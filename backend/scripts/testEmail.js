import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(process.env.RESEND_API);

async function testEmail() {
  try {
    console.log("📧 Sending test email...");
    
    const testEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">🧪 Test Email</h2>
        
        <p>This is a test email to verify that the Resend API is working correctly.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📊 Test Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px;"><strong>API Key:</strong></td><td style="padding: 8px;">${process.env.RESEND_API ? 'Configured ✅' : 'Not Configured ❌'}</td></tr>
            <tr><td style="padding: 8px;"><strong>Time:</strong></td><td style="padding: 8px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
            <tr><td style="padding: 8px;"><strong>From:</strong></td><td style="padding: 8px;">Sachin Bansal's Book Store &lt;onboarding@resend.dev&gt;</td></tr>
          </table>
        </div>
        
        <p>If you receive this email, the email system is working correctly!</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6c757d; font-size: 14px;">
          Best regards,<br>
          <strong>Sachin Bansal</strong><br>
          Author & Educator<br>
          <small>This is an automated test email.</small>
        </p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "Sachin Bansal's Book Store <onboarding@resend.dev>",
      to: "anotherdimplekataria@gmail.com",
      subject: "🧪 Test Email - Sachin Bansal's Book Store",
      html: testEmailContent,
    });

    console.log("✅ Test email sent successfully!");
    console.log("📧 Email ID:", result.data?.id);
    console.log("📊 Result:", result);
    
  } catch (error) {
    console.error("❌ Failed to send test email:", error);
  }
}

testEmail();
