import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BreakingNewsTicker from './BreakingNewsTicker';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRoles } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Heart, Leaf, Sun, Coffee } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { session } = useAuth();

  // Fetch user roles if logged in
  const { data: userRoles } = useQuery({
    queryKey: ['userRoles', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      return getUserRoles(session.user.id);
    },
    enabled: !!session?.user?.id,
  });

  // Check if user is admin
  const isAdmin = userRoles?.some(role => role.name === 'admin') || false;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full">
      <div className="bg-news-dark text-white w-full">
        <div className="px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link to="/" className="text-xl md:text-2xl font-bold tracking-wider">LOVE&PIXELS</Link>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
  <span className="text-white hover:text-news-orange transition-colors duration-200 cursor-pointer flex flex-col items-center">
    <Heart size={20} />
    <span className="text-xs mt-1">Love</span>
  </span>
  <span className="text-white hover:text-news-orange transition-colors duration-200 cursor-pointer flex flex-col items-center">
    <Leaf size={20} />
    <span className="text-xs mt-1">Nature</span>
  </span>
  <span className="text-white hover:text-news-orange transition-colors duration-200 cursor-pointer flex flex-col items-center">
    <Sun size={20} />
    <span className="text-xs mt-1">Light</span>
  </span>
  <span className="text-white hover:text-news-orange transition-colors duration-200 cursor-pointer flex flex-col items-center">
    <Coffee size={20} />
    <span className="text-xs mt-1">Moments</span>
  </span>
  {session && isAdmin && (
    <Link to="/dashboard" className="font-medium text-news-orange hover:text-white transition-colors duration-200">
      DASHBOARD
    </Link>
  )}
  {!session ? (
    <Link to="/login" className="font-medium text-white hover:text-news-orange transition-colors duration-200">
      LOGIN
    </Link>
  ) : (
    <Link to="/login" className="font-medium text-white hover:text-news-orange transition-colors duration-200">
      MY ACCOUNT
    </Link>
  )}
</nav>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-white"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && isMobile && (
        <div className="bg-news-dark text-white md:hidden py-4">
          <div className="px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <nav className="flex flex-col space-y-4">
                <NavLink href="/">NEWS</NavLink>
                <NavLink href="/">WATCH</NavLink>
                <NavLink href="/">LISTEN</NavLink>
                <NavLink href="/">LIVE TV</NavLink>
                {session && isAdmin && (
                  <Link to="/dashboard" className="font-medium text-news-orange hover:text-white transition-colors duration-200">
                    DASHBOARD
                  </Link>
                )}
                {!session ? (
                  <Link to="/login" className="font-medium text-white hover:text-news-orange transition-colors duration-200">
                    LOGIN
                  </Link>
                ) : (
                  <Link to="/login" className="font-medium text-white hover:text-news-orange transition-colors duration-200">
                    MY ACCOUNT
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
      
      <BreakingNewsTicker />
    </header>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <a 
      href={href} 
      className="font-medium hover:text-news-orange transition-colors duration-200"
    >
      {children}
    </a>
  );
};

export default Header;
