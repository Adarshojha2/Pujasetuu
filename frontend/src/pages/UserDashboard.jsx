import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Calendar, ShoppingBag, Gift, Phone, Mail, Plus, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';

const UserDashboard = () => {
  const { user, token, addAddress, deleteAddress, API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, orders, profile, addresses

  // Data logs
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address Form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressTitle, setAddressTitle] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [addressError, setAddressError] = useState('');

  // Fetch lists
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      
      const bookingsRes = await axios.get(`${API_URL}/bookings/my-bookings`, { headers });
      setBookings(bookingsRes.data);

      const ordersRes = await axios.get(`${API_URL}/orders/my-orders`, { headers });
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Error fetching dashboard lists:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  // Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.put(`${API_URL}/bookings/${bookingId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDashboardData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  // Cancel Order
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await axios.put(`${API_URL}/orders/${orderId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchDashboardData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel order');
      }
    }
  };

  // Add address
  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError('');
    if (!street || !city || !state || !zipCode) {
      return setAddressError('Please fill in all address fields');
    }

    const res = await addAddress({ title: addressTitle, street, city, state, zipCode });
    if (res.success) {
      setShowAddressForm(false);
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
    } else {
      setAddressError(res.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-orange-100/50">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-saffron-500 rounded-full flex items-center justify-center text-white text-3xl font-black shadow uppercase">
            {user?.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-outfit">{user?.name}</h1>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{user?.role} ACCOUNT • {user?.phone}</p>
          </div>
        </div>

        {/* Referral panel */}
        {user?.referralCode && (
          <div className="mt-4 md:mt-0 bg-white px-4 py-3 rounded-2xl border border-orange-200 flex items-center space-x-3 text-xs">
            <Gift className="h-6 w-6 text-saffron-500 flex-shrink-0 animate-bounce" />
            <div>
              <span className="text-gray-400 block font-semibold">Your Referral Code</span>
              <span className="font-extrabold text-saffron-600 tracking-wider text-sm">{user.referralCode}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-orange-100 pb-3 space-x-6 text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center space-x-1.5 pb-2 transition-colors focus:outline-none whitespace-nowrap ${
            activeTab === 'bookings' ? 'text-saffron-600 border-b-2 border-saffron-500' : 'text-gray-500 hover:text-saffron-600'
          }`}
        >
          <Calendar className="h-4.5 w-4.5" />
          <span>My Pujas</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center space-x-1.5 pb-2 transition-colors focus:outline-none whitespace-nowrap ${
            activeTab === 'orders' ? 'text-saffron-600 border-b-2 border-saffron-500' : 'text-gray-500 hover:text-saffron-600'
          }`}
        >
          <ShoppingBag className="h-4.5 w-4.5" />
          <span>My Orders</span>
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center space-x-1.5 pb-2 transition-colors focus:outline-none whitespace-nowrap ${
            activeTab === 'addresses' ? 'text-saffron-600 border-b-2 border-saffron-500' : 'text-gray-500 hover:text-saffron-600'
          }`}
        >
          <MapPin className="h-4.5 w-4.5" />
          <span>Saved Addresses</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-1.5 pb-2 transition-colors focus:outline-none whitespace-nowrap ${
            activeTab === 'profile' ? 'text-saffron-600 border-b-2 border-saffron-500' : 'text-gray-500 hover:text-saffron-600'
          }`}
        >
          <User className="h-4.5 w-4.5" />
          <span>Account Profile</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {loading ? (
          <div className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
        ) : (
          <div>
            
            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <p className="text-xs text-gray-500 bg-white border border-orange-100 rounded-3xl p-8 text-center">No puja bookings made yet.</p>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-white border border-orange-100 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-extrabold text-md md:text-lg text-gray-900">{booking.pujaType}</h3>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-200' :
                            booking.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Scheduled: <span className="font-bold text-gray-700">{booking.date}</span> at <span className="font-bold text-gray-700">{booking.time}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Pandit: <span className="font-bold text-gray-700">{booking.panditId?.name || 'Assigned Scholar'}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Location: <span className="font-bold text-gray-600">{booking.address?.street}, {booking.address?.city}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-orange-50 pt-3 md:pt-0">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-gray-400 block font-semibold">Dakshina Fee</span>
                          <span className="text-xl font-extrabold text-saffron-600">₹{booking.totalAmount}</span>
                          <span className={`block text-[9px] font-bold ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {booking.paymentStatus === 'paid' ? '● Paid' : '● Payment Pending'}
                          </span>
                        </div>

                        {booking.status === 'pending' || booking.status === 'confirmed' ? (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 font-bold px-4 py-2 rounded-xl text-xs transition-colors border border-red-100"
                          >
                            Cancel Booking
                          </button>
                        ) : null}
                      </div>

                    </div>
                  ))
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-xs text-gray-500 bg-white border border-orange-100 rounded-3xl p-8 text-center">No marketplace orders placed yet.</p>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white border border-orange-100 rounded-3xl p-5 md:p-6 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-orange-50">
                        <div>
                          <span className="text-[10px] text-gray-400 font-semibold uppercase">Order Ref: {order._id.slice(-8).toUpperCase()}</span>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700 border border-green-200' :
                            order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-orange-50 text-saffron-700 border border-orange-200'
                          }`}>
                            Status: {order.orderStatus}
                          </span>
                          <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}>
                            Payment: {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Products */}
                      <div className="space-y-2.5">
                        {order.products.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-gray-600">
                            <span>{p.name} <span className="text-gray-400 font-medium">x {p.quantity}</span></span>
                            <span className="font-bold text-gray-800">₹{p.price * p.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-orange-50">
                        <div>
                          <span className="text-[10px] text-gray-400 font-semibold block">Total Amount</span>
                          <span className="text-lg font-black text-saffron-600">₹{order.totalAmount}</span>
                        </div>

                        {order.orderStatus === 'processing' ? (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 font-bold px-4 py-2 rounded-xl text-xs transition-colors border border-red-100"
                          >
                            Cancel Order
                          </button>
                        ) : null}
                      </div>

                    </div>
                  ))
                )}
              </div>
            )}

            {/* SAVED ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">Manage Shipping Address List</h3>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={handleAddAddressSubmit} className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm space-y-4 max-w-xl">
                    <h4 className="font-bold text-gray-800">Address Form</h4>
                    {addressError && <p className="text-xs text-red-500 font-bold">{addressError}</p>}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Title (e.g. Home, Office)</label>
                        <input
                          type="text"
                          required
                          value={addressTitle}
                          onChange={(e) => setAddressTitle(e.target.value)}
                          placeholder="Home"
                          className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Street Address</label>
                        <input
                          type="text"
                          required
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="123, Dev Colony"
                          className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Varanasi"
                          className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">State</label>
                        <input
                          type="text"
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Uttar Pradesh"
                          className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Zip Code</label>
                        <input
                          type="text"
                          required
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="221001"
                          className="w-full px-3 py-2 rounded-lg border border-orange-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors"
                    >
                      Save Location
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user?.savedAddresses?.length === 0 ? (
                    <p className="text-xs text-gray-500">No saved addresses. Please add one.</p>
                  ) : (
                    user?.savedAddresses?.map((addr) => (
                      <div
                        key={addr._id}
                        className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm flex justify-between items-start"
                      >
                        <div className="space-y-1 text-xs">
                          <h4 className="font-extrabold text-saffron-700 flex items-center">
                            🏢 {addr.title}
                          </h4>
                          <p className="text-gray-600">{addr.street}</p>
                          <p className="text-gray-500 font-semibold">{addr.city}, {addr.state} - {addr.zipCode}</p>
                        </div>
                        <button
                          onClick={() => deleteAddress(addr._id)}
                          className="p-2 text-gray-400 hover:text-crimson-600"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm max-w-lg space-y-6">
                <h3 className="text-lg font-bold text-gray-900 pb-3 border-b border-orange-50">Profile Details</h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-3.5 bg-orange-50/20 p-3 rounded-2xl">
                    <User className="h-5 w-5 text-saffron-500" />
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Full Name</span>
                      <span className="font-bold text-gray-800">{user?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3.5 bg-orange-50/20 p-3 rounded-2xl">
                    <Mail className="h-5 w-5 text-saffron-500" />
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Email Address</span>
                      <span className="font-bold text-gray-800">{user?.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3.5 bg-orange-50/20 p-3 rounded-2xl">
                    <Phone className="h-5 w-5 text-saffron-500" />
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Phone Contact</span>
                      <span className="font-bold text-gray-800">{user?.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
};

export default UserDashboard;
