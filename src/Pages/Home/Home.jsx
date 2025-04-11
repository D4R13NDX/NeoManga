import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import banner1 from '../../assets/banners/Banner1.jpg';
import banner2 from '../../assets/banners/Banner2.jpg';
import banner3 from '../../assets/banners/Banner3.jpeg';
import ProductShowcase from './Components/ProductoShowcase';

// Array de imágenes para el banner
const bannerImages = [banner1, banner2, banner3];

const Home = () => {
  const { currentUser, userData } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Efecto para ocultar el mensaje después de 5 segundos
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(welcomeTimer);
  }, []);

  // Mostrar mensaje de bienvenida cuando el usuario se autentica
  useEffect(() => {
    if (currentUser) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // Carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <Header />
      
      <main style={styles.main}>
        {/* Mensaje de bienvenida mejorado */}
        {showWelcome && (
          <div style={styles.welcomeContainer}>
            <h2 style={styles.welcomeMessage}>
              ¡Bienvenid@{' '}
              <span style={styles.userName}>
                {userData?.name || currentUser?.displayName || currentUser?.email?.split('@')[0]}
              </span>!
            </h2>
            <p style={styles.welcomeSubtext}>Gracias por visitar nuestra tienda</p>
          </div>
        )}
        
        {/* Banner de imágenes */}
        <div style={styles.bannerContainer}>
          <div style={{
            ...styles.bannerImage,
            backgroundImage: `url(${bannerImages[currentImageIndex]})`,
          }} />
          <div style={styles.bannerDots}>
            {bannerImages.map((_, index) => (
              <span 
                key={index}
                style={{
                  ...styles.dot,
                  backgroundColor: index === currentImageIndex ? '#FFDC51' : '#ccc'
                }}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </div>
        
        <div style={styles.showcaseContainer}>
          <ProductShowcase />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};



// Estilos
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh', 
    fontFamily: 'Helvetica, Arial, sans-serif',
  },
  main: {
    flex: 1,
    padding: '20px',
    textAlign: 'center',
  },
  bannerContainer: {
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto 30px',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    height: '400px',
  },
  bannerImage: {
    height: '400px',
    width: '100%',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundColor: '#d7d7d7',
    transition: 'background-image 0.5s ease-in-out',
  },
  bannerDots: {
    position: 'absolute',
    bottom: '20px',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  title: {
    fontSize: '32px',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#555',
    marginTop: '20px',
  },
  welcomeContainer: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#FFDC51',
    color: '#000',
    padding: '15px 30px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    animation: 'fadeOut 1s ease 4s forwards',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  welcomeMessage: {
    fontSize: '20px',
    margin: '0',
    fontWeight: 'bold'
  },
  userName: {
    color: '#E74C3C',
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
  },
  welcomeSubtext: {
    fontSize: '14px',
    margin: '5px 0 0',
    fontStyle: 'italic'
  },
  '@keyframes fadeOut': {
    from: { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
    to: { opacity: 0, transform: 'translateX(-50%) translateY(-20px)' }
  },
  showcaseContainer: {
    marginTop: '40px',
    padding: '0 20px',
  }
};
export default Home;