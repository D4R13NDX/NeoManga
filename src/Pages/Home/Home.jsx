import React from 'react';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';

const Home = () => {
  return (
    <div style={styles.container}>
      {/* Navbar */}
      <Header />

      {/* Contenido Principal */}
      <main style={styles.main}>
        <h1 style={styles.title}>Bienvenido a Neo-Manga</h1>
        <p style={styles.subtitle}>Explora nuestra colección de mangas y cómics.</p>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;

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
  title: {
    fontSize: '32px',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#555',
  },
};