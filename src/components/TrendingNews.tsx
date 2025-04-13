import React from 'react';
import { Eye, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getBlogs } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const TrendingNews = () => {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['trendingBlogs'],
    queryFn: async () => {
      const blogs = await getBlogs('published');
      // Filter to only get blogs with the Trending category
      const trendingBlogs = blogs.filter(blog => blog.categories?.name === 'Trending');
      
      // If no blogs with Trending category, fall back to showing the most viewed blogs
      if (trendingBlogs.length === 0) {
        return blogs.sort((a, b) => b.views - a.views).slice(0, 4);
      }
      
      return trendingBlogs.slice(0, 4);
    },
  });

  return (
    <section className="container mx-auto px-4 md:px-0 py-12">
      <div className="section-title">
        <h2>Reader Favorites </h2>
        <Link to="/category/trending" className="see-more flex items-center">
          See More <ChevronRight size={16} />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="article-card overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : error || !articles || articles.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No trending articles available right now.</p>
          </div>
        ) : (
          articles.map((article) => (
            <Link to={`/blog/${article.id}`} key={article.id} className="article-card overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={article.image_url || "https://images.pexels.com/photos/4505169/pexels-photo-4505169.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} 
                  alt={article.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 truncate-2-lines">{article.title}</h3>
                <p className="text-gray-600 text-sm mb-3 truncate-2-lines">{article.excerpt}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-gray-500 text-xs">
                    <Eye size={14} className="mr-1" />
                    <span>{article.views} views</span>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="text-xs bg-news-gray hover:bg-news-gray/80">
                      {article.categories?.name || 'Uncategorized'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
};

export default TrendingNews;
