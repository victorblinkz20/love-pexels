import React from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TrendingNews from '@/components/TrendingNews';
import Newsletter from '@/components/Newsletter';
import LatestNews from '@/components/LatestNews';
import FeaturedArticle from '@/components/FeaturedArticle';
import WeeklyHighlight from '@/components/WeeklyHighlight';
import WeeklyFunNews from '@/components/WeeklyFunNews';
import InspirationCard from '../components/InspirationCard';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-[1600px] mx-auto w-full">
          <HeroSection />
          <TrendingNews />
          <Newsletter />
          <LatestNews />
          <FeaturedArticle />
          <WeeklyFunNews />
          <InspirationCard />
          <WeeklyHighlight />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
