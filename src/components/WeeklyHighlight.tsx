import React from 'react';
import { ChevronRight, Clock, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getBlogs } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const WeeklyHighlight = () => {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['highlightBlogs'],
    queryFn: async () => {
      const blogs = await getBlogs('published');
      console.log('All published blogs:', blogs);
      
      // Filter to only get blogs with the Weekly Highlight category
      const highlightBlogs = blogs.filter(blog => {
        console.log('Checking blog:', {
          id: blog.id,
          title: blog.title,
          category: blog.categories?.name,
          category_id: blog.category_id
        });
        return blog.categories?.name === 'Weekly Highlight';
      });
      
      console.log('Filtered highlight blogs:', highlightBlogs);
      return highlightBlogs.length > 0 ? highlightBlogs.slice(0, 3) : [];
    },
  });

  // Fallback data if no categorized blogs are available
  const fallbackArticles = [
    {
      id: 1,
      title: "New Educational Program Shows Remarkable Results in Student Achievement",
      image: "https://images.pexels.com/photos/6238120/pexels-photo-6238120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      time: "2 days ago",
      views: "4.3K"
    },
    {
      id: 2,
      title: "Urban Revitalization Project Transforms Downtown District",
      image: "https://images.pexels.com/photos/1209978/pexels-photo-1209978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      time: "3 days ago",
      views: "5.1K"
    },
    {
      id: 3,
      title: "International Collaboration Leads to Breakthrough in Clean Water Technology",
      image: "https://images.pexels.com/photos/1367252/pexels-photo-1367252.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      time: "4 days ago",
      views: "3.9K"
    }
  ];

  return (
    <section className="container mx-auto px-4 md:px-0 py-12">
      <div className="section-title">
        <h2>Something Special</h2>
        <Link to="/category/highlights" className="see-more flex items-center">
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
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No highlight articles available right now.</p>
          </div>
        ) : (
          articles.map((blog) => (
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

export default WeeklyHighlight;
