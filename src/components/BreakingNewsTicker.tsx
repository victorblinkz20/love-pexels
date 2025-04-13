import React from 'react';

const BreakingNewsTicker = () => {
  const breakingNews = [
    "You are allowed to outgrow versions of yourself that once felt like home. Growth isn't always graceful - it's often uncomfortable, raw, and uncertain. But trust that every season of change is shaping you into something stronger, softer, and more aligned with who you're meant to be."
  ];

  return (
    <div className="bg-news-orange text-white py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-ticker">
        {breakingNews.map((news, index) => (
          <React.Fragment key={index}>
            <span className="font-bold mr-2">A gentle reminder:</span>
            <span className="mr-12">{news}</span>
          </React.Fragment>
        ))}
        {breakingNews.map((news, index) => (
          <React.Fragment key={`repeat-${index}`}>
            <span className="font-bold mr-2">A gentle reminder:</span>
            <span className="mr-12">{news}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
