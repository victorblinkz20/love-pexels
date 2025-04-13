
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  BarChart2,
  Settings,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  Home,
  Tags,
} from 'lucide-react';
import { signOut } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Posts', path: '/dashboard/posts' },
  { icon: Tags, label: 'Categories', path: '/dashboard/categories' },
  { icon: Image, label: 'Media', path: '/dashboard/media' },
  { icon: Users, label: 'Users', path: '/dashboard/users' },
  { icon: BarChart2, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    // In a real implementation, you would apply the theme change to the document
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-news-orange">Blog Admin</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-orange-50 text-news-orange font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={18} className={`mr-3 ${isActive ? 'text-news-orange' : 'text-gray-500'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => navigate('/')}
          >
            <Home size={18} className="mr-3" />
            View Homepage
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut size={18} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>
      
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden fixed top-4 left-4 z-20"
          >
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-news-orange">Blog Admin</span>
            </div>
          </div>
          
          <div className="py-4">
            <nav className="px-2 space-y-1">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-orange-50 text-news-orange font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon size={18} className={`mr-3 ${isActive ? 'text-news-orange' : 'text-gray-500'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-200 space-y-2 mt-auto">
            <Button 
              variant="outline" 
              className="w-full justify-start text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              onClick={() => navigate('/')}
            >
              <Home size={18} className="mr-3" />
              View Homepage
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut size={18} className="mr-3" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center md:hidden">
                {/* Mobile menu button placeholder for spacing */}
                <div className="w-6 h-6"></div>
              </div>
              
              <div className="flex-1 flex justify-between items-center">
                {/* Left side */}
                <div>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="hidden md:flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                    onClick={() => navigate('/')}
                  >
                    <Home size={16} className="mr-2" />
                    View Homepage
                  </Button>
                </div>
                
                {/* Right side */}
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-news-orange text-white hover:bg-orange-600 border-none"
                    onClick={() => navigate('/dashboard/create')}
                  >
                    <PlusCircle size={16} className="mr-2" />
                    New Post
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={toggleTheme}>
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button variant="ghost" size="icon" onClick={handleSignOut}>
                    <LogOut size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
