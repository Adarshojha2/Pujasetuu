import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, Heart, ShieldAlert, Award, MessageCircle } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { token, API_URL } = useAuth();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Submittal form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Quantity Picker
  const [quantity, setQuantity] = useState(1);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/products/${id}`);
      setProduct(res.data.product);
      setReviews(res.data.reviews);
    } catch (err) {
      console.error('Error fetching product details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      return navigate('/login', { state: { from: { pathname: `/marketplace/${id}` } } });
    }

    if (!newComment.trim()) {
      return setReviewError('Please write a comment for your review');
    }

    try {
      setReviewError('');
      setReviewSuccess('');
      setSubmittingReview(true);

      const res = await axios.post(
        `${API_URL}/products/${id}/reviews`,
        { rating: newRating, comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReviewSuccess(res.data.message);
      setNewComment('');
      setNewRating(5);
      fetchProductData(); // Reload details and review list
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-spiritual-cream">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-red-600">Product not found.</h2>
        <a href="/marketplace" className="mt-4 inline-block bg-saffron-500 text-white px-6 py-2 rounded-full">
          Back to Marketplace
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Product Information Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-sm">
        
        {/* Left: Image Container */}
        <div className="bg-orange-50/20 rounded-2xl overflow-hidden border border-orange-100/50 h-96 flex items-center justify-center relative">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1609137144813-911d087b32d2?w=800'}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          <button
            onClick={() => addToWishlist(product)}
            className="absolute top-4 right-4 p-2.5 bg-white rounded-full shadow hover:bg-orange-50 transition-colors"
          >
            <Heart className={`h-5 w-5 ${isInWishlist(product._id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Right: Specifications & Purchase panel */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="bg-orange-100 text-saffron-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
              {product.category}
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4.5 w-4.5 ${
                      star <= Math.round(product.rating)
                        ? 'text-gold-500 fill-current'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({product.reviewsCount} verified reviews)</span>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-orange-50">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-400 block font-semibold">Special Price</span>
                <span className="text-3xl font-black text-saffron-600">₹{product.price}</span>
              </div>
              <div>
                {product.stock > 0 ? (
                  <span className="text-xs font-extrabold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                    ✓ In Stock ({product.stock} units)
                  </span>
                ) : (
                  <span className="text-xs font-extrabold text-red-500 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                    ✕ Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center border border-orange-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 hover:bg-orange-50 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-1.5 hover:bg-orange-50 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => addToCart(product, quantity)}
              disabled={product.stock === 0}
              className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-extrabold py-3.5 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Add to Shopping Cart</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center border-t border-orange-50 pt-4 text-xs text-gray-500">
            <div className="flex items-center justify-center space-x-2 bg-orange-50/20 p-2.5 rounded-xl">
              <Award className="h-4 w-4 text-saffron-500" />
              <span>100% Authentic Quality</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-orange-50/20 p-2.5 rounded-xl">
              <ShieldAlert className="h-4 w-4 text-saffron-500" />
              <span>Eco-friendly Materials</span>
            </div>
          </div>

        </div>

      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Write a Review Form */}
        <div className="bg-white border border-orange-100 rounded-3xl p-6 h-max shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <MessageCircle className="h-5 w-5 text-saffron-500 mr-2" /> Write a Review
          </h3>

          {reviewError && (
            <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded border-l-4 border-red-500">{reviewError}</p>
          )}
          {reviewSuccess && (
            <p className="text-xs text-green-700 font-bold bg-green-50 p-2.5 rounded border-l-4 border-green-500">{reviewSuccess}</p>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Your Rating</label>
              <div className="flex space-x-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= newRating ? 'text-gold-500 fill-current' : 'text-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Review Comments</label>
              <textarea
                required
                rows="4"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience about the product's packaging, scent or quality..."
                className="w-full p-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-saffron-500 text-xs bg-orange-50/10"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-2 rounded-xl text-xs transition-colors shadow-sm"
            >
              {submittingReview ? 'Submitting...' : token ? 'Submit Review' : 'Login to Review'}
            </button>
          </form>
        </div>

        {/* Reviews Listing */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Customer Feedbacks ({reviews.length})</h3>

          {reviews.length === 0 ? (
            <p className="text-xs text-gray-500 bg-white border border-orange-100 rounded-3xl p-6 shadow-sm">
              No reviews written for this product yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center font-bold text-saffron-700 text-xs uppercase border border-orange-200">
                        {rev.userName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-gray-800">{rev.userName}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex space-x-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= rev.rating ? 'text-gold-500 fill-current' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 text-xs leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ProductDetail;
