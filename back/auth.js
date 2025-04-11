import express from 'express';
import admin from '../firebase';
import { hashPassword } from '../utils/hash'; // función que usas para hashear
import { firestore } from 'firebase-admin';

const router = express.Router();
const db = firestore();

router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email y nueva contraseña son obligatorios' });
  }

  try {
    // Buscar usuario en Firebase Auth
    const userRecord = await admin.auth().getUserByEmail(email);

    // Hashear la nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar solo en la base de datos Firestore (si no estás usando Firebase Auth directamente)
    const userSnapshot = await db.collection('users').where('email', '==', email).get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'Usuario no encontrado en base de datos' });
    }

    const userDoc = userSnapshot.docs[0];

    await db.collection('users').doc(userDoc.id).update({
      password: hashedPassword,
    });

    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
