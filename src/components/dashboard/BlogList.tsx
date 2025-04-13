import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Loader2, Plus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBlogs, deleteBlog, setFeaturedBlog, type Blog } from '@/lib/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BlogList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: blogs, isLoading, error } = useQuery({
    queryKey: ['blogs'],
    queryFn: () => getBlogs(),
  });
  
  const deletePostMutation = useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast({ 
        title: "Post deleted", 
        description: "The blog post has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({ 
        variant: "destructive", 
        title: "Failed to delete post", 
        description: "There was an error deleting the post. Please try again.",
      });
      console.error("Delete error:", error);
    },
  });
  
  const setFeaturedMutation = useMutation({
    mutationFn: (id: string) => setFeaturedBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast({ 
        title: "Featured post updated", 
        description: "The featured blog post has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({ 
        variant: "destructive", 
        title: "Failed to update featured post", 
        description: "There was an error updating the featured post. Please try again.",
      });
      console.error("Set featured error:", error);
    },
  });
  
  const handleDelete = async () => {
    if (deleteId) {
      deletePostMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-news-orange" />
        <span className="ml-2">Loading blog posts...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-red-500">Error loading blog posts. Please try again later.</p>
        <p className="text-sm text-gray-500 mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-bold">All Posts</h2>
        <Button 
          className="bg-news-orange hover:bg-orange-600"
          onClick={() => navigate('/dashboard/create')}
        >
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>
      
      {blogs && blogs.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((post: Blog) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.categories?.name || 'Uncategorized'}</TableCell>
                <TableCell>
                  <Badge className={post.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{post.views?.toLocaleString() || 0}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={post.is_featured ? "text-yellow-500" : "text-gray-400"}
                    onClick={() => setFeaturedMutation.mutate(post.id)}
                    disabled={setFeaturedMutation.isPending}
                  >
                    {setFeaturedMutation.isPending && post.id === setFeaturedMutation.variables ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Star className="h-4 w-4" fill={post.is_featured ? "currentColor" : "none"} />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`/blog/${post.id}`, '_blank')}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/dashboard/edit/${post.id}`)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => setDeleteId(post.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500">No blog posts found.</p>
          <Button 
            className="mt-4 bg-news-orange hover:bg-orange-600"
            onClick={() => navigate('/dashboard/create')}
          >
            Create your first post
          </Button>
        </div>
      )}
      
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletePostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogList;
