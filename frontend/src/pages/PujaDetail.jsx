import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Calendar as CalendarIcon, MapPin, Clock, ShieldCheck, UserCheck, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';

const PujaDetail = () => {
  const { type } = useParams();
  const { user, token, API_URL } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [cityFilter, setCityFilter] = useState('Varanasi');
  const [pandits, setPandits] = useState([]);
  const [loadingPandits, setLoadingPandits] = useState(false);

  // Selected Booking Details
  const [selectedPandit, setSelectedPandit] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Address
  const [street, setStreet] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [bookingCity, setBookingCity] = useState('Varanasi');
  
  const [bookingAmount, setBookingAmount] = useState(2500); // Default estimate
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cash'

  // Simulated Card Payment States
  const [showSimulator, setShowSimulator] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);
  const [simCardNo, setSimCardNo] = useState('');
  const [simExpiry, setSimExpiry] = useState('');
  const [simCvv, setSimCvv] = useState('');
  const [simName, setSimName] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [simUpi, setSimUpi] = useState('');
  const [simMethod, setSimMethod] = useState('card'); // 'card' or 'upi'

  // Load saved address of user if logged in
  useEffect(() => {
    if (user && user.savedAddresses && user.savedAddresses.length > 0) {
      const addr = user.savedAddresses[0];
      setStreet(addr.street);
      setState(addr.state);
      setZipCode(addr.zipCode);
      setBookingCity(addr.city);
      setCityFilter(addr.city);
    }
  }, [user]);

  // Fetch Pandits in chosen city who specialize in this ceremony
  useEffect(() => {
    const fetchPandits = async () => {
      try {
        setLoadingPandits(true);
        setSelectedPandit(null);
        setSelectedDate('');
        setSelectedTime('');
        
        const res = await axios.get(`${API_URL}/pandits`, {
          params: { city: cityFilter, specialty: type }
        });
        setPandits(res.data);
      } catch (err) {
        console.error('Error fetching pandits for puja detail:', err.message);
      } finally {
        setLoadingPandits(false);
      }
    };
    fetchPandits();
  }, [cityFilter, type]);

  // Setup dynamic pricing based on experience
  useEffect(() => {
    if (selectedPandit) {
      const baseCost = type.includes('Marriage') ? 8500 : type.includes('Griha') ? 4500 : 2100;
      const expPremium = selectedPandit.experience * 100;
      setBookingAmount(baseCost + expPremium);
    }
  }, [selectedPandit, type]);

  // Trigger Booking with Razorpay
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      return navigate('/login', { state: { from: { pathname: `/pujas/${type}` } } });
    }

    if (!selectedPandit || !selectedDate || !selectedTime || !street || !bookingCity || !state || !zipCode) {
      return setErrorMsg('Please complete all selection fields and address information');
    }

    try {
      setErrorMsg('');
      setIsSubmitting(true);

      const bookingPayload = {
        panditId: selectedPandit._id,
        pujaType: type,
        date: selectedDate,
        time: selectedTime,
        address: { street, city: bookingCity, state, zipCode },
        totalAmount: bookingAmount,
        paymentMethod
      };

      const checkoutRes = await axios.post(`${API_URL}/bookings`, bookingPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { booking, isMock, razorpayKeyId, isCash } = checkoutRes.data;

      if (isCash) {
        setBookingSuccess(true);
        return;
      }

      // Handle Razorpay Checkout payment flow
      if (isMock) {
        setPendingBooking(booking);
        setShowSimulator(true);
      } else {
        // Live Razorpay Integration script load
        const options = {
          key: razorpayKeyId,
          amount: booking.totalAmount * 100,
          currency: 'INR',
          name: 'PujaSetu',
          description: `Booking for ${type}`,
          order_id: booking.razorpayOrderId,
          handler: async function (response) {
            try {
              const verifyRes = await axios.post(`${API_URL}/bookings/verify`, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              }, { headers: { Authorization: `Bearer ${token}` } });
              if (verifyRes.data.success) {
                setBookingSuccess(true);
              }
            } catch (verErr) {
              setErrorMsg('Payment verification failed.');
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
      setErrorMsg(err.response?.data?.message || 'Failed to submit booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Run verification when simulator completes booking payment
  const handleSimulatedPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!pendingBooking) return;

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

      const verifyRes = await axios.post(`${API_URL}/bookings/verify`, {
        razorpayOrderId: pendingBooking.razorpayOrderId,
        razorpayPaymentId: `pay_mock_${Date.now()}`
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (verifyRes.data.success) {
        setBookingSuccess(true);
        setShowSimulator(false);
        setPendingBooking(null);
      } else {
        alert('Simulated card payment verification failed.');
      }
    } catch (err) {
      alert('Verification request failed. Connection error.');
    } finally {
      setSimulating(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl mx-auto">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Ceremony Confirmed!</h2>
        <p className="text-gray-600">
          Your booking for <span className="font-bold">{type}</span> has been processed successfully. The Pandit will contact you shortly to align on details.
        </p>
        <button
          onClick={() => navigate('/user-dashboard')}
          className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-8 py-3 rounded-full shadow transition-colors"
        >
          View Bookings History
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Description & Overview */}
      <div className="lg:col-span-2 space-y-8">
        <div className="space-y-4">
          <span className="bg-orange-100 text-saffron-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            Ceremony Details
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{type}</h1>
          <p className="text-gray-600 leading-relaxed">
            This ritual is conducted using pure items, including gangajal, customized hawan herbs, and authentic copper/brass tools. Our Pandits are trained to chant the mantras clearly to purify the environment and invoke positive changes in your life.
          </p>
        </div>

        {/* What's Included */}
        <div className="bg-white rounded-3xl p-6 border border-orange-100 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <Sparkles className="h-5 w-5 text-saffron-500 mr-2" /> What We Provide
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Vetted Vedic Pandit scholar</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Recitations & Katha chants</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Guidance on pre-puja setup</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Clean Prasad distribution advice</span>
            </li>
          </ul>
        </div>

        {/* 1. Choose Location */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 text-saffron-500 mr-2" /> Step 1: Select City
          </h2>
          <div className="flex space-x-3">
            {['Varanasi', 'Haridwar', 'Ayodhya'].map(city => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setCityFilter(city);
                  setBookingCity(city);
                }}
                className={`px-5 py-2 rounded-xl text-sm font-bold border transition-colors ${
                  cityFilter === city
                    ? 'bg-saffron-500 border-saffron-600 text-white'
                    : 'bg-white border-orange-100 text-gray-600 hover:bg-orange-50'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Choose Pandit */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <UserCheck className="h-5 w-5 text-saffron-500 mr-2" /> Step 2: Choose Pandit Ji
          </h2>

          {loadingPandits ? (
            <div className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
          ) : pandits.length === 0 ? (
            <p className="text-xs text-red-500 font-semibold">No pandits available in {cityFilter} specializing in {type} currently.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pandits.map((p) => (
                <div
                  key={p._id}
                  onClick={() => {
                    setSelectedPandit(p);
                    setSelectedDate('');
                    setSelectedTime('');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    selectedPandit?._id === p._id
                      ? 'border-saffron-500 bg-orange-50/20 ring-2 ring-saffron-200'
                      : 'border-orange-100 bg-white hover:bg-orange-50/10'
                  }`}
                >
                  <img
                    src={p.image || 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500'}
                    alt={p.name}
                    className="h-16 w-16 rounded-full object-cover bg-orange-100 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-gray-900">{p.name}</h4>
                    <p className="text-xs text-gray-500">{p.experience} yrs exp • {p.city}</p>
                    <p className="text-[10px] text-saffron-600 font-bold bg-orange-50 px-2 py-0.5 rounded w-max">
                      ⭐ {p.rating.toFixed(1)} ({p.reviewsCount} reviews)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Choose Date & Time */}
        {selectedPandit && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 text-saffron-500 mr-2" /> Step 3: Pick Available Slot
            </h2>

            <div className="space-y-3">
              {/* Dates */}
              <div className="flex flex-wrap gap-2">
                {selectedPandit.availability.map((avail, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedDate(avail.date);
                      setSelectedTime('');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      selectedDate === avail.date
                        ? 'bg-saffron-500 border-saffron-600 text-white'
                        : 'bg-white border-orange-100 text-gray-600 hover:bg-orange-50'
                    }`}
                  >
                    {avail.date}
                  </button>
                ))}
              </div>

              {/* Slots */}
              {selectedDate && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedPandit.availability
                    .find(a => a.date === selectedDate)
                    ?.slots.map((slot, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold border flex items-center space-x-1.5 transition-colors ${
                          selectedTime === slot
                            ? 'bg-saffron-500 border-saffron-600 text-white'
                            : 'bg-white border-orange-100 text-gray-600 hover:bg-orange-50'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>{slot}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Form Sidebar */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-md h-max space-y-6">
        <h3 className="text-xl font-bold text-gray-900 pb-3 border-b border-orange-50">Booking Summary</h3>

        {errorMsg && (
          <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-lg border-l-4 border-red-500">{errorMsg}</p>
        )}

        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <div className="text-sm space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Puja Type:</span>
              <span className="font-bold text-gray-800">{type}</span>
            </div>
            <div className="flex justify-between">
              <span>Pandit:</span>
              <span className="font-bold text-gray-800">{selectedPandit ? selectedPandit.name : 'Not chosen'}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-bold text-gray-800">{selectedDate || 'Not chosen'}</span>
            </div>
            <div className="flex justify-between">
              <span>Time Slot:</span>
              <span className="font-bold text-gray-800">{selectedTime || 'Not chosen'}</span>
            </div>
          </div>

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
                Prepay Online
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-saffron-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-saffron-600'
                }`}
              >
                Cash (to Pandit)
              </button>
            </div>
          </div>

          <hr className="border-orange-50" />

          {/* Address Fields */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">Delivery/Ceremony Address</h4>
            
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Street Address, Building Name"
              className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
              />
              <input
                type="text"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Zip Code"
                className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
              />
            </div>
          </div>

          <hr className="border-orange-50" />

          <div className="flex justify-between items-center bg-orange-50/50 p-3 rounded-2xl">
            <span className="text-xs text-gray-600 font-semibold">Est. Dakshina:</span>
            <span className="text-2xl font-extrabold text-saffron-600">₹{bookingAmount}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-extrabold py-3 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center space-x-2"
          >
            <CreditCard className="h-5 w-5" />
            <span>{isSubmitting ? 'Processing...' : token ? 'Book & Pay Now' : 'Login to Book'}</span>
          </button>
        </form>

        <div className="text-[10px] text-gray-400 space-y-1 text-center">
          <p className="flex items-center justify-center">
            <ShieldCheck className="h-3.5 w-3.5 text-saffron-500 mr-1" /> Vetted Vedic Scholars Guaranteed.
          </p>
          <p>Easy cancellation up to 24 hours prior.</p>
        </div>

      </div>

      {/* Renders the Premium Simulated Card Payment Modal */}
      {showSimulator && pendingBooking && (
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
              <span>Merchant: PujaSetu Bookings</span>
              <span>Amount: ₹{bookingAmount}</span>
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
                <span>{simulating ? 'Contacting secure bank servers...' : `Pay ₹${bookingAmount}`}</span>
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

export default PujaDetail;
