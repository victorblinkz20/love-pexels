
import { supabase } from '@/integrations/supabase/client';
import type { Category } from './types';

export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (name: string): Promise<Category | null> => {
  try {
    // First check if a category with this name already exists
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('*')
      .ilike('name', name)
      .limit(1);
    
    if (existingCategories && existingCategories.length > 0) {
      console.log('Category already exists:', existingCategories[0]);
      return existingCategories[0];
    }
    
    // If not exists, create a new one
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select();
    
    if (error) {
      console.error('Error creating category:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned after creating category');
      return null;
    }
    
    console.log('Category created successfully:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Exception creating category:', error);
    return null;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting category:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception deleting category:', error);
    return { success: false, error };
  }
};

export const updateCategory = async (id: string, name: string) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating category:', error);
      return { success: false, error };
    }
    
    return { success: true, data: data[0], error: null };
  } catch (error) {
    console.error('Exception updating category:', error);
    return { success: false, error };
  }
};
