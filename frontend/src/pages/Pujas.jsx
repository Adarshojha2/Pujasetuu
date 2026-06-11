import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, MapPin, CheckCircle } from 'lucide-react';

const Pujas = () => {
  const [filter, setFilter] = useState('all'); // all, home, temple
  const [search, setSearch] = useState('');

  const pujaServices = [
    {
      type: 'Satyanarayan Puja',
      category: 'home',
      icon: '📖',
      price: 2100,
      duration: '3 Hours',
      desc: 'Sacred ritual dedicated to Lord Vishnu, typically performed on full moon (Purnima) days or special occasions to bring peace, health, and abundance.'
    },
    {
      type: 'Griha Pravesh Puja',
      category: 'home',
      icon: '🏠',
      price: 5100,
      duration: '4 Hours',
      desc: 'Housewarming ceremony involving Vastu Puja, Hawan, and Kalash Pravesh to cleanse structural energies and bless the new home.'
    },
    {
      type: 'Rudrabhishek',
      category: 'temple',
      icon: '🔱',
      price: 3100,
      duration: '2 Hours',
      desc: 'Sacred bathing of Shiva Lingam with panchamrit while reciting Sri Rudram. Ideal for resolving health and planetary issues.'
    },
    {
      type: 'Navagraha Puja',
      category: 'home',
      icon: '🪐',
      price: 3500,
      duration: '3 Hours',
      desc: 'Ritual invocation of the nine celestial bodies to pacify negative planetary influences and capture benevolent vibrations.'
    },
    {
      type: 'Marriage Puja',
      category: 'temple',
      icon: '💍',
      price: 11000,
      duration: '6 Hours',
      desc: 'Sacred wedding ceremony performed in accordance with traditional Vedic rites, complete with pheras and mangalashtaka.'
    },
    {
      type: 'Naming Ceremony',
      category: 'home',
      icon: '👶',
      price: 2500,
      duration: '2 Hours',
      desc: 'Namkaran Sanskar ritual celebrating the naming of the newborn, aligning planetary naming letters with astrology.'
    },
    {
      type: 'Shradh Puja',
      category: 'temple',
      icon: '🙏',
      price: 4100,
      duration: '3 Hours',
      desc: 'Ceremony performed to express reverence and offer peace to ancestral spirits, ensuring their guidance and release.'
    },
    {
      type: 'Vastu Puja',
      category: 'home',
      icon: '📐',
      price: 4500,
      duration: '4 Hours',
      desc: 'Vastu Purusha worship done to clear construction defects and harmonize natural elements (earth, water, air, fire, space).'
    },
    {
      type: 'Festival Special Pujas',
      category: 'temple',
      icon: '🪔',
      price: 2700,
      duration: '2.5 Hours',
      desc: 'Ceremonies performed during major religious calendar days like Diwali, Ganesh Chaturthi, Maha Shivratri, and Navratri.'
    }
  ];

  // Filtering Logic
  const filteredPujas = pujaServices.filter(puja => {
    const matchesCategory = filter === 'all' || puja.category === filter;
    const matchesSearch = puja.type.toLowerCase().includes(search.toLowerCase()) || 
                          puja.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight font-outfit">Vedic Puja Booking Services</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Book highly knowledgeable, verified Vedic Pandits for customizable home or temple rituals. Complete samagri kits can be added on request.
        </p>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-orange-100 pb-6">
        
        {/* Category Toggles */}
        <div className="flex space-x-2 p-1 bg-orange-50/50 border border-orange-100 rounded-xl w-max">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              filter === 'all' ? 'bg-saffron-500 text-white' : 'text-gray-600 hover:text-saffron-600'
            }`}
          >
            All Pujas
          </button>
          <button
            onClick={() => setFilter('home')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              filter === 'home' ? 'bg-saffron-500 text-white' : 'text-gray-600 hover:text-saffron-600'
            }`}
          >
            🏠 Home Pujas
          </button>
          <button
            onClick={() => setFilter('temple')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              filter === 'temple' ? 'bg-saffron-500 text-white' : 'text-gray-600 hover:text-saffron-600'
            }`}
          >
            🕌 Temple Pujas
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ceremonies..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 text-sm bg-orange-50/10"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-orange-400" />
        </div>

      </div>

      {/* Services Grid */}
      {filteredPujas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl block mb-2">🔍</span>
          No puja service matches your selection. Try adjusting filters or search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPujas.map((puja, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-4xl bg-orange-50 p-3 rounded-2xl">{puja.icon}</span>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    puja.category === 'home' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                      : 'bg-purple-50 text-purple-700 border border-purple-100'
                  }`}>
                    {puja.category === 'home' ? 'At Home' : 'In Temple'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">{puja.type}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{puja.desc}</p>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500 font-semibold bg-orange-50/20 p-2.5 rounded-xl">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-saffron-500" />
                    <span>Duration: {puja.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-saffron-500" />
                    <span>Varanasi / Haridwar</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50/30 px-6 py-4 border-t border-orange-50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">Starting Cost</span>
                  <span className="text-2xl font-extrabold text-saffron-600">₹{puja.price}</span>
                </div>
                <Link
                  to={`/pujas/${encodeURIComponent(puja.type)}`}
                  className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
                >
                  Book Online
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Trust Badges */}
      <section className="bg-gradient-to-r from-saffron-50 to-orange-100/50 rounded-3xl p-8 border border-saffron-100/50 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2">
          <div className="text-3xl">📜</div>
          <h4 className="font-bold text-saffron-900">Vedic Scholars</h4>
          <p className="text-gray-600 text-xs">All Pandits are vetted, certified from spiritual universities, and highly experienced.</p>
        </div>
        <div className="space-y-2">
          <div className="text-3xl">📦</div>
          <h4 className="font-bold text-saffron-900">Optional Puja Samagri</h4>
          <p className="text-gray-600 text-xs">Get complete pure copper/brass items and herbs package delivered if chosen.</p>
        </div>
        <div className="space-y-2">
          <div className="text-3xl">🛡️</div>
          <h4 className="font-bold text-saffron-900">Safe Payments</h4>
          <p className="text-gray-600 text-xs">Escrow-backed payment gateways. Priest is paid only after ceremony completion.</p>
        </div>
      </section>

    </div>
  );
};

export default Pujas;
