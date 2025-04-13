
import React, { useState, useEffect } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Save, Send, Loader2, AlertTriangle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  createBlog, 
  updateBlog, 
  getBlogById, 
  uploadImage, 
  getCurrentUser,
  type Blog 
} from '@/lib/supabase';
import RichTextEditor from './RichTextEditor';

// Define form schema without category_id
const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  excerpt: z.string().min(10, {
    message: "Excerpt must be at least 10 characters.",
  }),
  status: z.enum(["draft", "published"]),
});

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const { data: blog, isLoading: blogLoading } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => id ? getBlogById(id) : null,
    enabled: !!id,
  });
  
  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      status: "draft",
    },
  });
  
  // Set form values when blog data is loaded
  useEffect(() => {
    if (blog) {
      form.reset({
        title: blog.title || "",
        content: blog.content || "",
        excerpt: blog.excerpt || "",
        status: blog.status as "draft" | "published" || "draft",
      });
      
      if (blog.image_url) {
        setSelectedImage(blog.image_url);
      }
    }
  }, [blog, form]);
  
  // Create new blog mutation
  const createBlogMutation = useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast({ 
        title: "Blog created", 
        description: "Your blog post has been created successfully." 
      });
      navigate('/dashboard/posts');
    },
    onError: (error) => {
      toast({ 
        variant: "destructive", 
        title: "Failed to create blog", 
        description: "There was an error creating your blog post. Please try again." 
      });
      console.error("Create error:", error);
    },
  });
  
  // Update blog mutation
  const updateBlogMutation = useMutation({
    mutationFn: ({ id, blog }: { id: string; blog: any }) => updateBlog(id, blog),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', id] });
      toast({ 
        title: "Blog updated", 
        description: "Your blog post has been updated successfully." 
      });
      navigate('/dashboard/posts');
    },
    onError: (error) => {
      toast({ 
        variant: "destructive", 
        title: "Failed to update blog", 
        description: "There was an error updating your blog post. Please try again." 
      });
      console.error("Update error:", error);
    },
  });
  
  // Handle image upload
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Reset any previous upload errors
      setUploadError(null);
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form values:", values);
    
    const user = await getCurrentUser();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to create or edit blog posts.",
      });
      return;
    }
    
    let imageUrl = selectedImage;
    
    if (selectedFile) {
      setIsUploading(true);
      setUploadError(null);
      try {
        imageUrl = await uploadImage(selectedFile);
        if (!imageUrl) {
          setUploadError("Failed to upload image. Please try again.");
          toast({
            variant: "destructive",
            title: "Upload failed",
            description: "Failed to upload image. Please try again.",
          });
          setIsUploading(false);
          return;
        }
      } catch (error) {
        console.error("Image upload error:", error);
        setUploadError("Error uploading image. Please try again.");
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
        });
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }
    
    const blogData = {
      ...values,
      // Add a default category_id to prevent database errors
      category_id: blog?.category_id || '00000000-0000-0000-0000-000000000000',
      image_url: imageUrl || null,
      author_id: user.id,
    };
    
    if (id) {
      updateBlogMutation.mutate({ id, blog: blogData });
    } else {
      createBlogMutation.mutate(blogData as Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'views'>);
    }
  }
  
  // Save as draft
  const handleSaveAsDraft = () => {
    form.setValue("status", "draft");
    form.handleSubmit(onSubmit)();
  };
  
  if (blogLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-news-orange" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6 md:col-span-1">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the post" 
                        {...field}
                        className="resize-none h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <Label htmlFor="image">Featured Image</Label>
                <div className="mt-1 flex items-center space-x-4">
                  <div 
                    className={`w-32 h-32 border-2 border-dashed rounded-md flex items-center justify-center ${
                      selectedImage ? 'border-green-300' : 'border-gray-300'
                    }`}
                  >
                    {selectedImage ? (
                      <img 
                        src={selectedImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-md" 
                      />
                    ) : (
                      <Camera size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="max-w-[240px]"
                    />
                    {uploadError && (
                      <div className="flex items-center text-red-500 text-sm">
                        <AlertTriangle size={12} className="mr-1" />
                        {uploadError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <RichTextEditor 
                      value={field.value} 
                      onChange={field.onChange} 
                      className="h-[360px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSaveAsDraft}
              disabled={createBlogMutation.isPending || updateBlogMutation.isPending || isUploading}
            >
              {(createBlogMutation.isPending || updateBlogMutation.isPending) && form.getValues().status === "draft" ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              Save as Draft
            </Button>
            <Button 
              type="submit" 
              className="bg-news-orange hover:bg-orange-600"
              disabled={createBlogMutation.isPending || updateBlogMutation.isPending || isUploading}
            >
              {(createBlogMutation.isPending || updateBlogMutation.isPending || isUploading) ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Publish Post
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BlogEditor;
