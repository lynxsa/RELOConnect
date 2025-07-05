import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: any;
}

interface EmailTemplate {
  html: string;
  text: string;
}

// Email templates
const templates: Record<string, (data: any) => EmailTemplate> = {
  'driver-invite': (data) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>RELOConnect Driver Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0057FF, #00B2FF); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #0057FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚛 RELOConnect Driver Invitation</h1>
          </div>
          <div class="content">
            <h2>Welcome to RELOConnect!</h2>
            <p>Hi ${data.driverName},</p>
            <p><strong>${data.ownerName}</strong> has invited you to join their fleet on RELOConnect, South Africa's leading logistics platform.</p>
            
            ${data.personalMessage ? `<div style="background: #e3f2fd; padding: 15px; border-left: 4px solid #0057FF; margin: 20px 0;"><p><em>"${data.personalMessage}"</em></p></div>` : ''}
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Complete your driver profile and upload your license</li>
              <li>Complete identity verification</li>
              <li>Get assigned to a truck</li>
              <li>Start earning with flexible trips</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="${data.inviteUrl}" class="button">Accept Invitation & Start Onboarding</a>
            </p>
            
            <p><strong>Important:</strong> This invitation expires on <strong>${data.expiresAt}</strong>.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <h3>Why RELOConnect?</h3>
            <ul>
              <li>✅ Flexible work schedule</li>
              <li>💰 Competitive earnings with weekly payouts</li>
              <li>📱 Easy-to-use driver app</li>
              <li>🔒 Comprehensive insurance coverage</li>
              <li>📞 24/7 support team</li>
            </ul>
          </div>
          <div class="footer">
            <p>RELOConnect - Moving South Africa Forward</p>
            <p>Need help? Contact us at support@reloconnect.co.za or +27 11 123 4567</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      RELOConnect Driver Invitation
      
      Hi ${data.driverName},
      
      ${data.ownerName} has invited you to join their fleet on RELOConnect.
      
      ${data.personalMessage ? `Personal message: "${data.personalMessage}"` : ''}
      
      To accept this invitation and start your onboarding, please visit:
      ${data.inviteUrl}
      
      This invitation expires on ${data.expiresAt}.
      
      Why RELOConnect?
      - Flexible work schedule
      - Competitive earnings with weekly payouts
      - Easy-to-use driver app
      - Comprehensive insurance coverage
      - 24/7 support team
      
      Need help? Contact us at support@reloconnect.co.za
    `
  }),
  
  'kyc-approved': (data) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>KYC Verification Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4CAF50, #81C784); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { background: #e8f5e8; border: 2px solid #4CAF50; border-radius: 5px; padding: 20px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Verification Approved!</h1>
          </div>
          <div class="content">
            <div class="success">
              <h2>🎉 Congratulations ${data.name}!</h2>
              <p>Your ${data.entityType} verification has been <strong>approved</strong>.</p>
            </div>
            
            <p>You can now access all RELOConnect features and start using the platform.</p>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              ${data.nextSteps?.map((step: string) => `<li>${step}</li>`).join('') || ''}
            </ul>
            
            <p>Welcome to the RELOConnect family!</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Verification Approved!
      
      Congratulations ${data.name}!
      Your ${data.entityType} verification has been approved.
      
      You can now access all RELOConnect features.
      
      ${data.nextSteps ? `Next Steps:\n${data.nextSteps.map((step: string) => `- ${step}`).join('\n')}` : ''}
      
      Welcome to the RELOConnect family!
    `
  }),
  
  'kyc-rejected': (data) => ({
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>KYC Verification Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF5722, #FF8A65); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .notice { background: #fff3e0; border: 2px solid #FF5722; border-radius: 5px; padding: 20px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Verification Update</h1>
          </div>
          <div class="content">
            <div class="notice">
              <h2>Additional Information Required</h2>
              <p>Hi ${data.name}, we need some additional information to complete your verification.</p>
            </div>
            
            <p><strong>Reason:</strong> ${data.reason}</p>
            
            <p><strong>What you need to do:</strong></p>
            <ul>
              ${data.requiredActions?.map((action: string) => `<li>${action}</li>`).join('') || ''}
            </ul>
            
            <p>Please log in to your account and upload the required documents or information.</p>
            
            <p>If you have questions, our support team is here to help at support@reloconnect.co.za</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Verification Update
      
      Hi ${data.name},
      
      We need some additional information to complete your verification.
      
      Reason: ${data.reason}
      
      Required actions:
      ${data.requiredActions?.map((action: string) => `- ${action}`).join('\n') || ''}
      
      Please log in to your account and provide the required information.
      
      Need help? Contact support@reloconnect.co.za
    `
  })
};

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send email using templates
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const template = templates[emailData.template];
    if (!template) {
      throw new Error(`Email template '${emailData.template}' not found`);
    }
    
    const { html, text } = template(emailData.data);
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"RELOConnect" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      html,
      text,
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

/**
 * Send bulk emails (for notifications, etc.)
 */
export async function sendBulkEmails(emails: EmailData[]): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  
  for (const email of emails) {
    const success = await sendEmail(email);
    if (success) {
      sent++;
    } else {
      failed++;
    }
    
    // Add delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return { sent, failed };
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default sendEmail;
