import { redirect } from '@/core/i18n/navigation'
import { Main } from '@/shared/blocks/dashboard'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { db } from '@/core/db'
import { adminInvite, role, user, userRole } from '@/config/db/schema'
import { eq } from 'drizzle-orm'
import { getAuth } from '@/core/auth'

async function getInvite(token: string) {
  const [row] = await db().select().from(adminInvite).where(eq(adminInvite.token, token))
  return row || null
}

export default async function InviteAcceptPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>
}) {
  const { locale, token } = await params
  const invite = await getInvite(token)
  const accept = async (formData: FormData) => {
    'use server'
    const name = String(formData.get('name') || '').trim()
    const password = String(formData.get('password') || '').trim()

    const [inviteRow] = await db().select().from(adminInvite).where(eq(adminInvite.token, token))
    if (!inviteRow || inviteRow.status !== 'pending') {
      throw new Error('invalid invite')
    }
    const [u] = await db().select().from(user).where(eq(user.email, inviteRow.email))
    let userId = u?.id

    if (!u) {
      if (!password) {
        throw new Error('password required')
      }
      const auth = await getAuth()
      await auth.api.signUp({
        body: {
          email: inviteRow.email,
          password,
          name: name || inviteRow.email.split('@')[0],
        },
        headers: new Headers(),
      })
      const [created] = await db().select().from(user).where(eq(user.email, inviteRow.email))
      userId = created?.id
    }

    const [adminRole] = await db().select().from(role).where(eq(role.name, 'admin'))
    const roleId = adminRole ? adminRole.id : 'admin-role'
    if (!adminRole) {
      await db().insert(role).values({
        id: roleId,
        name: 'admin',
        title: '超级管理员',
        description: '拥有所有管理权限',
        status: 'active',
        sort: 0,
      })
    }
    await db().insert(userRole).values({
      id: `ur-${userId}-${roleId}`,
      userId: userId!,
      roleId,
    })
    await db().update(adminInvite).set({ status: 'accepted' }).where(eq(adminInvite.id, inviteRow.id))
    redirect({ href: '/sign-in', locale })
  }

  if (!invite) {
    return (
      <Main>
        <div className="container py-12">
          <h2 className="text-2xl font-bold">邀请不存在或已失效</h2>
        </div>
      </Main>
    )
  }

  return (
    <>
      <Main>
        <form className="mx-auto w-full max-w-xl space-y-6" action={accept}>
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">接受邀请</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">被邀请邮箱</label>
              <Input defaultValue={invite.email} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">名称</label>
              <Input name="name" placeholder="您的名字" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">密码（新用户需要设置）</label>
              <Input type="password" name="password" placeholder="设置登录密码" />
            </div>
            <div className="flex justify-end">
              <Button type="submit">确认接受</Button>
            </div>
          </div>
        </form>
      </Main>
    </>
  )
}
