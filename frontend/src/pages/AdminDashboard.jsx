import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Users, Clipboard, ShoppingCart, TrendingUp, AlertTriangle, Plus, FileText, Check, X } from 'lucide-react';

const AdminDashboard = () => {
  const { token, API_URL } = useAuth();
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, kyc, inventory, orders, bookings
  const [metrics, setMetrics] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  
  // KYC Pending Pandits
  const [pendingPandits, setPendingPandits] = useState([]);
  
  // Inventory Manage Lists
  const [productsList, setProductsList] = useState([]);
  
  // Create Product Form
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductCat, setNewProductCat] = useState('Diyas');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  
  // Orders & Bookings lists (Full logs)
  const [allOrders, setAllOrders] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Metrics & Analytics
      const dashRes = await axios.get(`${API_URL}/admin/dashboard`, { headers });
      setMetrics(dashRes.data.metrics);
      setLowStock(dashRes.data.lowStockProducts);
      setRecentOrders(dashRes.data.recentOrders);
      setRecentBookings(dashRes.data.recentBookings);
      setCategorySales(dashRes.data.categoriesSales);

      // 2. Fetch KYC
      const kycRes = await axios.get(`${API_URL}/admin/pandits/pending-kyc`, { headers });
      setPendingPandits(kycRes.data);

      // 3. Fetch Products List
      const prodRes = await axios.get(`${API_URL}/products`);
      setProductsList(prodRes.data);

      // 4. Fetch All Orders
      const ordRes = await axios.get(`${API_URL}/admin/orders`, { headers });
      setAllOrders(ordRes.data);

      // 5. Fetch All Bookings
      const bkRes = await axios.get(`${API_URL}/admin/bookings`, { headers });
      setAllBookings(bkRes.data);

    } catch (err) {
      console.error('Error fetching admin details:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  // Verify Pandit KYC (Approve/Reject)
  const handleVerifyPandit = async (panditId, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_URL}/admin/pandits/${panditId}/verify`, { status }, { headers });
      fetchAdminData();
    } catch (err) {
      alert('KYC update failed');
    }
  };

  // Add Product Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!newProductName || !newProductDesc || !newProductPrice || !newProductStock) {
      return setSubmitError('Please complete name, price, description, and stock fields');
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_URL}/admin/products`, {
        name: newProductName,
        description: newProductDesc,
        category: newProductCat,
        price: Number(newProductPrice),
        stock: Number(newProductStock),
        image: newProductImage
      }, { headers });

      setSubmitSuccess('Product added successfully!');
      setNewProductName('');
      setNewProductDesc('');
      setNewProductPrice('');
      setNewProductStock('');
      setNewProductImage('');
      
      fetchAdminData();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`${API_URL}/admin/products/${productId}`, { headers });
        fetchAdminData();
      } catch (err) {
        alert('Product deletion failed');
      }
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, orderStatus) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_URL}/admin/orders/${orderId}`, { orderStatus }, { headers });
      fetchAdminData();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_URL}/admin/bookings/${bookingId}`, { status }, { headers });
      fetchAdminData();
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="flex items-center space-x-2">
        <ShieldCheck className="h-8 w-8 text-saffron-600" />
        <h1 className="text-3xl font-extrabold text-gray-900 font-outfit">Control Administration Panel</h1>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-orange-100 pb-3 space-x-6 text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-2 focus:outline-none whitespace-nowrap ${
            activeTab === 'analytics' ? 'text-saffron-600 border-b-2 border-saffron-500' : 'text-gray-500 hover:text-saffron-600'
          }`}
        >
          📊 Reports & Analytics
        </button>
        <button
          onClick={() => setActiveTab('kyc')}
          className={`pb-2 focus:outline-none whitespace-nowrap flex items-center ${
            activeTab === 'kyc' ? 'text-saffron-600 border-b-2 border-saffron-500' : 'text-gray-500 hover:text-saffron-600'
          }`}
        >
          📜 KYC Queue
          {pendingPandits.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-red-500 text-white rounded-full font-bold">
              {pendingPandits.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-2 focus:outline-none whitespace-nowrap ${
            activeTab === 'inventory' ? 'text-saffron-600 border-b-2 border-saffron-500' : 'text-gray-500 hover:text-saffron-600'
          }`}
        >
          📦 Catalog Inventory
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2 focus:outline-none whitespace-nowrap ${
            activeTab === 'orders' ? 'text-saffron-600 border-b-2 border-saffron-500' : 'text-gray-500 hover:text-saffron-600'
          }`}
        >
          🛒 Marketplace Orders
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-2 focus:outline-none whitespace-nowrap ${
            activeTab === 'bookings' ? 'text-saffron-600 border-b-2 border-saffron-500' : 'text-gray-500 hover:text-saffron-600'
          }`}
        >
          🕉️ Pandit Bookings
        </button>
      </div>

      {/* TAB VIEWS */}
      <div>
        
        {/* TAB 1: REPORTS & ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Gross Revenue</span>
                  <span className="text-2xl font-black text-saffron-600">₹{metrics?.totalRevenue}</span>
                  <span className="text-[10px] text-gray-500 font-semibold block">Commission + Products</span>
                </div>
                <div className="h-12 w-12 rounded-full bg-saffron-50 flex items-center justify-center text-saffron-600 text-xl font-bold">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Devotees</span>
                  <span className="text-2xl font-black text-gray-900">{metrics?.totalUsers}</span>
                  <span className="text-[10px] text-gray-500 font-semibold block">Active Customer Profiles</span>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 text-xl font-bold">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Ceremonies</span>
                  <span className="text-2xl font-black text-gray-900">{metrics?.totalBookings}</span>
                  <span className="text-[10px] text-gray-500 font-semibold block">Online / Home Bookings</span>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 text-xl font-bold">
                  <Clipboard className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">Product Orders</span>
                  <span className="text-2xl font-black text-gray-900">{metrics?.totalOrders}</span>
                  <span className="text-[10px] text-gray-500 font-semibold block">Marketplace Sales</span>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 text-xl font-bold">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Category Sales Chart (Responsive HTML Chart) */}
              <div className="lg:col-span-2 bg-white border border-orange-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900">E-Commerce Sales by Category</h3>
                
                <div className="space-y-4 pt-4">
                  {categorySales.length === 0 ? (
                    <p className="text-xs text-gray-500">No category sales metrics generated yet.</p>
                  ) : (
                    categorySales.map((c) => {
                      const maxVal = Math.max(...categorySales.map(x => x.totalRevenue), 1);
                      const percentage = Math.round((c.totalRevenue / maxVal) * 100);

                      return (
                        <div key={c._id} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-gray-700">{c._id}</span>
                            <span className="text-saffron-600">₹{c.totalRevenue} ({c.totalSold} sold)</span>
                          </div>
                          <div className="w-full bg-orange-50 h-3 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${percentage}%` }}
                              className="bg-gradient-to-r from-orange-500 to-saffron-600 h-full rounded-full transition-all duration-500"
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Inventory Stock Warnings */}
              <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-1" /> Inventory Alerts
                </h3>

                <div className="space-y-3 pt-2">
                  {lowStock.length === 0 ? (
                    <p className="text-xs text-green-600 font-bold bg-green-50 p-3 rounded-xl border">✓ All products have adequate stock levels.</p>
                  ) : (
                    lowStock.map((p) => (
                      <div key={p._id} className="flex justify-between items-center text-xs border-b border-orange-50 pb-2">
                        <div>
                          <span className="font-semibold text-gray-800 block truncate max-w-[150px]">{p.name}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{p.category}</span>
                        </div>
                        <span className="font-extrabold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Stock: {p.stock}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: KYC QUEUE */}
        {activeTab === 'kyc' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Pandits Verification Applications</h3>

            {pendingPandits.length === 0 ? (
              <p className="text-xs text-gray-500 bg-white border border-orange-100 rounded-3xl p-8 text-center shadow-sm">
                No Pandits waiting in the KYC verification queue.
              </p>
            ) : (
              pendingPandits.map((pandit) => (
                <div
                  key={pandit._id}
                  className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <h4 className="text-lg font-extrabold text-gray-900">{pandit.name}</h4>
                    <p className="text-xs text-gray-600 font-semibold">City: {pandit.city} • Experience: {pandit.experience} yrs</p>
                    <p className="text-xs text-gray-500">Email: {pandit.userId?.email} • Phone: {pandit.userId?.phone}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-saffron-500" /> Document Reference:{' '}
                      <span className="text-saffron-600 font-bold ml-1">{pandit.kycDoc || 'Uploaded_KYC_File.pdf'}</span>
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVerifyPandit(pandit._id, 'verified')}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleVerifyPandit(pandit._id, 'rejected')}
                      className="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 transition-colors border border-red-100"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Create Product Form */}
            <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm h-max space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Plus className="h-5 w-5 mr-1 text-saffron-500" /> Add New Product
              </h3>

              {submitError && <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded border-l-4 border-red-500">{submitError}</p>}
              {submitSuccess && <p className="text-xs text-green-700 font-bold bg-green-50 p-2.5 rounded border-l-4 border-green-500">{submitSuccess}</p>}

              <form onSubmit={handleAddProduct} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Premium Brass Kalash"
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Category</label>
                  <select
                    value={newProductCat}
                    onChange={(e) => setNewProductCat(e.target.value)}
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg text-xs bg-white font-semibold"
                  >
                    <option value="Diyas">Diyas</option>
                    <option value="Dhoop & Agarbatti">Dhoop & Agarbatti</option>
                    <option value="Puja Essentials">Puja Essentials</option>
                    <option value="Malas & Rudraksha">Malas & Rudraksha</option>
                    <option value="Idols & Murtis">Idols & Murtis</option>
                    <option value="Puja Kits">Puja Kits</option>
                    <option value="Holy Books">Holy Books</option>
                    <option value="Decorations & Festivals">Decorations & Festivals</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="299"
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Stock</label>
                    <input
                      type="number"
                      required
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(e.target.value)}
                      placeholder="50"
                      className="w-full px-3 py-2 border border-orange-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={newProductImage}
                    onChange={(e) => setNewProductImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 border border-orange-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Description</label>
                  <textarea
                    required
                    rows="3"
                    value={newProductDesc}
                    onChange={(e) => setNewProductDesc(e.target.value)}
                    placeholder="Description of the spiritual product..."
                    className="w-full p-3 border border-orange-200 rounded-lg text-xs focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Create Product
                </button>
              </form>
            </div>

            {/* Products Inventory List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Products Catalog Inventory</h3>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {productsList.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white border border-orange-100 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.image || 'https://images.unsplash.com/photo-1609137144813-911d087b32d2?w=100'}
                        alt={p.name}
                        className="h-12 w-12 rounded-lg object-cover bg-orange-100 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-gray-800 line-clamp-1">{p.name}</h4>
                        <span className="text-[9px] text-saffron-600 font-bold uppercase block">{p.category}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">Price: ₹{p.price} • Stock: {p.stock}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteProduct(p._id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-100 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Marketplace Customer Orders Logs</h3>

            {allOrders.length === 0 ? (
              <p className="text-xs text-gray-500">No orders logged yet.</p>
            ) : (
              allOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-orange-50">
                    <div className="text-xs">
                      <span className="font-bold text-gray-700 uppercase">Order Ref: {ord._id.toUpperCase()}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">Placed by {ord.userId?.name} ({ord.userId?.email})</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                        className="px-2 py-1 border border-orange-200 rounded-lg text-xs bg-white font-bold"
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ord.products.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs text-gray-600">
                        <span>{p.name} <span className="text-gray-400 font-semibold">x {p.quantity}</span></span>
                        <span className="font-bold text-gray-800">₹{p.price * p.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-orange-50">
                    <div className="text-xs">
                      <span className="text-gray-400 block font-semibold">Deliver to:</span>
                      <span className="font-bold text-gray-600">{ord.shippingAddress?.street}, {ord.shippingAddress?.city}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block font-semibold">Grand Total</span>
                      <span className="text-md font-black text-saffron-600">₹{ord.totalAmount}</span>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Priests Bookings Logs</h3>

            {allBookings.length === 0 ? (
              <p className="text-xs text-gray-500">No bookings logged yet.</p>
            ) : (
              allBookings.map((bk) => (
                <div
                  key={bk._id}
                  className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-orange-50">
                    <div className="text-xs">
                      <span className="font-extrabold text-gray-800">{bk.pujaType}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">Booked by {bk.userId?.name} ({bk.userId?.phone})</p>
                    </div>

                    <div className="flex space-x-2">
                      <select
                        value={bk.status}
                        onChange={(e) => handleUpdateBookingStatus(bk._id, e.target.value)}
                        className="px-2 py-1 border border-orange-200 rounded-lg text-xs bg-white font-bold"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Priest Assigned:</span>
                      <span className="font-bold text-gray-800">{bk.panditId?.name || 'Assigned Scholar'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ceremony Date:</span>
                      <span className="font-bold text-gray-800">{bk.date} at {bk.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ceremony Location:</span>
                      <span className="font-bold text-gray-600">{bk.address?.street}, {bk.address?.city}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-orange-50">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Payment Status</span>
                      <span className={`text-xs font-bold uppercase ${bk.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {bk.paymentStatus}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block font-semibold">Total Cost</span>
                      <span className="text-lg font-black text-saffron-600">₹{bk.totalAmount}</span>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminDashboard;
