
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getBlogs } from '@/lib/supabase';
import { BarChart, LineChart, PieChart } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CirclePlus, EditIcon, Eye, FileText, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardHome = () => {
  const navigate = useNavigate();
  
  const { data: blogs, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => getBlogs(),
  });
  
  const publishedCount = blogs?.filter(blog => blog.status === 'published').length || 0;
  const draftCount = blogs?.filter(blog => blog.status === 'draft').length || 0;
  const totalViews = blogs?.reduce((sum, blog) => sum + (blog.views || 0), 0) || 0;
  
  // Sample data for charts
  const viewsData = [
    { name: 'Mon', views: 2400 },
    { name: 'Tue', views: 1398 },
    { name: 'Wed', views: 9800 },
    { name: 'Thu', views: 3908 },
    { name: 'Fri', views: 4800 },
    { name: 'Sat', views: 3800 },
    { name: 'Sun', views: 4300 },
  ];
  
  const categoryData = [
    { name: 'Technology', value: 40 },
    { name: 'Travel', value: 30 },
    { name: 'Food', value: 20 },
    { name: 'Lifestyle', value: 10 },
  ];
  
  const sourceData = [
    { name: 'Direct', value: 400 },
    { name: 'Social', value: 300 },
    { name: 'Search', value: 300 },
    { name: 'Referral', value: 200 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button 
          className="bg-news-orange hover:bg-orange-600"
          onClick={() => navigate('/dashboard/create')}
        >
          <CirclePlus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{blogs?.length || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              +{draftCount} in draft
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <EditIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{publishedCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {blogs && blogs.length > 0 ? 
                `${Math.round((publishedCount / blogs.length) * 100)}% of total posts` : 
                '0% of total posts'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">
              +2.1% from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {publishedCount > 0 ? Math.round(totalViews / publishedCount).toLocaleString() : 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              views per post
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Analytics Charts */}
      <Tabs defaultValue="views" className="space-y-4">
        <TabsList>
          <TabsTrigger value="views">Views</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="referrals">Traffic Sources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Views Overview</CardTitle>
              <CardDescription>
                Daily page views for the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <LineChart 
                data={viewsData} 
                index="name"
                categories={["views"]}
                colors={["#f97316"]}
                valueFormatter={(value) => `${value.toLocaleString()} views`}
                showLegend={false}
                showXAxis={true}
                showYAxis={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>
                Views by category
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <PieChart 
                data={categoryData}
                index="name"
                valueFormatter={(value) => `${value}%`}
                category="value"
                colors={["#f97316", "#fb923c", "#fdba74", "#ffedd5"]}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>
                Where your readers are coming from
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart 
                data={sourceData} 
                index="name"
                categories={["value"]}
                colors={["#f97316"]}
                valueFormatter={(value) => `${value} views`}
                showLegend={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest updates from your blog</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="flex items-center mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4 space-y-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))
          ) : blogs && blogs.length > 0 ? (
            <div className="space-y-6">
              {blogs.slice(0, 5).map((blog) => (
                <div key={blog.id} className="flex items-start space-x-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                    {blog.status === 'published' ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EditIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{blog.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {blog.status === 'published' ? 'Published' : 'Drafted'} on {new Date(blog.created_at).toLocaleDateString()}
                      {blog.status === 'published' && ` • ${blog.views} views`}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/dashboard/edit/${blog.id}`)}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No recent activity</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/dashboard/create')}
              >
                Create your first post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
