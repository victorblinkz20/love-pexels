
import React, { useEffect, useState } from 'react';
import { Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogs, type Blog } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

const HeroSection = () => {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['featuredBlogs'],
    queryFn: async () => {
      const blogs = await getBlogs('published');
      // Get the 4 most recent published articles
      return blogs.slice(0, 4);
    },
  });

  // If no data is available yet, show loading state
  if (isLoading) {
    return (
      <section className="container mx-auto px-4 md:px-0 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <Skeleton className="h-[400px] md:h-[500px] rounded-lg" />
          </div>
          <div className="lg:col-span-4 flex flex-col space-y-4">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-[130px] rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If there's an error or no blogs, show a placeholder message
  if (error || !articles || articles.length === 0) {
    return (
      <section className="container mx-auto px-4 md:px-0 py-6 text-center">
        <p className="text-lg">No articles available at the moment. Check back soon!</p>
      </section>
    );
  }

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 4);

  return (
    <section className="container mx-auto px-4 md:px-0 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Featured Article */}
        <div className="lg:col-span-8">
          <Link to={`/blog/${mainArticle.id}`}>
            <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg group">
              <img 
                src={mainArticle.image_url || "https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} 
                alt={mainArticle.title} 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <div className="flex items-center text-news-orange text-sm mb-2">
                  <span className="font-semibold uppercase mr-3">{mainArticle.categories?.name || 'NEWS'}</span>
                  <span className="flex items-center text-white/80 text-xs">
                    <Clock size={14} className="mr-1" />
                    {new Date(mainArticle.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  {mainArticle.title}
                </h2>
                <div className="flex items-center text-white/80 text-sm">
                  <Eye size={16} className="mr-1" />
                  <span>{mainArticle.views.toLocaleString()} views</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Smaller Featured Articles */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {sideArticles.map((article) => (
            <SmallFeature 
              key={article.id}
              id={article.id}
              image={article.image_url || "https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
              category={article.categories?.name || 'NEWS'}
              time={new Date(article.created_at).toLocaleDateString()}
              title={article.title}
              views={article.views.toLocaleString()}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface SmallFeatureProps {
  id: string;
  image: string;
  category: string;
  time: string;
  title: string;
  views: string;
}

const SmallFeature = ({ id, image, category, time, title, views }: SmallFeatureProps) => {
  return (
    <Link to={`/blog/${id}`} className="flex h-[130px] bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="w-1/3 min-w-[120px]">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-2/3 p-3">
        <div className="flex items-center text-xs mb-1">
          <span className="text-news-orange font-semibold mr-2">{category}</span>
          <span className="flex items-center text-gray-500">
            <Clock size={12} className="mr-1" />
            {time}
          </span>
        </div>
        <h3 className="font-semibold text-sm mb-2 truncate-2-lines">{title}</h3>
        <div className="flex items-center text-gray-500 text-xs">
          <Eye size={12} className="mr-1" />
          <span>{views} views</span>
        </div>
      </div>
    </Link>
  );
};

export default HeroSection;
