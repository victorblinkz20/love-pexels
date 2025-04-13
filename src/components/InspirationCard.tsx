import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const InspirationCard = () => {
  return (
    <div className="relative h-[400px] rounded-2xl overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
          alt="Inspiration"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">Discover Amazing Stories</h2>
        <p className="text-lg mb-6 opacity-90">
          Explore our collection of inspiring articles and experiences from around the world.
        </p>
        <div className="group">
          <Link
            to="/all-blogs"
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Explore More
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InspirationCard; 