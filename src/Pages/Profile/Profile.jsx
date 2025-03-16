import React from 'react';
import Header from '../../Components/Header'; 
import Footer from '../../Components/Footer'; 

const Profile = () => {
  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.banner}></div>
      <main style={styles.main}>
        <div style={styles.profileCircle}></div>
        <button style={styles.editButton}>Editar información</button>
        <h2 style={styles.userName}>User</h2>
        <div style={styles.cardContainer}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Mis compras</h3>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>En camino</h3>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;

// Estilos
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh', 
    fontFamily: 'Helvetica, Arial, sans-serif',
  },
  banner: {
    height: '150px', 
    backgroundColor: '#fff', 
  },
  main: {
    flex: 1, 
    backgroundColor: '#000', 
    padding: '20px',
    position: 'relative',
  },
  profileCircle: {
    width: '120px', 
    height: '120px',
    borderRadius: '50%', 
    backgroundColor: '#fff', 
    position: 'absolute',
    top: '-60px',
    left: '20px', 
    border: '4px solid #000', 
  },
  editButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: '#000', 
    color: '#FFA500', 
    border: '2px solid #FFA500', 
    borderRadius: '20px', 
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  userName: {
    color: '#fff', 
    textAlign: 'left', 
    marginTop: '80px', 
    marginLeft: '20px', 
    fontSize: '24px',
    fontWeight: 'bold',
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px', 
    marginTop: '30px', 
  },
  card: {
    backgroundColor: '#333', 
    borderRadius: '10px', 
    padding: '20px',
    width: '200px', 
    textAlign: 'center',
  },
  cardTitle: {
    color: '#fff', 
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
};