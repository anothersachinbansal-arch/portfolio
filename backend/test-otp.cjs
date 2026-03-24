require('dotenv').config();
const { Resend } = require('resend');

console.log('RESEND_API:', process.env.RESEND_API);
console.log('RESEND_API length:', process.env.RESEND_API?.length);

const resend = new Resend(process.env.RESEND_API);

async function testOTP() {
  try {
    const result = await resend.emails.send({
      from: "OTP Service <onboarding@resend.dev>",
      to: "anotherdimplekataria@gmail.com",
      subject: "Test OTP",
      html: "<h1>123456</h1>",
    });
    
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Email error:', error);
  }
}

testOTP();
