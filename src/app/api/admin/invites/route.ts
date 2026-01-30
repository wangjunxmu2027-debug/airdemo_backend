import { NextResponse } from 'next/server'
import { db } from '@/core/db'
import { adminInvite, role, user, userRole } from '@/config/db/schema'
import { eq } from 'drizzle-orm'
import { getUserInfo } from '@/shared/models/user'
import { getUuid } from '@/shared/lib/hash'
import { getEmailService } from '@/shared/services/email'

export async function POST(request: Request) {
  try {
    const inviter = await getUserInfo()
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ code: 1, message: 'invalid email' }, { status: 400 })
    }

    const token = getUuid()
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000)

    await db().delete(adminInvite).where(eq(adminInvite.email, email))
    await db().insert(adminInvite).values({
      id: `invite-${token}`,
      email,
      token,
      status: 'pending',
      invitedBy: inviter?.id || null,
      expiresAt,
    })

    const origin = new URL(request.url).origin
    const link = `${origin}/invite/${token}`

    try {
      const emailService = await getEmailService()
      await emailService.sendEmail({
        to: email,
        subject: '管理员邀请',
        html: `<p>您被邀请成为管理人员，请点击以下链接完成注册：</p><p><a href="${link}">${link}</a></p>`,
      })
    } catch {
      // ignore sending errors; still return link
    }

    return NextResponse.json({ code: 0, data: { token, link } })
  } catch (e: any) {
    return NextResponse.json({ code: 1, message: e.message }, { status: 500 })
  }
}
