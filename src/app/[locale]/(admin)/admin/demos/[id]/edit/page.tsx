import { getTranslations } from 'next-intl/server';
import { redirect, Link } from '@/core/i18n/navigation';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Crumb } from '@/shared/types/blocks/common';
import { getUuid } from '@/shared/lib/hash';
import { db } from '@/core/db';
import { demo, demoStep, demoTableData } from '@/config/db/schema';
import { eq } from 'drizzle-orm';

async function getDemo(id: string) {
  try {
    const rows = await db().select().from(demo).where(eq(demo.id, id));
    if (!rows.length) return null;
    const steps = await db().select().from(demoStep).where(eq(demoStep.demoId, id));
    const tables = await db().select().from(demoTableData).where(eq(demoTableData.demoId, id));
    const tablesObj: Record<string, any> = {};
    for (const t of tables) {
      tablesObj[t.tableType] = t.data ? JSON.parse(t.data as any) : [];
    }
    const row = rows[0] as any;
    return {
      ...row,
      config: row.config ? JSON.parse(row.config) : null,
      steps,
      tables: tablesObj,
    };
  } catch {
    return null;
  }
}

export default async function EditDemoPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations('admin.demos');
  const demo = await getDemo(id);
  const updateDemo = async (formData: FormData) => {
    'use server';
    const splitLines = (value: string) =>
      value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
    const safeJson = (value: string, fallback: any) => {
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    };
    const title = String(formData.get('title') || '').trim();
    const slug = String(formData.get('slug') || '').trim();
    const valueProp = String(formData.get('valueProp') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const coverImage = String(formData.get('coverImage') || '').trim();
    const category = String(formData.get('category') || '').trim();
    const status = String(formData.get('status') || 'draft').trim();
    const sort = Number(formData.get('sort') || 0);
    const points = splitLines(String(formData.get('points') || ''));
    const audience = String(formData.get('audience') || '').trim();
    const conclusion = String(formData.get('conclusion') || '').trim();
    const risks = splitLines(String(formData.get('risks') || ''));
    const actions = splitLines(String(formData.get('actions') || ''));
    const next = String(formData.get('next') || '').trim();
    const stepsInput = String(formData.get('steps') || '');
    const tablesInput = String(formData.get('tables') || '');
    const steps = Array.isArray(safeJson(stepsInput, []))
      ? safeJson(stepsInput, [])
      : [];
    const tables = typeof safeJson(tablesInput, {}) === 'object'
      ? safeJson(tablesInput, {})
      : {};
    const payload = {
      title,
      slug,
      valueProp,
      description,
      coverImage,
      category,
      status,
      sort,
      config: {
        points,
        audience,
        aiInsights: {
          conclusion,
          risks,
          actions,
          next,
        },
      },
      steps: steps.map((step: any, index: number) => ({
        id: step.id || getUuid(),
        stepOrder: step.stepOrder ?? index + 1,
        title: step.title || '',
        component: step.component || '',
        script: step.script || '',
        value: step.value || '',
        fallback: step.fallback || '',
      })),
      tables,
    };
    const patch: any = {};
    ['title', 'slug', 'description', 'valueProp', 'coverImage', 'category', 'status'].forEach((k) => {
      if ((payload as any)[k] !== undefined) patch[k] = (payload as any)[k];
    });
    if (payload.sort !== undefined) patch.sort = Number(payload.sort);
    if (payload.config !== undefined) patch.config = payload.config ? JSON.stringify(payload.config) : null;
    if (Object.keys(patch).length) {
      await db().update(demo).set(patch).where(eq(demo.id, id));
    }
    if (Array.isArray(payload.steps)) {
      await db().delete(demoStep).where(eq(demoStep.demoId, id));
      for (const s of payload.steps) {
        await db().insert(demoStep).values({
          id: s.id,
          demoId: id,
          stepOrder: s.stepOrder,
          title: s.title,
          component: s.component,
          script: s.script,
          value: s.value,
          fallback: s.fallback,
        });
      }
    }
    if (payload.tables && typeof payload.tables === 'object') {
      await db().delete(demoTableData).where(eq(demoTableData.demoId, id));
      for (const key of Object.keys(payload.tables)) {
        await db().insert(demoTableData).values({
          id: `${id}-${key}`,
          demoId: id,
          tableType: key,
          data: JSON.stringify(payload.tables[key]),
        });
      }
    }
    redirect({ href: '/admin/demos', locale });
  };

  if (!demo) {
    return (
      <Main>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Demo 不存在</h2>
          <Button asChild className="mt-4">
            <Link href="/admin/demos">返回列表</Link>
          </Button>
        </div>
      </Main>
    );
  }

  const config = demo.config || {};
  const steps = demo.steps || [];
  const tables = demo.tables || {};

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.demos'), url: '/admin/demos' },
    { title: demo.title, is_active: true },
  ];

  return (
    <>
      <Header crumbs={crumbs} />
      <MainHeader
        title={demo.title || t('edit.title')}
        actions={[
          {
            title: t('edit.back'),
            url: '/admin/demos',
            variant: 'outline',
          },
        ]}
      />
      <Main>
        <form className="mx-auto w-full max-w-4xl space-y-6" action={updateDemo}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="locale" value={locale} />
          
          {/* 基本信息 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.basic')}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.title')}</label>
                <Input name="title" defaultValue={demo.title} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.slug')}</label>
                <Input name="slug" defaultValue={demo.slug} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.valueProp')}</label>
              <Input name="valueProp" defaultValue={demo.valueProp || ''} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.description')}</label>
              <Textarea name="description" defaultValue={demo.description || ''} rows={3} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.coverImage')}</label>
              <Input name="coverImage" defaultValue={demo.coverImage || ''} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.category')}</label>
                <Select name="category" defaultValue={demo.category}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gtm">销售智能 (GTM)</SelectItem>
                    <SelectItem value="inspection">智能巡检</SelectItem>
                    <SelectItem value="efficiency">数字伙伴</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.sort')}</label>
                <Input name="sort" type="number" defaultValue={demo.sort || 0} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.status')}</label>
              <Select name="status" defaultValue={demo.status}>
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

          {/* 核心要点 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.points')}</h3>
            <Textarea 
              name="points" 
              defaultValue={(config.points || []).join('\n')}
              placeholder="每行一个要点"
              rows={5}
            />
          </div>

          {/* 目标受众 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.audience')}</h3>
            <Input name="audience" defaultValue={config.audience || ''} />
          </div>

          {/* AI 洞察 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.aiInsights')}</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">结论</label>
              <Textarea 
                name="conclusion" 
                defaultValue={config.aiInsights?.conclusion || ''}
                rows={2} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">风险点 (每行一个)</label>
              <Textarea 
                name="risks" 
                defaultValue={(config.aiInsights?.risks || []).join('\n')}
                rows={3} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">建议动作 (每行一个)</label>
              <Textarea 
                name="actions" 
                defaultValue={(config.aiInsights?.actions || []).join('\n')}
                rows={3} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">下一步</label>
              <Input 
                name="next" 
                defaultValue={config.aiInsights?.next || ''} 
              />
            </div>
          </div>

          {/* 演示步骤 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.steps')}</h3>
            <Textarea 
              name="steps" 
              defaultValue={JSON.stringify(steps, null, 2)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* 表格数据 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.tables')}</h3>
            <Textarea 
              name="tables" 
              defaultValue={JSON.stringify(tables, null, 2)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              保存草稿
            </Button>
            <Button type="submit">
              更新 Demo
            </Button>
          </div>
        </form>
      </Main>
    </>
  );
}
