import { supabase as supabaseClient } from '@/integrations/supabase/client';
import { MediaItem } from '@/lib/supabase/types';

// Re-export the supabase client
export const supabase = supabaseClient;

// Type definitions for our database tables
type DBBlog = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_id: string;
  category_id: string;
  status: string;
  views: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
};

export type Blog = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_id: string;
  category_id: string;
  status: string;
  views: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  is_featured?: boolean;
  categories?: {
    id: string;
    name: string;
  } | null;
};

export type Category = {
  id: string;
  name: string;
  updated_at?: string;
};

export type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  website?: string;
  bio?: string;
};

export type Role = {
  id: string;
  name: string;
  permissions: Record<string, any>;
};

export type Comment = {
  id: string;
  blog_id: string;
  author_id?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type Analytics = {
  id: string;
  blog_id: string;
  page_views: number;
  unique_visitors: number;
  avg_time_on_page: number;
  bounce_rate: number;
  referral_sources: Record<string, number>;
  geo_distribution: Record<string, number>;
  date: string;
};

export type PostRevision = {
  id: string;
  blog_id: string;
  content: string;
  changes?: Record<string, any>;
  author_id: string;
  created_at: string;
};

type BlogUpdate = {
  is_featured?: boolean;
  title?: string;
  content?: string;
  excerpt?: string;
  author_id?: string;
  category_id?: string;
  status?: string;
  image_url?: string | null;
};

type SupabaseRPC = {
  increment_blog_view: (params: { blog_id: string }) => Promise<{ data: any; error: any }>;
  clear_featured_blog: () => Promise<{ data: any; error: any }>;
  set_featured_blog: (params: { blog_id: string }) => Promise<{ data: any; error: any }>;
};

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Blog related functions
export const getBlogs = async (status?: string): Promise<Blog[]> => {
  try {
    // First, fetch all blogs
    let query = supabase
      .from('blogs')
      .select('*');
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data: blogs, error: blogsError } = await query.order('created_at', { ascending: false });
    
    if (blogsError) throw blogsError;
    if (!blogs) return [];

    // Then, fetch all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) throw categoriesError;

    // Create a map of category IDs to names
    const categoryMap = (categories || []).reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<string, string>);
    
    // Transform the data to match the Blog type
    return blogs.map(blog => ({
      ...blog,
      categories: categoryMap[blog.category_id] 
        ? { id: blog.category_id, name: categoryMap[blog.category_id] }
        : { id: blog.category_id, name: 'Uncategorized' }
    }));
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
};

export const getBlogById = async (id: string): Promise<Blog | null> => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
};

