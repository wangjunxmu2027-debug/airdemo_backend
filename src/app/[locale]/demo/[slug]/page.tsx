import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

import { db } from '@/core/db'
import { demo } from '@/config/db/schema'
import { eq } from 'drizzle-orm'

export default async function DemoDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const t = await getTranslations('admin.demos')
  const [data] = await db()
    .select()
    .from(demo)
    .where(eq(demo.slug, slug))
  if (!data) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold">Demo 不存在</h1>
      </div>
    )
  }
  const parsedConfig = data.config ? JSON.parse(data.config) : null
  const points = Array.isArray(parsedConfig?.points) ? parsedConfig.points : []
  return (
    <div className="container py-10 space-y-6">
      <div className="flex items-center gap-6">
        {data.coverImage && (
          <Image src={data.coverImage} alt={data.title} width={240} height={160} className="rounded-lg object-cover" />
        )}
        <div>
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <p className="text-muted-foreground mt-2">{data.valueProp || data.description || ''}</p>
        </div>
      </div>
      {points.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">核心要点</h2>
          <ul className="mt-2 list-disc pl-5">
            {points.map((p: string) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
