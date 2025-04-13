
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

const SettingsPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // General settings
  const [siteName, setSiteName] = useState('My Blog');
  const [siteDescription, setSiteDescription] = useState('A modern blog dashboard');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // SEO settings
  const [metaTitle, setMetaTitle] = useState('My Blog | Latest News and Articles');
  const [metaDescription, setMetaDescription] = useState('Stay updated with the latest news, articles, and insights on various topics.');
  const [ogImage, setOgImage] = useState<File | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  
  // Performance settings
  const [enableCaching, setEnableCaching] = useState(true);
  const [cacheExpiration, setCacheExpiration] = useState('60');
  const [imageOptimization, setImageOptimization] = useState(true);
  const [lazyLoading, setLazyLoading] = useState(true);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [subscriptionNotifications, setSubscriptionNotifications] = useState(true);
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
      
      // Clean up preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };
  
  const handleOgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOgImage(file);
      const objectUrl = URL.createObjectURL(file);
      setOgImagePreview(objectUrl);
      
      // Clean up preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };
  
  const handleSaveSettings = (section: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({ 
        title: "Settings saved", 
        description: `Your ${section} settings have been saved successfully.`,
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex sm:grid-cols-none gap-1 sm:gap-0">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic settings for your blog.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input 
                    id="site-name" 
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="site-description">Site Description</Label>
                  <Textarea 
                    id="site-description" 
                    rows={3}
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="site-logo">Site Logo</Label>
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <div className="h-12 w-12 overflow-hidden rounded-md">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="h-full w-full object-contain"
                        />
                      </div>
                    )}
                    <Input 
                      id="site-logo" 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="MM/DD/YYYY">
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="MMMM D, YYYY">Month Day, Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="time-format">Time Format</Label>
                  <Select defaultValue="12">
                    <SelectTrigger>
                      <SelectValue placeholder="Select time format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12-hour format</SelectItem>
                      <SelectItem value="24">24-hour format</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                className="bg-news-orange hover:bg-orange-600"
                onClick={() => handleSaveSettings('general')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your blog for search engines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="meta-title">Default Meta Title</Label>
                  <Input 
                    id="meta-title" 
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Character count: {metaTitle.length}/60 (Recommended: 50-60)
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="meta-description">Default Meta Description</Label>
                  <Textarea 
                    id="meta-description" 
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Character count: {metaDescription.length}/160 (Recommended: 150-160)
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="og-image">Default Social Share Image</Label>
                  <div className="flex items-center gap-4">
                    {ogImagePreview && (
                      <div className="h-20 w-36 overflow-hidden rounded-md">
                        <img 
                          src={ogImagePreview} 
                          alt="Social share image preview" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <Input 
                      id="og-image" 
                      type="file" 
                      accept="image/*"
                      onChange={handleOgImageChange}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended size: 1200x630 pixels
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-author">Show Author in Meta</Label>
                    <Switch id="show-author" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Include author information in post metadata
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-sitemap">Generate Sitemap</Label>
                    <Switch id="auto-sitemap" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatically generate and update XML sitemap
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="canonical-links">Use Canonical Links</Label>
                    <Switch id="canonical-links" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add canonical links to prevent duplicate content issues
                  </p>
                </div>
              </div>
              
              <Button 
                className="bg-news-orange hover:bg-orange-600"
                onClick={() => handleSaveSettings('SEO')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
              <CardDescription>
                Optimize your blog loading speed and performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable-caching">Enable Page Caching</Label>
                    <Switch 
                      id="enable-caching" 
                      checked={enableCaching}
                      onCheckedChange={setEnableCaching}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cache pages to improve loading speed
                  </p>
                </div>
                
                {enableCaching && (
                  <div className="grid gap-2">
                    <Label htmlFor="cache-expiration">Cache Expiration (minutes)</Label>
                    <Input 
                      id="cache-expiration" 
                      type="number"
                      value={cacheExpiration}
                      onChange={(e) => setCacheExpiration(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="image-optimization">Image Optimization</Label>
                    <Switch 
                      id="image-optimization" 
                      checked={imageOptimization}
                      onCheckedChange={setImageOptimization}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatically compress and optimize images
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lazy-loading">Lazy Loading</Label>
                    <Switch 
                      id="lazy-loading" 
                      checked={lazyLoading}
                      onCheckedChange={setLazyLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Load images only when they enter the viewport
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="image-quality">Image Quality</Label>
                  <Select defaultValue="85">
                    <SelectTrigger>
                      <SelectValue placeholder="Select image quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100% (Original)</SelectItem>
                      <SelectItem value="85">85% (Recommended)</SelectItem>
                      <SelectItem value="75">75% (Good balance)</SelectItem>
                      <SelectItem value="65">65% (More compressed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="minify-html">Minify HTML</Label>
                    <Switch id="minify-html" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Remove unnecessary characters from HTML
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="prefetch-links">Prefetch Links</Label>
                    <Switch id="prefetch-links" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Preload links when user hovers over them
                  </p>
                </div>
              </div>
              
              <Button 
                className="bg-news-orange hover:bg-orange-600"
                onClick={() => handleSaveSettings('performance')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure when and how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Switch 
                      id="email-notifications" 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                
                {emailNotifications && (
                  <div className="grid gap-2">
                    <Label htmlFor="notification-email">Notification Email</Label>
                    <Input 
                      id="notification-email" 
                      type="email"
                      defaultValue="admin@example.com"
                    />
                  </div>
                )}
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="comment-notifications">Comment Notifications</Label>
                    <Switch 
                      id="comment-notifications" 
                      checked={commentNotifications}
                      onCheckedChange={setCommentNotifications}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get notified when someone comments on your posts
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subscription-notifications">Subscription Notifications</Label>
                    <Switch 
                      id="subscription-notifications" 
                      checked={subscriptionNotifications}
                      onCheckedChange={setSubscriptionNotifications}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get notified when someone subscribes to your blog
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="digest-frequency">Email Digest Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="browser-notifications">Browser Notifications</Label>
                    <Switch id="browser-notifications" defaultChecked />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications in your browser
                  </p>
                </div>
              </div>
              
              <Button 
                className="bg-news-orange hover:bg-orange-600"
                onClick={() => handleSaveSettings('notification')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
