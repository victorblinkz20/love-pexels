import { supabase } from '@/integrations/supabase/client';

export const recordBlogView = async (blogId: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  // First, try to get existing analytics for today
  const { data: existingAnalytics, error: fetchError } = await supabase
    .from('analytics')
    .select('*')
    .eq('blog_id', blogId)
    .eq('date', today)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error('Error fetching existing analytics:', fetchError);
    return;
  }
  
  if (existingAnalytics) {
    // Update existing record
    const { error: updateError } = await supabase
      .from('analytics')
      .update({
        page_views: (existingAnalytics.page_views || 0) + 1,
        unique_visitors: (existingAnalytics.unique_visitors || 0) + 1,
        avg_time_on_page: existingAnalytics.avg_time_on_page || 0,
        bounce_rate: existingAnalytics.bounce_rate || 0,
        geo_distribution: existingAnalytics.geo_distribution || {},
        referral_sources: existingAnalytics.referral_sources || {}
      })
      .eq('id', existingAnalytics.id);
    
    if (updateError) {
      console.error('Error updating analytics:', updateError);
    }
  } else {
    // Create new record
    const { error: insertError } = await supabase
      .from('analytics')
      .insert([{
        blog_id: blogId,
        date: today,
        page_views: 1,
        unique_visitors: 1,
        avg_time_on_page: 0,
        bounce_rate: 0,
        geo_distribution: {},
        referral_sources: {}
      }]);
    
    if (insertError) {
      console.error('Error creating analytics:', insertError);
    }
  }
};

export const getBlogAnalytics = async (blogId: string, period: 'day' | 'week' | 'month' = 'day') => {
  const now = new Date();
  let startDate = new Date();
  
  if (period === 'day') {
    startDate.setDate(now.getDate() - 1);
  } else if (period === 'week') {
    startDate.setDate(now.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(now.getMonth() - 1);
  }
  
  console.log('Fetching analytics for period:', period);
  console.log('Date range:', startDate.toISOString().split('T')[0], 'to', now.toISOString().split('T')[0]);
  
  let query = supabase
    .from('analytics')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', now.toISOString().split('T')[0])
    .order('date', { ascending: true });

  // Only filter by blog_id if it's not 'all'
  if (blogId !== 'all') {
    query = query.eq('blog_id', blogId);
  } else {
    // For 'all', we want to get all records without filtering by blog_id
    // This is the default behavior, so we don't need to do anything
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching blog analytics:', error);
    return [];
  }
  
  console.log('Analytics data fetched:', data);
  return data;
};
