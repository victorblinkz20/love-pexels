import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, UserPlus, User, Search, Filter, MoreHorizontal, Users, Shield, UserCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteUser, changeUserRole, deleteUser, getAllUsers } from '@/lib/supabase/users';

const UsersManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('author');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });
  
  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) => inviteUser(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Invitation sent",
        description: `An invitation email has been sent to ${inviteEmail}`,
      });
      setInviteEmail('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to invite user",
        variant: "destructive",
      });
    },
  });
  
  const roleChangeMutation = useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: string }) => changeUserRole(userId, newRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Role updated",
        description: "User role has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });
  
  // Filter users based on search and filters
  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (roleFilter === 'all' || user.role === roleFilter)
  );
  
  const handleInviteUser = () => {
    if (!inviteEmail || !inviteRole) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };
  
  const handleRoleChange = (userId: string, newRole: string) => {
    roleChangeMutation.mutate({ userId, newRole });
  };
  
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId);
    }
  };
  
  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    editor: 'bg-blue-100 text-blue-800',
    author: 'bg-green-100 text-green-800',
  };
  
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };
  
  const roleIcons: Record<string, React.ReactNode> = {
    admin: <Shield className="h-4 w-4 mr-2" />,
    editor: <Pencil className="h-4 w-4 mr-2" />,
    author: <User className="h-4 w-4 mr-2" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-news-orange hover:bg-orange-600">
              <UserPlus className="mr-2 h-4 w-4" /> Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation email to add a new user to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">Role</label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleInviteUser}
                disabled={inviteMutation.isPending}
                className="bg-news-orange hover:bg-orange-600"
              >
                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage user accounts and permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-4">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-32 sm:w-36">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="author">Author</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 sm:w-36">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ width: 50 }} className="text-center">
                        <Checkbox />
                      </TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead style={{ width: 100 }} className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-center">
                            <Checkbox disabled />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Skeleton className="h-10 w-10 rounded-full mr-3" />
                              <div>
                                <Skeleton className="h-4 w-24 mb-1" />
                                <Skeleton className="h-3 w-32" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="text-center">
                            <Checkbox />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={user.avatar_url} alt={user.username} />
                                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.username}</div>
                                <div className="text-sm text-muted-foreground">{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${roleColors[user.role]} flex items-center w-fit`}>
                              {roleIcons[user.role]}
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Edit User</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'editor')}>
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-500"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-300 mx-auto mb-1" />
                          <p className="text-muted-foreground">No users found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Manage role definitions and access control.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-md border shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <Shield className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold">Admin</h3>
                      <p className="text-sm text-muted-foreground">Full access to all features</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Edit Role
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Content Management</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          Create Posts
                        </li>
                        <li className="flex items-center">
                          <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          Edit Any Post
                        </li>
                        <li className="flex items-center">
                          <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          Delete Posts
                        </li>
                        <li className="flex items-center">
                          <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          Manage Categories
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">User Management</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          Create Users
                        </li>
                        <li className="flex items-center">
                          <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          Edit Users
                        </li>
                        <li className="flex items-center">
                          <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          Delete Users
                        </li>
                        <li className="flex items-center">
                          <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          Assign Roles
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Settings</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          View Analytics
                        </li>
                        <li className="flex items-center">
                          <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          Manage Settings
                        </li>
                        <li className="flex items-center">
                          <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          Configure System
                        </li>
                        <li className="flex items-center">
                          <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                          Manage Media
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <Pencil className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold">Editor</h3>
                      <p className="text-sm text-muted-foreground">Can edit and manage content</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Edit Role
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Permission sections for Editor role */}
                    {/* ... similar to Admin role ... */}
                  </div>
                </div>
                
                <div className="rounded-md border shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <User className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold">Author</h3>
                      <p className="text-sm text-muted-foreground">Can create and edit own content</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Edit Role
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Permission sections for Author role */}
                    {/* ... similar to Admin role ... */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersManagement;
