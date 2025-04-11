import React from 'react';
import { useAuth } from '../../context/AuthContext';
import ProductList from '../../Components/ProductList';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';

const ComicsPage = () => {
  const { currentUser } = useAuth();
  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        {/* Mensaje personalizado si está autenticado */}
        {currentUser && (
          <p style={styles.welcomeText}>
            ¡Hola {currentUser.displayName || currentUser.email.split('@')[0]}!
          </p>
        )}
        <p style={styles.subtitle}>Revisa nuestra selección de comics</p>
        <div style={styles.showcaseContainer}>
          <ProductList category="Comic" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: '32px',
    marginBottom: '10px',
    color: '#333',
  },
  subtitle: {
    fontSize: '18px',
    color: '#555',
    marginTop: '20px',
    marginBottom: '30px',
  },
  showcaseContainer: {
    marginTop: '20px',
    padding: '0 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  welcomeText: {
    color: '#FFDC51',
    fontSize: '16px',
    marginBottom: '10px',
    fontWeight: 'bold'
  },
  '@keyframes fadeOut': {
    from: { opacity: 1 },
    to: { opacity: 0 }
  }
};

export default ComicsPage;