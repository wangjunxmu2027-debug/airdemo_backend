import { NextResponse } from 'next/server'
import { db } from '@/core/db'
import { efficiencyTool } from '@/config/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const rows = await db()
      .select()
      .from(efficiencyTool)
      .where(status ? eq(efficiencyTool.status, status) : undefined as any)
      .orderBy(desc(efficiencyTool.sort))
    return NextResponse.json({ code: 0, data: rows })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const id = body.id || body.name
    const name = body.name
    const title = body.title
    const url = body.url
    const avatarUrl = body.avatarUrl || ''
    const description = body.description || ''
    const highlight = body.highlight || ''
    const status = body.status || 'draft'
    const sort = Number(body.sort ?? 0)
    const skills = Array.isArray(body.skills)
      ? body.skills
      : typeof body.skills === 'string' && body.skills.length
      ? body.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
    await db().insert(efficiencyTool).values({
      id,
      name,
      title,
      url,
      avatarUrl,
      description,
      highlight,
      status,
      sort,
      skills,
    })
    return NextResponse.json({ code: 0, message: 'created' })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}
