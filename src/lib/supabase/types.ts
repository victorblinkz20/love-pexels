// Type definitions for our database tables
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
  categories: {
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

export type MediaItem = {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  url: string;
  alt_text?: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
};

export type PostRevision = {
  id: string;
  blog_id: string;
  content: string;
  changes?: Record<string, any>;
  author_id: string;
  created_at: string;
};
