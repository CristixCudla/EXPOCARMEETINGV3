import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send car approval email
 */
export async function sendCarApprovalEmail(userEmail, userDetails, carDetails) {
  const { full_name } = userDetails
  const { make, model, year, images } = carDetails
  const carImage = images && images[0] ? images[0] : ''

  try {
    const { data, error } = await resend.emails.send({
      from: 'EXPO CAR MEETING <contact@expocarmeeting.ro>',
      to: userEmail,
      subject: '🎉 Mașina ta a fost APROBATĂ!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000000;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a0033 0%, #0a0015 100%); border: 2px solid #00bcd4; border-radius: 16px; padding: 30px; box-shadow: 0 0 40px rgba(0, 188, 212, 0.3);">
              
              <h1 style="color: #00bcd4; font-size: 42px; text-align: center; margin: 0 0 10px 0; text-transform: uppercase; text-shadow: 0 0 20px rgba(0, 188, 212, 0.8);">
                EXPO CAR MEETING
              </h1>
              
              <p style="color: #a855f7; font-size: 14px; text-align: center; margin: 0 0 30px 0; text-transform: uppercase; letter-spacing: 2px;">
                Fălticeni • Nada Florilor • 2026
              </p>

              <div style="height: 2px; background: linear-gradient(90deg, transparent, #00bcd4, transparent); margin-bottom: 30px;"></div>

              <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin: 0 0 20px 0;">
                🎉 FELICITĂRI ${full_name}!
              </h2>

              <p style="color: #e5e7eb; font-size: 16px; text-align: center; margin: 0 0 30px 0;">
                Mașina ta <strong style="color: #00bcd4;">${make} ${model} (${year})</strong> a fost <strong style="color: #4ade80;">APROBATĂ</strong> pentru participare la EXPO CAR MEETING 2026!
              </p>

              ${carImage ? `
              <div style="text-align: center; margin: 30px 0;">
                <img src="${carImage}" alt="${make} ${model}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 0 20px rgba(0, 188, 212, 0.5);">
              </div>
              ` : ''}

              <div style="background: rgba(74, 222, 128, 0.1); border-left: 4px solid #4ade80; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #4ade80; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">
                  ✅ Ce urmează?
                </p>
                <ul style="color: #e5e7eb; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Mașina ta va apărea în galeria oficială</li>
                  <li>Vei putea participa la voting "Best Car of the Show"</li>
                  <li>Prezintă-te la eveniment pe 6-7 Iunie 2026</li>
                </ul>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #cccccc; font-size: 14px;">
                  Ne vedem la Stadionul Nada Florilor! 🚗💨
                </p>
              </div>

              <div style="height: 1px; background: rgba(0, 188, 212, 0.3); margin: 30px 0;"></div>

              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                Pasiune & Performanță se întâlnesc<br>
                6-7 Iunie 2026 • Stadionul Nada Florilor, Fălticeni
              </p>
              
              <p style="color: #6b7280; font-size: 11px; text-align: center; margin: 10px 0 0 0;">
                © 2026 EXPO CAR MEETING. Toate drepturile rezervate.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('❌ Resend error (car approval):', error)
      throw error
    }

    console.log('✅ Car approval email sent via Resend:', data.id)
    return { success: true, messageId: data.id }

  } catch (error) {
    console.error('❌ Failed to send car approval email:', error)
    throw error
  }
}

/**
 * Send car rejection email
 */
export async function sendCarRejectionEmail(userEmail, userDetails, carDetails, rejectionReason = '') {
  const { full_name } = userDetails
  const { make, model, year } = carDetails

  try {
    const { data, error } = await resend.emails.send({
      from: 'EXPO CAR MEETING <contact@expocarmeeting.ro>',
      to: userEmail,
      subject: '❌ Status Înscriere - EXPO CAR MEETING',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000000;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a0033 0%, #0a0015 100%); border: 2px solid #f97316; border-radius: 16px; padding: 30px; box-shadow: 0 0 40px rgba(249, 115, 22, 0.3);">
              
              <h1 style="color: #00bcd4; font-size: 42px; text-align: center; margin: 0 0 10px 0; text-transform: uppercase; text-shadow: 0 0 20px rgba(0, 188, 212, 0.8);">
                EXPO CAR MEETING
              </h1>
              
              <p style="color: #a855f7; font-size: 14px; text-align: center; margin: 0 0 30px 0; text-transform: uppercase; letter-spacing: 2px;">
                Fălticeni • Nada Florilor • 2026
              </p>

              <div style="height: 2px; background: linear-gradient(90deg, transparent, #f97316, transparent); margin-bottom: 30px;"></div>

              <h2 style="color: #ffffff; font-size: 28px; text-align: center; margin: 0 0 20px 0;">
                Bună ${full_name},
              </h2>

              <p style="color: #e5e7eb; font-size: 16px; text-align: center; margin: 0 0 30px 0;">
                Mulțumim pentru înscriere! Din păcate, mașina ta <strong style="color: #f97316;">${make} ${model} (${year})</strong> nu a fost aprobată pentru această ediție.
              </p>

              ${rejectionReason ? `
              <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #fca5a5; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">
                  📝 Motiv:
                </p>
                <p style="color: #ffffff; font-size: 14px; margin: 0;">
                  ${rejectionReason}
                </p>
              </div>
              ` : ''}

              <p style="font-size: 14px; color: #ffffff; margin-top: 30px; padding: 15px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
                💡 <strong style="color: #fbbf24;">Ai nelămuriri?</strong><br>
                <span style="color: #e5e5e5;">Deschide un ticket și echipa noastră îți va răspunde cu toate detaliile!</span>
              </p>

              <div style="height: 1px; background: rgba(249, 115, 22, 0.3); margin: 30px 0;"></div>

              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                Pasiune & Performanță se întâlnesc<br>
                6-7 Iunie 2026 • Stadionul Nada Florilor, Fălticeni
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('❌ Resend error (car rejection):', error)
      throw error
    }

    console.log('✅ Car rejection email sent via Resend:', data.id)
    return { success: true, messageId: data.id }

  } catch (error) {
    console.error('❌ Failed to send car rejection email:', error)
    throw error
  }
}

/**
 * Send new ticket notification to admin
 */
export async function sendNewTicketNotification(adminEmails, ticketDetails, userDetails) {
  const { subject, message, id } = ticketDetails
  const { full_name: userName, email: userEmail } = userDetails

  // Handle both string and array inputs for adminEmails
  const adminEmail = Array.isArray(adminEmails) ? adminEmails[0] : adminEmails

  try {
    const { data, error } = await resend.emails.send({
      from: 'EXPO CAR MEETING <contact@expocarmeeting.ro>',
      to: adminEmail,
      subject: `🎫 Ticket Nou: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000000;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a0033 0%, #0a0015 100%); border: 2px solid #a855f7; border-radius: 16px; padding: 30px;">
              
              <h1 style="color: #00bcd4; font-size: 36px; text-align: center; margin: 0 0 20px 0;">
                🎫 TICKET NOU
              </h1>

              <div style="background: rgba(168, 85, 247, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #cccccc; font-size: 14px; margin-bottom: 10px;"><strong style="color: #ffffff;">De la:</strong> ${userName}</p>
                <p style="color: #cccccc; font-size: 14px; margin-bottom: 10px;"><strong style="color: #ffffff;">Email:</strong> ${userEmail}</p>
                <p style="color: #cccccc; font-size: 14px; margin: 0;"><strong style="color: #ffffff;">Subiect:</strong> ${subject}</p>
              </div>

              <div style="background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 8px; border-left: 4px solid #a855f7;">
                <p style="color: #ffffff; font-size: 14px; line-height: 1.6; margin: 0;">
                  ${message}
                </p>
              </div>

              <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 20px;">
                Ticket ID: #${id}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('❌ Resend error (new ticket):', error)
      throw error
    }

    console.log('✅ New ticket notification sent via Resend:', data.id)
    return { success: true, messageId: data.id }

  } catch (error) {
    console.error('❌ Failed to send new ticket notification:', error)
    throw error
  }
}

/**
 * Send ticket reply notification
 */
export async function sendTicketReplyNotification(recipientEmail, ticketDetails, replyMessage, senderName) {
  const { subject, id } = ticketDetails

  try {
    const { data, error } = await resend.emails.send({
      from: 'EXPO CAR MEETING <contact@expocarmeeting.ro>',
      to: recipientEmail,
      subject: `💬 Răspuns la Ticket: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000000;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1a0033 0%, #0a0015 100%); border: 2px solid #00bcd4; border-radius: 16px; padding: 30px;">
              
              <h1 style="color: #00bcd4; font-size: 36px; text-align: center; margin: 0 0 20px 0;">
                💬 RĂSPUNS NOU
              </h1>

              <p style="color: #e5e7eb; font-size: 14px; text-align: center; margin: 0 0 30px 0;">
                <strong>${senderName}</strong> a răspuns la ticket-ul tău:
              </p>

              <div style="background: rgba(168, 85, 247, 0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #cccccc; font-size: 13px; margin: 0;">
                  <strong style="color: #ffffff;">Subiect:</strong> ${subject}
                </p>
              </div>

              <div style="background: rgba(0, 188, 212, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #00bcd4;">
                <p style="color: #ffffff; font-size: 14px; line-height: 1.6; margin: 0;">
                  ${replyMessage}
                </p>
              </div>

              <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 20px;">
                Ticket ID: #${id}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('❌ Resend error (ticket reply):', error)
      throw error
    }

    console.log('✅ Ticket reply notification sent via Resend:', data.id)
    return { success: true, messageId: data.id }

  } catch (error) {
    console.error('❌ Failed to send ticket reply notification:', error)
    throw error
  }
}
