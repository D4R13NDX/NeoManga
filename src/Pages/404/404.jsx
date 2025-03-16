import React from 'react';

const NotFound = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.errorCode}>404</h1>
        <p style={styles.errorMessage}>Intenta de nuevo más tarde</p>
      </div>
    </div>
  );
};

export default NotFound;

// Estilos
const styles = {
  container: {
    backgroundColor: '#000',
    color: '#fff', 
    height: '100vh', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start', 
    paddingLeft: '50px', 
  },
  content: {
    textAlign: 'left', 
  },
  errorCode: {
    fontSize: '100px', 
    fontWeight: 'bold', 
    margin: 0, 
  },
  errorMessage: {
    fontSize: '24px', 
    margin: 0, 
  },
};