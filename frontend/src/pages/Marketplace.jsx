import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Search, SlidersHorizontal, Star, Heart, ShoppingCart } from 'lucide-react';

const Marketplace = () => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  // API State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('new');
  
  const categoriesList = [
    'Diyas', 
    'Dhoop & Agarbatti', 
    'Puja Essentials', 
    'Malas & Rudraksha', 
    'Idols & Murtis', 
    'Puja Kits', 
    'Holy Books', 
    'Decorations & Festivals'
  ];

  // Sync search query from Navbar URL
  useEffect(() => {
    const navbarSearch = searchParams.get('search');
    if (navbarSearch !== null) {
      setSearch(navbarSearch);
    }
  }, [searchParams]);

  // Fetch Products based on filter triggers
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category) params.category = category;
      if (search) params.search = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (rating) params.rating = rating;
      if (sort) params.sort = sort;

      const res = await axios.get('http://localhost:5000/api/products', { params });
      setProducts(res.data);
    } catch (err) {
      console.error('Error loading products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Update URL query params
    const nextParams = {};
    if (category) nextParams.category = category;
    if (search) nextParams.search = search;
    setSearchParams(nextParams);
  }, [category, search, minPrice, maxPrice, rating, sort]);

  const toggleWishlist = (product) => {
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight font-outfit">Spiritual Marketplace</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our collection of authentic, high-quality puja essentials, incense, brass icons, and holy books.
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="bg-white border border-orange-100 rounded-3xl p-6 h-max shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-orange-50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <SlidersHorizontal className="h-4.5 w-4.5 mr-2 text-saffron-500" /> Filters
            </h2>
            <button
              onClick={() => {
                setCategory('');
                setSearch('');
                setMinPrice('');
                setMaxPrice('');
                setRating('');
                setSort('new');
              }}
              className="text-xs text-saffron-600 hover:text-saffron-700 font-bold"
            >
              Clear All
            </button>
          </div>

          {/* Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Diyas, Dhoop..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-1 focus:ring-saffron-500 text-xs bg-orange-50/10"
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-orange-400" />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Categories</label>
            <div className="space-y-1.5">
              <button
                onClick={() => setCategory('')}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  category === ''
                    ? 'bg-saffron-50 text-saffron-700'
                    : 'text-gray-600 hover:bg-orange-50/50'
                }`}
              >
                All Products
              </button>
              {categoriesList.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    category === cat
                      ? 'bg-saffron-50 text-saffron-700'
                      : 'text-gray-600 hover:bg-orange-50/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Price Range (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="w-full px-3 py-2 rounded-xl border border-orange-200 text-xs focus:outline-none bg-orange-50/10"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="w-full px-3 py-2 rounded-xl border border-orange-200 text-xs focus:outline-none bg-orange-50/10"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Minimum Rating</label>
            <div className="flex space-x-1">
              {[4, 3, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => setRating(num)}
                  className={`flex-1 py-1.5 border rounded-lg text-xs font-bold transition-colors ${
                    Number(rating) === num
                      ? 'bg-saffron-500 border-saffron-600 text-white'
                      : 'bg-white border-orange-100 text-gray-600 hover:bg-orange-50'
                  }`}
                >
                  {num}★ +
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Sort By</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-orange-200 text-xs focus:outline-none bg-orange-50/10 font-medium"
            >
              <option value="new">New Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Average Rating</option>
            </select>
          </div>

        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(idx => (
                <div key={idx} className="bg-white rounded-3xl h-80 animate-pulse border border-orange-50"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-white rounded-3xl border border-orange-100 shadow-sm">
              <span className="text-5xl block mb-2">📦</span>
              No products found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-orange-50/40 overflow-hidden">
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1609137144813-911d087b32d2?w=500'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(p)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-orange-50 transition-colors focus:outline-none"
                    >
                      <Heart
                        className={`h-4.5 w-4.5 ${
                          isInWishlist(p._id)
                            ? 'text-red-500 fill-current'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      />
                    </button>

                    <span className="absolute bottom-3 left-3 bg-saffron-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {p.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-gray-800 text-sm md:text-md group-hover:text-saffron-600 transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-gray-500 text-xs line-clamp-2 mt-1">{p.description}</p>
                    </div>

                    <div className="space-y-2 pt-3">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3.5 w-3.5 text-gold-500 fill-current" />
                        <span className="text-xs font-bold text-gray-700">{p.rating.toFixed(1)}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">({p.reviewsCount} reviews)</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-lg font-black text-saffron-600">₹{p.price}</span>
                        {p.stock > 0 ? (
                          <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                            In Stock ({p.stock})
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Actions */}
                  <div className="px-4 pb-4 grid grid-cols-2 gap-2 border-t border-orange-50/50 pt-3 bg-orange-50/10">
                    <button
                      onClick={() => addToCart(p, 1)}
                      disabled={p.stock === 0}
                      className="bg-saffron-100 hover:bg-saffron-600 hover:text-white text-saffron-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                    <a
                      href={`/marketplace/${p._id}`}
                      className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center transition-colors text-center"
                    >
                      Details
                    </a>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Marketplace;
