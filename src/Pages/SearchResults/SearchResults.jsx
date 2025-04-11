// src/pages/SearchResults.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { searchProducts } from '../../services/productService';
//import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const products = await searchProducts(searchQuery);
        setResults(products);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchResults();
    }
  }, [searchQuery]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Resultados de búsqueda para: "{searchQuery}"</h2>
      
      {loading ? (
        <div style={styles.loading}>Buscando productos...</div>
      ) : results.length > 0 ? (
        <div style={styles.resultsGrid}>
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div style={styles.noResults}>
          <p>No se encontraron productos que coincidan con tu búsqueda.</p>
          <Link to="/mangas" style={styles.browseLink}>
            Ver todos los productos
          </Link>
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
  title: {
    color: '#FFDC51',
    marginBottom: '30px',
    textAlign: 'center',
  },
  loading: {
    textAlign: 'center',
    color: '#fff',
    fontSize: '18px',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  noResults: {
    textAlign: 'center',
    color: '#fff',
    fontSize: '18px',
    padding: '40px 0',
  },
  browseLink: {
    color: '#FFDC51',
    textDecoration: 'none',
    fontWeight: 'bold',
    marginTop: '20px',
    display: 'inline-block',
    ':hover': {
      textDecoration: 'underline',
    },
  },
};

export default SearchResults;