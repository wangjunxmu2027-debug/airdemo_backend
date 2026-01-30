import { getTranslations } from 'next-intl/server'
import { redirect, Link } from '@/core/i18n/navigation'
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Crumb } from '@/shared/types/blocks/common'
import { db } from '@/core/db'
import { efficiencyTool } from '@/config/db/schema'
import { eq } from 'drizzle-orm'
import { AvatarUploaderField } from '../../avatar-uploader-field'

async function getTool(id: string) {
  try {
    const rows = await db().select().from(efficiencyTool).where(eq(efficiencyTool.id, id))
    return rows[0] || null
  } catch {
    return null
  }
}

export default async function EditToolPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const t = await getTranslations('admin.tools')
  const tool = await getTool(id)
  const updateTool = async (formData: FormData) => {
    'use server'
    const toArray = (s: string) =>
      s
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean)
    const name = String(formData.get('name') || '').trim()
    const title = String(formData.get('title') || '').trim()
    const url = String(formData.get('url') || '').trim()
    const avatarUrl = String(formData.get('avatarUrl') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const highlight = String(formData.get('highlight') || '').trim()
    const skills = toArray(String(formData.get('skills') || ''))
    const sort = Number(formData.get('sort') || 0)
    const status = String(formData.get('status') || 'draft').trim()
    const payload = { name, title, url, avatarUrl, description, highlight, skills, sort, status }
    await db().update(efficiencyTool).set(payload).where(eq(efficiencyTool.id, id))
    redirect({ href: '/admin/tools', locale })
  }
  if (!tool) {
    return (
      <Main>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">工具不存在</h2>
          <Button asChild className="mt-4">
            <Link href="/admin/tools">返回列表</Link>
          </Button>
        </div>
      </Main>
    )
  }
  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.tools'), url: '/admin/tools' },
    { title: t('edit.title'), is_active: true },
  ]
  return (
    <>
      <Header crumbs={crumbs} />
      <MainHeader
        title={t('edit.title')}
        actions={[
          {
            title: t('add.back'),
            url: '/admin/tools',
            variant: 'outline',
          },
        ]}
      />
      <Main>
        <form className="max-w-4xl space-y-6" action={updateTool}>
          <input type="hidden" name="locale" value={locale} />
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.basic')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.name')}</label>
                <Input name="name" defaultValue={tool.name} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.title')}</label>
                <Input name="title" defaultValue={tool.title} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.url')}</label>
              <Input name="url" defaultValue={tool.url} required />
            </div>
            <AvatarUploaderField
              name="avatarUrl"
              label={t('fields.avatarUrl')}
              defaultValue={tool.avatarUrl || ''}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.description')}</label>
              <Textarea name="description" defaultValue={tool.description || ''} rows={3} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.highlight')}</label>
              <Textarea name="highlight" defaultValue={tool.highlight || ''} rows={2} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.skills')}</label>
              <Input name="skills" defaultValue={(tool.skills || []).join(', ')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.sort')}</label>
                <Input name="sort" type="number" defaultValue={tool.sort || 0} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.status')}</label>
                <Select name="status" defaultValue={tool.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="archived">已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button type="submit">保存</Button>
          </div>
        </form>
      </Main>
    </>
  )
}
