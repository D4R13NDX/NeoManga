import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export const searchProducts = async (searchTerm) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('keywords', 'array-contains', searchTerm.toLowerCase()),
      limit(5)
    );
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return results;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};