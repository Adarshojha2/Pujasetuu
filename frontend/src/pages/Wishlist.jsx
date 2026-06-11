import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center text-crimson-600 text-3xl mx-auto">
          <Heart className="h-8 w-8 text-crimson-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Your Wishlist is Empty</h2>
        <p className="text-gray-500 text-sm">Save items you like to buy later by clicking the heart icon on products in the marketplace.</p>
        <Link
          to="/marketplace"
          className="inline-block bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-8 py-3 rounded-full shadow transition-colors"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-outfit flex items-center">
        <Heart className="h-7 w-7 text-crimson-500 mr-2 fill-current" /> My Wishlist ({wishlist.length} saved items)
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {wishlist.map((p) => (
          <div
            key={p._id}
            className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-sm flex flex-col justify-between group"
          >
            <div className="relative h-44 bg-orange-50/40 overflow-hidden">
              <img
                src={p.image || 'https://images.unsplash.com/photo-1609137144813-911d087b32d2?w=500'}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform"
              />
              <button
                onClick={() => removeFromWishlist(p._id)}
                className="absolute top-2.5 right-2.5 p-1.5 bg-white rounded-full shadow hover:text-crimson-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <span className="absolute bottom-2.5 left-2.5 bg-saffron-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                {p.category}
              </span>
            </div>

            <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-gray-800 text-xs md:text-sm line-clamp-1">{p.name}</h3>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="h-3 w-3 text-gold-500 fill-current" />
                  <span className="text-[10px] font-bold text-gray-700">{p.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-md font-black text-saffron-600">₹{p.price}</span>
              </div>
            </div>

            <div className="px-4 pb-4 pt-1 bg-orange-50/10">
              <button
                onClick={() => handleMoveToCart(p)}
                className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>Move to Cart</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default Wishlist;
