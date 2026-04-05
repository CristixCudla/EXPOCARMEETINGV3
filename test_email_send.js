require('dotenv').config();
const { sendTicketReplyToUser } = require('./lib/gmail-smtp.js');

async function testEmailSend() {
    try {
        console.log('🔧 Environment check:');
        console.log('SMTP_HOST:', process.env.SMTP_HOST);
        console.log('SMTP_PORT:', process.env.SMTP_PORT);
        console.log('SMTP_USER:', process.env.SMTP_USER);
        console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***HIDDEN***' : 'NOT SET');
        console.log('SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL);
        console.log('SMTP_FROM_NAME:', process.env.SMTP_FROM_NAME);
        
        const ticketData = {
            subject: "Test Ticket pentru Email",
            id: process.argv[2] || "test-ticket-id"
        };
        
        const replyData = {
            message: "Bună! Am primit ticket-ul tău. Îți răspundem cât mai curând posibil!",
            created_by_name: "Administrator"
        };
        
        console.log('🚀 Sending email to cristicudla123@gmail.com...');
        const result = await sendTicketReplyToUser("cristicudla123@gmail.com", ticketData, replyData);
        console.log('✅ Email sent successfully:', result);
    } catch (error) {
        console.error('❌ Email send failed:', error);
        process.exit(1);
    }
}

testEmailSend();