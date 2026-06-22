import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const features = [
    {
      icon: 'fas fa-shield-alt',
      title: 'Premium Insurance',
      description: 'Comprehensive coverage for complete peace of mind during your rental period.'
    },
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Nationwide Coverage',
      description: 'Pick up and drop off at any of our locations across South Africa.'
    },
    {
      icon: 'fas fa-concierge-bell',
      title: '24/7 Support',
      description: 'Our customer service team is available round the clock to assist you.'
    },
    {
      icon: 'fas fa-car',
      title: 'Luxury Fleet',
      description: 'Carefully maintained luxury vehicles for the ultimate driving experience.'
    },
    {
      icon: 'fas fa-tag',
      title: 'Best Prices',
      description: 'Competitive pricing with no hidden fees or surprises.'
    },
    {
      icon: 'fas fa-star',
      title: 'Premium Service',
      description: 'Exceptional service from booking to return and everything in between.'
    }
  ];

  const team = [
    {
      name: 'Menzi Sigwebela',
      role: 'Founder & CEO',
      image: '/images/team/menzi-sigwebela.jpeg', 
      description: 'Former luxury car dealer with 10+ years in automotive industry.'
    },
    {
      name: 'Sanele Dlomo',
      role: 'Operations Manager',
      image: '/images/team/sanele-dlomo.jpeg', 
      description: 'Expert in customer service and logistics management.'
    },
    {
      name: 'Brilliant Sifundza',
      role: 'Fleet Manager',
      image: '/images/team/brilliant-sifundza.jpeg', 
      description: 'Ensures our luxury fleet is always in perfect condition.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-500 to-amber-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About Safari Wheels</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Your premier luxury car rental service across South Africa. Experience the finest vehicles with unmatched service.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Story</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-gray-600 mb-4">
                  Founded in 2020, Safari Wheels began with a simple vision: to provide South Africans and visitors with access to the world's most luxurious and high-performance vehicles.
                </p>
                <p className="text-gray-600 mb-4">
                  What started as a small fleet of premium sedans in Johannesburg has grown into South Africa's leading luxury car rental service, with locations in all 9 provinces and a diverse collection of the finest automobiles.
                </p>
                <p className="text-gray-600">
                  Our commitment to excellence, attention to detail, and unparalleled customer service has made us the preferred choice for discerning clients who expect nothing but the best.
                </p>
              </div>
              <div className="bg-gray-200 h-80 rounded-lg overflow-hidden">
                <img 
                  src="/images/about/luxury-fleet-showcase.jpeg" 
                  alt="Our Luxury Fleet" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600">
                  <div className="text-center text-white">
                    <i className="fas fa-car text-4xl mb-4"></i>
                    <p className="text-xl font-semibold">Our Luxury Fleet</p>
                    <p className="text-amber-100 mt-2">Premium Vehicles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose Safari Wheels?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`${feature.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center relative overflow-hidden">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex items-center justify-center ${member.image ? 'hidden' : 'flex'}`}>
                    <div className="text-center text-white">
                      <i className="fas fa-user text-6xl mb-2"></i>
                      <p className="text-lg font-semibold">{member.name}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-amber-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-amber-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience Luxury?</h2>
          <p className="text-amber-100 text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have experienced the Safari Wheels difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/cars"
              className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Our Fleet
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-amber-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;