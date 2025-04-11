import React, { useEffect, useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import { FaHeart, FaTrash, FaShoppingCart } from 'react-icons/fa';

const WishlistPage = () => {
  const { wishlist, loading, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsData = await Promise.all(
        wishlist.map(async (item) => {
          try {
            const productRef = doc(db, 'products', item.productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              return { 
                ...productSnap.data(), 
                id: productSnap.id,
                wishlistItemId: item.id
              };
            }
            return null;
          } catch (error) {
            console.error("Error fetching product:", error);
            return null;
          }
        })
      );
      setProducts(productsData.filter(p => p !== null));
    };

    if (wishlist.length > 0) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [wishlist]);

  const handleRemoveFromWishlist = async (productId) => {
    await removeFromWishlist(productId);
    await refreshWishlist();
  };
  const handleAddToCart = async (product) => {
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

  if (!currentUser) {
    return (
      <div style={styles.container}>
        <Header />
        <main style={styles.main}>
          <div style={styles.authMessage}>
            <h2>Wishlist</h2>
            <p>Debes iniciar sesión para ver tu lista de deseos</p>
            <Link to="/login" style={styles.loginButton}>Iniciar sesión</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <Header />
        <main style={styles.main}>
          <div style={styles.loading}>Cargando tu wishlist...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        <div style={styles.wishlistContainer}>
          <h2 style={styles.title}>Tu Wishlist</h2>
          
          {products.length === 0 ? (
            <div style={styles.emptyWishlist}>
              <FaHeart style={styles.emptyIcon} />
              <p>Tu wishlist está vacía</p>
              <Link to="/mangas" style={styles.browseButton}>Explorar productos</Link>
            </div>
          ) : (
            <div style={styles.productsGrid}>
              {products.map((product) => (
                <div key={product.id} style={styles.productCard}>
                  <div 
                    style={styles.productImageContainer}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <img 
                      src={product.images?.[0]} 
                      alt={product.name}
                      style={styles.productImage}
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWishlist(product.id);
                      }}
                      style={styles.removeButton}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div style={styles.productInfo}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.productPrice}>${product.price}</p>
                    <div style={styles.productActions}>
                      <button 
                        style={styles.addToCartButton}
                        onClick={() => handleAddToCart(product)}
                      >
                        <FaShoppingCart style={{ marginRight: '5px' }} />
                        Añadir al carrito
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
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
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  wishlistContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  emptyWishlist: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  emptyIcon: {
    fontSize: '48px',
    color: '#FFDC51',
    marginBottom: '20px',
  },
  browseButton: {
    display: 'inline-block',
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#000',
    color: '#FFDC51',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  productCard: {
    border: '1px solid #eee',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'transform 0.3s',
    ':hover': {
      transform: 'translateY(-5px)',
    },
  },
  productImageContainer: {
    position: 'relative',
    cursor: 'pointer',
  },
  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  productInfo: {
    padding: '15px',
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
    color: '#333',
    margin: '0 0 15px 0',
  },
  productActions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  addToCartButton: {
    backgroundColor: '#000',
    color: '#FFDC51',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
  },
  authMessage: {
    textAlign: 'center',
    maxWidth: '500px',
    margin: '0 auto',
    padding: '40px 20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  loginButton: {
    display: 'inline-block',
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#000',
    color: '#FFDC51',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
  },
};

export default WishlistPage;