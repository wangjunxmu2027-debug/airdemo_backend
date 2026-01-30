import { NextResponse } from 'next/server'
import { db } from '@/core/db'
import { efficiencyTool } from '@/config/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request, ctx: { params: { id: string } }) {
  try {
    const id = ctx.params.id
    const rows = await db().select().from(efficiencyTool).where(eq(efficiencyTool.id, id))
    if (!rows.length) return NextResponse.json({ code: 1, message: 'not found' }, { status: 404 })
    const tool = rows[0]
    if (tool.avatarUrl && tool.avatarUrl.startsWith('/')) {
      const origin = new URL(request.url).origin
      return NextResponse.json({ code: 0, data: { ...tool, avatarUrl: `${origin}${tool.avatarUrl}` } })
    }
    return NextResponse.json({ code: 0, data: tool })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}
