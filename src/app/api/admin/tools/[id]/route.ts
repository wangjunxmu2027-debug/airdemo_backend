import { NextResponse } from 'next/server'
import { db } from '@/core/db'
import { efficiencyTool } from '@/config/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const rows = await db().select().from(efficiencyTool).where(eq(efficiencyTool.id, id))
    if (!rows.length) return NextResponse.json({ code: 1, message: 'not found' }, { status: 404 })
    return NextResponse.json({ code: 0, data: rows[0] })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const patch: any = {}
    ;['name','title','url','avatarUrl','description','highlight','status'].forEach((k) => {
      if (body[k] !== undefined) patch[k] = body[k]
    })
    if (body.sort !== undefined) patch.sort = Number(body.sort)
    if (body.skills !== undefined) {
      patch.skills = Array.isArray(body.skills)
        ? body.skills
        : typeof body.skills === 'string' && body.skills.length
        ? body.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []
    }
    if (Object.keys(patch).length) {
      await db().update(efficiencyTool).set(patch).where(eq(efficiencyTool.id, id))
    }
    return NextResponse.json({ code: 0, message: 'updated' })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db().delete(efficiencyTool).where(eq(efficiencyTool.id, id))
    return NextResponse.json({ code: 0, message: 'deleted' })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}
