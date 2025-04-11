import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const saveAddressToFirestore = async (userId, address) => {
  const addressesRef = collection(db, 'users', userId, 'addresses');
  await addDoc(addressesRef, {
    ...address,
    createdAt: new Date(),
    isDefault: true
  });
};

export const getUserAddresses = async (userId) => {
  try {
    const addressesRef = collection(db, 'users', userId, 'addresses');
    const snapshot = await getDocs(addressesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting user addresses:", error);
    throw error;
  }
};