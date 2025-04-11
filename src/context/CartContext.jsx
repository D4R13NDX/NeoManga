import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import * as cartService from '../services/cartService';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  const refreshCart = async () => {
    if (currentUser) {
      setLoading(true);
      try {
        const cartData = await cartService.getCart(currentUser.uid);
        setCart(cartData);
      } finally {
        setLoading(false);
      }
    }
  };
  const clearCart = async () => {
    if (currentUser) {
      try {
        await cartService.clearCart(currentUser.uid); // Asegúrate de implementar esto en cartService
      } catch (error) {
        console.error("Error al vaciar el carrito:", error);
        throw error;
      }
    }
    setCart({ items: [], total: 0 }); // Vacía el carrito en el estado local
  };

  const addToCart = async (product) => {
    const validatedProduct = {
        ...product,
        maxStock: product.maxStock ?? product.stock ?? 10
      };
    if (!currentUser) return false;
  
    // Validación de campos obligatorios
    const requiredFields = ['id', 'name', 'price', 'image', 'quantity'];
    const missingFields = requiredFields.filter(field => !validatedProduct[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
    }
  
    try {
      await cartService.addToCart(currentUser.uid, product);
      await refreshCart();
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(productId);
      return;
    }
    await cartService.updateCartItem(currentUser.uid, productId, newQuantity);
    await refreshCart();
  };
  
  const removeFromCart = async (productId) => {
    await cartService.removeFromCart(currentUser.uid, productId);
    await refreshCart();
  };

  useEffect(() => {
    refreshCart();
  }, [currentUser]);

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      addToCart, 
      removeFromCart, 
      updateQuantity,
      clearCart,
      refreshCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}