import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          where('category', '==', category)
        );
        const querySnapshot = await getDocs(q);
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
  
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity: 1,
        maxStock: product.stock || 10
      });
      
      setNotification({
        message: `${product.name} añadido al carrito`,
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        message: `Error: ${error.message}`,
        type: 'error'
      });
    }
  };

  const handleAddToFavorites = async (productId, e) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    await toggleWishlist(productId);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return <div style={styles.loading}>Cargando productos...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.productsContainer}>
        {products.map(product => (
          <div 
            key={product.id} 
            style={styles.productCard}
            onClick={() => handleProductClick(product.id)}
          >
            <button 
              onClick={(e) => handleAddToFavorites(product.id, e)}
              style={{
                ...styles.favoriteButton,
                color: isInWishlist(product.id) ? '#FF0000' : '#FFDC51'
              }}
            >
              <FaHeart />
            </button>
            <img 
              src={product.images?.[0]} 
              alt={product.name}
              style={styles.productImage}
            />
            <div style={styles.productInfo}>
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.productPrice}>${product.price}</p>
              <button 
  onClick={(e) => handleAddToCart(product, e)}
  style={styles.addToCartButton}
>
  <FaShoppingCart style={{ marginRight: '5px' }} />
  Añadir al carro
</button>
            </div>
          </div>
        ))}
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
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  productsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-5px)',
    },
  },
  productImage: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
  },
  productInfo: {
    padding: '15px',
    textAlign: 'center',
  },
  productName: {
    fontSize: '16px',
    margin: '0 0 10px 0',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  productPrice: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333333',
    margin: '0 0 15px 0',
  },
  addToCartButton: {
    backgroundColor: '#000000',
    color: '#FFDC51',
    border: 'none',
    borderRadius: '5px',
    padding: '8px 15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#333333',
    },
  },
  favoriteButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: '#000000',
    color: '#FFDC51',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: '1',
    transition: 'transform 0.3s',
    ':hover': {
      transform: 'scale(1.1)',
    },
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '18px',
  },
};

export default ProductList;