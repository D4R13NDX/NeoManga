import React from 'react';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';

const Contact = () => {
  return (
    <div style={styles.container}>
      {/* Navbar */}
      <Header />

      {/* Contenido Principal */}
      <main style={styles.main}>
        <h1 style={styles.title}>Contáctanos</h1>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Información de Contacto</h2>
          <p style={styles.sectionText}>
            Correo: contacto@neomanga.com <br />
            Teléfono: +123 456 7890 <br />
            Dirección: Calle Falsa 123, Ciudad, País
          </p>
        </div>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Soporte Técnico</h2>
          <p style={styles.sectionText}>
            Para asistencia técnica, contáctanos en: <br />
            soporte@neomanga.com <br />
            Teléfono: +123 456 7890
          </p>
        </div>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Trabaja con Nosotros</h2>
          <p style={styles.sectionText}>
            Envíanos tu CV a: <br />
            trabajo@neomanga.com <br />
            ¡Únete a nuestro equipo!
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;

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
    backgroundColor: '#949494', 
    padding: '20px',
    textAlign: 'center', 
  },
  title: {
    color: '#FFDC51', 
    fontSize: '36px',
    fontWeight: 'bold', 
    marginBottom: '30px', 
  },
  section: {
    marginBottom: '30px', 
  },
  sectionTitle: {
    color: '#FFDC51', 
    fontSize: '24px',
    fontWeight: 'bold', 
    marginBottom: '10px', 
  },
  sectionText: {
    color: '#fff', 
    fontSize: '18px',
    lineHeight: '1.6', 
  },
};