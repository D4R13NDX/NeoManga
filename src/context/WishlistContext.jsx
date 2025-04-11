import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserWishlist, 
  addToWishlist as addToWishlistService, 
  removeFromWishlist as removeFromWishlistService,
  isInWishlist as isInWishlistService
} from '../services/wishlistService';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistStatus, setWishlistStatus] = useState({});

  const refreshWishlist = async () => {
    if (currentUser) {
      setLoading(true);
      try {
        const items = await getUserWishlist(currentUser.uid);
        setWishlist(items);
        
        // Actualizar estados individuales de los productos
        const statusMap = {};
        items.forEach(item => {
          statusMap[item.productId] = true;
        });
        setWishlistStatus(statusMap);
      } catch (error) {
        console.error("Error refreshing wishlist: ", error);
      } finally {
        setLoading(false);
      }
    } else {
      setWishlist([]);
      setWishlistStatus({});
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!currentUser) return { success: false, message: 'Debes iniciar sesión' };
    
    try {
      const result = await addToWishlistService(currentUser.uid, productId);
      if (result.success) {
        await refreshWishlist();
      }
      return result;
    } catch (error) {
      console.error("Error adding to wishlist: ", error);
      return { success: false, message: 'Error al añadir a wishlist' };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await removeFromWishlistService(currentUser.uid, productId);
      await refreshWishlist();
      return { success: true };
    } catch (error) {
      console.error("Error removing from wishlist: ", error);
      return { success: false, message: 'Error al eliminar de wishlist' };
    }
  };

  const toggleWishlist = async (productId) => {
    if (wishlistStatus[productId]) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => {
    return !!wishlistStatus[productId];
  };

  useEffect(() => {
    refreshWishlist();
  }, [currentUser]);

  return (
    <WishlistContext.Provider 
      value={{ 
        wishlist, 
        loading, 
        addToWishlist, 
        removeFromWishlist, 
        toggleWishlist,
        isInWishlist,
        refreshWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}