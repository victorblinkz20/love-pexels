export async function onRequestPost(context) {
  try {
    const { email, role } = await context.request.json();
    
    if (!email || !role) {
      return new Response(JSON.stringify({ error: 'Email and role are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get Brevo API key from environment variables
    const apiKey = context.env.BREVO_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Send email using Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: {
          name: context.env.EMAIL_SENDER_NAME || 'Love&Pixels',
          email: context.env.EMAIL_SENDER_ADDRESS || 'victorblinkz20@gmail.com'
        },
        to: [{
          email,
          name: email.split('@')[0]
        }],
        subject: 'Invitation to join our platform',
        htmlContent: `
          <h1>You've been invited!</h1>
          <p>You have been invited to join our platform as a ${role}.</p>
          <p>Click the link below to set up your account:</p>
          <a href="${context.env.APP_URL || 'https://your-app.pages.dev'}/auth/signup?email=${encodeURIComponent(email)}">Set up your account</a>
        `
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({ error: errorData.message || 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 