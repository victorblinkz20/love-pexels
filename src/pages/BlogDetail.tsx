import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogById, incrementViewCount, type Blog } from '@/lib/supabase';
import { recordBlogView } from '@/lib/supabase/analytics';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, Share2, Facebook, Twitter, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RelatedArticles from '@/components/RelatedArticles';

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => id ? getBlogById(id) : Promise.reject('No ID provided'),
    enabled: !!id,
  });
  
  // Increment view count and record analytics when page loads
  useEffect(() => {
    if (id) {
      incrementViewCount(id).catch(err => console.error('Error incrementing view count:', err));
      recordBlogView(id).catch(err => console.error('Error recording analytics:', err));
    }
  }, [id]);
  
  // Handle share functionality
  const handleShare = (platform: 'facebook' | 'twitter' | 'copy') => {
    const url = window.location.href;
    const title = blog?.title || 'Check out this blog post';
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-6 pb-16">
        <div className="container mx-auto px-4 md:px-0">
          {isLoading ? (
            <BlogSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Blog Post</h2>
              <p className="text-gray-600 mb-6">We couldn't load the blog post you're looking for. It may have been removed or there was a temporary issue.</p>
              <Link to="/" className="text-news-orange hover:underline">Return to Homepage</Link>
            </div>
          ) : blog ? (
            <>
              <div className="mb-8">
                <Link to="/" className="text-news-orange hover:underline mb-2 inline-block">« Back to News</Link>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">{blog.title}</h1>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Author" />
                      <AvatarFallback>JP</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">The Editor</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock size={14} className="mr-1" />
                        {new Date(blog.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-500 mr-4">
                      <Eye size={18} className="mr-1" />
                      <span>{blog.views} views</span>
                    </div>
                    <Badge variant="outline" className="bg-gray-100">
                      {blog.categories?.name || 'Uncategorized'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Featured Image */}
              <div className="mb-10 rounded-lg overflow-hidden shadow-md">
                <img 
                  src={blog.image_url || "https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"} 
                  alt={blog.title} 
                  className="w-full h-auto md:h-[500px] object-cover"
                />
              </div>
              
              {/* Blog Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: blog.content }} />
                  
                  <div className="flex items-center space-x-3 mt-12 border-t border-b py-4">
                    <span className="font-medium">Share:</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleShare('facebook')}
                      className="rounded-full h-8 w-8"
                    >
                      <Facebook size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleShare('twitter')}
                      className="rounded-full h-8 w-8"
                    >
                      <Twitter size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleShare('copy')}
                      className="rounded-full h-8 w-8"
                    >
                      <Link2 size={16} />
                    </Button>
                  </div>
                </div>
                
                <div className="lg:col-span-4">
                  <div className="bg-gray-50 p-6 rounded-lg sticky top-8">
                    <h3 className="text-xl font-bold mb-4">Related Articles</h3>
                    {blog && (
                      <RelatedArticles 
                        currentBlogId={blog.id} 
                        categoryName={blog.categories?.name || ''} 
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Blog Post Not Found</h2>
              <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
              <Link to="/" className="text-news-orange hover:underline">Return to Homepage</Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

const BlogSkeleton = () => (
  <div>
    <Skeleton className="h-10 w-40 mb-2" />
    <Skeleton className="h-12 w-full mb-4" />
    
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center">
        <Skeleton className="h-10 w-10 rounded-full mr-3" />
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex items-center">
        <Skeleton className="h-6 w-24 mr-2" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
    
    <Skeleton className="h-[400px] w-full mb-10" />
    
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-2/3 mb-8" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-5/6 mb-8" />
        <Skeleton className="h-10 w-full mt-8" />
      </div>
      <div className="lg:col-span-4">
        <div className="bg-gray-50 p-6 rounded-lg">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start">
                <Skeleton className="w-20 h-20 flex-shrink-0" />
                <div className="ml-3 flex-grow">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default BlogDetail;
