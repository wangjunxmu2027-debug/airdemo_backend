import { NextResponse } from 'next/server'
import { db } from '@/core/db'
import { demo, demoStep, demoTableData } from '@/config/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(_: Request, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id
    const rows = await db().select().from(demo).where(eq(demo.id, id))
    if (!rows.length) return NextResponse.json({ code: 1, message: 'not found' }, { status: 404 })
    const steps = await db().select().from(demoStep).where(eq(demoStep.demoId, id))
    const tables = await db().select().from(demoTableData).where(eq(demoTableData.demoId, id))
    const tablesObj: Record<string, any> = {}
    for (const t of tables) {
      tablesObj[t.tableType] = t.data ? JSON.parse(t.data as any) : []
    }
    const row = rows[0] as any
    return NextResponse.json({
      code: 0,
      data: {
        ...row,
        config: row.config ? JSON.parse(row.config) : null,
        steps,
        tables: tablesObj,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}

export async function PUT(request: Request, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id
    const body = await request.json()
    const patch: any = {}
    ;['title','slug','description','valueProp','coverImage','category','status'].forEach((k) => {
      if (body[k] !== undefined) patch[k] = body[k]
    })
    if (body.sort !== undefined) patch.sort = Number(body.sort)
    if (body.config !== undefined) patch.config = body.config ? JSON.stringify(body.config) : null
    if (Object.keys(patch).length) {
      await db().update(demo).set(patch).where(eq(demo.id, id))
    }
    if (Array.isArray(body.steps)) {
      await db().delete(demoStep).where(eq(demoStep.demoId, id))
      for (const s of body.steps) {
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
    }
    if (body.tables && typeof body.tables === 'object') {
      await db().delete(demoTableData).where(eq(demoTableData.demoId, id))
      for (const key of Object.keys(body.tables)) {
        await db().insert(demoTableData).values({
          id: `${id}-${key}`,
          demoId: id,
          tableType: key,
          data: JSON.stringify(body.tables[key]),
        })
      }
    }
    return NextResponse.json({ code: 0, message: 'updated' })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id
    await db().delete(demoStep).where(eq(demoStep.demoId, id))
    await db().delete(demoTableData).where(eq(demoTableData.demoId, id))
    await db().delete(demo).where(eq(demo.id, id))
    return NextResponse.json({ code: 0, message: 'deleted' })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}
