import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'; 

const AdminPanel = () => {
  const { currentUser, userRole, loading: authLoading, error: authError } = useAuth();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [dataLoading, setDataLoading] = useState(true);
  
  // Estados para formularios
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    imageName: '',
    category: '',       
    gender: ''          
  });
  const generateKeywords = (name) => {
    const words = name.toLowerCase().split(' ');
    const keywords = new Set();
    
    // Agrega palabras completas
    words.forEach(word => keywords.add(word));
    
    // Agrega combinaciones de palabras
    for (let i = 0; i < words.length; i++) {
      let phrase = words[i];
      keywords.add(phrase);
      for (let j = i + 1; j < words.length; j++) {
        phrase += ' ' + words[j];
        keywords.add(phrase);
      }
    }
    
    return Array.from(keywords);
  };
  
  const categories = ['Manga', 'Comic', 'Manwha', 'Novela Ligera'];
  const genders = ['Acción', 'Terror', 'Romance', 'Suspenso', 'Shoujo', 'Shounen', 'Seinen', 'Josei', 'Isekai', 'Fantasia', 'Aventura', 'Ciencia Ficción', 'Deportes', 'Drama', 'Comedia', 'Slice of Life'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProduct({
        ...product,
        imageName: file.name
      });
    }
  };
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    try {
      // Generar nuevos keywords si el nombre cambió
      const keywords = generateKeywords(editProduct.name);
      
      await updateDoc(doc(db, 'products', editProduct.id), {
        ...editProduct,
        price: parseFloat(editProduct.price),
        quantity: parseInt(editProduct.quantity),
        keywords: keywords // Actualizar keywords
      });
      
      alert('Producto actualizado correctamente');
      setEditProduct(null);
      await fetchProducts();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  };
  
  const [editProduct, setEditProduct] = useState(null);
  const [editUser, setEditUser] = useState(null);

  // Obtener usuarios
  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  // Obtener productos
  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!authLoading && userRole === 'admin') {
      setDataLoading(true);
      Promise.all([fetchUsers(), fetchProducts()])
        .then(() => setDataLoading(false))
        .catch(error => {
          console.error("Error fetching data:", error);
          setDataLoading(false);
        });
    }
  }, [authLoading, userRole]);

  // Manejar cierre de sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Agregar nuevo producto
  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    try {
      const keywords = generateKeywords(product.name);
      await addDoc(collection(db, 'products'), {
        ...product,
        price: parseFloat(product.price),
        quantity: parseInt(product.quantity),
        images: [`/assets/ProdImgs/${product.imageName}`],
        category: product.category,
        gender: product.gender,
        keywords: keywords 
      });
      
      alert(`Por favor, coloca manualmente la imagen ${product.imageName} en public/assets/ProdImgs/`);
      
      // Resetear el formulario
      setProduct({
        name: '',
        description: '',
        price: '',
        quantity: '',
        imageName: '',
        category: '',  
        gender: ''   
      });
      await fetchProducts();
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  };

  // Actualizar usuario
  const handleUpdateUser = async (userId, newRole) => {
    try {
      // Verificación adicional de permisos
      if (userRole !== 'admin') {
        throw new Error("No tienes permisos para esta acción");
      }
      
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
      await fetchUsers();
      setEditUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert(error.message);
    }
  };

  // Verificación de acceso mejorada
  if (authLoading) {
    return <div style={styles.loading}>Verificando autenticación...</div>;
  }

  if (authError) {
    return <div style={styles.accessDenied}>Error de autenticación: {authError}</div>;
  }

  if (!currentUser || userRole !== 'admin') {
    return (
      <div style={styles.accessDenied}>
        Acceso denegado. Solo para administradores.
        {currentUser && <p>Tu rol actual es: {userRole}</p>}
      </div>
    );
  }

  if (dataLoading) {
    return <div style={styles.loading}>Cargando datos del panel...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Barra superior con botón de cerrar sesión */}
      <div style={styles.adminHeader}>
        <h2>Panel de Administración</h2>
        <div>
          <span style={{ marginRight: '10px' }}>{currentUser.email}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Pestañas */}
      <div style={styles.tabs}>
        <button 
          style={{ 
            ...styles.tabButton, 
            ...(activeTab === 'users' && styles.activeTab) 
          }}
          onClick={() => setActiveTab('users')}
        >
          Usuarios
        </button>
        <button 
          style={{ 
            ...styles.tabButton, 
            ...(activeTab === 'products' && styles.activeTab) 
          }}
          onClick={() => setActiveTab('products')}
        >
          Productos
        </button>
      </div>

      {/* Contenido de las pestañas */}
      <div style={styles.content}>
        {activeTab === 'users' ? (
          <div style={styles.section}>
            <h3>Lista de Usuarios</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Nombre</th>
                  <th style={styles.tableHeader}>Email</th>
                  <th style={styles.tableHeader}>Rol</th>
                  <th style={styles.tableHeader}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name || 'N/A'}</td>
                    <td>{user.email}</td>
                    <td>
                      {editUser === user.id ? (
                        <select 
                          value={user.role}
                          onChange={(e) => handleUpdateUser(user.id, e.target.value)}
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Administrador</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </td>
                    <td>
                      {editUser === user.id ? (
                        <>
                          <button 
                            onClick={() => setEditUser(null)}
                            style={styles.cancelButton}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setEditUser(user.id)}
                          style={styles.editButton}
                        >
                          Editar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.section}>
            <div style={styles.productForms}>
              {/* Formulario para agregar producto */}
              <form onSubmit={handleAddProduct} style={styles.form}>
                <h3>Agregar Nuevo Producto</h3>
                <div style={styles.formGroup}>
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => setProduct({...product, name: e.target.value})}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Descripción:</label>
                  <textarea
                    value={product.description}
                    onChange={(e) => setProduct({...product, description: e.target.value})}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Precio:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={product.price}
                    onChange={(e) => setProduct({...product, price: e.target.value})}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Cantidad:</label>
                  <input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => setProduct({...product, quantity: e.target.value})}
                    required
                  />
                </div>
                {/* Nuevo campo: Categoría */}
  <div style={styles.formGroup}>
    <label>Categoría:</label>
    <select
      value={product.category}
      onChange={(e) => setProduct({...product, category: e.target.value})}
      required
    >
      <option value="">Seleccione una categoría</option>
      {categories.map((cat, index) => (
        <option key={index} value={cat}>{cat}</option>
      ))}
    </select>
  </div>

  {/* Nuevo campo: Género */}
  <div style={styles.formGroup}>
    <label>Género:</label>
    <select
      value={product.gender}
      onChange={(e) => setProduct({...product, gender: e.target.value})}
      required
    >
      <option value="">Seleccione un género</option>
      {genders.map((gen, index) => (
        <option key={index} value={gen}>{gen}</option>
      ))}
    </select>
  </div>
                <div style={styles.formGroup}>
                  <label>Imágenes:</label>
                  <input 
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    />
                </div>
                <button type="submit" style={styles.submitButton}>
                  Agregar Producto
                </button>
              </form>

              {/* Formulario para editar producto (aparece cuando editProduct no es null) */}
              {editProduct && (
                <form onSubmit={handleUpdateProduct} style={styles.form}>
                <h3>Editar Producto</h3>
                
                <div style={styles.formGroup}>
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={editProduct.name}
                    onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label>Descripción:</label>
                  <textarea
                    value={editProduct.description}
                    onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label>Precio:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editProduct.price}
                    onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label>Cantidad:</label>
                  <input
                    type="number"
                    value={editProduct.quantity}
                    onChange={(e) => setEditProduct({...editProduct, quantity: e.target.value})}
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label>Categoría:</label>
                  <select
                    value={editProduct.category}
                    onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}
                    required
                  >
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formGroup}>
                  <label>Género:</label>
                  <select
                    value={editProduct.gender}
                    onChange={(e) => setEditProduct({...editProduct, gender: e.target.value})}
                    required
                  >
                    {genders.map((gen, index) => (
                      <option key={index} value={gen}>{gen}</option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formActions}>
                  <button type="submit" style={styles.submitButton}>
                    Actualizar
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditProduct(null)}
                    style={styles.cancelButton}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
              )}
            </div>

            {/* Lista de productos */}
            <div style={styles.productList}>
              <h3>Lista de Productos</h3>
              <div style={styles.productsGrid}>
                {products.map(product => (
                  <div key={product.id} style={styles.productCard}>
                    {product.images?.[0] && (
  <img 
    src={product.images[0]} 
    alt={product.name}
    style={styles.productImage}
  />
)}
                    <h4>{product.name}</h4>
                    <p>{product.description}</p>
                    <p>Precio: ${product.price}</p>
                    <p>Stock: {product.quantity}</p>
                    <p>Categoría: {product.category}</p>  {/* Nuevo campo mostrado */}
                    <p>Género: {product.gender}</p>       {/* Nuevo campo mostrado */}
                    <div style={styles.productActions}>
                      <button 
                        onClick={() => setEditProduct(product)}
                        style={styles.editButton}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm('¿Eliminar este producto?')) {
                            await deleteDoc(doc(db, 'products', product.id));
                            await fetchProducts();
                          }
                        }}
                        style={styles.deleteButton}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Estilos
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  adminHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#333',
    color: 'white',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#FF8000',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #ddd',
  },
  tabButton: {
    padding: '10px 20px',
    backgroundColor: '#f1f1f1',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
  activeTab: {
    backgroundColor: '#ddd',
    fontWeight: 'bold',
  },
  content: {
    padding: '20px',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  tableHeader: {
    backgroundColor: '#f2f2f2',
    padding: '12px',
    textAlign: 'left',
  },
  tableCell: {
    padding: '12px',
    borderBottom: '1px solid #ddd',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  submitButton: {
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '6px 12px',
    backgroundColor: '#FF8000',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  productForms: {
    marginBottom: '30px',
  },
  productList: {
    marginTop: '30px',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  productCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  productActions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  accessDenied: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '24px',
    color: 'red',
  },
  loading: {
    textAlign: 'center',
    padding: '50px',
    fontSize: '24px',
  },
};

export default AdminPanel;