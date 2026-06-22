import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home relative">
      {/* Background Video Section */}
      <section className="hero-section h-screen flex items-center justify-center text-white relative overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
            <source src="/videos/hero-background.webm" type="video/webm" />
            {/* Fallback image if video doesn't load */}
            <img 
              src="/images/hero-fallback.jpg" 
              alt="Luxury cars background" 
              className="w-full h-full object-cover"
            />
          </video>
          {/* Dim overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        {/* Content */}
        <div className="text-center relative z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
            Safari Wheels
          </h1>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in-delay">
            Luxury Car Rentals Across South Africa
          </p>
          <Link 
            to="/cars" 
            className="bg-white text-amber-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg animate-fade-in-delay-2"
          >
            Explore Our Fleet
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;