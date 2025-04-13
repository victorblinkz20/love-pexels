import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, TrendingUp, Users, Clock, Activity, Globe, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getBlogAnalytics } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('7days');
  const [isLoading, setIsLoading] = useState(false);

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      const period = dateRange === '7days' ? 'week' : 
                    dateRange === '30days' ? 'month' : 
                    'month';
      
      console.log('Fetching analytics with period:', period);
      const analytics = await getBlogAnalytics('all', period);
      console.log('Raw analytics data:', analytics);
      
      // Group analytics by date and aggregate the data
      const groupedByDate = analytics.reduce((acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = {
            page_views: 0,
            unique_visitors: 0,
            avg_time_on_page: 0,
            bounce_rate: 0,
            geo_distribution: {},
            referral_sources: {},
            count: 0
          };
        }
        
        acc[item.date].page_views += item.page_views || 0;
        acc[item.date].unique_visitors += item.unique_visitors || 0;
        acc[item.date].avg_time_on_page += item.avg_time_on_page || 0;
        acc[item.date].bounce_rate += item.bounce_rate || 0;
        acc[item.date].count += 1;
        
        // Merge geo distribution
        if (item.geo_distribution) {
          Object.entries(item.geo_distribution).forEach(([country, value]) => {
            acc[item.date].geo_distribution[country] = (acc[item.date].geo_distribution[country] || 0) + (value || 0);
          });
        }
        
        // Merge referral sources
        if (item.referral_sources) {
          Object.entries(item.referral_sources).forEach(([source, value]) => {
            acc[item.date].referral_sources[source] = (acc[item.date].referral_sources[source] || 0) + (value || 0);
          });
        }
        
        return acc;
      }, {} as Record<string, any>);
      
      console.log('Grouped analytics data:', groupedByDate);
      
      // Process the data for charts
      const viewsData = Object.entries(groupedByDate).map(([date, data]) => ({
        date,
        views: data.page_views
      }));

      // Calculate total geo distribution
      const totalGeoDistribution = Object.values(groupedByDate).reduce((acc, data) => {
        Object.entries(data.geo_distribution).forEach(([country, value]) => {
          acc[country] = (acc[country] || 0) + value;
        });
        return acc;
      }, {} as Record<string, number>);

      const geographyData = Object.entries(totalGeoDistribution)
        .map(([name, value]) => ({ name, value: Number(value) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      // Calculate total referral sources
      const totalReferralSources = Object.values(groupedByDate).reduce((acc, data) => {
        Object.entries(data.referral_sources).forEach(([source, value]) => {
          acc[source] = (acc[source] || 0) + value;
        });
        return acc;
      }, {} as Record<string, number>);

      const referralData = Object.entries(totalReferralSources)
        .map(([name, value]) => ({ name, value: Number(value) }))
        .sort((a, b) => b.value - a.value);

      // Calculate device usage (example: 60% mobile, 40% desktop)
      const deviceData = Object.entries(groupedByDate).map(([date, data]) => ({
        date,
        mobile: Math.round(data.unique_visitors * 0.6),
        desktop: Math.round(data.unique_visitors * 0.4)
      }));

      // Calculate totals
      const totalViews = Object.values(groupedByDate).reduce((sum, data) => sum + data.page_views, 0);
      const totalVisitors = Object.values(groupedByDate).reduce((sum, data) => sum + data.unique_visitors, 0);
      const totalAvgTime = Object.values(groupedByDate).reduce((sum, data) => sum + data.avg_time_on_page, 0);
      const totalBounceRate = Object.values(groupedByDate).reduce((sum, data) => sum + data.bounce_rate, 0);
      const totalCount = Object.values(groupedByDate).reduce((sum, data) => sum + data.count, 0);

      const result = {
        viewsData,
        geographyData,
        referralData,
        deviceData,
        totalViews,
        totalVisitors,
        avgTimeOnPage: totalCount > 0 ? totalAvgTime / totalCount : 0,
        bounceRate: totalCount > 0 ? totalBounceRate / totalCount : 0
      };

      console.log('Processed analytics result:', result);
      return result;
    }
  });

  const handleDateRangeChange = (value: string) => {
    setIsLoading(true);
    setDateRange(value);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="3months">Last 3 months</SelectItem>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Overview Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || isAnalyticsLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{analytics?.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> 
                  {Math.round((analytics?.totalViews || 0) / 100)}% from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || isAnalyticsLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{analytics?.totalVisitors.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> 
                  {Math.round((analytics?.totalVisitors || 0) / 100)}% from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time on Page</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || isAnalyticsLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {Math.floor(analytics?.avgTimeOnPage || 0)}m {Math.round(((analytics?.avgTimeOnPage || 0) % 1) * 60)}s
                </div>
                <p className="text-xs text-muted-foreground flex items-center text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> 
                  {Math.round((analytics?.avgTimeOnPage || 0) / 10)}% from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || isAnalyticsLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{Math.round(analytics?.bounceRate || 0)}%</div>
                <p className="text-xs text-muted-foreground flex items-center text-red-500">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> 
                  {Math.round((analytics?.bounceRate || 0) / 10)}% from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Traffic Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Overview</CardTitle>
          <CardDescription>
            Page views over time
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading || isAnalyticsLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <LineChart 
              data={analytics?.viewsData || []} 
              index="date"
              categories={["views"]}
              colors={["#f97316"]}
              valueFormatter={(value) => `${value.toLocaleString()} views`}
              showLegend={false}
              showYAxis={true}
              showXAxis={true}
            />
          )}
        </CardContent>
      </Card>
      
      {/* Detailed Analytics */}
      <Tabs defaultValue="geography" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geography">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visitor Geography</CardTitle>
                <CardDescription>
                  Distribution of visitors by country
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading || isAnalyticsLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <PieChart 
                    data={analytics?.geographyData || []}
                    index="name"
                    category="value"
                    valueFormatter={(value) => `${value}%`}
                    colors={["#f97316", "#fb923c", "#fdba74", "#ffedd5", "#fed7aa", "#fff7ed"]}
                  />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
                <CardDescription>
                  Traffic by country
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading || isAnalyticsLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {analytics?.geographyData.map((country, i) => (
                      <div key={i} className="flex items-center">
                        <div className="mr-4">
                          <Globe className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{country.name}</p>
                            <p className="text-sm font-medium">{country.value}%</p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-news-orange h-1.5 rounded-full" 
                              style={{ width: `${country.value}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="devices">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
                <CardDescription>
                  Mobile vs Desktop traffic
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading || isAnalyticsLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <BarChart
                    data={analytics?.deviceData || []}
                    index="date"
                    categories={["mobile", "desktop"]}
                    colors={["#f97316", "#94a3b8"]}
                    valueFormatter={(value) => `${value}%`}
                    layout="stacked"
                  />
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics by Device</CardTitle>
                <CardDescription>
                  Comparison of important metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading || isAnalyticsLoading ? (
                  <div className="space-y-6">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <div className="grid grid-cols-2 gap-4">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Avg. Session Duration</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground">Mobile</p>
                          <p className="text-lg font-bold">2m 12s</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground">Desktop</p>
                          <p className="text-lg font-bold">4m 35s</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Pages Per Session</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground">Mobile</p>
                          <p className="text-lg font-bold">1.8</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground">Desktop</p>
                          <p className="text-lg font-bold">2.6</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground">Mobile</p>
                          <p className="text-lg font-bold">54.2%</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground">Desktop</p>
                          <p className="text-lg font-bold">36.7%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="referrals">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>
                  Where your readers are coming from
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading || isAnalyticsLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <PieChart 
                    data={analytics?.referralData || []}
                    index="name"
                    category="value"
                    valueFormatter={(value) => `${value}%`}
                    colors={["#f97316", "#fdba74", "#fb923c", "#fed7aa", "#ffedd5"]}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
