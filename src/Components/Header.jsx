import React, { useState } from 'react';

// Componente Header
const Header = () => {
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleHover = (link) => {
    setHoveredLink(link);
  };

  const handleHoverEnd = () => {
    setHoveredLink(null);
  };

  return (
    <header style={styles.header}>
      <h1 style={styles.headerTitle}>Neo-Manga</h1>
      <nav style={styles.nav}>
        <a
          href="/"
          style={{
            ...styles.navLink,
            ...(hoveredLink === 'inicio' && styles.navLinkHover),
          }}
          onMouseEnter={() => handleHover('inicio')}
          onMouseLeave={handleHoverEnd}
        >
          Inicio
        </a>
        <a
          href="/mangas"
          style={{
            ...styles.navLink,
            ...(hoveredLink === 'mangas' && styles.navLinkHover),
          }}
          onMouseEnter={() => handleHover('mangas')}
          onMouseLeave={handleHoverEnd}
        >
          Mangas
        </a>
        <a
          href="/comics"
          style={{
            ...styles.navLink,
            ...(hoveredLink === 'comics' && styles.navLinkHover),
          }}
          onMouseEnter={() => handleHover('comics')}
          onMouseLeave={handleHoverEnd}
        >
          Comics
        </a>
        <a
          href="/preventas"
          style={{
            ...styles.navLink,
            ...(hoveredLink === 'preventas' && styles.navLinkHover),
          }}
          onMouseEnter={() => handleHover('preventas')}
          onMouseLeave={handleHoverEnd}
        >
          Preventas
        </a>
        <div style={styles.dropdown}>
          <a
            href="/mas"
            style={{
              ...styles.navLink,
              ...(hoveredLink === 'mas' && styles.navLinkHover),
            }}
            onMouseEnter={() => handleHover('mas')}
            onMouseLeave={handleHoverEnd}
          >
            Más
          </a>
        </div>
      </nav>

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar..."
          style={styles.searchBar}
        />
      </div>

      <div style={styles.userIcon}>
        <div style={styles.userCircle}></div>
      </div>
    </header>
  );
};

export default Header;

// Estilos
const styles = {
  header: {
    backgroundColor: '#000', 
    color: '#fff', 
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  dropdown: {
    position: 'relative',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '10px', 
  },
  searchBar: {
    padding: '8px 12px',
    borderRadius: '20px', 
    border: 'none',
    backgroundColor: '#949494', 
    color: '#fff', 
    outline: 'none', 
    width: '200px', 
  },
  userIcon: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '10px',
  },
  userCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%', 
    backgroundColor: '#fff', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000', 
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};