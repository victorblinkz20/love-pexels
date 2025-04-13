import React from 'react';
import { Eye, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getBlogs } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface RelatedArticlesProps {
  currentBlogId: string;
  categoryName: string;
}

const RelatedArticles = ({ currentBlogId, categoryName }: RelatedArticlesProps) => {
  console.log('RelatedArticles props:', { currentBlogId, categoryName });

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['relatedArticles', categoryName],
    queryFn: async () => {
      const blogs = await getBlogs('published');
      console.log('All published blogs:', blogs);
      
      const filteredBlogs = blogs
        .filter(blog => {
          const isSameCategory = categoryName ? blog.categories?.name === categoryName : true;
          const isNotCurrent = blog.id !== currentBlogId;
          console.log('Blog filtering:', {
            blogId: blog.id,
            blogCategory: blog.categories?.name,
            targetCategory: categoryName,
            isSameCategory,
            isNotCurrent
          });
          return isSameCategory && isNotCurrent;
        })
        .slice(0, 3);
      
      console.log('Filtered related articles:', filteredBlogs);
      return filteredBlogs;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-start">
            <Skeleton className="w-20 h-20 rounded flex-shrink-0" />
            <div className="ml-3 flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error fetching related articles:', error);
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Error loading related articles.</p>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    console.log('No related articles found');
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No related articles available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <Link 
          to={`/blog/${article.id}`} 
          key={article.id} 
          className="flex items-start group hover:bg-gray-50 p-2 rounded-lg transition-colors"
        >
          <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
            <img 
              src={article.image_url || "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} 
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <h4 className="font-medium text-sm leading-tight group-hover:text-news-orange transition-colors line-clamp-2 mb-1">
              {article.title}
            </h4>
            <div className="flex items-center text-xs text-gray-500 space-x-2">
              <div className="flex items-center">
                <Clock size={12} className="mr-1 flex-shrink-0" />
                <span className="whitespace-nowrap">{new Date(article.created_at).toLocaleDateString()}</span>
              </div>
              <span>•</span>
              <div className="flex items-center">
                <Eye size={12} className="mr-1 flex-shrink-0" />
                <span className="whitespace-nowrap">{article.views.toLocaleString()} views</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RelatedArticles; 