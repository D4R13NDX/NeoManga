import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

admin.initializeApp();


const transporter = nodemailer.createTransport({
  service: 'gmail', // Puedes usar otro servicio
  auth: {
    user: await admin.firestore().collection('config').doc('email').get().then(doc => doc.data().EMAIL_USER), // Configura en Firestore
    pass: await admin.firestore().collection('config').doc('email').get().then(doc => doc.data().EMAIL_PASS)  // Configura en Firestore
  }
});

export const sendVerificationCode = functions.https.onCall(async (data, context) => {
  const email = data.email;
  
  // Generar código de 6 dígitos
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 300000; // 5 minutos de expiración

  // Guardar código en Firestore
  await admin.firestore().collection('verificationCodes').doc(email).set({
    code,
    expiresAt,
    used: false
  });

  // Configurar email
  const mailOptions = {
    from: `"Neo Manga" <${await admin.firestore().collection('config').doc('email').get().then(doc => doc.data().EMAIL_USER)}>`,
    to: email,
    subject: 'Tu código de verificación',
    text: `Tu código de verificación es: ${code}\n\nEl código expira en 5 minutos.`,
    html: `
      <div>
        <h2>Tu código de verificación</h2>
        <p style="font-size: 24px; font-weight: bold;">${code}</p>
        <p>El código expira en 5 minutos.</p>
        <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
      </div>
    `
  };

  // Enviar email
  await transporter.sendMail(mailOptions);
  
  return { success: true };
});