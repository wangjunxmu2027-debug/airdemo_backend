import { NextResponse } from 'next/server'
import { db } from '@/core/db'
import { adminInvite, role, user, userRole } from '@/config/db/schema'
import { eq } from 'drizzle-orm'
import { getAuth } from '@/core/auth'

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const [row] = await db().select().from(adminInvite).where(eq(adminInvite.token, token))
    if (!row) return NextResponse.json({ code: 1, message: 'invalid token' }, { status: 404 })
    return NextResponse.json({ code: 0, data: row })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const body = await request.json()
    const name = String(body.name || '').trim()
    const password = String(body.password || '').trim()

    const [invite] = await db().select().from(adminInvite).where(eq(adminInvite.token, token))
    if (!invite || invite.status !== 'pending') {
      return NextResponse.json({ code: 1, message: 'invalid invite' }, { status: 400 })
    }
    const [u] = await db().select().from(user).where(eq(user.email, invite.email))
    let userId = u?.id

    if (!u) {
      if (!password) {
        return NextResponse.json({ code: 1, message: 'password required' }, { status: 400 })
      }
      const auth = await getAuth()
      await auth.api.signUp({
        body: {
          email: invite.email,
          password,
          name: name || invite.email.split('@')[0],
        },
        headers: new Headers(),
      })
      const [created] = await db().select().from(user).where(eq(user.email, invite.email))
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
    await db().update(adminInvite).set({ status: 'accepted' }).where(eq(adminInvite.id, invite.id))
    return NextResponse.json({ code: 0, message: 'accepted' })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}
