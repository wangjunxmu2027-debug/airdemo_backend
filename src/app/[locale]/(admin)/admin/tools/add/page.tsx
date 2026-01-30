import { getTranslations } from 'next-intl/server';
import { redirect } from '@/core/i18n/navigation';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Crumb } from '@/shared/types/blocks/common';
import { db } from '@/core/db';
import { efficiencyTool } from '@/config/db/schema';
import { AvatarUploaderField } from '../avatar-uploader-field';

export default async function AddToolPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin.tools');
  const createTool = async (formData: FormData) => {
    'use server';
    const toArray = (s: string) =>
      s
        .split(/[,，]/)
        .map((i) => i.trim())
        .filter(Boolean);
    const name = String(formData.get('name') || '').trim();
    const title = String(formData.get('title') || '').trim();
    const url = String(formData.get('url') || '').trim();
    const avatarUrl = String(formData.get('avatarUrl') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const highlight = String(formData.get('highlight') || '').trim();
    const skillsRaw = toArray(String(formData.get('skills') || ''));
    const skills = skillsRaw.length > 0 ? skillsRaw : null;
    const sort = Number(formData.get('sort') || 0);
    const status = String(formData.get('status') || 'draft').trim();
    const payload = {
      id: name,
      name,
      title,
      url,
      avatarUrl,
      description,
      highlight,
      sort,
      status,
      skills,
      updatedAt: new Date(),
    };
    await db().insert(efficiencyTool).values(payload);
    redirect({ href: '/admin/tools', locale });
  };

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.tools'), url: '/admin/tools' },
    { title: t('add.title'), is_active: true },
  ];

  return (
    <>
      <Header crumbs={crumbs} />
      <MainHeader
        title={t('add.title')}
        actions={[
          {
            title: t('add.back'),
            url: '/admin/tools',
            variant: 'outline',
          },
        ]}
      />
      <Main>
        <form className="max-w-4xl space-y-6" action={createTool}>
          <input type="hidden" name="locale" value={locale} />
          
          {/* 基本信息 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.basic')}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.name')}</label>
                <Input name="name" placeholder="ruirui" required />
                <p className="text-xs text-muted-foreground">内部标识符</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.title')}</label>
                <Input name="title" placeholder="AI汇报复盘助手" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.url')}</label>
              <Input name="url" placeholder="https://ruirui.airdemo.cn/" required />
            </div>

            <AvatarUploaderField name="avatarUrl" label={t('fields.avatarUrl')} />

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.description')}</label>
              <Textarea name="description" placeholder="工具的详细描述..." rows={3} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.highlight')}</label>
              <Textarea name="highlight" placeholder="高亮文案..." rows={2} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.skills')}</label>
              <Input name="skills" placeholder="技能1, 技能2, 技能3" />
              <p className="text-xs text-muted-foreground">多个技能用逗号分隔</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.sort')}</label>
                <Input name="sort" type="number" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.status')}</label>
                <Select name="status" defaultValue="draft">
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

          {/* 提交按钮 */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              保存草稿
            </Button>
            <Button type="submit">
              发布工具
            </Button>
          </div>
        </form>
      </Main>
    </>
  );
}
