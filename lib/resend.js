import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey) {
  throw new Error('Missing RESEND_API_KEY environment variable')
}

export const resend = new Resend(resendApiKey)

const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@expocarmeeting.ro'

// Email Templates
export const emailTemplates = {
  carAccepted: (userName, carMake, carModel) => ({
    subject: 'Mașina ta a fost acceptată! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #fff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 32px; font-weight: bold; background: linear-gradient(to right, #ff0080, #00ffff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.1); }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #00ffff; }
            .message { font-size: 16px; line-height: 1.6; color: #e0e0e0; margin-bottom: 30px; }
            .car-info { background: rgba(0, 255, 255, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #00ffff; margin-bottom: 30px; }
            .button { display: inline-block; background: linear-gradient(to right, #ff0080, #ff8c00); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            .footer { text-align: center; margin-top: 40px; color: #888; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">EXPO CAR MEETING</div>
            </div>
            <div class="content">
              <div class="title">✅ Felicitări ${userName}!</div>
              <div class="message">
                Suntem bucuroși să îți anunțăm că mașina ta a fost acceptată în cadrul Expo Car Meeting 2026!
              </div>
              <div class="car-info">
                <strong>Mașina acceptată:</strong><br>
                ${carMake} ${carModel}
              </div>
              <div class="message">
                Mașina ta va fi afișată în eveniment. Te așteptăm la Stadionul Nada Florilor, Fălticeni, în perioada 6-7 Iunie 2026!
              </div>
              <a href="https://expocarmeeting.ro" class="button">Vezi Detalii Eveniment →</a>
            </div>
            <div class="footer">
              © 2026 Expo Car Meeting. Toate drepturile rezervate.
            </div>
          </div>
        </body>
      </html>
    `
  }),

  carRejected: (userName, carMake, carModel) => ({
    subject: 'Status înregistrare mașină',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #fff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 32px; font-weight: bold; background: linear-gradient(to right, #ff0080, #00ffff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.1); }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #ff6b6b; }
            .message { font-size: 16px; line-height: 1.6; color: #e0e0e0; margin-bottom: 30px; }
            .car-info { background: rgba(255, 107, 107, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b6b; margin-bottom: 30px; }
            .footer { text-align: center; margin-top: 40px; color: #888; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">EXPO CAR MEETING</div>
            </div>
            <div class="content">
              <div class="title">Actualizare înregistrare</div>
              <div class="message">
                Bună ${userName},
              </div>
              <div class="car-info">
                <strong>Mașina:</strong><br>
                ${carMake} ${carModel}
              </div>
              <div class="message">
                Din păcate, în urma evaluării, mașina ta nu a fost selectată pentru acest eveniment. Te încurajăm să încerci la viitoarele ediții!
              </div>
              <div class="message">
                Pentru detalii sau întrebări, ne poți contacta prin sistemul de ticketing de pe site.
              </div>
            </div>
            <div class="footer">
              © 2026 Expo Car Meeting. Toate drepturile rezervate.
            </div>
          </div>
        </body>
      </html>
    `
  }),

  newTicket: (adminEmail, userName, ticketSubject, ticketId) => ({
    subject: 'Mesaj ticket',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #fff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 32px; font-weight: bold; background: linear-gradient(to right, #ff0080, #00ffff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.1); }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #00ffff; }
            .message { font-size: 16px; line-height: 1.6; color: #e0e0e0; margin-bottom: 20px; }
            .ticket-info { background: rgba(0, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">EXPO CAR MEETING - ADMIN</div>
            </div>
            <div class="content">
              <div class="title">🎫 Ticket Nou Creat</div>
              <div class="ticket-info">
                <strong>De la:</strong> ${userName}<br>
                <strong>Subiect:</strong> ${ticketSubject}<br>
                <strong>ID Ticket:</strong> ${ticketId}
              </div>
              <div class="message">
                Un utilizator a creat un ticket nou. Accesează dashboard-ul pentru a vizualiza și răspunde.
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  ticketReply: (userEmail, userName, ticketSubject, replyMessage) => ({
    subject: 'MESAJ TICKET:',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #0a0a0a; color: #fff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { font-size: 32px; font-weight: bold; background: linear-gradient(to right, #ff0080, #00ffff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255, 255, 255, 0.1); }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #00ffff; }
            .message { font-size: 16px; line-height: 1.6; color: #e0e0e0; margin-bottom: 20px; }
            .reply-box { background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 8px; border-left: 4px solid #ff0080; margin: 20px 0; }
            .button { display: inline-block; background: linear-gradient(to right, #ff0080, #ff8c00); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">EXPO CAR MEETING</div>
            </div>
            <div class="content">
              <div class="title">💬 Răspuns la ticket</div>
              <div class="message">
                Bună ${userName},<br><br>
                Ai primit un răspuns la ticketul tău: <strong>${ticketSubject}</strong>
              </div>
              <div class="reply-box">
                ${replyMessage}
              </div>
              <a href="https://expocarmeeting.ro/dashboard/tickets" class="button">Vezi Ticket →</a>
            </div>
          </div>
        </body>
      </html>
    `
  })
}

// Send email helper
export async function sendEmail(to, template) {
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: template.subject,
      html: template.html
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}
