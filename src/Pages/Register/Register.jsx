import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import fondo from '../../assets/fondo.jpg';
import personaje from '../../assets/bangbu.png';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '¿Cuál es el nombre de tu primera mascota?', // Pregunta por defecto
    securityAnswer: ''
  });

  const securityQuestions = [
    '¿Cuál es el nombre de tu primera mascota?',
    '¿Cuál es tu ciudad de nacimiento?',
    '¿Cuál es el nombre de tu escuela primaria?',
    '¿Cuál es tu comida favorita?'
  ];

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
  
    try {
      // 1. Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // 2. Crear documento en Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        role: 'user',
        createdAt: new Date(),
        securityQuestion: formData.securityQuestion,
  securityAnswer: formData.securityAnswer.toLowerCase().trim()
      });
  
      // 3. Cerrar sesión y redirigir a login
      await signOut(auth);
      navigate('/login', { state: { success: 'Registro exitoso' } });
  
    } catch (error) {
      console.error('Error en registro:', error);
      setError(error.code === 'auth/email-already-in-use' 
        ? 'El correo ya está registrado' 
        : 'Error en el registro');
    }
  };
  return (
    <div style={styles.container}>
      <div style={styles.backgroundTop}></div>
      <div style={styles.backgroundBottom}></div>
      <div style={styles.formContainer}>
        <h1 style={styles.title}>Registro</h1>
        <p style={styles.subtitle}>Crea tu cuenta</p>
        {error && <p style={styles.error}>{error}</p>}
        <form style={styles.form} onSubmit={handleRegister}>
          <label style={styles.label}>Nombre</label>
          <input
            type="text"
            name="name"
            placeholder="Nombre completo"
            style={styles.input}
            value={formData.name}
            onChange={handleChange}
            required
          />
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
          <label style={styles.label}>Repetir Contraseña</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Repetir Contraseña"
            style={styles.input}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <label style={styles.label}>Pregunta de seguridad</label>
<select
  name="securityQuestion"
  style={styles.input}
  value={formData.securityQuestion}
  onChange={handleChange}
  required
>
  {securityQuestions.map((question, index) => (
    <option key={index} value={question}>{question}</option>
  ))}
</select>

<label style={styles.label}>Respuesta de seguridad</label>
<input
  type="text"
  name="securityAnswer"
  placeholder="Respuesta"
  style={styles.input}
  value={formData.securityAnswer}
  onChange={handleChange}
  required
/>
          <button type="submit" style={styles.registerButton}>
            Registrarse
          </button>
        </form>
        <p style={styles.loginText}>
          ¿Ya tienes cuenta?{' '}
        </p>
        <button
          style={styles.loginButton}
          onClick={() => navigate('/login')} // Asegúrate de que esta ruta existe
        >
          Iniciar Sesión
        </button>
        <div style={styles.characterContainer}>
          <img src={personaje} alt="Personaje" style={styles.character} />
        </div>
      </div>
    </div>
  );
};

export default Register;

const styles = {
  error: {
    color: '#ff6b6b',
    marginBottom: '15px',
    fontSize: '14px',
  },
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
  registerButton: {
    padding: '10px',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
  },
  loginText: {
    marginTop: '10px',
    color: '#fff',
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