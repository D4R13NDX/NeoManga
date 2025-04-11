import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, functions, db } from '../../../firebase';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../context/AuthContext';
import fondo from '../../../assets/fondo.jpg';
import personaje from '../../../assets/bangbu.png';

const TwoFactorAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1: credenciales, 2: código
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { email, password, from } = location.state || {}; // Obtiene credenciales del estado
  const [formData, setFormData] = useState({
    email: email || '',
    password: password || ''
  });

  // Redirección segura con useEffect
  useEffect(() => {
    if (!email || !password) {
        navigate('/login'); // Si no hay credenciales, regresa al login
      }
    }, [email, password, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendVerificationCode = httpsCallable(functions, 'sendVerificationCode');

  const handleStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Enviar código de verificación
      await sendVerificationCode({ email: formData.email });
      setEmailSent(true);
      setStep(2);
    } catch (error) {
      console.error('Error en login:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const verifyCode = async () => {
    const codeDoc = await getDoc(doc(db, 'verificationCodes', formData.email));
    
    if (!codeDoc.exists()) {
      throw new Error('Código no encontrado');
    }
    
    const { code, expiresAt, used } = codeDoc.data();
    
    if (used || Date.now() > expiresAt) {
      throw new Error('Código expirado o ya usado');
    }
    
    if (verificationCode !== code) {
      throw new Error('Código incorrecto');
    }
    
    // Marcar código como usado
    await setDoc(doc(db, 'verificationCodes', formData.email), {
      used: true
    }, { merge: true });
  };
  const handleStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // 1. Verificar el código primero
      await verifyCode();
      
      // 2. Si el código es correcto, autenticar al usuario
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
       // 3. Redirigir al home
       navigate(from?.pathname || '/home', { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    return null; // Mientras se redirige
  } 

  return (
    <div style={styles.container}>
      <div style={styles.backgroundTop}></div>
      <div style={styles.backgroundBottom}></div>
      <div style={styles.formContainer}>
        <h1 style={styles.title}>Verificación en 2 Pasos</h1>
        
        {error && <p style={styles.error}>{error}</p>}
        {emailSent && <p style={styles.success}>Código enviado a tu correo electrónico</p>}

        {step === 1 ? (
          <form style={styles.form} onSubmit={handleStep1}>
            <label style={styles.label}>Correo electrónico</label>
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              style={styles.input}
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              style={styles.input}
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Cargando...' : 'Continuar'}
            </button>
          </form>
        ) : (
          <form style={styles.form} onSubmit={handleStep2}>
            <p style={styles.instructions}>
              Hemos enviado un código de verificación a tu correo electrónico.
              Por favor ingrésalo a continuación.
            </p>
            <label style={styles.label}>Código de verificación</label>
            <input
              type="text"
              placeholder="Código de 6 dígitos"
              style={styles.input}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              maxLength="6"
            />
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
            <button 
              type="button" 
              style={styles.secondaryButton}
              onClick={handleStep1}
              disabled={loading}
            >
              Reenviar código
            </button>
          </form>
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
  button: {
    padding: '10px',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '10px',
  },
  secondaryButton: {
    padding: '10px',
    backgroundColor: 'transparent',
    color: '#FFDC51',
    border: '1px solid #FFDC51',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '10px',
  },
  instructions: {
    marginBottom: '15px',
    fontSize: '14px',
    color: '#fff',
  },
};

export default TwoFactorAuth;