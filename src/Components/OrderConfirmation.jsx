import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useEffect, useState, useContext } from 'react';
import { useAuth } from '../context/AuthContext';

const OrderConfirmation = () => {
    const { currentUser } = useAuth();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) {
            setError("Debes iniciar sesión para ver esta orden");
            setLoading(false);
            return;
        }
        const fetchOrder = async () => {
            let docSnap;
            try {
                console.log("Fetching order:", {
                    orderId,
                    userId: currentUser.uid
                });

                const docRef = doc(db, 'orders', orderId);
                docSnap = await getDoc(docRef);
                
                if (!docSnap.exists()) {
                    throw new Error("La orden no existe");
                }

                const orderData = docSnap.data();
                console.log("Order data:", orderData);

                if (currentUser.uid !== orderData.userId) {
                    throw new Error("No tienes permiso para ver esta orden");
                }

                setOrder(orderData);
            } catch (error) {
                console.error("Error details:", {
                    error: error.message,
                    code: error.code,
                    orderData: docSnap?.data() // Ahora docSnap está definido
                });
                setError(`Error al cargar la orden: ${error.message}`);
          }finally {
            setLoading(false);
        }
        };
      
        if (currentUser) {
          fetchOrder();
        }
      }, [orderId, currentUser]);
  
    if (loading) return <div style={styles.loading}>Cargando detalles de la orden...</div>;
    if (error) return <div style={styles.error}>Error: {error}</div>;
  
    return (
      <div style={styles.container}>
        <h2>¡Compra exitosa!</h2>
        <p>Número de orden: {orderId}</p>
        {order && (
          <>
            <p>Total: ${order.total?.toFixed(2)}</p>
            <p>Fecha: {order.createdAt?.toDate().toLocaleString()}</p>
          </>
        )}
        <p>Gracias por tu compra. Revisa tu perfil para ver tu compra.</p>
        <Link to="/" style={styles.homeLink}>
          Volver al inicio
        </Link>
      </div>
    );
  };

const styles = {
  container: { 
    textAlign: 'center', 
    padding: '40px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  homeLink: { 
    display: 'inline-block',
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#000',
    color: '#FFDC51',
    borderRadius: '5px',
    textDecoration: 'none'
  },
  loading: {
    textAlign: 'center',
    padding: '40px'
  },
  error: {
    textAlign: 'center',
    padding: '40px',
    color: 'red'
  }
};

export default OrderConfirmation;