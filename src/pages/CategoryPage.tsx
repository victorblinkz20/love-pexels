import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogs } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryPage = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  
  const { data: blogs, isLoading, error } = useQuery({
    queryKey: ['categoryBlogs', categoryName],
    queryFn: async () => {
      const allBlogs = await getBlogs('published');
      return allBlogs.filter(blog => {
        const category = blog.categories?.name;
        switch (categoryName?.toLowerCase()) {
          case 'trending':
            return category === 'Trending';
          case 'latest':
            return true; // Show all published blogs for latest
          case 'highlights':
            return category === 'Weekly Highlights';
          case 'fun':
            return category === 'Weekly Fun';
          default:
            return false;
        }
      });
    },
  });

  const getCategoryTitle = (name: string | undefined) => {
    switch (name?.toLowerCase()) {
      case 'trending':
        return 'Trending News';
      case 'latest':
        return 'Latest News';
      case 'highlights':
        return 'Weekly Highlights';
      case 'fun':
        return 'Weekly Fun News';
      default:
        return 'Category';
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Error loading category</h1>
        <p className="text-red-500">Failed to load category content. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{getCategoryTitle(categoryName)}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="article-card">
              <Skeleton className="h-56 w-full" />
              <div className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))
        ) : blogs && blogs.length > 0 ? (
          blogs.map((blog) => (
            <Link to={`/blog/${blog.id}`} key={blog.id} className="article-card">
              <div className="h-56 overflow-hidden">
                <img 
                  src={blog.image_url || "https://images.pexels.com/photos/6238120/pexels-photo-6238120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} 
                  alt={blog.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center text-gray-500 text-xs mb-2">
                  <Clock size={14} className="mr-1" />
                  <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-lg mb-3">{blog.title}</h3>
                <p className="text-gray-600 mb-4 truncate-2-lines">{blog.excerpt}</p>
                <div className="flex items-center text-gray-500 text-xs">
                  <Eye size={14} className="mr-1" />
                  <span>{blog.views} views</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No articles found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage; 