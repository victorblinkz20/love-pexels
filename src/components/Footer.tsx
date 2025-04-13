import React from 'react';
import { Heart, Leaf, Sun, Moon, Coffee, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-news-dark text-white w-full">
      <div className="px-4 md:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4">LOVE&PIXELS</h2>
            <p className="text-white/80 text-center max-w-xl">
              Honest reflections, heartfelt stories, and a little inspiration — just for you.
            </p>
            <div className="flex space-x-4 mt-6">
              <InspirationIcon icon={<Heart size={18} />} text="Love" />
              <InspirationIcon icon={<Leaf size={18} />} text="Nature" />
              <InspirationIcon icon={<Coffee size={18} />} text="Moments" />
              <InspirationIcon icon={<Sun size={18} />} text="Light" />
              <InspirationIcon icon={<Moon size={18} />} text="Reflection" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-8">
            <div className="text-center">
              <h3 className="font-bold mb-4">Daily Affirmation</h3>
              <p className="text-white/70 italic">
                "Every sunrise is an invitation for us to arise and brighten someone's day."
              </p>
              <div className="mt-4 flex justify-center">
                <span className="px-4 py-1 bg-white/10 rounded-full text-sm">New affirmation daily</span>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="font-bold mb-4">Season's Palette</h3>
              <div className="flex justify-center space-x-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-amber-300"></div>
                <div className="w-6 h-6 rounded-full bg-emerald-500"></div>
                <div className="w-6 h-6 rounded-full bg-sky-400"></div>
                <div className="w-6 h-6 rounded-full bg-rose-400"></div>
              </div>
              <p className="text-white/70 text-sm">
                Colors that inspire this season's reflections
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="font-bold mb-4">Journal Prompt</h3>
              <p className="text-white/70">
                "What small moment brought you unexpected joy today?"
              </p>
              <div className="mt-4 flex justify-center">
                <a href="#" className="text-sm text-news-orange hover:underline">Share your thoughts</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} LOVE&PIXELS. A journal of life's beautiful moments.
            </p>
            <div className="flex flex-col sm:flex-row items-center text-white/60 text-sm">
              <div className="flex items-center mb-2 sm:mb-0 sm:mr-6">
                <Phone size={14} className="mr-2" />
                <span>Whisper your thoughts: +1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <MapPin size={14} className="mr-2" />
                <span>Writing from a quiet corner in NY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const InspirationIcon = ({ icon, text }: { icon: React.ReactNode, text: string }) => {
  return (
    <div className="flex flex-col items-center">
      <a 
        href="#" 
        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-news-orange transition-colors duration-300 mb-1"
      >
        {icon}
      </a>
      <span className="text-xs text-white/70">{text}</span>
    </div>
  );
};

export default Footer;