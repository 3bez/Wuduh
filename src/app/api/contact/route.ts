import { NextRequest, NextResponse } from 'next/server'
import { apiError, langFromHeaders } from '@/lib/i18n/errors'

export async function POST(request: NextRequest) {
  const lang = langFromHeaders(request.headers)
  try {
    const { name, email, message } = await request.json()

    // Basic validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: apiError('all_fields_required', lang) }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: apiError('invalid_email', lang) }, { status: 400 })
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ error: apiError('message_too_short', lang) }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set')
      return NextResponse.json({ error: apiError('email_not_configured', lang) }, { status: 500 })
    }

    // Lazy import so Resend never runs at build time
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const date = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

    // Notification email to you
    await resend.emails.send({
      from: 'Wuduh Contact <contact@wuduh.site>',
      to: 'hello@wuduh.site',
      replyTo: email,
      subject: `New message from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#0D1B2A;">
          <h1 style="font-size:22px;font-weight:500;margin:0 0 6px;letter-spacing:-0.02em;">New message via wuduh.site</h1>
          <p style="font-size:13px;color:#8795A6;margin:0 0 32px;font-family:monospace;">${date}</p>
          <div style="background:#F4F6F8;border-radius:12px;padding:24px;margin-bottom:24px;">
            <p style="font-size:11px;font-family:monospace;letter-spacing:0.1em;text-transform:uppercase;color:#8795A6;margin:0 0 4px;">From</p>
            <p style="font-size:15px;font-weight:500;color:#0D1B2A;margin:0 0 16px;">${name}</p>
            <p style="font-size:11px;font-family:monospace;letter-spacing:0.1em;text-transform:uppercase;color:#8795A6;margin:0 0 4px;">Email</p>
            <p style="font-size:15px;margin:0 0 16px;"><a href="mailto:${email}" style="color:#C9A84C;text-decoration:none;">${email}</a></p>
            <p style="font-size:11px;font-family:monospace;letter-spacing:0.1em;text-transform:uppercase;color:#8795A6;margin:0 0 8px;">Message</p>
            <p style="font-size:15px;color:#0D1B2A;line-height:1.65;margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          <a href="mailto:${email}?subject=Re: your message to Wuduh"
            style="display:inline-block;background:#0D1B2A;color:#fff;font-size:14px;font-weight:500;padding:12px 24px;border-radius:9px;text-decoration:none;">
            Reply to ${name.split(' ')[0]} →
          </a>
        </div>
      `,
    })

    // Auto-reply to sender
    await resend.emails.send({
      from: 'Wuduh <hello@wuduh.site>',
      to: email,
      subject: 'We got your message',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#0D1B2A;">
          <h1 style="font-size:22px;font-weight:500;margin:0 0 12px;letter-spacing:-0.02em;">Message received, ${name.split(' ')[0]}.</h1>
          <p style="font-size:15px;color:#647183;line-height:1.7;margin:0 0 24px;">
            We read every message ourselves. You'll hear from us within one business day.
          </p>
          <div style="background:#F4F6F8;border-radius:12px;padding:20px 24px;margin-bottom:28px;border-left:3px solid #C9A84C;">
            <p style="font-size:11px;font-family:monospace;letter-spacing:0.1em;text-transform:uppercase;color:#8795A6;margin:0 0 8px;">Your message</p>
            <p style="font-size:14px;color:#36404D;line-height:1.65;margin:0;white-space:pre-wrap;">${message}</p>
          </div>
          <a href="https://wuduh.site"
            style="display:inline-block;background:#C9A84C;color:#0D1B2A;font-size:14px;font-weight:600;padding:12px 24px;border-radius:9px;text-decoration:none;">
            Back to Wuduh →
          </a>
          <p style="font-size:12px;color:#B4BFCB;margin-top:32px;">
            Wuduh · Riyadh, Saudi Arabia · <a href="https://wuduh.site" style="color:#B4BFCB;">wuduh.site</a>
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: apiError('send_failed', lang) }, { status: 500 })
  }
}
