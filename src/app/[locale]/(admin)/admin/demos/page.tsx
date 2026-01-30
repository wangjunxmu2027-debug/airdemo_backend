import { getTranslations } from 'next-intl/server';

import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { TableCard } from '@/shared/blocks/table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Link } from '@/core/i18n/navigation';
import { Crumb, Filter, Search, Tab } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';
import { Eye, Edit, Trash } from 'lucide-react';
import { db } from '@/core/db';
import { demo, role, user, userRole } from '@/config/db/schema';
import { and, desc, eq, isNull, like, asc } from 'drizzle-orm';
import { InviteAdminButton } from '../users/invite-admin';

async function getDemos({
  title,
  status,
  adminId,
  sort,
}: {
  title?: string;
  status?: string;
  adminId?: string;
  sort?: string;
}) {
  try {
    const rows = await db()
      .select({
        id: demo.id,
        title: demo.title,
        slug: demo.slug,
        description: demo.description,
        valueProp: demo.valueProp,
        coverImage: demo.coverImage,
        category: demo.category,
        adminUserId: demo.adminUserId,
        adminName: user.name,
        adminEmail: user.email,
        status: demo.status,
        sort: demo.sort,
        createdAt: demo.createdAt,
        updatedAt: demo.updatedAt,
      })
      .from(demo)
      .leftJoin(user, eq(user.id, demo.adminUserId))
      .where(
        and(
          title ? like(demo.title, `%${title}%`) : undefined,
          status && status !== 'all' ? eq(demo.status, status) : undefined,
          adminId && adminId !== 'all' && adminId !== 'unassigned'
            ? eq(demo.adminUserId, adminId)
            : undefined,
          adminId === 'unassigned' ? isNull(demo.adminUserId) : undefined
        )
      )
      .orderBy(
        sort === 'created_asc'
          ? asc(demo.createdAt)
          : sort === 'created_desc'
          ? desc(demo.createdAt)
          : desc(demo.sort)
      );
    return rows;
  } catch (e: any) {
    console.error('getDemos error:', e.message);
    return [];
  }
}

async function getAdminOptions() {
  const rows = await db()
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
    })
    .from(user)
    .leftJoin(userRole, eq(userRole.userId, user.id))
    .leftJoin(role, eq(role.id, userRole.roleId))
    .where(eq(role.name, 'admin'));

  return rows
    .filter((item) => item.id)
    .map((item) => ({
      value: item.id as string,
      label: `${item.name || item.email} (${item.email})`,
    }));
}

export default async function AdminDemosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: number;
    pageSize?: number;
    title?: string;
    status?: string;
    adminId?: string;
    sort?: string;
  }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin.demos');
  const { title, status, adminId, sort } = await searchParams;
  const demos = await getDemos({ title, status, adminId, sort });
  const adminOptions = await getAdminOptions();

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.demos'), is_active: true },
  ];

  const makeTabUrl = (nextSort: string) => {
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (status) params.set('status', status);
    if (adminId) params.set('adminId', adminId);
    if (nextSort) params.set('sort', nextSort);
    const query = params.toString();
    return query ? `/admin/demos?${query}` : '/admin/demos';
  };

  const tabs: Tab[] = [
    {
      name: 'default',
      title: t('list.tabs.default'),
      url: makeTabUrl(''),
      is_active: !sort || sort === 'sort',
    },
    {
      name: 'newest',
      title: t('list.tabs.newest'),
      url: makeTabUrl('created_desc'),
      is_active: sort === 'created_desc',
    },
    {
      name: 'oldest',
      title: t('list.tabs.oldest'),
      url: makeTabUrl('created_asc'),
      is_active: sort === 'created_asc',
    },
  ];

  const filters: Filter[] = [
    {
      name: 'status',
      title: t('list.filters.status.title'),
      value: status,
      options: [
        { value: 'all', label: t('list.filters.status.options.all') },
        { value: 'published', label: t('list.filters.status.options.published') },
        { value: 'draft', label: t('list.filters.status.options.draft') },
        { value: 'archived', label: t('list.filters.status.options.archived') },
      ],
    },
    {
      name: 'adminId',
      title: t('list.filters.admin.title'),
      value: adminId,
      options: [
        { value: 'all', label: t('list.filters.admin.options.all') },
        { value: 'unassigned', label: t('list.filters.admin.options.unassigned') },
        ...adminOptions,
      ],
    },
  ];

  const search: Search = {
    name: 'title',
    title: t('list.search.title.title'),
    placeholder: t('list.search.title.placeholder'),
    value: title,
  };

  const table: Table = {
    columns: [
      { name: 'title', title: t('fields.title') },
      { name: 'slug', title: t('fields.slug') },
      {
        name: 'adminUserId',
        title: t('fields.admin'),
        callback: (item: any) => item.adminName || item.adminEmail || '-',
      },
      {
        name: 'category',
        title: t('fields.category'),
        callback: (item: any) => {
          const categoryLabels: Record<string, string> = {
            gtm: '销售智能 (GTM)',
            inspection: '智能巡检',
            efficiency: '数字伙伴',
          };
          return (
            <Badge variant="outline">
              {categoryLabels[item.category] || item.category}
            </Badge>
          );
        },
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
      { name: 'sort', title: t('fields.sort') },
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
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/demo/${item.slug}`} target="_blank">
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/admin/demos/${item.id}/flow`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/admin/demos/${item.id}/edit`}>
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
    data: demos,
    pagination: {
      page: 1,
      limit: 30,
      total: demos.length,
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <MainHeader
        title={t('list.title')}
        tabs={tabs}
        filters={filters}
        search={search}
        actions={[
          {
            title: t('list.actions.add'),
            url: '/admin/demos/add',
            icon: 'Plus',
          },
        ]}
      />
      <div className="mb-4 flex justify-end">
        <InviteAdminButton />
      </div>
      <Main>
        <TableCard table={table} />
      </Main>
    </>
  );
}