export const createBlog = async (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'views'>) => {
  // Get the first category from the database to use as default
  let defaultCategoryId = '00000000-0000-0000-0000-000000000000';
  
  try {
    // Try to get at least one category to use
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    if (categories && categories.length > 0) {
      defaultCategoryId = categories[0].id;
    } else {
      // If no categories exist, create a default one
      const { data: newCategory } = await supabase
        .from('categories')
        .insert([{ name: 'Uncategorized' }])
        .select();
      
      if (newCategory && newCategory.length > 0) {
        defaultCategoryId = newCategory[0].id;
      }
    }
  } catch (error) {
    console.error('Error getting/creating default category:', error);
  }
  
  const { data, error } = await supabase
    .from('blogs')
    .insert([{
      ...blog,
      // Always use the default category
      category_id: defaultCategoryId,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select();
  
  if (error) {
    console.error('Error creating blog:', error);
    return null;
  }
  
  return data[0];
};

export const updateBlog = async (id: string, blog: Partial<Omit<Blog, 'id' | 'created_at'>>) => {
  const { data, error } = await supabase
    .from('blogs')
    .update({
      ...blog,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error updating blog:', error);
    return null;
  }
  
  return data[0];
};

export const deleteBlog = async (id: string) => {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);
  
  return { success: !error, error };
};

export const incrementViewCount = async (id: string) => {
  const { data, error } = await supabase.rpc('increment_blog_view', { blog_id: id });
  
  if (error) {
    console.error('Error incrementing view count:', error);
  }
  
  return { success: !error, data };
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching categories...');
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    
    console.log('Categories fetched successfully:', data);
    return data || [];
  } catch (error) {
    console.error('Exception fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (name: string): Promise<Category | null> => {
  try {
    console.log('Creating category with name:', name);
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select();
    
    if (error) {
      console.error('Error creating category:', error);
      return null;
    }
    
    console.log('Category created:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Exception creating category:', error);
    return null;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    console.log('Deleting category with id:', id);
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting category:', error);
      return { success: false, error };
    }
    
    console.log('Category deleted successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception deleting category:', error);
    return { success: false, error };
  }
};

export const uploadImage = async (file: File, path: string = 'media-library') => {
  try {
    console.log('Starting image upload...');
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
    
    console.log('Uploading file to path:', fileName);
    
    // Upload the file to storage
    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    
    // Get the public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);
    
    // Store the media item in the database
    const { error: dbError } = await supabase
      .from('media_library')
      .insert({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: fileName,
        url: publicUrl,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id || 'anonymous',
      });
    
    if (dbError) {
      console.error('Error storing media item:', dbError);
    }
    
    console.log('Uploaded image URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage function:', error);
    return null;
  }
};

// User and role management
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

export const getUserRoles = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      role_id,
      roles(*)
    `)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
  
  return data.map(item => item.roles);
};

// Analytics functions
export const getBlogAnalytics = async (blogId: string, period: 'day' | 'week' | 'month' = 'day') => {
  try {
    const today = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(today.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];

    let query = supabase
      .from('analytics')
      .select('*')
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true });

    // Only add blog_id filter if it's not 'all'
    if (blogId !== 'all') {
      query = query.eq('blog_id', blogId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Aggregate the data by date
    const aggregatedData = data.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = {
          page_views: 0,
          unique_visitors: 0,
          avg_time_on_page: 0,
          bounce_rate: 0,
          geo_distribution: {},
          referral_sources: {},
          count: 0
        };
      }
      
      acc[item.date].page_views += item.page_views || 0;
      acc[item.date].unique_visitors += item.unique_visitors || 0;
      acc[item.date].avg_time_on_page += item.avg_time_on_page || 0;
      acc[item.date].bounce_rate += item.bounce_rate || 0;
      acc[item.date].count += 1;
      
      // Merge geo distribution
      if (item.geo_distribution) {
        Object.entries(item.geo_distribution).forEach(([country, value]) => {
          acc[item.date].geo_distribution[country] = (acc[item.date].geo_distribution[country] || 0) + (value || 0);
        });
      }
      
      // Merge referral sources
      if (item.referral_sources) {
        Object.entries(item.referral_sources).forEach(([source, value]) => {
          acc[item.date].referral_sources[source] = (acc[item.date].referral_sources[source] || 0) + (value || 0);
        });
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Convert the aggregated data into an array format
    return Object.entries(aggregatedData).map(([date, data]) => ({
      date,
      page_views: data.page_views,
      unique_visitors: data.unique_visitors,
      avg_time_on_page: data.avg_time_on_page / data.count,
      bounce_rate: data.bounce_rate / data.count,
      geo_distribution: data.geo_distribution,
      referral_sources: data.referral_sources
    }));
  } catch (error) {
    console.error('Error fetching blog analytics:', error);
    throw error;
  }
};

// Media library functions
export const getMediaItems = async (): Promise<MediaItem[]> => {
  const { data, error } = await supabase
    .from('media_library')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching media items:', error);
    return [];
  }

  return data || [];
};

// Comments management
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

// Post revision history
export const getBlogRevisions = async (blogId: string) => {
  const { data, error } = await supabase
    .from('post_revisions')
    .select('*')
    .eq('blog_id', blogId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching blog revisions:', error);
    return [];
  }
  
  return data;
};

export const setFeaturedBlog = async (blogId: string) => {
  try {
    // First, unfeature all blogs
    const { error: unfeatureError } = await supabase
      .from('blogs')
      .update({ is_featured: false })
      .eq('is_featured', true);
    
    if (unfeatureError) throw unfeatureError;
    
    // Then, feature the selected blog
    const { error: featureError } = await supabase
      .from('blogs')
      .update({ is_featured: true })
      .eq('id', blogId);
    
    if (featureError) throw featureError;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error setting featured blog:', error);
    return { success: false, error };
  }
};
