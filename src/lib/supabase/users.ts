import { supabase } from '@/integrations/supabase/client';
import { sendInviteEmail } from '@/lib/email/brevo';

// Define the profile type based on the actual database schema
type Profile = {
  id: string;
  username: string;
  email: string;
  role_id: string;
  role: string;
  status: string;
  created_at: string;
  avatar_url?: string;
  website?: string;
  bio?: string;
};

export const inviteUser = async (email: string, role: string) => {
  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      throw checkError;
    }

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Send invitation email
    console.log('Sending invitation email to:', email);
    const baseUrl = window.location.origin;
    console.log('Using base URL:', baseUrl);
    
    const response = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, role }),
    });

    const responseData = await response.json().catch(() => null);
    console.log('Email API response status:', response.status);
    console.log('Email API response data:', responseData);

    if (!response.ok) {
      throw new Error(responseData?.error || `Failed to send invitation email: ${response.status} ${response.statusText}`);
    }

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email,
          role_id: role,
          status: 'pending',
          username: email.split('@')[0],
        },
      ]);

    if (profileError) throw profileError;

    return { success: true };
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      roles:role_id (
        name
      )
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  if (!data) return null;
  
  return {
    ...data,
    role: data.roles?.name || 'user'
  };
};

export const getUserRoles = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

export const changeUserRole = async (userId: string, newRole: string) => {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role_id: newRole })
    .eq('id', userId);

  if (profileError) throw profileError;

  const { error: roleError } = await supabase
    .from('user_roles')
    .update({ role_id: newRole })
    .eq('user_id', userId);

  if (roleError) throw roleError;
};

export const deleteUser = async (userId: string) => {
  const { error: roleError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  if (roleError) throw roleError;

  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) throw profileError;

  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) throw authError;
};

export const getAllUsers = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      roles:role_id (
        name
      )
    `);

  if (error) throw error;
  
  return data.map(user => ({
    ...user,
    role: user.roles?.name || 'user'
  }));
};
