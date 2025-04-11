import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import fondo from '../../../assets/fondo.jpg';
import personaje from '../../../assets/bangbu.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [step, setStep] = useState(1);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
     
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Usuario no encontrado');
      }
      
      
      const userDoc = querySnapshot.docs[0];
      setSecurityQuestion(userDoc.data().securityQuestion);
      setUserId(userDoc.id);
      setStep(2);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSecurityAnswer = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Verificar la respuesta sin autenticación
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }
      const correctAnswer = userDoc.data().securityAnswer;
      
      if (securityAnswer.toLowerCase().trim() !== correctAnswer) {
        throw new Error('Respuesta incorrecta');
      }
      
      // Si la respuesta es correcta, enviar email de recuperación
      await sendPasswordResetEmail(auth, email); 
      setSuccess('Se ha enviado un enlace de recuperación a tu correo');
      setStep(3);
    } catch (error) {
      setError(error.code === 'auth/wrong-password' 
        ? 'Verificando respuesta...' 
        : error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundTop}></div>
      <div style={styles.backgroundBottom}></div>
      <div style={styles.formContainer}>
        <h1 style={styles.title}>Recuperar Contraseña</h1>
        
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        
        {step === 1 && (
          <form style={styles.form} onSubmit={handleEmailSubmit}>
            <label style={styles.label}>Correo electrónico</label>
            <input
              type="email"
              placeholder="Ingresa tu correo"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" style={styles.submitButton}>
              Continuar
            </button>
          </form>
        )}
        
        {step === 2 && (
          <form style={styles.form} onSubmit={handleSecurityAnswer}>
            <p style={styles.question}>{securityQuestion}</p>
            <input
              type="text"
              placeholder="Tu respuesta"
              style={styles.input}
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
            />
            <button type="submit" style={styles.submitButton}>
              Verificar
            </button>
          </form>
        )}
        
        {step === 3 && (
          <button 
            style={styles.loginButton}
            onClick={() => navigate('/login')}
          >
            Volver al Login
          </button>
        )}
        
        <div style={styles.characterContainer}>
          <img src={personaje} alt="Personaje" style={styles.character} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'Helvetica, Arial, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '40%',
    backgroundColor: '#fff', 
    backgroundImage: `url(${fondo})`, 
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: -1,
  },
  backgroundBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '60%',
    backgroundColor: '#000',
    zIndex: -1,
  },
  formContainer: {
    backgroundColor: '#949494',
    padding: '20px',
    borderRadius: '10px',
    width: '300px',
    textAlign: 'center',
    color: '#fff',
    zIndex: 1,
    position: 'relative',
  },
  title: {
    fontSize: '24px',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    textAlign: 'left',
    marginBottom: '5px',
  },
  input: {
    padding: '10px',
    marginBottom: '15px',
    border: 'none',
    borderRadius: '5px',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: '15px',
    fontSize: '14px',
  },
  success: {
    color: '#4CAF50',
    marginBottom: '15px',
    fontSize: '14px',
  },
  question: {
    marginBottom: '15px',
    fontWeight: 'bold',
  },
  submitButton: {
    padding: '10px',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#000',
    color: '#FFDC51',
    border: 'none',
    borderRadius: '5px',
    padding: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
  },
  characterContainer: {
    position: 'absolute',
    bottom: '-20px',
    right: '-20px',
  },
  character: {
    width: '100px',
    height: 'auto',
  },
};

export default ForgotPassword;