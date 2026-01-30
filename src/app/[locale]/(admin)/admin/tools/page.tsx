import { getTranslations } from 'next-intl/server';

import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { TableCard } from '@/shared/blocks/table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Link } from '@/core/i18n/navigation';
import { Crumb, Search } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';
import { Eye, Edit, Trash } from 'lucide-react';
import { db } from '@/core/db';
import { efficiencyTool } from '@/config/db/schema';
import { desc } from 'drizzle-orm';

async function getTools() {
  try {
    const rows = await db()
      .select()
      .from(efficiencyTool)
      .orderBy(desc(efficiencyTool.sort));
    return rows;
  } catch (e: any) {
    console.error('getTools error:', e.message);
    return [];
  }
}

export default async function AdminToolsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: number;
    pageSize?: number;
    name?: string;
  }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin.tools');
  const tools = await getTools();

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.tools'), is_active: true },
  ];

  const search: Search = {
    name: 'name',
    title: t('list.search.name.title'),
    placeholder: t('list.search.name.placeholder'),
    value: '',
  };

  const table: Table = {
    columns: [
      { name: 'name', title: t('fields.name') },
      { name: 'title', title: t('fields.title') },
      {
        name: 'url',
        title: t('fields.url'),
        callback: (item: any) => (
          <a href={item.url} target="_blank" className="text-primary hover:underline truncate max-w-[200px] block">
            {item.url}
          </a>
        ),
      },
      {
        name: 'skills',
        title: t('fields.skills'),
        callback: (item: any) => (
          <div className="flex flex-wrap gap-1">
            {(item.skills || []).slice(0, 2).map((skill: string, index: number) => (
              <Badge key={`${skill}-${index}`} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {(item.skills?.length || 0) > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{item.skills.length - 2}
              </Badge>
            )}
          </div>
        ),
      },
      {
        name: 'status',
        title: t('fields.status'),
        callback: (item: any) => (
          <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
            {item.status === 'published' ? '已发布' : '草稿'}
          </Badge>
        ),
      },
      {
        name: 'sort',
        title: t('fields.sort'),
      },
      {
        name: 'createdAt',
        title: t('fields.createdAt'),
        callback: (item: any) => new Date(item.createdAt).toLocaleDateString(),
      },
      {
        name: 'actions',
        title: t('fields.actions'),
        callback: (item: any) => (
          <div className="flex items-center gap-2">
            {item.url ? (
              <Button variant="ghost" size="icon" asChild>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4" />
                </a>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" disabled title="未设置URL">
                <Eye className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/admin/tools/${item.id}/edit`}>
                <Edit className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    data: tools,
    pagination: {
      page: 1,
      limit: 30,
      total: tools.length,
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <MainHeader
        title={t('list.title')}
        search={search}
        actions={[
          {
            title: t('list.actions.add'),
            url: '/admin/tools/add',
            icon: 'Plus',
          },
        ]}
      />
      <Main>
        <TableCard table={table} />
      </Main>
    </>
  );
}
