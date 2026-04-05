import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET(request) {
  console.log('🧪 Testing SMTP connection...')
  
  // Log environment variables (obscured)
  const envCheck = {
    SMTP_HOST: process.env.SMTP_HOST || 'MISSING',
    SMTP_PORT: process.env.SMTP_PORT || 'MISSING',
    SMTP_USER: process.env.SMTP_USER ? '✓ SET' : 'MISSING',
    SMTP_PASS: process.env.SMTP_PASS ? '✓ SET' : 'MISSING',
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || 'MISSING',
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'MISSING'
  }
  
  console.log('📋 Environment Variables Check:', envCheck)

  // Check if any variables are missing
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return NextResponse.json({
      success: false,
      error: 'Missing SMTP environment variables',
      envCheck
    }, { status: 500 })
  }

  try {
    // Create transporter
    console.log('🔧 Creating SMTP transporter...')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      debug: true, // Enable debug output
      logger: true // Log to console
    })

    // Verify connection
    console.log('🔍 Verifying SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection verified!')

    // Send test email
    console.log('📧 Sending test email...')
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_FROM_EMAIL, // Send to admin or self
      subject: '🧪 Test Email - EXPO CAR MEETING',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #ffffff;">
          <h1 style="color: #00bcd4; text-align: center;">✅ SMTP TEST REUȘIT!</h1>
          <p style="font-size: 16px; color: #e5e5e5;">
            Dacă primești acest email, înseamnă că <strong style="color: #00bcd4;">Gmail SMTP funcționează perfect</strong> în Vercel! 🎉
          </p>
          <div style="background: rgba(0, 188, 212, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #cccccc;"><strong>From:</strong> ${process.env.SMTP_FROM_EMAIL}</p>
            <p style="margin: 5px 0 0 0; color: #cccccc;"><strong>Host:</strong> ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}</p>
          </div>
          <p style="font-size: 14px; color: #999999; text-align: center; margin-top: 30px;">
            EXPO CAR MEETING - Fălticeni 2026
          </p>
        </div>
      `
    })

    console.log('✅ Test email sent successfully!')
    console.log('📬 Message ID:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'SMTP connection successful! Test email sent.',
      messageId: info.messageId,
      envCheck,
      details: {
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response
      }
    })

  } catch (error) {
    console.error('❌ SMTP Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      command: error.command,
      envCheck,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
