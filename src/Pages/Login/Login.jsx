import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import fondo from '../../assets/fondo.jpg';
import personaje from '../../assets/bangbu.png';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Configurar persistencia antes de iniciar sesión
      await setPersistence(auth, browserLocalPersistence);
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // Verificación adicional del rol
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Tu cuenta no está configurada correctamente');
      }
      
    } catch (error) {
      console.error('Error en login:', error);
      let errorMessage = 'Error al iniciar sesión';
      switch (error.code) {
        case 'auth/wrong-password': 
          errorMessage = 'Contraseña incorrecta'; 
          break;
        case 'auth/user-not-found': 
          errorMessage = 'Usuario no encontrado'; 
          break;
        case 'auth/too-many-requests': 
          errorMessage = 'Demasiados intentos. Intenta más tarde'; 
          break;
        case 'auth/invalid-email': 
          errorMessage = 'Correo electrónico inválido'; 
          break;
        default: 
          errorMessage = error.message || 'Error al iniciar sesión';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Si ya está autenticado, redirigir
  if (currentUser) {
    const from = location.state?.from?.pathname || '/home';
    navigate(from, { replace: true });
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundTop}></div>
      <div style={styles.backgroundBottom}></div>
      <div style={styles.formContainer}>
        <h1 style={styles.title}>Inicio de Sesión</h1>
        <p style={styles.subtitle}>Ingresa tus datos</p>
        {error && <p style={styles.error}>{error}</p>}
        <form style={styles.form} onSubmit={handleLogin}>
          <label style={styles.label}>Correo</label>
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
         
          <button 
            type="submit" 
            style={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
        <p style={styles.registerText}>
          ¿No tienes cuenta?{' '}
        </p>
        <button 
          style={styles.registerButton}
          onClick={() => navigate('/register')}
        >
          Registrarse
        </button>
        <p style={styles.forgotText}>
  ¿Olvidaste tu contraseña?{' '}
</p>
<button 
  style={styles.forgotButton}
  onClick={() => navigate('/forgot-password')}
>
  Recuperar contraseña
</button>
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
  subtitle: {
    fontSize: '16px',
    marginBottom: '20px',
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
  loginButton: {
    padding: '10px',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    opacity: 1,
    transition: 'opacity 0.3s',
    '&:disabled': {
      opacity: 0.7,
      cursor: 'not-allowed'
    }
  },
  registerText: {
    marginTop: '10px',
  },
  registerButton: {
    backgroundColor: '#000',
    color: '#FFDC51', 
    border: 'none',
    borderRadius: '5px',
    padding: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
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
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#000',
    color: '#FFDC51',
    fontSize: '20px'
  },
  forgotText: {
    marginTop: '10px',
  },
  forgotButton: {
    backgroundColor: 'transparent',
    color: '#FFDC51',
    border: 'none',
    borderRadius: '5px',
    padding: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    textDecoration: 'underline',
  }
};

export default Login;