import React from 'react';
import { ChevronRight, Clock, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getBlogs, type Blog } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const WeeklyFunNews = () => {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['funBlogs'],
    queryFn: async () => {
      const blogs = await getBlogs('published');
      // Filter to only get blogs with the Weekly Fun category
      const funBlogs = blogs.filter(blog => blog.categories?.name === 'Weekly Fun');
      
      return funBlogs.length > 0 ? funBlogs.slice(0, 3) : [];
    },
  });

  // Fallback data if no categorized blogs are available
  const fallbackArticles = [
    {
      id: 1,
      title: "Local Baker's Creative Cakes Become Social Media Sensation",
      image: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      time: "1 day ago",
      views: "2.7K"
    },
    {
      id: 2,
      title: "Community Comes Together to Create Record-Breaking Mosaic",
      image: "https://images.pexels.com/photos/1145720/pexels-photo-1145720.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      time: "2 days ago",
      views: "1.9K"
    },
    {
      id: 3,
      title: "Rescue Dog Becomes Lifeguard, Saves Child from Drowning",
      image: "https://images.pexels.com/photos/39317/chihuahua-dog-puppy-cute-39317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      time: "3 days ago",
      views: "4.2K"
    }
  ];

  return (
    <section className="container mx-auto px-4 md:px-0 py-12">
      <div className="section-title">
        <h2>Things That Made Me Smile </h2>
        <Link to="/category/fun" className="see-more flex items-center">
          See More <ChevronRight size={16} />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="article-card">
              <Skeleton className="h-56 w-full" />
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))
        ) : error || !articles || articles.length === 0 ? (
          // Show fallback content if no categorized articles
          fallbackArticles.map((article) => (
            <div key={article.id} className="article-card">
              <div className="h-56 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center text-gray-500 text-xs mb-2">
                  <Clock size={14} className="mr-1" />
                  <span>{article.time}</span>
                </div>
                <h3 className="font-bold text-lg mb-3">{article.title}</h3>
                
                <div className="flex items-center text-gray-500 text-xs">
                  <Eye size={14} className="mr-1" />
                  <span>{article.views} views</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          articles.map((blog) => (
            <Link to={`/blog/${blog.id}`} key={blog.id} className="article-card">
              <div className="h-56 overflow-hidden">
                <img 
                  src={blog.image_url || "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} 
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
                
                <div className="flex items-center text-gray-500 text-xs">
                  <Eye size={14} className="mr-1" />
                  <span>{blog.views} views</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
};

export default WeeklyFunNews;
