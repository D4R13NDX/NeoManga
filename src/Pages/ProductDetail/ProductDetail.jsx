// src/Pages/ProductDetail/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { currentUser } = useAuth();
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error getting document:", error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  
    // Validar que todos los campos requeridos existen
    if (!product || !product.id || !product.name || !product.price || !product.images?.[0]) {
      setNotification({
        message: 'Información del producto incompleta',
        type: 'error'
      });
      return;
    }
  
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '', // Fallback para imagen
        quantity: quantity,
        maxStock: product.maxStock ?? product.stock ?? 10 // Nullish coalescing
      });
  
      setNotification({
        message: `${quantity} ${product.name} añadido(s) al carrito`,
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        message: `Error al agregar al carrito: ${error.message}`,
        type: 'error'
      });
    }
  };

  const handleAddToFavorites = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    await toggleWishlist(id);
  };

  if (loading) {
    return <div style={styles.loading}>Cargando producto...</div>;
  }

  if (!product) {
    return <div style={styles.notFound}>Producto no encontrado</div>;
  }

  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        <div style={styles.productDetail}>
          <div style={styles.imageContainer}>
            <img 
              src={product.images?.[0]} 
              alt={product.name}
              style={styles.productImage}
            />
          </div>
          
          <div style={styles.infoContainer}>
            <h1 style={styles.productTitle}>{product.name}</h1>
            <p style={styles.productDescription}>{product.description}</p>
            
            <div style={styles.priceContainer}>
              <span style={styles.productPrice}>${product.price}</span>
            </div>
            
            <div style={styles.quantitySelector}>
              <label htmlFor="quantity" style={styles.quantityLabel}>Cantidad:</label>
              <input
  type="number"
  id="quantity"
  min="1"
  max={product?.stock || 10}
  value={isNaN(quantity) ? '' : quantity} // Mostrar vacío si es NaN
  onChange={(e) => {
    const rawValue = e.target.value;
    
    // Si el campo está vacío, setear a 1 temporalmente
    if (rawValue === '') {
      setQuantity('');
      return;
    }
    
    const numValue = parseInt(rawValue, 10);
    
    // Si no es un número válido, no actualizar el estado
    if (isNaN(numValue)) return;
    
    // Aplicar límites
    const clampedValue = Math.max(
      1, 
      Math.min(product?.stock || 10, numValue)
    );
    setQuantity(clampedValue);
  }}
  onBlur={(e) => {
    // Si el campo queda vacío o con valor inválido, resetear a 1
    if (e.target.value === '' || isNaN(parseInt(e.target.value, 10))) {
      setQuantity(1);
    }
  }}
/>
              <span style={styles.stockText}>(Disponibles: {product.quantity})</span>
            </div>
            
            <div style={styles.buttonGroup}>
              <button 
                onClick={handleAddToCart}
                style={styles.addToCartButton}
              >
                <FaShoppingCart style={{ marginRight: '8px' }} />
                Añadir al carrito
              </button>
              
              <button 
                onClick={handleAddToFavorites}
                style={{
                  ...styles.favoriteButton,
                  backgroundColor: isInWishlist(id) ? '#FF0000' : '#000'
                }}
              >
                <FaHeart />
              </button>
            </div>
          </div>
        </div>
        {notification && (
  <div style={{
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: notification.type === 'success' ? '#4CAF50' : '#f44336',
    color: 'white',
    padding: '15px',
    borderRadius: '5px',
    zIndex: 1000
  }}>
    {notification.message}
  </div>
  )}
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
    padding: '40px 20px',
    backgroundColor: '#f5f5f5',
  },
  productDetail: {
    display: 'flex',
    flexDirection: 'row',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    padding: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  productImage: {
    maxWidth: '100%',
    maxHeight: '500px',
    objectFit: 'contain',
  },
  infoContainer: {
    flex: 1,
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
  },
  productTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  productDescription: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#555',
    marginBottom: '30px',
  },
  priceContainer: {
    margin: '20px 0',
  },
  productPrice: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  quantitySelector: {
    display: 'flex',
    alignItems: 'center',
    margin: '30px 0',
    gap: '15px',
  },
  quantityLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  quantityInput: {
    width: '60px',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    textAlign: 'center',
    fontSize: '16px',
  },
  stockText: {
    fontSize: '14px',
    color: '#666',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '20px',
  },
  addToCartButton: {
    backgroundColor: '#000',
    color: '#FFDC51',
    border: 'none',
    borderRadius: '5px',
    padding: '12px 25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#333',
    },
  },
  favoriteButton: {
    backgroundColor: '#000',
    color: '#FFDC51',
    border: 'none',
    borderRadius: '5px',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#333',
    },
  },
  loading: {
    textAlign: 'center',
    padding: '100px',
    fontSize: '18px',
  },
  notFound: {
    textAlign: 'center',
    padding: '100px',
    fontSize: '18px',
    color: '#ff0000',
  },
};

export default ProductDetail;