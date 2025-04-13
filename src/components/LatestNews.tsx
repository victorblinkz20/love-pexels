import React from 'react';
import { ChevronRight, Clock, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getBlogs, type Blog } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const LatestNews = () => {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['latestBlogs'],
    queryFn: () => getBlogs('published'),
  });
  
  const latestArticles = articles?.slice(0, 3);

  return (
    <section className="container mx-auto px-4 md:px-0 py-12">
      <div className="section-title">
        <h2>Fresh From the Blog </h2>
        <Link to="/category/latest" className="see-more flex items-center">
          See More <ChevronRight size={16} />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="article-card">
              <Skeleton className="h-56 sm:h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))
        ) : error || !latestArticles || latestArticles.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No articles available right now.</p>
          </div>
        ) : (
          latestArticles.map((article) => (
            <Link to={`/blog/${article.id}`} key={article.id} className="article-card">
              <div className="relative h-56 sm:h-48 overflow-hidden">
                <img 
                  src={article.image_url || "https://images.pexels.com/photos/327540/pexels-photo-327540.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} 
                  alt={article.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center text-gray-500 text-xs mb-2">
                  <Clock size={14} className="mr-1" />
                  <span>{new Date(article.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-lg mb-2 truncate-2-lines">{article.title}</h3>
                <p className="text-gray-600 text-sm mb-3 truncate-2-lines">{article.excerpt}</p>
                
                <div className="flex items-center text-gray-500 text-xs">
                  <Eye size={14} className="mr-1" />
                  <span>{article.views} views</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
};

export default LatestNews;
