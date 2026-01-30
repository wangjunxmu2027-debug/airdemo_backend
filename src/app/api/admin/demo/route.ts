import { NextResponse } from 'next/server'
import { db } from '@/core/db'
import { demo, demoStep, demoTableData } from '@/config/db/schema'
import { getUserInfo } from '@/shared/models/user'
import { desc, eq } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const rows = await db()
      .select()
      .from(demo)
      .where(status ? eq(demo.status, status) : undefined as any)
      .orderBy(desc(demo.sort))
    return NextResponse.json({ code: 0, data: rows })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserInfo()
    const body = await request.json()
    const id = body.id
    const title = body.title
    const slug = body.slug
    const description = body.description || ''
    const valueProp = body.valueProp || ''
    const coverImage = body.coverImage || ''
    const category = body.category || ''
    const sort = Number(body.sort ?? 0)
    const status = body.status || 'draft'
    const config = body.config ? JSON.stringify(body.config) : null
    await db().insert(demo).values({
      id,
      title,
      slug,
      description,
      valueProp,
      coverImage,
      category,
      sort,
      status,
      config,
      adminUserId: user?.id || null,
    })
    const steps = Array.isArray(body.steps) ? body.steps : []
    for (const s of steps) {
      await db().insert(demoStep).values({
        id: s.id,
        demoId: id,
        stepOrder: s.stepOrder,
        title: s.title,
        component: s.component,
        script: s.script,
        value: s.value,
        fallback: s.fallback,
      })
    }
    const tables = body.tables && typeof body.tables === 'object' ? body.tables : {}
    for (const key of Object.keys(tables)) {
      await db().insert(demoTableData).values({
        id: `${id}-${key}`,
        demoId: id,
        tableType: key,
        data: JSON.stringify(tables[key]),
      })
    }
    return NextResponse.json({ code: 0, message: 'created' })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}
