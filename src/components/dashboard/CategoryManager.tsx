
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createCategory, deleteCategory, getCategories, Category, updateBlog, getBlogs, Blog } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

const CategoryManager = () => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [featuredBlogs, setFeaturedBlogs] = useState<Record<string, string[]>>({
    trending: [],
    highlights: [],
    fun: []
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: categories, isLoading: loadingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
  
  const { data: blogs, isLoading: loadingBlogs } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => getBlogs('published'),
  });
  
  // Load initial featured blogs
  useEffect(() => {
    if (blogs) {
      // Find blogs with special categories
      const trendingBlogs = blogs.filter(blog => blog.categories?.name === 'Trending').map(blog => blog.id);
      const highlightBlogs = blogs.filter(blog => blog.categories?.name === 'Weekly Highlight').map(blog => blog.id);
      const funBlogs = blogs.filter(blog => blog.categories?.name === 'Weekly Fun').map(blog => blog.id);
      
      setFeaturedBlogs({
        trending: trendingBlogs,
        highlights: highlightBlogs,
        fun: funBlogs
      });
    }
  }, [blogs]);
  
  const handleCreateCategory = async (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent) => {
    e.preventDefault(); // Prevent form submission behavior
    
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const result = await createCategory(newCategoryName.trim());
      console.log("Category creation result:", result);
      
      if (result) {
        toast({
          title: "Success",
          description: `Category '${newCategoryName}' created successfully`,
        });
        setNewCategoryName('');
        await refetchCategories();
      } else {
        toast({
          title: "Error",
          description: "Failed to create category",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: "Failed to create category: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        toast({
          title: "Success",
          description: `Category '${name}' deleted successfully`,
        });
        refetchCategories();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    }
  };
  
  const handleRefetchCategories = () => {
    refetchCategories();
  };
  
  const handleBlogSelection = (blogId: string, section: 'trending' | 'highlights' | 'fun') => {
    setFeaturedBlogs(prev => {
      const newFeatured = { ...prev };
      
      if (newFeatured[section].includes(blogId)) {
        // Remove blog from section
        newFeatured[section] = newFeatured[section].filter(id => id !== blogId);
      } else {
        // Add blog to section
        newFeatured[section] = [...newFeatured[section], blogId];
      }
      
      return newFeatured;
    });
  };
  
  const handleSaveFeaturedBlogs = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent default behavior
    setIsLoading(true);
    console.log("Saving featured blogs...", featuredBlogs);
    
    try {
      // Find category IDs
      const trendingCategoryId = categories?.find(c => c.name === 'Trending')?.id;
      const highlightCategoryId = categories?.find(c => c.name === 'Weekly Highlight')?.id;
      const funCategoryId = categories?.find(c => c.name === 'Weekly Fun')?.id;
      
      console.log("Category IDs:", { trendingCategoryId, highlightCategoryId, funCategoryId });
      
      // Check if required categories exist or create them
      let missingCategories = [];
      if (!trendingCategoryId) missingCategories.push('Trending');
      if (!highlightCategoryId) missingCategories.push('Weekly Highlight');
      if (!funCategoryId) missingCategories.push('Weekly Fun');
      
      // Create missing categories
      let newCategoryIds = {};
      if (missingCategories.length > 0) {
        for (const catName of missingCategories) {
          console.log(`Creating missing category: ${catName}`);
          const newCategory = await createCategory(catName);
          if (newCategory) {
            newCategoryIds[catName] = newCategory.id;
          } else {
            toast({
              title: "Error",
              description: `Failed to create required category: ${catName}`,
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
        }
        
        // Refresh categories to get the new ones
        await refetchCategories();
      }
      
      // Use newly created category IDs if needed
      const finalTrendingCategoryId = trendingCategoryId || newCategoryIds['Trending'];
      const finalHighlightCategoryId = highlightCategoryId || newCategoryIds['Weekly Highlight'];
      const finalFunCategoryId = funCategoryId || newCategoryIds['Weekly Fun'];
      
      console.log("Final category IDs:", {
        finalTrendingCategoryId,
        finalHighlightCategoryId,
        finalFunCategoryId
      });
      
      if (!finalTrendingCategoryId || !finalHighlightCategoryId || !finalFunCategoryId) {
        toast({
          title: "Error",
          description: "Could not find or create required categories",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Update all blogs that should be in each category
      const updatePromises: Promise<any>[] = [];
      
      // Process all blogs
      if (blogs) {
        for (const blog of blogs) {
          let targetCategoryId = blog.category_id;
          
          // If blog should be in trending
          if (featuredBlogs.trending.includes(blog.id)) {
            targetCategoryId = finalTrendingCategoryId;
          }
          // If blog should be in highlights
          else if (featuredBlogs.highlights.includes(blog.id)) {
            targetCategoryId = finalHighlightCategoryId;
          }
          // If blog should be in fun
          else if (featuredBlogs.fun.includes(blog.id)) {
            targetCategoryId = finalFunCategoryId;
          }
          
          // Only update if category changed
          if (targetCategoryId !== blog.category_id) {
            console.log(`Updating blog ${blog.id} category to ${targetCategoryId}`);
            updatePromises.push(updateBlog(blog.id, { category_id: targetCategoryId }));
          }
        }
      }
      
      const results = await Promise.all(updatePromises);
      console.log("Update results:", results);
      
      toast({
        title: "Success",
        description: "Featured blogs updated successfully",
      });
      
      // Refresh blogs data
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      
    } catch (error) {
      console.error("Error saving featured blogs:", error);
      toast({
        title: "Error",
        description: "Failed to save featured blogs: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content & Category Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="featured">
          <TabsList className="mb-4">
            <TabsTrigger value="featured">Featured Content</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="featured">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Featured Content</h3>
                <Button 
                  onClick={handleSaveFeaturedBlogs} 
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Select blogs to display in each featured section of the homepage.
              </p>
              
              {loadingBlogs ? (
                <div>Loading blogs...</div>
              ) : (
                <Tabs defaultValue="trending">
                  <TabsList>
                    <TabsTrigger value="trending">Trending News</TabsTrigger>
                    <TabsTrigger value="highlights">Weekly Highlights</TabsTrigger>
                    <TabsTrigger value="fun">Weekly Fun</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="trending" className="space-y-2 mt-4">
                    {blogs?.map(blog => (
                      <div key={blog.id} className="flex items-center space-x-2 border p-2 rounded">
                        <Checkbox 
                          id={`trending-${blog.id}`}
                          checked={featuredBlogs.trending.includes(blog.id)}
                          onCheckedChange={() => handleBlogSelection(blog.id, 'trending')}
                        />
                        <label 
                          htmlFor={`trending-${blog.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-grow"
                        >
                          {blog.title}
                        </label>
                        <Badge variant="outline">{blog.categories?.name || 'Uncategorized'}</Badge>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="highlights" className="space-y-2 mt-4">
                    {blogs?.map(blog => (
                      <div key={blog.id} className="flex items-center space-x-2 border p-2 rounded">
                        <Checkbox 
                          id={`highlights-${blog.id}`}
                          checked={featuredBlogs.highlights.includes(blog.id)}
                          onCheckedChange={() => handleBlogSelection(blog.id, 'highlights')}
                        />
                        <label 
                          htmlFor={`highlights-${blog.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-grow"
                        >
                          {blog.title}
                        </label>
                        <Badge variant="outline">{blog.categories?.name || 'Uncategorized'}</Badge>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="fun" className="space-y-2 mt-4">
                    {blogs?.map(blog => (
                      <div key={blog.id} className="flex items-center space-x-2 border p-2 rounded">
                        <Checkbox 
                          id={`fun-${blog.id}`}
                          checked={featuredBlogs.fun.includes(blog.id)}
                          onCheckedChange={() => handleBlogSelection(blog.id, 'fun')}
                        />
                        <label 
                          htmlFor={`fun-${blog.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-grow"
                        >
                          {blog.title}
                        </label>
                        <Badge variant="outline">{blog.categories?.name || 'Uncategorized'}</Badge>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="categories">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Categories</h3>
                <Button 
                  variant="outline"
                  onClick={handleRefetchCategories} 
                  disabled={loadingCategories}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingCategories ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory(e)}
                />
                <Button 
                  onClick={handleCreateCategory} 
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create
                    </>
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-2 mt-4">
                {loadingCategories ? (
                  <div>Loading categories...</div>
                ) : categories && categories.length > 0 ? (
                  categories.map((category: Category) => (
                    <div key={category.id} className="flex justify-between items-center border p-2 rounded">
                      <span>{category.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No categories found. Create your first category.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
