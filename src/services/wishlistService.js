import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  doc
} from 'firebase/firestore';

export const addToWishlist = async (userId, productId) => {
  try {
    // Verificar si ya existe en el wishlist
    const q = query(
      collection(db, 'wishlists'),
      where('userId', '==', userId),
      where('productId', '==', productId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { success: false, message: 'El producto ya está en tu wishlist' };
    }

    // Añadir a wishlist
    await addDoc(collection(db, 'wishlists'), {
      userId,
      productId,
      addedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error adding to wishlist: ", error);
    throw error;
  }
};

export const removeFromWishlist = async (userId, productId) => {
  try {
    const q = query(
      collection(db, 'wishlists'),
      where('userId', '==', userId),
      where('productId', '==', productId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      await Promise.all(
        querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      );
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error removing from wishlist: ", error);
    throw error;
  }
};

export const getUserWishlist = async (userId) => {
  try {
    const q = query(collection(db, 'wishlists'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting wishlist: ", error);
    throw error;
  }
};

export const isInWishlist = async (userId, productId) => {
  try {
    const q = query(
      collection(db, 'wishlists'),
      where('userId', '==', userId),
      where('productId', '==', productId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking wishlist: ", error);
    return false;
  }
};