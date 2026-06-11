import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, token, API_URL } = useAuth();
  const [cart, setCart] = useState({ products: [] });
  const [wishlist, setWishlist] = useState([]);

  // Load guest cart/wishlist on start
  useEffect(() => {
    const localWish = localStorage.getItem('wishlist');
    if (localWish) {
      setWishlist(JSON.parse(localWish));
    }

    if (!token) {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      } else {
        setCart({ products: [] });
      }
    } else {
      fetchCartFromServer();
    }
  }, [token]);

  // Save guest cart
  useEffect(() => {
    if (!token) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, token]);

  // Save guest wishlist
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const fetchCartFromServer = async () => {
    try {
      const res = await axios.get(`${API_URL}/cart`);
      setCart(res.data);
    } catch (err) {
      console.error('Error fetching cart from server:', err.message);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const qty = Number(quantity);
    if (token) {
      try {
        const res = await axios.post(`${API_URL}/cart`, {
          productId: product._id,
          quantity: qty
        });
        setCart(res.data);
      } catch (err) {
        console.error('Error adding to cart on server:', err.message);
      }
    } else {
      // Guest logic
      setCart(prev => {
        const productsCopy = [...prev.products];
        const existIndex = productsCopy.findIndex(
          p => p.productId?._id === product._id || p.productId === product._id
        );

        if (existIndex > -1) {
          productsCopy[existIndex].quantity += qty;
        } else {
          productsCopy.push({ productId: product, quantity: qty });
        }
        return { ...prev, products: productsCopy };
      });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const qty = Number(quantity);
    if (qty < 1) return removeFromCart(productId);

    if (token) {
      try {
        const res = await axios.put(`${API_URL}/cart/update`, {
          productId,
          quantity: qty
        });
        setCart(res.data);
      } catch (err) {
        console.error('Error updating quantity on server:', err.message);
      }
    } else {
      setCart(prev => {
        const productsCopy = prev.products.map(item => {
          const id = item.productId?._id || item.productId;
          if (id === productId) {
            return { ...item, quantity: qty };
          }
          return item;
        });
        return { ...prev, products: productsCopy };
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (token) {
      try {
        const res = await axios.delete(`${API_URL}/cart/${productId}`);
        setCart(res.data);
      } catch (err) {
        console.error('Error removing from cart on server:', err.message);
      }
    } else {
      setCart(prev => {
        const productsCopy = prev.products.filter(item => {
          const id = item.productId?._id || item.productId;
          return id !== productId;
        });
        return { ...prev, products: productsCopy };
      });
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        await axios.delete(`${API_URL}/cart`);
        setCart({ products: [] });
      } catch (err) {
        console.error('Error clearing cart on server:', err.message);
      }
    } else {
      setCart({ products: [] });
    }
  };

  const addToWishlist = (product) => {
    setWishlist(prev => {
      if (prev.find(item => item._id === product._id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item._id !== productId));
  };

  const isInWishlist = (productId) => {
    return !!wishlist.find(item => item._id === productId);
  };

  const getCartCount = () => {
    return cart.products.reduce((acc, item) => acc + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.products.reduce((acc, item) => {
      const price = item.productId?.price || 0;
      return acc + (price * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      wishlist,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      getCartCount,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
