import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase'; // Ensure you have the correct path to your Firebase configuration
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import AddressForm from '../../Components/AddressForm';
import { processOrder } from '../../services/orderService';
const CartPage = () => {
  const { cart, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null); // Default payment method

  // Función para manejar cambios de cantidad
const handleQuantityChange = async (productId, newQuantity) => {
  try {
    await updateQuantity(productId, newQuantity);
  } catch (error) {
    console.error('Error actualizando cantidad:', error);
    // Mostrar mensaje de error al usuario
    setError(`Error al actualizar cantidad: ${error.message}`);
  }
};
// Función para eliminar producto
const handleRemoveItem = async (productId) => {
  try {
    await removeFromCart(productId);
  } catch (error) {
    console.error('Error eliminando producto:', error);
    setError(`Error al eliminar producto: ${error.message}`);
  }
};


// Función para checkout
// CartPage.jsx - Modificar handleCheckout
const handleCheckout = async () => {
  try {
    if (!address) {
      setError("Por favor ingresa una dirección de envío");
      return;
    }

    const calculatedTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const orderData = {
      userId: currentUser.uid,
      items: cart.items,
      total: calculatedTotal,
      address: address,
      paymentMethod: "Simulado",
      createdAt: new Date()
    };

    const orderId = await processOrder(orderData);

    console.log("Orden creada con ID:", orderId);
    
    if (!orderId) {
      throw new Error("No se pudo obtener el ID de la orden");
    }

    await clearCart();
    // 2. Usamos SOLO el string orderId en la navegación
    navigate(`/order-confirmation/${orderId}`);
  } catch (error) {
    console.error("Error en checkout:", {
      error: error.message,
      stack: error.stack
    });
    setError(error.message || "Ocurrió un error al procesar la orden");
  }
};

  const handleAddressSuccess = (savedAddress) => {
    setShowAddressForm(false);
    setAddress(savedAddress); // Guarda la dirección en el estado
  };
  useEffect(() => {
    const checkProduct = async () => {
      try {
        // Verifica si hay productos en el carrito
        if (cart.items.length > 0) {
          const productIdToCheck = cart.items[0].productId;
          const productRef = doc(db, 'products', productIdToCheck);
          const snap = await getDoc(productRef);
          
          console.log("Verificación de producto:", {
            id: productIdToCheck,
            exists: snap.exists(),
            data: snap.data(),
            hasQuantity: 'quantity' in snap.data(),
            quantityValue: snap.data()?.quantity
          });
        }
      } catch (error) {
        console.error("Error verificando producto:", error);
      }
    };

    checkProduct();
  }, [cart.items]); // Se ejecuta cuando cambia el carrito


  if (loading) return <div style={styles.loading}>Cargando carrito...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <h2 style={styles.title}>Tu Carrito</h2>
        
        {cart.items.length === 0 ? (
          <div style={styles.emptyCart}>
            <p style={styles.subtitle}>Tu carrito está vacío</p>
            <Link to="/mangas" style={styles.browseBtn}>
              Explorar productos
            </Link>
          </div>
        ) : (
          <>
            <div style={styles.cartItems}>
            {cart.items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="cart-item">
                  <div style={styles.productInfo}>
                    <img 
                      src={item.image} 
                      alt={item.name}
                      style={styles.productImage}
                    />
                    <div>
                      <h3 style={styles.productName}>{item.name}</h3>
                      <p style={styles.productPrice}>Precio unitario: ${item.price}</p>
                    </div>
                  </div>
                  
                  <div style={styles.quantityControls}>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      style={styles.quantityButton}
                    >
                      <FaMinus />
                    </button>
                    <span style={styles.quantityValue}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      style={styles.quantityButton}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  
                  <div style={styles.subtotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    style={styles.removeBtn}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.cartSummary}>
              <h3 style={styles.totalText}>
                Total: $
                {cart.items
                  .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                  .toFixed(2)}
              </h3>
              {!address && (
  <button 
    onClick={() => setShowAddressForm(true)}
    style={styles.checkoutBtn}
  >
    Ingresar Dirección
  </button>
)}
              
              {address && (
    <button 
      onClick={handleCheckout}
      style={styles.checkoutBtn}
    >
      Confirmar Compra
    </button>
  )}
            </div>

            {showAddressForm && (
              <AddressForm 
              onSuccess={handleAddressSuccess}
              onCancel={() => setShowAddressForm(false)}
              initialAddress={currentUser?.addresses?.[0] || null}
            />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    fontFamily: 'Helvetica, Arial, sans-serif',
    backgroundColor: '#f5f5f5',
  },
  main: {
    flex: 1,
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  title: {
    fontSize: '32px',
    marginBottom: '30px',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '18px',
    color: '#555',
    marginBottom: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '100px',
    fontSize: '18px',
  },
  emptyCart: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  browseBtn: {
    display: 'inline-block',
    backgroundColor: '#000',
    color: '#FFDC51',
    padding: '12px 24px',
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: 'bold',
    marginTop: '20px',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#333',
    },
  },
  cartItems: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '30px',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    borderBottom: '1px solid #eee',
    ':lastChild': { 
      borderBottom: 'none',
    },
  },
  productInfo: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  productImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    marginRight: '20px',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5'
  },
  productName: {
    fontSize: '18px',
    margin: '0 0 5px 0',
    color: '#333',
  },
  productPrice: {
    fontSize: '16px',
    color: '#666',
    margin: '0',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 20px',
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    ':hover:not(:disabled)': {
      backgroundColor: '#ddd',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  quantityValue: {
    fontSize: '16px',
    minWidth: '20px',
    textAlign: 'center',
  },
  subtotal: {
    fontSize: '18px',
    fontWeight: 'bold',
    minWidth: '80px',
    textAlign: 'right',
    margin: '0 20px',
  },
  removeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ff4444',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '8px',
    transition: 'color 0.3s',
    ':hover': {
      color: '#cc0000',
    },
  },
  cartSummary: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'right',
  },
  totalText: {
    fontSize: '24px',
    margin: '0 0 20px 0',
  },
  checkoutBtn: {
    backgroundColor: '#000',
    color: '#FFDC51',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    ':hover:not(:disabled)': {
      backgroundColor: '#333',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
};

export default CartPage;