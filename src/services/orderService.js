import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, runTransaction } from 'firebase/firestore';

export const processOrder = async (orderData) => {
    const ordersRef = collection(db, 'orders');
    
    const order = {
        ...orderData,
        createdAt: serverTimestamp(),
        paymentMethod: 'Simulado',
        status: 'completed',
        total: orderData.total 
      };
  
    try {
      const orderId = await runTransaction(db, async (transaction) => {
        // 1. Verificar stock primero
        for (const item of orderData.items) {
          const productRef = doc(db, 'products', item.productId);
          const snap = await transaction.get(productRef);
          if (!snap.exists() || snap.data().quantity < item.quantity) {
            throw new Error(`Stock insuficiente para ${item.name}`);
          }
        }
  
        // 2. Crear orden
        const docRef = await addDoc(ordersRef, order);
        
        // 3. Actualizar productos (MÉTODO CLAVE)
        for (const item of orderData.items) {
          const productRef = doc(db, 'products', item.productId);
          const snap = await transaction.get(productRef);
          const newQuantity = snap.data().quantity - item.quantity;
          
          transaction.update(productRef, {
            quantity: newQuantity,
            lastUpdated: serverTimestamp()
          });
        }
  
        return docRef.id; // Retorna solo el ID
      });
      console.log("Orden creada con ID:", orderId); // Debug
        return orderId; // Retorna el string directamente
      
    } catch (error) {
      console.error("Detalle del error:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
};