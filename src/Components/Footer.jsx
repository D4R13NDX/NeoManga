import React from 'react';
import personaje from '../assets/bangbu.png'; // Importar la imagen del personaje

const Footer = () => {
  return (
    <footer style={styles.footer}>
      {/* Logo de NeoManga y Personaje */}
      <div style={styles.logoContainer}>
        <h2 style={styles.logo}>NeoManga</h2>
        <div style={styles.characterContainer}>
          <img src={personaje} alt="Personaje" style={styles.character} />
        </div>
      </div>

      {/* Textos: Nosotros, Términos y Políticas, Cuentas */}
      <div style={styles.textContainer}>
        <div style={styles.textSection}>
          <h3 style={styles.textTitle}>Nosotros</h3>
          <p style={styles.textContent}>
            Somos una plataforma dedicada a los amantes del manga y los cómics.
          </p>
        </div>
        <div style={styles.textSection}>
          <h3 style={styles.textTitle}>Términos y Políticas</h3>
          <p style={styles.textContent}>
            Lee nuestros términos y condiciones, así como nuestras políticas de privacidad.
          </p>
        </div>
        <div style={styles.textSection}>
          <h3 style={styles.textTitle}>Cuentas</h3>
          <p style={styles.textContent}>
            Gestiona tu cuenta, suscripciones y preferencias.
          </p>
        </div>
      </div>

      {/* Texto "Derechos reservados" en la parte inferior */}
      <div style={styles.rightsContainer}>
        <p style={styles.rightsText}>Derechos reservados</p>
      </div>
    </footer>
  );
};

export default Footer;

// Estilos
const styles = {
  footer: {
    backgroundColor: '#000', // Fondo negro
    color: '#fff', // Texto blanco
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    minHeight: '200px', // Altura mínima del footer
  },
  logoContainer: {
    flex: 1,
    paddingLeft: '20px', // Separación del borde izquierdo
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    marginBottom: '10px', // Separación entre el logo y el personaje
  },
  characterContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  character: {
    width: '100px', // Tamaño del personaje
    height: 'auto',
  },
  textContainer: {
    flex: 2,
    display: 'flex',
    justifyContent: 'space-around',
    gap: '20px', // Separación entre las secciones de texto
  },
  textSection: {
    textAlign: 'left', // Texto justificado a la izquierda
  },
  textTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  textContent: {
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.5', // Espaciado entre líneas
  },
  rightsContainer: {
    position: 'absolute',
    bottom: '10px', // Separación del borde inferior
    left: '50%', // Centrado horizontalmente
    transform: 'translateX(-50%)', // Ajuste para centrar
  },
  rightsText: {
    fontSize: '12px',
    margin: 0,
  },
};