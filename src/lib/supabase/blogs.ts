
import { supabase } from '@/integrations/supabase/client';
import type { Blog } from './types';

export const getBlogs = async (status?: string): Promise<Blog[]> => {
  try {
    let query = supabase
      .from('blogs')
      .select(`
        *,
        categories (
          name
        )
      `);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
    
    // Transform data to match the Blog type
    return data.map(blog => ({
      ...blog,
      categories: blog.categories || { name: 'Uncategorized' }
    })) as Blog[];
  } catch (error) {
    console.error('Exception fetching blogs:', error);
    throw error;
  }
};

export const getBlogById = async (id: string): Promise<Blog | null> => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        categories (
          name
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching blog by ID:', error);
      return null;
    }
    
    // Transform data to match the Blog type
    return {
      ...data,
      categories: data.categories || { name: 'Uncategorized' }
    } as Blog;
  } catch (error) {
    console.error('Exception fetching blog by ID:', error);
    return null;
  }
};

export const createBlog = async (blogData: Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'views' | 'categories'>) => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .insert([blogData])
      .select();
    
    if (error) {
      console.error('Error creating blog:', error);
      return { success: false, error, data: null };
    }
    
    return { success: true, error: null, data: data[0] };
  } catch (error) {
    console.error('Exception creating blog:', error);
    return { success: false, error, data: null };
  }
};

export const updateBlog = async (id: string, updateData: Partial<Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'categories'>>) => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating blog:', error);
      return { success: false, error, data: null };
    }
    
    return { success: true, error: null, data: data[0] };
  } catch (error) {
    console.error('Exception updating blog:', error);
    return { success: false, error, data: null };
  }
};

export const deleteBlog = async (id: string) => {
  try {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting blog:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception deleting blog:', error);
    return { success: false, error };
  }
};

export const incrementBlogViews = async (id: string) => {
  try {
    const { error } = await supabase
      .rpc('increment_blog_view', { blog_id: id });
    
    if (error) {
      console.error('Error incrementing blog views:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception incrementing blog views:', error);
    return false;
  }
};
