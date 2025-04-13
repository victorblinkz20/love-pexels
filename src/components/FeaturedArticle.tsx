import React from 'react';
import { ArrowRight, Eye, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getBlogs } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedArticle = () => {
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['featuredArticle'],
    queryFn: async () => {
      const blogs = await getBlogs('published');
      return blogs.find(blog => blog.is_featured) || null;
    },
  });

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 md:px-0 py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-news-orange/5 to-transparent" />
          <div className="relative p-8 md:p-12">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-3/4 mb-6" />
            <Skeleton className="h-24 w-full mb-8" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !article) {
    return (
      <section className="container mx-auto px-4 md:px-0 py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="absolute inset-0 bg-gradient-to-r from-news-orange/5 to-transparent" />
          <div className="relative p-8 md:p-12">
            <span className="inline-block px-4 py-2 rounded-full bg-news-orange/10 text-news-orange text-sm font-medium mb-6">
              FEATURED
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              No Featured Article Available
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl">
              There is currently no featured article. Please check back later.
            </p>
            <Link 
              to="/blog" 
              className="inline-flex items-center text-news-orange font-medium hover:underline group"
            >
              Browse Articles
              <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 md:px-0 py-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-news-orange/5 to-transparent" />
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
          <div className="relative aspect-[4/3] md:aspect-[3/4] rounded-xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />
            <img 
              src={article.image_url || "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} 
              alt={article.title} 
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <div className="flex items-center gap-4 text-white/90">
                <span className="flex items-center text-sm">
                  <Clock size={14} className="mr-1" />
                  {new Date(article.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center text-sm">
                  <Eye size={14} className="mr-1" />
                  {article.views.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <span className="inline-block px-4 py-2 rounded-full bg-news-orange/10 text-news-orange text-sm font-medium mb-6">
              {article.categories?.name || 'NEWS'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              {article.title}
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              {article.excerpt}
            </p>
            <Link 
              to={`/blog/${article.id}`} 
              className="inline-flex items-center text-news-orange font-medium hover:underline group"
            >
              Read Full Article
              <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticle;
