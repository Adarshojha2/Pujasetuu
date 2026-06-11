import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { Search, Compass, Calendar, Award, Star, Flame, Sparkles, Gift } from 'lucide-react';

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [featuredPandits, setFeaturedPandits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Puja Services list for home display
  const pujas = [
    { type: 'Satyanarayan Puja', desc: 'Bring home peace and prosperity with the auspicious Satyanarayan Katha.', icon: '📖', price: 2100 },
    { type: 'Griha Pravesh Puja', desc: 'Purify your new home before moving in to attract divine energy.', icon: '🏠', price: 5100 },
    { type: 'Rudrabhishek', desc: 'Perform sacred bathing of Lord Shiva to invoke divine blessings.', icon: '🔱', price: 3100 },
    { type: 'Vastu Shanti Puja', desc: 'Rectify structural defects and align energies in your workplace or home.', icon: '📐', price: 4500 }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch products
        const prodRes = await axios.get('http://localhost:5000/api/products');
        setTrendingProducts(prodRes.data.slice(0, 4));

        // Fetch pandits
        const panditRes = await axios.get('http://localhost:5000/api/pandits');
        setFeaturedPandits(panditRes.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching home page data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-12">
      {/* 1. Hero Banner */}
      <section className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 py-20 px-4 md:px-8 text-white text-center overflow-hidden shanti-glow">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/20 via-orange-600/30 to-red-800/40 pointer-events-none"></div>
        <div className="relative max-w-4xl mx-auto space-y-6">
          <span className="bg-orange-600/50 border border-orange-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-orange-100">
            🕉️ Traditional, Verified & Pure
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-md">
            {t('hero_title')}
          </h1>
          <p className="text-lg md:text-xl text-orange-50 font-medium max-w-2xl mx-auto">
            {t('hero_subtitle')}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/pujas"
              className="bg-white text-saffron-600 hover:bg-orange-50 font-bold px-8 py-3.5 rounded-full shadow-lg transition-transform hover:-translate-y-0.5"
            >
              {t('book_pandit')}
            </Link>
            <Link
              to="/marketplace"
              className="bg-orange-700 hover:bg-orange-800 text-white font-bold px-8 py-3.5 rounded-full border border-orange-400 shadow-lg transition-transform hover:-translate-y-0.5"
            >
              {t('shop_now')}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Festival Offer Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-orange-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="h-12 w-12 bg-saffron-500 rounded-full flex items-center justify-center text-white text-xl animate-pulse">
              🪔
            </div>
            <div>
              <h2 className="text-xl font-bold text-saffron-900">Festival Special Offer!</h2>
              <p className="text-gray-700 text-sm">Get 10% instant discount on all spiritual products. Use code <span className="font-bold text-saffron-600 bg-white px-2 py-0.5 rounded border border-orange-100">FESTIVAL10</span></p>
            </div>
          </div>
          <Link to="/marketplace" className="bg-saffron-600 hover:bg-saffron-700 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors">
            Explore Offers
          </Link>
        </div>
      </section>

      {/* 3. Puja Services */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('featured_pujas')}</h2>
          <p className="text-gray-600 mt-2">Customized Hindu prayer services conducted by vetted Vedic priests.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pujas.map((p, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <span className="text-4xl block mb-4">{p.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{p.type}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{p.desc}</p>
              </div>
              <div className="mt-4">
                <div className="text-xs text-gray-500 font-medium">Starting at</div>
                <div className="text-xl font-extrabold text-saffron-600">₹{p.price}</div>
                <Link
                  to={`/pujas/${encodeURIComponent(p.type)}`}
                  className="mt-3 block bg-saffron-100 hover:bg-saffron-500 hover:text-white text-saffron-700 font-bold py-2 rounded-xl text-sm transition-colors"
                >
                  Book Ceremony
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Marketplace Products */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('trending_products')}</h2>
            <p className="text-gray-600 mt-2">Authentic Puja essentials shipped straight to your doorstep.</p>
          </div>
          <Link to="/marketplace" className="text-saffron-600 hover:text-saffron-700 font-bold text-sm flex items-center">
            View All &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="bg-gray-100 rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((p) => (
              <Link to={`/marketplace/${p._id}`} key={p._id} className="group bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-orange-50 overflow-hidden">
                  <img
                    src={p.image || 'https://images.unsplash.com/photo-1609137144813-911d087b32d2?w=500'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-saffron-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {p.category}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-gray-800 text-sm truncate">{p.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-gold-500 fill-current" />
                    <span className="text-xs font-bold text-gray-700">{p.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-md font-extrabold text-saffron-600">₹{p.price}</span>
                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">
                      In Stock
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. Vetted Pandits */}
      <section className="max-w-7xl mx-auto px-4 bg-orange-50/50 py-12 rounded-3xl border border-orange-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Our Spiritual Guides</h2>
          <p className="text-gray-600 mt-2">Vedic scholars certified in rituals and scripture recitations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {loading ? (
            [1, 2, 3].map(idx => (
              <div key={idx} className="bg-white rounded-2xl h-48 animate-pulse"></div>
            ))
          ) : (
            featuredPandits.map((pandit) => (
              <div key={pandit._id} className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-orange-100 flex-shrink-0">
                  <img
                    src={pandit.image || 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500'}
                    alt={pandit.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-md">{pandit.name}</h3>
                  <p className="text-xs text-saffron-600 font-semibold uppercase">{pandit.specialization.slice(0, 2).join(', ')}</p>
                  <p className="text-xs text-gray-500">{pandit.experience} {t('experience')} • {pandit.city}</p>
                  <div className="flex items-center space-x-1 pt-1">
                    <Star className="h-3.5 w-3.5 text-gold-500 fill-current" />
                    <span className="text-xs font-bold text-gray-800">{pandit.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded ml-2">
                      Vetted
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 6. Referral & Loyalty System */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-crimson-800 to-red-950 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between">
          <div className="absolute right-0 top-0 opacity-10 text-9xl pointer-events-none">
            🕉️
          </div>
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <span className="bg-red-700/60 border border-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-red-100 flex items-center w-max mx-auto md:mx-0">
              <Gift className="h-3.5 w-3.5 mr-1 text-gold-400" /> Refer & Earn Program
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold">Spread Spiritual Harmony</h2>
            <p className="text-red-100 text-sm md:text-md">
              Share the blessings of PujaSetu with friends! Invite them to join. When they sign up using your referral code, both of you receive a 10% coupon code for your next order.
            </p>
          </div>
          <Link to="/register" className="mt-6 md:mt-0 bg-gold-500 hover:bg-gold-600 text-gray-900 font-extrabold px-8 py-3 rounded-full shadow-md transition-transform hover:scale-105">
            Join & Get Code
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
