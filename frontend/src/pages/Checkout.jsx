import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CreditCard, CheckCircle2, ChevronRight, MapPin, Building, ShieldCheck } from 'lucide-react';

const Checkout = () => {
  const { user, token, API_URL } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Coupon from cart page
  const couponCode = location.state?.couponCode || '';

  // Address State
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  
  // Custom Address Form (if no saved address or user wants new)
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Checkout flow state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cod'

  // Simulated Card Payment States
  const [showSimulator, setShowSimulator] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [simCardNo, setSimCardNo] = useState('');
  const [simExpiry, setSimExpiry] = useState('');
  const [simCvv, setSimCvv] = useState('');
  const [simName, setSimName] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simUpi, setSimUpi] = useState('');
  const [simMethod, setSimMethod] = useState('card'); // 'card' or 'upi'

  useEffect(() => {
    if (!cart.products || cart.products.length === 0) {
      if (!checkoutSuccess) {
        navigate('/cart');
      }
    }
  }, [cart, navigate, checkoutSuccess]);

  // Calculations
  const subtotal = getCartTotal();
  
  let discountAmount = 0;
  if (couponCode) {
    if (couponCode === 'FESTIVAL10' || couponCode === 'SAN123') {
      discountAmount = Math.round(subtotal * 0.1);
    } else if (couponCode === 'SETU20') {
      discountAmount = Math.round(subtotal * 0.2);
    }
  }
  const netPayable = Math.max(0, subtotal - discountAmount);

  // Submit Order Checkout
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!token) return navigate('/login');

    let shippingAddress = null;

    if (useNewAddress || !user.savedAddresses || user.savedAddresses.length === 0) {
      if (!street || !city || !state || !zipCode) {
        return setErrorMsg('Please write down your shipping address details');
      }
      shippingAddress = { street, city, state, zipCode };
    } else {
      const addr = user.savedAddresses[selectedAddressIndex];
      shippingAddress = {
        street: addr.street,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode
      };
    }

    try {
      setErrorMsg('');
      setIsSubmitting(true);

      const productsPayload = cart.products.map(item => ({
        productId: item.productId?._id || item.productId,
        name: item.productId?.name,
        quantity: item.quantity,
        price: item.productId?.price
      }));

      // 1. Create order on backend
      const orderRes = await axios.post(`${API_URL}/orders`, {
        products: productsPayload,
        shippingAddress,
        couponCode,
        paymentMethod
      }, { headers: { Authorization: `Bearer ${token}` } });

      const { order, isMock, razorpayKeyId, isCod } = orderRes.data;

      if (isCod) {
        clearCart();
        setCheckoutSuccess(true);
        return;
      }

      // 2. Process payment
      if (isMock) {
        setPendingOrder(order);
        setShowSimulator(true);
      } else {
        // Live Razorpay Script Load
        const options = {
          key: razorpayKeyId,
          amount: order.totalAmount * 100,
          currency: 'INR',
          name: 'PujaSetu Marketplace',
          description: 'Spiritual Products Purchase',
          order_id: order.razorpayOrderId,
          handler: async function (response) {
            try {
              const verifyRes = await axios.post(`${API_URL}/orders/verify`, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              }, { headers: { Authorization: `Bearer ${token}` } });

              if (verifyRes.data.success) {
                clearCart();
                setCheckoutSuccess(true);
              }
            } catch (verErr) {
              setErrorMsg('Order payment verification failed.');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone
          },
          theme: { color: '#f97316' }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Order checkout request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Run verification when simulator completes payment successfully
  const handleSimulatedPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!pendingOrder) return;

    if (simMethod === 'card' && (!simCardNo || !simExpiry || !simCvv || !simName)) {
      return alert('Please enter card details');
    }
    if (simMethod === 'upi' && !simUpi) {
      return alert('Please enter UPI ID');
    }

    try {
      setSimulating(true);
      // Wait 1.5s to show processing overlay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const verifyRes = await axios.post(`${API_URL}/orders/verify`, {
        razorpayOrderId: pendingOrder.razorpayOrderId,
        razorpayPaymentId: `pay_mock_${Date.now()}`
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (verifyRes.data.success) {
        clearCart();
        setCheckoutSuccess(true);
        setShowSimulator(false);
        setPendingOrder(null);
      } else {
        alert('Simulated card payment verification failed.');
      }
    } catch (err) {
      alert('Verification request failed. Connection error.');
    } finally {
      setSimulating(false);
    }
  };

  if (checkoutSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl mx-auto">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 font-outfit">Order Placed Successfully!</h2>
        <p className="text-gray-600">
          Your spiritual essentials order has been placed. We are preparing your items to be shipped.
        </p>
        <button
          onClick={() => navigate('/user-dashboard')}
          className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-8 py-3 rounded-full shadow transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Shipping Address Forms */}
      <div className="lg:col-span-2 space-y-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-outfit">Shipping Details</h1>

        {errorMsg && (
          <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-lg border-l-4 border-red-500">{errorMsg}</p>
        )}

        {/* Saved Addresses Panel */}
        {user && user.savedAddresses && user.savedAddresses.length > 0 && !useNewAddress && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select Delivery Location</h2>
              <button
                type="button"
                onClick={() => setUseNewAddress(true)}
                className="text-xs text-saffron-600 hover:text-saffron-700 font-bold"
              >
                + Ship to a New Address
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.savedAddresses.map((addr, idx) => (
                <div
                  key={addr._id}
                  onClick={() => setSelectedAddressIndex(idx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 bg-white ${
                    selectedAddressIndex === idx
                      ? 'border-saffron-500 bg-orange-50/10 ring-2 ring-saffron-100'
                      : 'border-orange-100 hover:bg-orange-50/10'
                  }`}
                >
                  <MapPin className="h-5 w-5 text-saffron-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-gray-800 flex items-center">
                      <Building className="h-3.5 w-3.5 mr-1 text-orange-400" /> {addr.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">{addr.street}</p>
                    <p className="text-gray-500 font-medium">{addr.city}, {addr.state} - {addr.zipCode}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Address Input Form */}
        {(useNewAddress || !user || !user.savedAddresses || user.savedAddresses.length === 0) && (
          <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-orange-50">
              <h2 className="text-lg font-bold text-gray-900">Enter Shipping Address</h2>
              {user && user.savedAddresses && user.savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseNewAddress(false)}
                  className="text-xs text-saffron-600 hover:text-saffron-700 font-bold"
                >
                  &larr; Choose Saved Address
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-orange-200 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Varanasi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-orange-200 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Uttar Pradesh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-orange-200 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Zip Code</label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="221001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-orange-200 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Display Item List briefly */}
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-orange-50">Review Ordered Items</h2>
          <div className="space-y-3">
            {cart.products.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs text-gray-600">
                <span className="font-semibold text-gray-800 max-w-[200px] truncate">
                  {item.productId?.name} <span className="text-gray-400">x {item.quantity}</span>
                </span>
                <span className="font-bold text-gray-900">₹{(item.productId?.price || 0) * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Checkout Sidebar Panel */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-md h-max space-y-6">
        <h3 className="text-xl font-bold text-gray-900 pb-3 border-b border-orange-50">Payment Details</h3>

        {/* Payment Method Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Payment Mode</label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-orange-50 rounded-xl border border-orange-100">
            <button
              type="button"
              onClick={() => setPaymentMethod('online')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                paymentMethod === 'online'
                  ? 'bg-saffron-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-saffron-600'
              }`}
            >
              Pay Online
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                paymentMethod === 'cod'
                  ? 'bg-saffron-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-saffron-600'
              }`}
            >
              Cash (COD)
            </button>
          </div>
        </div>

        <div className="text-sm space-y-2.5 text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold text-gray-800">₹{subtotal}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Applied Coupon:</span>
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
          <span className="text-xs text-gray-600 font-semibold">Total Payable:</span>
          <span className="text-2xl font-extrabold text-saffron-600">₹{netPayable}</span>
        </div>

        <button
          onClick={handlePayment}
          disabled={isSubmitting}
          className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-extrabold py-3.5 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center space-x-2"
        >
          <CreditCard className="h-5 w-5" />
          <span>{isSubmitting ? 'Processing...' : 'Verify & Pay Now'}</span>
        </button>

        <div className="text-[10px] text-gray-400 text-center flex items-center justify-center">
          <ShieldCheck className="h-4 w-4 text-saffron-500 mr-1" /> Verified Secure Gateway.
        </div>

      </div>

      {/* Renders the Premium Simulated Card Payment Modal */}
      {showSimulator && pendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden border border-orange-100 shadow-2xl relative p-6 space-y-6">
            
            <div className="flex justify-between items-center pb-3 border-b border-orange-50">
              <div className="flex items-center space-x-1.5">
                <span className="text-xl">💳</span>
                <h3 className="text-lg font-bold text-gray-900 font-outfit">Secure Payment Simulator</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSimulator(false);
                  setIsSubmitting(false);
                }}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm focus:outline-none"
              >
                Cancel
              </button>
            </div>

            <div className="bg-orange-50/50 p-3 rounded-2xl flex justify-between text-xs text-saffron-900 font-semibold border border-orange-100">
              <span>Merchant: PujaSetu</span>
              <span>Amount: ₹{netPayable}</span>
            </div>

            {/* Simulated Card Design Preview */}
            {simMethod === 'card' && (
              <div className="w-full bg-gradient-to-r from-saffron-500 via-amber-500 to-red-600 rounded-2xl p-5 text-white shadow-md space-y-6 font-mono relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 text-8xl pointer-events-none">🕉️</div>
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold uppercase tracking-wider font-outfit">PujaSetu Pay</span>
                  <span className="text-xs font-semibold italic">Debit Card</span>
                </div>
                <div className="text-md md:text-lg tracking-widest pt-2">
                  {simCardNo || '••••  ••••  ••••  ••••'}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[8px] text-orange-200 block uppercase font-outfit">Card Holder</span>
                    <span className="truncate max-w-[150px] inline-block uppercase font-outfit">{simName || 'YOUR NAME'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-orange-200 block uppercase font-outfit">Expires</span>
                    <span>{simExpiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab selection */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
              <button
                type="button"
                onClick={() => setSimMethod('card')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  simMethod === 'card' ? 'bg-white text-saffron-600 shadow-xs' : 'text-gray-500 hover:text-saffron-600'
                }`}
              >
                Card Payment
              </button>
              <button
                type="button"
                onClick={() => setSimMethod('upi')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  simMethod === 'upi' ? 'bg-white text-saffron-600 shadow-xs' : 'text-gray-500 hover:text-saffron-600'
                }`}
              >
                UPI / QR ID
              </button>
            </div>

            <form onSubmit={handleSimulatedPaymentSubmit} className="space-y-4">
              {simMethod === 'card' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Card Holder Name</label>
                    <input
                      type="text"
                      required
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      placeholder="CARDHOLDER NAME"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      maxLength="19"
                      value={simCardNo}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                        let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                        setSimCardNo(formatted);
                      }}
                      placeholder="1234 5678 9101 1121"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        maxLength="5"
                        value={simExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
                          if (val.length >= 2) {
                            val = val.slice(0, 2) + '/' + val.slice(2);
                          }
                          setSimExpiry(val);
                        }}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">CVV Code</label>
                      <input
                        type="password"
                        required
                        maxLength="3"
                        value={simCvv}
                        onChange={(e) => setSimCvv(e.target.value.replace(/[^0-9]/gi, ''))}
                        placeholder="•••"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-center"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">UPI ID (VPA)</label>
                  <input
                    type="text"
                    required
                    value={simUpi}
                    onChange={(e) => setSimUpi(e.target.value)}
                    placeholder="user@okaxis"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Simulates a UPI checkout request to your BHIM app.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={simulating}
                className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-extrabold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2 text-xs"
              >
                <span>{simulating ? 'Contacting secure bank servers...' : `Pay ₹${netPayable}`}</span>
              </button>
            </form>

            {/* Spinner Overlay */}
            {simulating && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center space-y-3 z-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron-600"></div>
                <span className="text-xs font-bold text-saffron-700 animate-pulse">Securing transaction...</span>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
