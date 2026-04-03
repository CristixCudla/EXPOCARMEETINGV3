import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://expocarmeeting.ro'
const FROM_EMAIL = 'EXPO CAR MEETING <noreply@expocarmeeting.ro>'

// Email când mașina e ACCEPTATĂ (UPDATED - Mai frumos)
export async function sendCarApprovedEmail(userEmail, userDetails, carDetails) {
  const { make, model, year } = carDetails
  const userName = userDetails.full_name || 'Prieten'
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mașina Ta A Fost Acceptată!</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background: #0a0a0a; }
    .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border-radius: 16px; overflow: hidden; border: 2px solid #06b6d4; box-shadow: 0 0 40px rgba(6, 182, 212, 0.4); }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 50px 20px; text-align: center; position: relative; }
    .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>'); opacity: 0.3; }
    .logo { font-size: 32px; font-weight: 900; color: white; letter-spacing: 4px; text-shadow: 0 0 20px rgba(255,255,255,0.6); position: relative; z-index: 1; }
    .icon-success { font-size: 100px; margin: 30px 0; animation: bounce 2s infinite; position: relative; z-index: 1; }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
    .content { padding: 50px 40px; color: white; }
    .title { font-size: 36px; font-weight: 900; color: #06b6d4; margin-bottom: 25px; text-align: center; text-transform: uppercase; letter-spacing: 2px; }
    .car-info { background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(8, 145, 178, 0.1) 100%); border: 3px solid #06b6d4; border-radius: 16px; padding: 30px; margin: 35px 0; box-shadow: 0 10px 30px rgba(6, 182, 212, 0.2); }
    .car-name { font-size: 32px; font-weight: 900; color: white; margin-bottom: 12px; text-shadow: 0 0 10px rgba(6, 182, 212, 0.5); }
    .message { font-size: 17px; line-height: 1.9; color: #d1d5db; margin: 25px 0; }
    .info-box { background: rgba(139, 92, 246, 0.1); border-left: 5px solid #8b5cf6; padding: 25px; margin: 30px 0; border-radius: 8px; }
    .info-box strong { color: #8b5cf6; font-size: 18px; display: block; margin-bottom: 15px; }
    .info-box li { margin: 10px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 18px 45px; border-radius: 50px; text-decoration: none; font-weight: 900; font-size: 18px; margin: 25px 0; box-shadow: 0 10px 30px rgba(6, 182, 212, 0.5); transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px; }
    .button:hover { box-shadow: 0 15px 40px rgba(6, 182, 212, 0.7); transform: translateY(-3px); }
    .footer { background: rgba(0,0,0,0.5); padding: 35px; text-align: center; color: #9ca3af; font-size: 14px; border-top: 1px solid rgba(6, 182, 212, 0.2); }
    .footer a { color: #06b6d4; text-decoration: none; }
    .highlight { color: #06b6d4; font-weight: bold; }
    .emoji { font-size: 24px; vertical-align: middle; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">EXPO CAR MEETING</div>
      <div class="icon-success">🎉</div>
    </div>
    <div class="content">
      <h1 class="title">✨ FELICITĂRI ${userName}! ✨</h1>
      <p class="message" style="text-align: center; font-size: 22px; font-weight: bold;">
        Mașina ta a fost <span class="highlight">ACCEPTATĂ</span> la eveniment!
      </p>
      <div class="car-info">
        <div class="car-name">${make} ${model}</div>
        ${year ? `<div style="color: #9ca3af; font-size: 20px; margin-top: 8px;">📅 Anul: ${year}</div>` : ''}
      </div>
      <p class="message">
        Suntem încântați să anunțăm că <strong style="color: white;">${make} ${model}</strong> a fost acceptat pentru <strong style="color: #06b6d4;">Expo Car Meeting 2026</strong>! Mașina ta va fi expusă la eveniment pe <strong>6-7 Iunie 2026</strong> la Nada Florilor, Fălticeni.
      </p>
      <div class="info-box">
        <strong>🎯 Ce urmează:</strong>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li>✅ Mașina ta va fi afișată în galeria oficială</li>
          <li>🏆 Participă la votarea Best Car of the Show</li>
          <li>📧 Vei primi detalii cu privire la program și acces</li>
          <li>🚗 Pregătește mașina pentru show!</li>
        </ul>
      </div>
      <p class="message" style="text-align: center; font-size: 18px; margin-top: 40px;">
        <strong>Te așteptăm cu drag la cel mai spectaculos eveniment auto al anului!</strong>
      </p>
      <div style="text-align: center; margin-top: 40px;">
        <a href="${SITE_URL}/masini" class="button">Vezi Toate Mașinile Acceptate →</a>
      </div>
    </div>
    <div class="footer">
      <p style="font-size: 16px; margin-bottom: 15px;"><strong>© 2026 Expo Car Meeting</strong></p>
      <p>📍 Nada Florilor, Fălticeni | 📅 6-7 Iunie 2026</p>
      <p style="margin-top: 20px;">
        📧 <a href="mailto:expocarmeeting@gmail.com">expocarmeeting@gmail.com</a> | 
        📱 <a href="tel:0746225850">0746 225 850</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px; color: #6b7280;">
        Ai primit acest email pentru că ți-ai înregistrat mașina la Expo Car Meeting.
      </p>
    </div>
  </div>
</body>
</html>
`

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: '🎉 MAȘINA TA A FOST ACCEPTATĂ - EXPO CAR MEETING 2026!',
      html: html,
    })

    if (error) {
      console.error('Error sending car approved email:', error)
      return { error }
    }

    return { data }
  } catch (error) {
    console.error('Error sending car approved email:', error)
    return { error }
  }
}

// Continuă în următorul mesaj cu celelalte funcții...
