import { supabase } from '@/integrations/supabase/client';
import { MediaItem } from './types';

export const uploadImage = async (file: File, path: string = 'blog-images') => {
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
    
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
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadImage function:', error);
    return null;
  }
};

export const getMediaItems = async (): Promise<MediaItem[]> => {
  const { data, error } = await supabase
    .from('media_library')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching media items:', error);
    return [];
  }
  
  return data.map(item => ({
    ...item,
    alt_text: item.alt_text || ''
  }));
};
