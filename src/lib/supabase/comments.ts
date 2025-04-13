
import { supabase } from '@/integrations/supabase/client';

export const getBlogComments = async (blogId: string, status?: string) => {
  let query = supabase
    .from('comments')
    .select('*')
    .eq('blog_id', blogId)
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  
  return data;
};
