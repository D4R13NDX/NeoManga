import React from 'react';
import { useNavigate } from 'react-router-dom';
import fondo from '../../assets/fondo.jpg';
import personaje from '../../assets/bangbu.png';

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/home');
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundTop}>
      </div>
      <div style={styles.backgroundBottom}></div>
      <div style={styles.formContainer}>
        <h1 style={styles.title}>Registro</h1>
        <p style={styles.subtitle}>Crea tu cuenta</p>
        <form style={styles.form} onSubmit={handleRegister}>
          <label style={styles.label}>Nombre</label>
          <input
            type="text"
            placeholder="Nombre completo"
            style={styles.input}
          />
          <label style={styles.label}>Correo</label>
          <input
            type="email"
            placeholder="Correo electrónico"
            style={styles.input}
          />
          <label style={styles.label}>Contraseña</label>
          <input
            type="password"
            placeholder="Contraseña"
            style={styles.input}
          />
          <label style={styles.label}>Repetir Contraseña</label>
          <input
            type="password"
            placeholder="Repetir Contraseña"
            style={styles.input}
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
          onClick={() => navigate('')}
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