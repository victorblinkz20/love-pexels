import { NextResponse } from 'next/server';
import { sendInviteEmail } from '@/lib/email/brevo';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  console.log('=== API Route: Send Email ===');
  console.log('Request received');
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS request for CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { email, role } = body;
    console.log('Email:', email);
    console.log('Role:', role);
    
    if (!email || !role) {
      console.error('Missing email or role');
      return NextResponse.json(
        { error: 'Email and role are required' }, 
        { status: 400, headers }
      );
    }
    
    console.log('Calling sendInviteEmail...');
    const result = await sendInviteEmail(email, role);
    console.log('Email send result:', result);
    
    if (!result.success) {
      console.error('Email send failed:', result.error);
      return NextResponse.json(
        { error: result.error }, 
        { status: 500, headers }
      );
    }
    
    console.log('Email sent successfully');
    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to send email' }, 
      { status: 500, headers }
    );
  }
} 