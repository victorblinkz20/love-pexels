import { TransactionalEmailsApi } from '@getbrevo/brevo';

const apiKey = process.env.BREVO_API_KEY || '';
const brevoClient = new TransactionalEmailsApi();

export const sendInviteEmail = async (email: string, role: string) => {
  console.log('=== Starting Email Send Process ===');
  console.log('Brevo API Key:', apiKey ? 'Set' : 'Not set');
  console.log('Sender Name:', process.env.EMAIL_SENDER_NAME);
  console.log('Sender Email:', process.env.EMAIL_SENDER_ADDRESS);
  console.log('Recipient Email:', email);
  console.log('Role:', role);
  
  if (!apiKey) {
    console.error('❌ Brevo API key not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    console.log('📧 Attempting to send email...');
    const response = await brevoClient.sendTransacEmail({
      sender: {
        name: process.env.EMAIL_SENDER_NAME || 'Love&Pixels',
        email: process.env.EMAIL_SENDER_ADDRESS || 'victorblinkz20@gmail.com',
      },
      to: [{
        email,
        name: email.split('@')[0],
      }],
      subject: 'Invitation to join our platform',
      htmlContent: `
        <h1>You've been invited!</h1>
        <p>You have been invited to join our platform as a ${role}.</p>
        <p>Click the link below to set up your account:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/signup?email=${encodeURIComponent(email)}">Set up your account</a>
      `,
    }, {
      headers: {
        'api-key': apiKey
      }
    });

    console.log('✅ Email sent successfully!');
    console.log('Response:', JSON.stringify(response, null, 2));
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error sending invite email:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return { success: false, error };
  }
}; 