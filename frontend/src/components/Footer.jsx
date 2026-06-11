import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-spiritual-brown text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* About Column */}
          <div className="space-y-4">
            <span className="text-xl font-bold text-saffron-400 tracking-wider">
              🕉️ PujaSetu
            </span>
            <p className="text-gray-300 text-sm leading-relaxed">
              Bridging the gap between devotees, verified Pandits, and authentic spiritual tools to bring peace, prosperity, and blessings to your home.
            </p>
            <div className="flex space-x-4">
              <span className="text-xs text-orange-200 bg-saffron-950 border border-saffron-800 px-2 py-1 rounded">
                100% Pure Samagri
              </span>
              <span className="text-xs text-orange-200 bg-saffron-950 border border-saffron-800 px-2 py-1 rounded">
                Verified Pandits
              </span>
            </div>
          </div>

          {/* Quick Bookings */}
          <div>
            <h3 className="text-saffron-400 font-semibold mb-4 text-sm uppercase tracking-wider">Book Pujas</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/pujas" className="hover:text-gold-400 transition-colors">Satyanarayan Puja</Link></li>
              <li><Link to="/pujas" className="hover:text-gold-400 transition-colors">Griha Pravesh Puja</Link></li>
              <li><Link to="/pujas" className="hover:text-gold-400 transition-colors">Rudrabhishek Puja</Link></li>
              <li><Link to="/pujas" className="hover:text-gold-400 transition-colors">Vastu Shanti Puja</Link></li>
              <li><Link to="/pujas" className="hover:text-gold-400 transition-colors">Festival Special Pujas</Link></li>
            </ul>
          </div>

          {/* Spiritual Marketplace */}
          <div>
            <h3 className="text-saffron-400 font-semibold mb-4 text-sm uppercase tracking-wider">Marketplace</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/marketplace?category=Diyas" className="hover:text-gold-400 transition-colors">Brass & Clay Diyas</Link></li>
              <li><Link to="/marketplace?category=Dhoop%20%26%20Agarbatti" className="hover:text-gold-400 transition-colors">Incense & Dhoop</Link></li>
              <li><Link to="/marketplace?category=Puja%20Kits" className="hover:text-gold-400 transition-colors">Puja Samagri Kits</Link></li>
              <li><Link to="/marketplace?category=Idols%20%26%20Murtis" className="hover:text-gold-400 transition-colors">Idols & Murtis</Link></li>
              <li><Link to="/marketplace?category=Holy%20Books" className="hover:text-gold-400 transition-colors">Bhagavad Gita & Ramayana</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-saffron-400 font-semibold text-sm uppercase tracking-wider">Get in Touch</h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-saffron-500" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-saffron-500" />
                <span>support@pujasetu.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-saffron-500 mt-0.5" />
                <span>Kashi Vishwanath Corridor, Varanasi, UP, India - 221001</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <hr className="my-8 border-saffron-900" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400">
          <p>© 2026 PujaSetu Spiritual Services Pvt Ltd. All rights reserved.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Made with <Heart className="h-3.5 w-3.5 text-crimson-500 mx-1 fill-current" /> in India
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
