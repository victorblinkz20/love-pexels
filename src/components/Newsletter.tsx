import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Newsletter = () => {
  return (
    <section className="bg-news-dark text-white py-12 my-12">
      <div className="container mx-auto px-4 md:px-0">
        <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Latest from the Heart
        </h2>
        <p className="text-white/80 mb-8 text-sm md:text-base">
          Honest reflections, daily musings, and everything in between.
        </p>

          
          <div className="flex flex-col md:flex-row max-w-xl mx-auto gap-3">
            <Input 
              type="email" 
              placeholder="Enter your email address" 
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button className="bg-news-orange hover:bg-news-orange/90 text-white">
              Subscribe
            </Button>
          </div>
          
          <p className="text-white/60 text-xs mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive news from Love & Pixels
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
