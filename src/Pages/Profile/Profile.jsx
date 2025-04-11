import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { updateProfile } from 'firebase/auth'; // Añadir este import
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import userIcon from '../../assets/UserIco.jpg';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPurchasesModalOpen, setIsPurchasesModalOpen] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {

    const loadUserData = async () => {
      try {
        if (currentUser?.uid) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              name: data.name || currentUser.displayName || 'Usuario',
              email: data.email || currentUser.email,
              createdAt: data.createdAt?.toDate?.()?.toLocaleDateString() || 'Fecha no disponible',
              role: data.role || 'user'
            });
            
            setEditForm({
              name: data.name || currentUser.displayName || '',
              email: data.email || currentUser.email || ''
            });
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  // Cargar compras del usuario
  const loadUserPurchases = async () => {
    try {
      setPurchasesLoading(true);
      if (currentUser?.uid) {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const purchasesData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          purchasesData.push({
            id: doc.id,
            date: data.createdAt?.toDate?.()?.toLocaleDateString() || 'Fecha no disponible',
            items: data.items || [],
            total: data.total || 0
          });
        });
        
        setPurchases(purchasesData);
      }
    } catch (error) {
      console.error("Error loading purchases:", error);
    } finally {
      setPurchasesLoading(false);
    }
  };

  const handlePurchasesClick = async () => {
    setIsPurchasesModalOpen(true);
    await loadUserPurchases();
  };

  const handleClosePurchasesModal = () => {
    setIsPurchasesModalOpen(false);
  };

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (loading || !userData) {
    return <div style={styles.loading}>Cargando perfil...</div>;
  }

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (editForm.name.length < 2 || !editForm.email.includes('@')) {
      alert('Nombre debe tener al menos 2 caracteres y email debe ser válido');
      return;
    }
    try {
      setLoading(true);
      
      // Actualizar en Firebase Auth (nombre)
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: editForm.name
        });
      }
      
      // Actualizar en Firestore - Solo campos permitidos
      if (currentUser?.uid) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          name: editForm.name,
          email: editForm.email
          
        });
      }
      
      // Actualizar el estado local
      setUserData(prev => ({
        ...prev,
        name: editForm.name,
        email: editForm.email
      }));
      setIsModalOpen(false);
      alert('Información actualizada correctamente');
    } catch (error) {
      console.error('Error completo:', error);
      alert(`Error al actualizar: ${error.message}`);
      if (error.code === 'permission-denied') {
        console.log('Detalles del error de permisos:', {
          uid: currentUser?.uid,
          email: editForm.email,
          name: editForm.name
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.banner}></div>
      <main style={styles.main}>
        <img 
          src={userIcon} 
          alt="Usuario"
          style={styles.profileCircle}
        />
        <button 
          onClick={handleEditClick}
          style={styles.editButton}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Editar información'}
        </button>
        <h2 style={styles.userName}>{userData.name}</h2>
        <p style={styles.userEmail}>{userData.email}</p>
        <p style={styles.userCreated}>Miembro desde: {userData.createdAt}</p>
        
        <div style={styles.cardContainer}>
          <div style={styles.card} onClick={handlePurchasesClick}>
            <h3 style={styles.cardTitle}>Mis compras</h3>
          </div>
          
        </div>
      </main>
      <Footer />

      {/* Modal de Edición */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Editar información</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre:</label>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleInputChange}
                style={styles.input}
                disabled={loading}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email:</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleInputChange}
                style={styles.input}
                disabled={loading}
              />
            </div>
            
            <div style={styles.modalButtons}>
              <button 
                onClick={handleCloseModal}
                style={styles.cancelButton}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveChanges}
                style={styles.saveButton}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Nuevo Modal de Compras */}
      {isPurchasesModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.purchasesModalContent}>
            <h3 style={styles.modalTitle}>Mis Compras</h3>
            
            {purchasesLoading ? (
              <p style={styles.loadingText}>Cargando compras...</p>
            ) : purchases.length === 0 ? (
              <p style={styles.noPurchasesText}>No tienes compras registradas</p>
            ) : (
              <div style={styles.purchasesList}>
                {purchases.map((purchase) => (
                  <div key={purchase.id} style={styles.purchaseItem}>
                    <div style={styles.purchaseHeader}>
                      <span style={styles.purchaseDate}>Fecha: {purchase.date}</span>
                      <span style={styles.purchaseTotal}>Total: ${purchase.total.toFixed(2)}</span>
                    </div>
                    
                    <div style={styles.itemsList}>
                      {purchase.items.map((item, index) => (
                        <div key={index} style={styles.itemCard}>
                          <img 
                            src={item.image || userIcon} 
                            alt={item.name}
                            style={styles.itemImage}
                          />
                          <div style={styles.itemDetails}>
                            <h4 style={styles.itemName}>{item.name}</h4>
                            <p style={styles.itemPrice}>${item.price.toFixed(2)}</p>
                            <p style={styles.itemQuantity}>Cantidad: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={styles.modalButtons}>
              <button 
                onClick={handleClosePurchasesModal}
                style={styles.closeButton}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos actualizados
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh', 
    fontFamily: 'Helvetica, Arial, sans-serif',
    position: 'relative',
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
    color: '#fff',
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
    objectFit: 'cover',
  },
  editButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: '#000', 
    color: '#FFDC51', 
    border: '2px solid #FFDC51', 
    borderRadius: '20px', 
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: '#FFDC51',
      color: '#000',
    }
  },
  userName: {
    textAlign: 'left', 
    marginTop: '80px', 
    marginLeft: '20px', 
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  userEmail: {
    textAlign: 'left',
    marginLeft: '20px',
    marginBottom: '5px',
    color: '#ccc',
  },
  userRole: {
    textAlign: 'left',
    marginLeft: '20px',
    marginBottom: '5px',
    color: '#FFDC51',
    fontWeight: 'bold',
  },
  userCreated: {
    textAlign: 'left',
    marginLeft: '20px',
    marginBottom: '20px',
    color: '#999',
    fontSize: '14px',
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px', 
    marginTop: '30px',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: '#333',
    borderRadius: '10px',
    padding: '20px',
    width: '200px',
    textAlign: 'center',
    transition: 'transform 0.3s',
    cursor: 'pointer', 
    ':hover': {
      transform: 'translateY(-5px)',
    }
  },
  cardTitle: {
    color: '#fff', 
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  loading: {
    textAlign: 'center',
    padding: '100px',
    color: '#fff',
    backgroundColor: '#000',
  },
  // Estilos del modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#333',
    padding: '30px',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '500px',
  },
  modalTitle: {
    color: '#FFDC51',
    marginTop: 0,
    marginBottom: '20px',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #555',
    backgroundColor: '#222',
    color: '#fff',
    fontSize: '16px',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    color: '#FFDC51',
    border: '1px solid #FFDC51',
    borderRadius: '5px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: 'rgba(255, 220, 81, 0.1)',
    }
  },
  saveButton: {
    backgroundColor: '#FFDC51',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: '#ffd700',
    }
  },
  purchasesModalContent: {
    backgroundColor: '#333',
    padding: '30px',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  purchasesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    margin: '20px 0',
  },
  purchaseItem: {
    backgroundColor: '#444',
    borderRadius: '8px',
    padding: '15px',
  },
  purchaseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #555',
  },
  purchaseDate: {
    color: '#FFDC51',
    fontWeight: 'bold',
  },
  purchaseTotal: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  itemCard: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    backgroundColor: '#555',
    borderRadius: '6px',
    padding: '10px',
  },
  itemImage: {
    width: '60px',
    height: '60px',
    borderRadius: '4px',
    objectFit: 'cover',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: '#fff',
    margin: '0 0 5px 0',
  },
  itemPrice: {
    color: '#FFDC51',
    margin: '0 0 5px 0',
  },
  itemQuantity: {
    color: '#ccc',
    margin: 0,
    fontSize: '14px',
  },
  loadingText: {
    color: '#fff',
    textAlign: 'center',
    padding: '20px',
  },
  noPurchasesText: {
    color: '#ccc',
    textAlign: 'center',
    padding: '20px',
  },
  closeButton: {
    backgroundColor: '#FFDC51',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: '#ffd700',
    }
  },
};

export default Profile;