import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Trash2, Tag, Percent, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  // Coupon Code
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = coupon.trim().toUpperCase();

    if (code === 'FESTIVAL10' || code === 'SAN123') {
      setDiscountPercent(10);
      setAppliedCoupon(code);
      setCoupon('');
    } else if (code === 'SETU20') {
      setDiscountPercent(20);
      setAppliedCoupon(code);
      setCoupon('');
    } else {
      setCouponError('Invalid coupon code.');
    }
  };

  const handleCheckout = () => {
    // Navigate to checkout passing applied coupon code in location state
    navigate('/checkout', { state: { couponCode: appliedCoupon } });
  };

  const subtotal = getCartTotal();
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const finalTotal = subtotal - discountAmount;

  if (!cart.products || cart.products.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <span className="text-6xl block">🛒</span>
        <h2 className="text-3xl font-extrabold text-gray-900">Your Cart is Empty</h2>
        <p className="text-gray-500 text-sm">Fill it with sacred offerings, incense, books, and diyas from our marketplace.</p>
        <Link
          to="/marketplace"
          className="inline-block bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-8 py-3 rounded-full shadow transition-colors"
        >
          Explore Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-outfit flex items-center">
        <ShoppingBag className="h-7 w-7 text-saffron-500 mr-2" /> Shopping Cart ({cart.products.length} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.products.map((item) => {
            const product = item.productId;
            if (!product) return null;

            const itemId = product._id;

            return (
              <div
                key={itemId}
                className="bg-white border border-orange-100 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
              >
                {/* Image & Title */}
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="h-20 w-20 rounded-2xl bg-orange-50/50 border border-orange-100 overflow-hidden flex-shrink-0">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1609137144813-911d087b32d2?w=500'}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-saffron-600 font-semibold">{product.category}</p>
                    <p className="text-xs text-gray-400 font-semibold">₹{product.price} each</p>
                  </div>
                </div>

                {/* Quantity adjustments */}
                <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center border border-orange-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => updateQuantity(itemId, item.quantity - 1)}
                      className="px-2.5 py-1.5 hover:bg-orange-50 font-bold transition-colors text-xs"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(itemId, item.quantity + 1)}
                      className="px-2.5 py-1.5 hover:bg-orange-50 font-bold transition-colors text-xs"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-400">Total</div>
                    <div className="font-extrabold text-gray-900 text-sm">₹{product.price * item.quantity}</div>
                  </div>

                  <button
                    onClick={() => removeFromCart(itemId)}
                    className="p-2 text-gray-400 hover:text-crimson-600 transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Cart Calculations Summary */}
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm h-max space-y-6">
          <h3 className="text-lg font-bold text-gray-900 pb-3 border-b border-orange-50">Order Summary</h3>

          {/* Coupon Input Form */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">Have a Coupon?</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="FESTIVAL10, SETU20"
                className="flex-grow px-3 py-2 rounded-xl border border-orange-200 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500 bg-orange-50/10"
              />
              <button
                type="submit"
                className="bg-saffron-100 hover:bg-saffron-500 hover:text-white text-saffron-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors border border-orange-100"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
            {appliedCoupon && (
              <p className="text-[10px] text-green-700 font-bold flex items-center">
                <Percent className="h-3 w-3 mr-1" /> Coupon <span className="bg-green-50 px-1 border rounded">{appliedCoupon}</span> applied ({discountPercent}% discount)
              </p>
            )}
          </form>

          <hr className="border-orange-50" />

          {/* Pricing Ledger */}
          <div className="text-sm space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Cart Subtotal:</span>
              <span className="font-semibold text-gray-800">₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount:</span>
                <span>- ₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Delivery:</span>
              <span className="text-green-600 font-semibold">FREE</span>
            </div>
          </div>

          <hr className="border-orange-50" />

          <div className="flex justify-between items-center bg-orange-50/50 p-3 rounded-2xl">
            <span className="text-xs text-gray-600 font-semibold">Net Payable:</span>
            <span className="text-2xl font-extrabold text-saffron-600">₹{finalTotal}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-extrabold py-3.5 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center space-x-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default Cart;
