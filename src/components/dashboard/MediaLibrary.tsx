import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadImage, getMediaItems } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image, Search, X, Check, Info, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MediaLibrary = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: mediaItems, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: getMediaItems,
  });
  
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return await uploadImage(file, 'media-library');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast({
        title: 'Upload Successful',
        description: 'Your media has been uploaded successfully.',
      });
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'There was an error uploading your media.',
      });
      console.error('Upload error:', error);
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Clean up preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };
  
  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };
  
  const filteredMedia = mediaItems?.filter(item => 
    item.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-news-orange hover:bg-orange-600">
              <Upload className="mr-2 h-4 w-4" /> Upload New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
              <DialogDescription>
                Upload images to use in your blog posts.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="media-file">Select File</Label>
                <Input 
                  id="media-file" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </div>
              
              {previewUrl && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <div className="mt-2 relative aspect-video rounded-md overflow-hidden border border-gray-200">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className="bg-news-orange hover:bg-orange-600"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search media files..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
              Array(8).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-2">
                    <Skeleton className="aspect-square w-full rounded-md" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardContent>
                </Card>
              ))
            ) : filteredMedia && filteredMedia.length > 0 ? (
              filteredMedia.map((item) => (
                <Card 
                  key={item.id} 
                  className={`overflow-hidden cursor-pointer transition-all ${
                    selectedMedia === item.id ? 'ring-2 ring-news-orange' : ''
                  }`}
                  onClick={() => setSelectedMedia(item.id === selectedMedia ? null : item.id)}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <img 
                        src={item.url} 
                        alt={item.alt_text || item.file_name} 
                        className="w-full h-full object-cover"
                      />
                      {selectedMedia === item.id && (
                        <div className="absolute top-2 right-2 bg-news-orange text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="truncate text-sm font-medium">{item.file_name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <Image className="h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold">No media found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchQuery ? 'Try a different search term' : 'Upload your first media file'}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-semibold">File</th>
                  <th className="py-3 px-4 text-left font-semibold">Type</th>
                  <th className="py-3 px-4 text-left font-semibold">Size</th>
                  <th className="py-3 px-4 text-left font-semibold">Uploaded On</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded-md mr-3" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 px-4 text-right"><Skeleton className="h-6 w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredMedia && filteredMedia.length > 0 ? (
                  filteredMedia.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-md overflow-hidden bg-gray-100 mr-3">
                            <img 
                              src={item.url} 
                              alt={item.alt_text || item.file_name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="truncate max-w-[200px]">{item.file_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{item.file_type.split('/')[1]}</td>
                      <td className="py-3 px-4">{Math.round(item.file_size / 1024)} KB</td>
                      <td className="py-3 px-4">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(item.url, '_blank')}>
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.url)}>
                              Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          {searchQuery ? 'No media found matching your search' : 'No media files uploaded yet'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaLibrary;
