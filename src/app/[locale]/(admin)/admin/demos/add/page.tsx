import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Crumb } from '@/shared/types/blocks/common';
import { getUuid } from '@/shared/lib/hash';

export default async function AddDemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin.demos');
  const createDemo = async (formData: FormData) => {
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
    const id = getUuid();
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
      id,
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.message || 'create failed');
    }
    redirect('/admin/demos');
  };

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.demos'), url: '/admin/demos' },
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
            url: '/admin/demos',
            variant: 'outline',
          },
        ]}
      />
      <Main>
        <form className="max-w-4xl space-y-6" action={createDemo}>
          <input type="hidden" name="locale" value={locale} />
          
          {/* 基本信息 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.basic')}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.title')}</label>
                <Input name="title" placeholder="AI 智能巡检" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.slug')}</label>
                <Input name="slug" placeholder="inspection" required />
                <p className="text-xs text-muted-foreground">唯一标识，用于 URL</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.valueProp')}</label>
              <Input name="valueProp" placeholder="通过 AI 视觉分析实现巡检自动判定与闭环整改" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.description')}</label>
              <Textarea name="description" placeholder="Demo 的详细描述..." rows={3} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fields.coverImage')}</label>
              <Input name="coverImage" placeholder="https://..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('fields.category')}</label>
                <Select name="category">
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
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
                <Input name="sort" type="number" defaultValue="0" />
              </div>
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

          {/* 核心要点 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.points')}</h3>
            <Textarea 
              name="points" 
              placeholder="每行一个要点&#10;巡检任务自动分配&#10;照片/视频实时 AI 审计&#10;低合规项自动预警"
              rows={5}
            />
          </div>

          {/* 目标受众 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.audience')}</h3>
            <Input name="audience" placeholder="工厂负责人 / EHS 主管 / 设备部经理" />
          </div>

          {/* AI 洞察 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.aiInsights')}</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">结论</label>
              <Textarea name="conclusion" placeholder="过去 4 天累计执行 10 项巡检任务..." rows={2} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">风险点 (每行一个)</label>
              <Textarea name="risks" placeholder="机械维修工任务积压..." rows={3} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">建议动作 (每行一个)</label>
              <Textarea name="actions" placeholder="针对进行中任务下发自动化催办..." rows={3} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">下一步</label>
              <Input name="next" placeholder="设备健康度周度例会" />
            </div>
          </div>

          {/* 演示步骤 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.steps')}</h3>
            <p className="text-sm text-muted-foreground">
              步骤配置暂支持 JSON 格式输入
            </p>
            <Textarea 
              name="steps" 
              placeholder='[{"id": 1, "title": "巡检任务执行", "component": "移动端", "script": "工程师根据系统指派...", "value": "流程标准化，结果数字化", "fallback": ""}]'
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* 表格数据 */}
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">{t('add.sections.tables')}</h3>
            <p className="text-sm text-muted-foreground">
              支持 main, secondary, equipment, factory 四种表格类型
            </p>
            <Textarea 
              name="tables" 
              placeholder='{"main": [...], "equipment": [...], "factory": [...]}'
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
              发布 Demo
            </Button>
          </div>
        </form>
      </Main>
    </>
  );
}
