import nodemailer from 'nodemailer'

// Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Gmail SMTP connection error:', error)
  } else {
    console.log('Gmail SMTP ready to send emails')
  }
})

/**
 * Send car approval email with car image
 */
export async function sendCarApprovalEmail(userEmail, userDetails, carDetails) {
  const { full_name } = userDetails
  const { make, model, year, images } = carDetails
  const carImage = images && images[0] ? images[0] : ''

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Arial', sans-serif;
      background-color: #0a0a0a;
      color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 2px solid #00bcd4;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 0 30px rgba(0, 188, 212, 0.3);
    }
    .header {
      background: linear-gradient(90deg, #ec4899 0%, #a855f7 50%, #06b6d4 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #ffffff;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    }
    .content {
      padding: 40px 30px;
      color: #ffffff;
    }
    .content p {
      color: #e5e5e5;
      line-height: 1.8;
    }
    .content strong {
      color: #ffffff;
    }
    .car-image {
      width: 100%;
      max-width: 500px;
      height: auto;
      border-radius: 8px;
      margin: 20px auto;
      display: block;
      border: 3px solid #00bcd4;
      box-shadow: 0 0 20px rgba(0, 188, 212, 0.5);
    }
    .success-badge {
      background: linear-gradient(135deg, #10b981, #06b6d4);
      padding: 15px 30px;
      border-radius: 50px;
      display: inline-block;
      margin: 20px 0;
      font-size: 18px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #ffffff;
    }
    .car-details {
      background: rgba(0, 188, 212, 0.1);
      border-left: 4px solid #00bcd4;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .car-details h2 {
      margin: 0 0 10px 0;
      color: #00bcd4;
      font-size: 24px;
    }
    .car-details p {
      color: #cccccc;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #ec4899, #a855f7);
      color: #ffffff;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
      transition: all 0.3s;
    }
    .footer {
      background: #0a0a0a;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #333;
    }
    .neon-text {
      color: #00bcd4;
      text-shadow: 0 0 10px rgba(0, 188, 212, 0.8);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏁 EXPO CAR MEETING 🏁</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 18px;">Bună <strong>${full_name}</strong>,</p>
      
      <div style="text-align: center;">
        <div class="success-badge">
          ✅ MAȘINA TA A FOST ACCEPTATĂ!
        </div>
      </div>
      
      ${carImage ? `<img src="${carImage}" alt="${make} ${model}" class="car-image">` : ''}
      
      <div class="car-details">
        <h2>${make} ${model}</h2>
        <p style="margin: 5px 0; font-size: 16px; color: #ccc;">
          <strong>An fabricație:</strong> ${year || 'N/A'}
        </p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.8; color: #e5e5e5;">
        <strong class="neon-text">Felicitări!</strong> Mașina ta a fost acceptată la <strong style="color: #ffffff;">EXPO CAR MEETING 2026</strong>! 🎉
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #e5e5e5;">
        Te așteaptă două zile pline de pasiune auto, concursuri și premii! Nu uita să vii pregătit pentru un eveniment de neuitat!
      </p>
      
      <p style="font-size: 14px; color: #aaaaaa; margin-top: 30px;">
        Dacă ai întrebări, ne poți contacta la <a href="mailto:expocarmeeting@gmail.com" style="color: #00bcd4;">expocarmeeting@gmail.com</a>
      </p>
    </div>
    
    <div class="footer">
      <p>© 2026 EXPO CAR MEETING - Fălticeni, Nada Florilor</p>
      <p>Partener Oficial: <strong>AUTO MINGIUC</strong></p>
    </div>
  </div>
</body>
</html>
  `

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: userEmail,
      subject: '✅ Mașina ta a fost ACCEPTATĂ - EXPO CAR MEETING 2026',
      html: htmlContent,
    })
    console.log(`Car approval email sent to ${userEmail}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending car approval email:', error)
    throw error
  }
}

/**
 * Send car rejection email
 */
export async function sendCarRejectionEmail(userEmail, userDetails, carDetails) {
  const { full_name } = userDetails
  const { make, model, year, images } = carDetails
  const carImage = images && images[0] ? images[0] : ''

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Arial', sans-serif;
      background-color: #0a0a0a;
      color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 2px solid #ef4444;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
    }
    .header {
      background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 2px;
    }
    .content {
      padding: 40px 30px;
    }
    .car-image {
      width: 100%;
      max-width: 500px;
      height: auto;
      border-radius: 8px;
      margin: 20px auto;
      display: block;
      border: 3px solid #ef4444;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
      opacity: 0.7;
    }
    .info-box {
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid #ef4444;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .info-box h2 {
      margin: 0 0 10px 0;
      color: #ef4444;
      font-size: 24px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #ec4899, #a855f7);
      color: #ffffff;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
    }
    .footer {
      background: #0a0a0a;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #333;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏁 EXPO CAR MEETING 🏁</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 18px;">Bună <strong>${full_name}</strong>,</p>
      
      ${carImage ? `<img src="${carImage}" alt="${make} ${model}" class="car-image">` : ''}
      
      <div class="info-box">
        <h2>❌ ${make} ${model}</h2>
        <p style="margin: 5px 0; font-size: 16px; color: #ccc;">
          <strong>An fabricație:</strong> ${year || 'N/A'}
        </p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.8; color: #ddd;">
        Ne pare rău, dar mașina ta nu a fost acceptată pentru <strong>EXPO CAR MEETING 2026</strong>.
      </p>
      
      <p style="font-size: 16px; line-height: 1.8; color: #ddd;">
        <strong>Dacă ai nelămuriri sau întrebări</strong>, te rugăm să deschizi un ticket de support și vom clarifica situația cât mai curând posibil.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/tickets" class="button">
          💬 Deschide Ticket Support
        </a>
      </div>
      
      <p style="font-size: 14px; color: #888; margin-top: 30px; padding: 15px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
        💡 <strong>Avem nelămuriri?</strong><br>
        Deschide un ticket și echipa noastră îți va răspunde cu toate detaliile. Poate există motive tehnice sau organizatorice pe care le putem clarifica împreună!
      </p>
      
      <p style="font-size: 14px; color: #888; margin-top: 20px;">
        Contact: <a href="mailto:expocarmeeting@gmail.com" style="color: #00bcd4;">expocarmeeting@gmail.com</a>
      </p>
    </div>
    
    <div class="footer">
      <p>© 2026 EXPO CAR MEETING - Fălticeni, Nada Florilor</p>
      <p>Partener Oficial: <strong>AUTO MINGIUC</strong></p>
    </div>
  </div>
</body>
</html>
  `

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: userEmail,
      subject: '❌ Mașina ta nu a fost acceptată - EXPO CAR MEETING 2026',
      html: htmlContent,
    })
    console.log(`Car rejection email sent to ${userEmail}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending car rejection email:', error)
    throw error
  }
}

export default transporter



/**
 * Send new ticket notification to admins/organizers
 */
export async function sendNewTicketNotification(adminEmails, ticketData, userData) {
  const { subject, message, id } = ticketData
  const { full_name, email } = userData

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e, #16213e); border: 2px solid #ec4899; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(90deg, #ec4899, #a855f7); padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; color: #fff; }
    .content { padding: 30px; color: #e5e5e5; }
    .ticket-box { background: rgba(236, 72, 153, 0.1); border-left: 4px solid #ec4899; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .button { display: inline-block; background: linear-gradient(135deg, #ec4899, #a855f7); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold; margin: 20px 0; }
    .footer { background: #0a0a0a; padding: 20px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎫 TICKET NOU EXPOCARMEETING</h1>
    </div>
    <div class="content">
      <p style="font-size: 18px; color: #fff;"><strong>Ticket nou de la:</strong> ${full_name}</p>
      <p style="color: #aaa;">Email: <a href="mailto:${email}" style="color: #00bcd4;">${email}</a></p>
      
      <div class="ticket-box">
        <h3 style="color: #ec4899; margin-top: 0;">📌 ${subject}</h3>
        <p style="color: #e5e5e5; white-space: pre-wrap;">${message}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="button">
          👀 Vezi Ticket în Dashboard
        </a>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 EXPO CAR MEETING</p>
    </div>
  </div>
</body>
</html>
  `

  try {
    for (const adminEmail of adminEmails) {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: adminEmail,
        subject: `🎫 TICKET NOU EXPOCARMEETING - ${full_name}`,
        html: htmlContent,
      })
    }
    console.log(`New ticket notification sent to ${adminEmails.length} admins`)
    return { success: true }
  } catch (error) {
    console.error('Error sending new ticket notification:', error)
    throw error
  }
}

/**
 * Send ticket reply notification to user
 */
export async function sendTicketReplyToUser(userEmail, ticketData, replyData) {
  const { subject, id } = ticketData
  const { message, created_by_name } = replyData

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e, #16213e); border: 2px solid #00bcd4; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(90deg, #00bcd4, #06b6d4); padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; color: #fff; }
    .content { padding: 30px; color: #e5e5e5; }
    .message-box { background: rgba(0, 188, 212, 0.1); border-left: 4px solid #00bcd4; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .button { display: inline-block; background: linear-gradient(135deg, #ec4899, #a855f7); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold; margin: 20px 0; }
    .footer { background: #0a0a0a; padding: 20px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💬 MESAJ TICKET EXPO CAR MEETING</h1>
    </div>
    <div class="content">
      <p style="font-size: 18px; color: #fff;"><strong>Răspuns nou la ticket-ul tău:</strong></p>
      <p style="color: #00bcd4; font-weight: bold;">📌 ${subject}</p>
      
      <div class="message-box">
        <p style="color: #aaa; font-size: 14px; margin-bottom: 10px;"><strong>De la:</strong> ${created_by_name}</p>
        <p style="color: #e5e5e5; white-space: pre-wrap;">${message}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/tickets" class="button">
          💬 Răspunde la Ticket
        </a>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 EXPO CAR MEETING</p>
    </div>
  </div>
</body>
</html>
  `

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: userEmail,
      subject: '💬 MESAJ TICKET EXPO CAR MEETING',
      html: htmlContent,
    })
    console.log(`Ticket reply sent to user: ${userEmail}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending ticket reply to user:', error)
    throw error
  }
}

/**
 * Send ticket reply notification to admins/organizers
 */
export async function sendTicketReplyToAdmins(adminEmails, ticketData, replyData, userData) {
  const { subject, id } = ticketData
  const { message } = replyData
  const { full_name, email } = userData

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e, #16213e); border: 2px solid #a855f7; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(90deg, #a855f7, #ec4899); padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; color: #fff; }
    .content { padding: 30px; color: #e5e5e5; }
    .message-box { background: rgba(168, 85, 247, 0.1); border-left: 4px solid #a855f7; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .button { display: inline-block; background: linear-gradient(135deg, #ec4899, #a855f7); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold; margin: 20px 0; }
    .footer { background: #0a0a0a; padding: 20px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💬 MESAJ TICKET EXPO CAR MEETING</h1>
    </div>
    <div class="content">
      <p style="font-size: 18px; color: #fff;"><strong>Răspuns nou de la:</strong> ${full_name}</p>
      <p style="color: #aaa;">Email: <a href="mailto:${email}" style="color: #00bcd4;">${email}</a></p>
      <p style="color: #a855f7; font-weight: bold;">📌 ${subject}</p>
      
      <div class="message-box">
        <p style="color: #e5e5e5; white-space: pre-wrap;">${message}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="button">
          👀 Vezi Ticket în Dashboard
        </a>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 EXPO CAR MEETING</p>
    </div>
  </div>
</body>
</html>
  `

  try {
    for (const adminEmail of adminEmails) {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: adminEmail,
        subject: '💬 MESAJ TICKET EXPO CAR MEETING',
        html: htmlContent,
      })
    }
    console.log(`Ticket reply sent to ${adminEmails.length} admins`)
    return { success: true }
  } catch (error) {
    console.error('Error sending ticket reply to admins:', error)
    throw error
  }
}
