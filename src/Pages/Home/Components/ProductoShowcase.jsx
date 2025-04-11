import React, { useState, useEffect } from 'react';
import { collection, query, limit, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../../context/WishlistContext';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';

const ProductShowcase = () => {
  const [mangas, setMangas] = useState([]);
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [notification, setNotification] = useState(null);
  

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Obtener 10 mangas
        const mangasQuery = query(
          collection(db, 'products'),
          where('category', '==', 'Manga'),
          limit(10)
        );
        const mangasSnapshot = await getDocs(mangasQuery);
        const mangasList = mangasSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Obtener 10 comics
        const comicsQuery = query(
          collection(db, 'products'),
          where('category', '==', 'Comic'),
          limit(10)
        );
        const comicsSnapshot = await getDocs(comicsQuery);
        const comicsList = comicsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setMangas(mangasList);
        setComics(comicsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
        maxStock: product.stock || 10 // Usar el mismo nombre que en ProductDetail
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
      {/* Sección de Mangas */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Mangas Destacados</h2>
        <div style={styles.productsContainer}>
          {mangas.map(product => (
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
      </div>

      {/* Sección de Comics */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Comics Destacados</h2>
        <div style={styles.productsContainer}>
          {comics.map(product => (
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
  section: {
    backgroundColor: '#949494',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '30px',
  },
  sectionTitle: {
    color: '#FFFFFF',
    marginBottom: '20px',
    fontSize: '24px',
    fontWeight: 'bold',
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

export default ProductShowcase;