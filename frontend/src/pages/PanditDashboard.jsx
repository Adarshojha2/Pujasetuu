import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Wallet, CheckCircle, Clock, AlertTriangle, Plus, Trash2, ShieldCheck } from 'lucide-react';

const PanditDashboard = () => {
  const { user, token, API_URL } = useAuth();
  const { t } = useLanguage();

  const [panditProfile, setPanditProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Availability calendar forms
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('09:00 AM');

  // Onboarding registration form (if profile doesn't exist)
  const [onboarding, setOnboarding] = useState(false);
  const [specialization, setSpecialization] = useState([]);
  const [experience, setExperience] = useState('');
  const [city, setCity] = useState('Varanasi');
  const [kycFile, setKycFile] = useState(null);

  const specsOptions = [
    'Satyanarayan Puja',
    'Griha Pravesh Puja',
    'Rudrabhishek',
    'Navagraha Puja',
    'Marriage Puja',
    'Naming Ceremony',
    'Shradh Puja',
    'Vastu Puja',
    'Festival Special Pujas'
  ];

  const fetchPanditData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Profile
      try {
        const profileRes = await axios.get(`${API_URL}/pandits/profile`, { headers });
        setPanditProfile(profileRes.data);
        setOnboarding(false);

        // 2. Fetch Assigned Bookings
        const bookingsRes = await axios.get(`${API_URL}/pandits/bookings`, { headers });
        setBookings(bookingsRes.data);
      } catch (profErr) {
        if (profErr.response?.status === 404) {
          setOnboarding(true); // Needs onboarding profile
        } else {
          setErrorMsg('Failed to load profile.');
        }
      }
    } catch (err) {
      setErrorMsg('An error occurred loading dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPanditData();
    }
  }, [token]);

  // Handle Onboarding form submit
  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (specialization.length === 0 || !experience || !city) {
      return setErrorMsg('Please fill in experience, city and select at least one specialization');
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('specialization', JSON.stringify(specialization));
      formData.append('experience', experience);
      formData.append('city', city);
      if (kycFile) {
        formData.append('kycDoc', kycFile);
      }

      await axios.post(`${API_URL}/pandits/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      fetchPanditData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Profile onboarding failed.');
      setLoading(false);
    }
  };

  // Spec multi-select handler
  const handleSpecToggle = (spec) => {
    setSpecialization(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  // Add Availability Slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newDate || !newSlot) return;

    try {
      const updatedAvail = [...panditProfile.availability];
      const dateIndex = updatedAvail.findIndex(a => a.date === newDate);

      if (dateIndex > -1) {
        if (!updatedAvail[dateIndex].slots.includes(newSlot)) {
          updatedAvail[dateIndex].slots.push(newSlot);
        }
      } else {
        updatedAvail.push({ date: newDate, slots: [newSlot] });
      }

      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(`${API_URL}/pandits/profile`, {
        availability: updatedAvail
      }, { headers });

      setPanditProfile(res.data);
      setNewDate('');
    } catch (err) {
      alert('Failed to add calendar slot');
    }
  };

  // Delete Availability Slot
  const handleDeleteSlot = async (date, slot) => {
    try {
      let updatedAvail = panditProfile.availability.map(avail => {
        if (avail.date === date) {
          return { ...avail, slots: avail.slots.filter(s => s !== slot) };
        }
        return avail;
      }).filter(avail => avail.slots.length > 0);

      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(`${API_URL}/pandits/profile`, {
        availability: updatedAvail
      }, { headers });

      setPanditProfile(res.data);
    } catch (err) {
      alert('Failed to remove calendar slot');
    }
  };

  // Update Booking Status (Accept / Complete)
  const handleUpdateBooking = async (bookingId, newStatus) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_URL}/pandits/bookings/${bookingId}`, {
        status: newStatus
      }, { headers });
      fetchPanditData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  if (loading && !onboarding) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-saffron-600"></div>
      </div>
    );
  }

  // ONBOARDING FORM VIEW
  if (onboarding) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-4xl block">📜</span>
          <h1 className="text-3xl font-extrabold text-gray-900 font-outfit">Pandit Profile Registration</h1>
          <p className="text-gray-500 text-sm">Please register your expertise to begin receiving bookings</p>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-lg border-l-4 border-red-500">{errorMsg}</p>
        )}

        <form onSubmit={handleOnboardingSubmit} className="bg-white border border-orange-100 rounded-3xl p-6 md:p-8 shadow-md space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Experience (Years)</label>
              <input
                type="number"
                required
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 border border-orange-200 rounded-lg text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Serving City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-orange-200 rounded-lg text-xs focus:outline-none bg-white font-medium"
              >
                <option value="Varanasi">Varanasi</option>
                <option value="Haridwar">Haridwar</option>
                <option value="Ayodhya">Ayodhya</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Ceremonies Specializations</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {specsOptions.map((spec, i) => (
                <label key={i} className="flex items-center space-x-2 text-xs text-gray-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={specialization.includes(spec)}
                    onChange={() => handleSpecToggle(spec)}
                    className="rounded text-saffron-500 focus:ring-saffron-500"
                  />
                  <span>{spec}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">KYC Credentials Doc (PDF/Image)</label>
            <input
              type="file"
              required
              onChange={(e) => setKycFile(e.target.files[0])}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-saffron-700 hover:file:bg-orange-100"
            />
            <p className="text-[10px] text-gray-400 mt-1">Upload Vedic studies degree or national identification card.</p>
          </div>

          <button
            type="submit"
            className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-3 rounded-xl shadow-md transition-colors"
          >
            Submit Application
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={panditProfile?.image || 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500'}
            alt={user?.name}
            className="h-16 w-16 rounded-full object-cover bg-orange-100 border border-orange-200"
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-gray-900 font-outfit">{user?.name}</h1>
            <p className="text-xs text-gray-500">
              Serving: <span className="font-bold">{panditProfile?.city}</span> • {panditProfile?.experience} years exp
            </p>
            <div className="flex items-center space-x-2 pt-0.5">
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center ${
                panditProfile?.verificationStatus === 'verified' ? 'bg-green-50 text-green-700 border border-green-200' :
                panditProfile?.verificationStatus === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}>
                {panditProfile?.verificationStatus === 'verified' ? (
                  <>✓ {t('verified')}</>
                ) : (
                  <>⚠ {panditProfile?.verificationStatus}</>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl px-5 py-3.5 shadow flex items-center space-x-4">
          <Wallet className="h-8 w-8 text-orange-100 animate-pulse" />
          <div>
            <span className="text-[10px] text-orange-100 block font-bold uppercase">{t('earnings')}</span>
            <span className="text-2xl font-black">₹{panditProfile?.earnings || 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Availability Calendar (Left Column) */}
        <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm space-y-6 h-max">
          <h3 className="text-lg font-bold text-gray-900 pb-3 border-b border-orange-50 flex items-center">
            <Calendar className="h-5 w-5 text-saffron-500 mr-2" /> Calendar Availability
          </h3>

          <form onSubmit={handleAddSlot} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="px-3 py-2 border border-orange-200 rounded-lg text-xs focus:outline-none"
              />
              <select
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="px-3 py-2 border border-orange-200 rounded-lg text-xs bg-white font-semibold"
              >
                <option value="07:00 AM">07:00 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-saffron-100 hover:bg-saffron-600 hover:text-white text-saffron-700 font-bold py-2 rounded-xl text-xs transition-colors border border-orange-100"
            >
              + Add Available Slot
            </button>
          </form>

          {/* Slots List */}
          <div className="space-y-4 pt-4 border-t border-orange-50">
            {panditProfile?.availability?.length === 0 ? (
              <p className="text-[10px] text-gray-400">No availability slots added yet. Please use the form above.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {panditProfile?.availability?.map((avail) => (
                  <div key={avail.date} className="space-y-1.5">
                    <span className="text-xs font-bold text-gray-800">{avail.date}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {avail.slots.map((slot) => (
                        <span
                          key={slot}
                          className="px-2 py-0.5 rounded bg-orange-50 border border-orange-100 text-[10px] text-saffron-700 font-semibold flex items-center"
                        >
                          {slot}
                          <button
                            onClick={() => handleDeleteSlot(avail.date, slot)}
                            className="ml-1 text-red-500 font-bold hover:text-red-700 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assigned Bookings List (Right Column) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Assigned Ceremonies Bookings</h3>

          {bookings.length === 0 ? (
            <p className="text-xs text-gray-500 bg-white border border-orange-100 rounded-3xl p-6 shadow-sm">
              No ceremony bookings assigned to you yet. Ensure your availability calendar has slots.
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-gray-900 text-md">{booking.pujaType}</h4>
                      <p className="text-xs text-gray-500">
                        Date: <span className="font-bold text-gray-800">{booking.date}</span> at <span className="font-bold text-gray-800">{booking.time}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Devotee: <span className="font-semibold text-gray-700">{booking.userId?.name} ({booking.userId?.phone})</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Location Address: <span className="font-semibold text-gray-600">{booking.address?.street}, {booking.address?.city}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block font-semibold">Your Share (80%)</span>
                      <span className="text-lg font-extrabold text-saffron-600">₹{booking.totalAmount * 0.8}</span>
                      <span className={`text-[9px] font-bold block ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {booking.paymentStatus === 'paid' ? '● Paid' : '● Unpaid'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-orange-50 bg-orange-50/10 px-4 py-2 rounded-xl">
                    <span className="text-xs text-gray-500">
                      Status:{' '}
                      <span className={`font-bold uppercase ${
                        booking.status === 'confirmed' ? 'text-green-600' :
                        booking.status === 'completed' ? 'text-blue-600' :
                        booking.status === 'cancelled' ? 'text-red-500' : 'text-yellow-600'
                      }`}>
                        {booking.status}
                      </span>
                    </span>

                    <div className="flex space-x-2">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateBooking(booking._id, 'confirmed')}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                        >
                          Accept Booking
                        </button>
                      )}
                      {booking.status === 'confirmed' && booking.paymentStatus === 'paid' && (
                        <button
                          onClick={() => handleUpdateBooking(booking._id, 'completed')}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                        >
                          Complete Ceremony
                        </button>
                      )}
                    </div>
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

export default PanditDashboard;
