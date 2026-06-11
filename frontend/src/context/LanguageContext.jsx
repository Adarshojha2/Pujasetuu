import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
  en: {
    home: 'Home',
    pujas: 'Book Pujas',
    marketplace: 'Marketplace',
    cart: 'Cart',
    wishlist: 'Wishlist',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    dashboard: 'Dashboard',
    hero_title: 'PujaSetu – Connecting You to Divinity',
    hero_subtitle: 'Book verified Pandits online for home and temple pujas, and shop premium spiritual essentials.',
    book_pandit: 'Book Pandits',
    shop_now: 'Shop Now',
    featured_pujas: 'Featured Puja Services',
    trending_products: 'Trending Marketplace Products',
    experience: 'years exp',
    verified: 'Verified',
    price: 'Price',
    rating: 'Rating',
    search: 'Search products or services...',
    categories: 'Categories',
    add_to_cart: 'Add to Cart',
    buy_now: 'Buy Now',
    reviews: 'Reviews',
    booking_history: 'Booking History',
    order_history: 'Order History',
    referral_msg: 'Refer a friend and get 10% off using code:',
    saved_addresses: 'Saved Addresses',
    notifications: 'Notifications',
    checkout: 'Checkout',
    total: 'Total Amount',
    pandits_list: 'Available Pandits',
    booking_form: 'Confirm Ceremony Details',
    language_toggle: 'हिंदी',
    kyc_status: 'KYC Verification',
    earnings: 'Earnings Wallet'
  },
  hi: {
    home: 'मुख्य पृष्ठ',
    pujas: 'पूजा बुक करें',
    marketplace: 'पूजा सामग्री',
    cart: 'कार्ट',
    wishlist: 'इच्छा-सूची',
    login: 'लॉगिन',
    register: 'पंजीकरण',
    logout: 'लॉगआउट',
    profile: 'प्रोफ़ाइल',
    dashboard: 'डैशबोर्ड',
    hero_title: 'पूजासेतु – देवत्व से आपका जुड़ाव',
    hero_subtitle: 'घर और मंदिर की पूजा के लिए ऑनलाइन सत्यापित पंडित बुक करें, और उत्कृष्ट आध्यात्मिक सामान की खरीदारी करें।',
    book_pandit: 'पंडित बुक करें',
    shop_now: 'अभी खरीदें',
    featured_pujas: 'प्रमुख पूजा सेवाएँ',
    trending_products: 'प्रचलित आध्यात्मिक उत्पाद',
    experience: 'वर्षों का अनुभव',
    verified: 'सत्यापित',
    price: 'मूल्य',
    rating: 'रेटिंग',
    search: 'उत्पाद या सेवाएँ खोजें...',
    categories: 'श्रेणियाँ',
    add_to_cart: 'कार्ट में जोड़ें',
    buy_now: 'अभी खरीदें',
    reviews: 'समीक्षाएं',
    booking_history: 'पूजा बुकिंग इतिहास',
    order_history: 'ऑर्डर इतिहास',
    referral_msg: 'मित्रों को साझा करें और 10% छूट पाएं, कोड:',
    saved_addresses: 'सहेजे गए पते',
    notifications: 'सूचनाएं',
    checkout: 'चेकआउट',
    total: 'कुल राशि',
    pandits_list: 'उपलब्ध पंडित',
    booking_form: 'पूजा विवरण की पुष्टि करें',
    language_toggle: 'English',
    kyc_status: 'केवाईसी सत्यापन',
    earnings: 'कमाई बटुआ'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
