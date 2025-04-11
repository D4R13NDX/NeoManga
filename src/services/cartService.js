import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export const getCart = async (userId) => {
  const docRef = doc(db, 'carts', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : { items: [] };
};

export const addToCart = async (userId, product) => {
  const cartRef = doc(db, 'carts', userId);
  const cartSnap = await getDoc(cartRef);

  const cleanProduct = {
    productId: product.id,
    name: product.name,
    image: product.image,
    price: product.price,
    quantity: product.quantity,
    maxStock: product.maxStock,
    addedAt: new Date()
  };

  if (!cartSnap.exists()) {
    // Crear el carrito si no existe
    await setDoc(cartRef, {
      items: [cleanProduct],
      createdAt: new Date()
    });
  } else {
    const cart = cartSnap.data();
    const existingItem = cart.items.find(item => item.productId === product.id);

    if (existingItem) {
      await updateCartItem(userId, product.id, existingItem.quantity + product.quantity);
    } else {
      await updateDoc(cartRef, {
        items: arrayUnion(cleanProduct),
        updatedAt: new Date()
      });
    }
  }
};

export const updateCartItem = async (userId, productId, newQuantity) => {
  const cartRef = doc(db, 'carts', userId);
  const cart = await getCart(userId);
  
  const updatedItems = cart.items.map(item => 
    item.productId === productId 
      ? { ...item, quantity: newQuantity } 
      : item
  );

  await updateDoc(cartRef, {
    items: updatedItems,
    updatedAt: new Date()
  });
};

export const removeFromCart = async (userId, productId) => {
  const cartRef = doc(db, 'carts', userId);
  const cart = await getCart(userId);
  
  const updatedItems = cart.items.filter(item => item.productId !== productId);
  
  await updateDoc(cartRef, {
    items: updatedItems,
    updatedAt: new Date()
  });
};

export const clearCart = async (userId) => {
  const cartRef = doc(db, 'carts', userId);
  await updateDoc(cartRef, {
    items: [],
    total: 0
  });
};