import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import userIcon from '../assets/UserIco.jpg';
import { FaShoppingCart, FaHeart, FaSearch } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { searchProducts } from '../services/productService';

const Header = () => {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { wishlist } = useWishlist();

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await searchProducts(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Error al buscar productos:', error);
        setSearchResults([]);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setSearchQuery('');
    }
  };

  const handleResultClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleHover = (link) => {
    setHoveredLink(link);
  };

  const handleHoverEnd = () => {
    setHoveredLink(null);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  return (
    <header style={styles.header}>
      <h1 style={styles.headerTitle}>Neo-Manga</h1>
      <nav style={styles.nav}>
        <Link
          to="/home"
          style={{
            ...styles.navLink,
            ...(hoveredLink === 'inicio' && styles.navLinkHover),
          }}
          onMouseEnter={() => handleHover('inicio')}
          onMouseLeave={handleHoverEnd}
        >
          Inicio
        </Link>
        <Link
          to="/mangas"
          style={{
            ...styles.navLink,
            ...(hoveredLink === 'mangas' && styles.navLinkHover),
          }}
          onMouseEnter={() => handleHover('mangas')}
          onMouseLeave={handleHoverEnd}
        >
          Mangas
        </Link>
        <Link
          to="/comics"
          style={{
            ...styles.navLink,
            ...(hoveredLink === 'comics' && styles.navLinkHover),
          }}
          onMouseEnter={() => handleHover('comics')}
          onMouseLeave={handleHoverEnd}
        >
          Comics
        </Link>

        
        {/* Menú desplegable "Más" */}
        <div 
          style={styles.dropdownContainer}
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <div
            style={{
              ...styles.navLink,
              ...(hoveredLink === 'mas' && styles.navLinkHover),
              cursor: 'pointer',
            }}
            onClick={toggleDropdown}
            onMouseEnter={() => handleHover('mas')}
            onMouseLeave={handleHoverEnd}
          >
            Más
          </div>
          
          {showDropdown && (
            <div style={styles.dropdownMenu}>
              <Link
                to="/contact"
                style={styles.dropdownItem}
                onClick={() => setShowDropdown(false)}
              >
                Contacto
              </Link>
              {/* Opción de cerrar sesión (solo muestra si hay usuario autenticado) */}
              {currentUser && (
                <div 
                  style={styles.dropdownItem} 
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                >
                  Cerrar Sesión
                </div>
                )}
            </div>
          )}
        </div>
      </nav>

      <div style={styles.searchContainer}>
        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Buscar mangas, cómics..."
            style={styles.searchBar}
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleSearchSubmit}
            onFocus={() => searchQuery && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
          <FaSearch style={styles.searchIcon} />
          {showResults && searchResults.length > 0 && (
            <div style={styles.resultsDropdown}>
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  style={styles.resultItem}
                  onClick={() => handleResultClick(product.id)}
                >
                  <img 
                    src={product.images?.[0] || '/placeholder-image.jpg'} 
                    alt={product.title} 
                    style={styles.resultImage} 
                  />
                  <div style={styles.resultText}>
                    <div style={styles.resultTitle}>{product.title}</div>
                    <div style={styles.resultPrice}>${product.price}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={styles.iconsContainer}>
      <Link to="/wishlist" style={styles.iconLink}>
                    <FaHeart style={{ ...styles.icon, color: '#FFDC51' }} />
                    {wishlist.length > 0 && (
                        <span style={styles.badge}>{wishlist.length}</span>
                    )}
                </Link>
        <Link to="/cart" style={styles.iconLink}>
          <FaShoppingCart style={{ ...styles.icon, color: '#FFDC51' }}/>
        </Link>
        <Link to="/profile" style={styles.userIcon}>
          <img 
            src={userIcon} 
            alt="Usuario"
            style={styles.userImage}
          />
        </Link>
      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#000', 
    color: '#fff', 
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1000,
  },
  headerTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
  },
  nav: {
    display: 'flex',
    gap: '20px', 
    alignItems: 'center',
  },
  navLink: {
    color: '#fff', 
    textDecoration: 'none', 
    padding: '8px 12px',
    borderRadius: '5px', 
    transition: 'background-color 0.3s, color 0.3s', 
  },
  navLinkHover: {
    backgroundColor: '#fff', 
    color: '#000', 
    fontWeight: 'bold', 
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#000',
    borderRadius: '0 0 5px 5px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    minWidth: '150px',
    zIndex: 1000,
  },
  dropdownItem: {
    display: 'block',
    color: '#fff',
    padding: '10px 15px',
    textDecoration: 'none',
    transition: 'background-color 0.3s',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#333',
    },
  },
  searchContainer: {
    position: 'relative',
    flex: 1,
    maxWidth: '500px',
    margin: '0 20px',
  },
  searchWrapper: {
    position: 'relative',
  },
  searchBar: {
    padding: '10px 15px 10px 40px',
    borderRadius: '25px',
    border: 'none',
    backgroundColor: '#333',
    color: '#fff',
    outline: 'none',
    width: '100%',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    ':focus': {
      backgroundColor: '#fff',
      color: '#000',
      boxShadow: '0 0 5px rgba(255, 220, 81, 0.5)',
    },
  },
  searchIcon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFDC51',
  },
  resultsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#333',
    borderRadius: '0 0 10px 10px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    maxHeight: '400px',
    overflowY: 'auto',
    zIndex: 1001,
    marginTop: '5px',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #444',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#444',
    },
  },
  resultImage: {
    width: '40px',
    height: '50px',
    objectFit: 'cover',
    marginRight: '10px',
    borderRadius: '3px',
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  resultPrice: {
    color: '#FFDC51',
    fontSize: '12px',
  },
  iconsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  iconLink: {
    color: '#fff',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '24px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, color 0.3s ease',
    ':hover': {
      transform: 'scale(1.1)',
      color: '#FFDC51',
    }
  },
  userIcon: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  userImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%', 
    objectFit: 'cover',
    border: '2px solid #FFDC51',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'scale(1.1)',
    }
  },
  badge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '12px',
},
};

export default Header;