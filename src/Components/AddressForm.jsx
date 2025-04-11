import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveAddressToFirestore, getUserAddresses } from '../services/addressService';
import { FaCheck } from 'react-icons/fa';

const AddressForm = ({ onSuccess, onCancel, initialAddress }) => {
  const { currentUser } = useAuth();
  const [address, setAddress] = useState(initialAddress || {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'México',
    phone: '',
    references: '',
    isDefault: true
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAddresses = async () => {
      if (currentUser) {
        try {
          const addresses = await getUserAddresses(currentUser.uid);
          setSavedAddresses(addresses);
          setLoadingAddresses(false);
        } catch (error) {
          console.error("Error al cargar direcciones:", error);
          setLoadingAddresses(false);
        }
      }
    };
    
    fetchAddresses();
  }, [currentUser]);

  const validate = () => {
    const newErrors = {};
    if (!address.street) newErrors.street = 'La calle es requerida';
    if (!address.city) newErrors.city = 'La ciudad es requerida';
    if (!address.state) newErrors.state = 'El estado es requerido';
    if (!address.zipCode) newErrors.zipCode = 'El código postal es requerido';
    if (!address.phone) newErrors.phone = 'El teléfono es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await saveAddressToFirestore(currentUser.uid, address);
      // Actualizar la lista de direcciones después de guardar
      const addresses = await getUserAddresses(currentUser.uid);
      setSavedAddresses(addresses);
      onSuccess(address); // Pasamos la dirección guardada
    } catch (error) {
      console.error("Error al guardar dirección:", error);
      setErrors({ submit: 'Error al guardar la dirección. Intenta nuevamente.' });
    }
  };
  const handleSelectAddress = (selectedAddress) => {
    setAddress(selectedAddress);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        {/* Título - Fuera del scroll */}
        <h3 style={styles.title}>Agrega tu dirección de envío</h3>
  
        {/* Área con scroll - Todo el contenido desplazable va aquí */}
        <div style={styles.scrollContainer}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Campos del formulario */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Calle y número*</label>
              <input
                type="text"
                placeholder="Ej. Av. Revolución 123"
                value={address.street}
                onChange={(e) => setAddress({...address, street: e.target.value})}
                style={styles.input}
                required
              />
              {errors.street && <span style={styles.error}>{errors.street}</span>}
            </div>
  
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Ciudad*</label>
                <input
                  type="text"
                  placeholder="Ej. Ciudad de México"
                  value={address.city}
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                  style={styles.input}
                  required
                />
                {errors.city && <span style={styles.error}>{errors.city}</span>}
              </div>
  
              <div style={styles.formGroup}>
                <label style={styles.label}>Estado*</label>
                <input
                  type="text"
                  placeholder="Ej. CDMX"
                  value={address.state}
                  onChange={(e) => setAddress({...address, state: e.target.value})}
                  style={styles.input}
                  required
                />
                {errors.state && <span style={styles.error}>{errors.state}</span>}
              </div>
            </div>
  
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Código Postal*</label>
                <input
                  type="text"
                  placeholder="Ej. 06700"
                  value={address.zipCode}
                  onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                  style={styles.input}
                  required
                />
                {errors.zipCode && <span style={styles.error}>{errors.zipCode}</span>}
              </div>
  
              <div style={styles.formGroup}>
                <label style={styles.label}>País</label>
                <input
                  type="text"
                  value={address.country}
                  onChange={(e) => setAddress({...address, country: e.target.value})}
                  style={styles.input}
                  disabled
                />
              </div>
            </div>
  
            <div style={styles.formGroup}>
              <label style={styles.label}>Teléfono*</label>
              <input
                type="tel"
                placeholder="Ej. 5512345678"
                value={address.phone}
                onChange={(e) => setAddress({...address, phone: e.target.value})}
                style={styles.input}
                required
              />
              {errors.phone && <span style={styles.error}>{errors.phone}</span>}
            </div>
  
            <div style={styles.formGroup}>
              <label style={styles.label}>Referencias</label>
              <textarea
                placeholder="Ej. Entre calles X y Y, color de la casa, etc."
                value={address.references}
                onChange={(e) => setAddress({...address, references: e.target.value})}
                style={{...styles.input, minHeight: '80px'}}
              />
            </div>
  
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="defaultAddress"
                checked={address.isDefault}
                onChange={(e) => setAddress({...address, isDefault: e.target.checked})}
                style={styles.checkbox}
              />
              <label htmlFor="defaultAddress" style={styles.checkboxLabel}>
                Usar como dirección principal
              </label>
            </div>
  
            {/* Listado de direcciones guardadas */}
            <div style={styles.savedAddressesSection}>
              <h4 style={styles.savedAddressesTitle}>Tus direcciones guardadas</h4>
              
              {loadingAddresses ? (
                <p>Cargando direcciones...</p>
              ) : savedAddresses.length === 0 ? (
                <p>No tienes direcciones guardadas</p>
              ) : (
                <div style={styles.addressList}>
                  {savedAddresses.map((addr, index) => (
                    <div 
                      key={index} 
                      style={{
                        ...styles.addressItem,
                        ...(address.street === addr.street && address.zipCode === addr.zipCode ? styles.selectedAddress : {})
                      }}
                      onClick={() => handleSelectAddress(addr)}
                    >
                      <div style={styles.addressText}>
                        <p><strong>{addr.street}</strong></p>
                        <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                        <p>{addr.country}</p>
                        <p>Tel: {addr.phone}</p>
                        {addr.references && <p>Referencias: {addr.references}</p>}
                        {addr.isDefault && <p style={styles.defaultBadge}>PRINCIPAL</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
        {/* Fin del área con scroll */}
  
        {/* Mensajes de error - Fuera del scroll */}
        {errors.submit && <div style={styles.submitError}>{errors.submit}</div>}
  
        {/* Botones - Fuera del scroll */}
        <div style={styles.buttonGroup}>
          <button 
            type="button" 
            onClick={onCancel}
            style={styles.cancelButton}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            style={styles.submitButton}
            onClick={handleSubmit}
          >
            <FaCheck style={{ marginRight: '8px' }} />
            Guardar dirección
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '30px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh', // Altura máxima del 90% del viewport
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  scrollContainer: {
    overflowY: 'auto',
    flex: 1,
    marginBottom: '20px',
    paddingRight: '10px', 
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formRow: {
    display: 'flex',
    gap: '20px',
  },
  formGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    width: '100%',
    ':focus': {
      outline: 'none',
      borderColor: '#000',
    },
  },
  error: {
    color: '#ff4444',
    fontSize: '12px',
    marginTop: '4px',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '10px 0',
  },
  checkbox: {
    width: '18px',
    height: '18px',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#555',
  },
  submitError: {
    color: '#ff4444',
    textAlign: 'center',
    margin: '10px 0',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '20px',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#e0e0e0',
    },
  },
  submitButton: {
    backgroundColor: '#000',
    color: '#FFDC51',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.3s',
    ':hover': {
      backgroundColor: '#333',
    },
  },
  savedAddressesSection: {
    marginTop: '30px',
    borderTop: '1px solid #eee',
    paddingTop: '20px',
  },
  savedAddressesTitle: {
    fontSize: '18px',
    marginBottom: '15px',
    color: '#333',
  },
  addressList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    maxHeight: '200px',
    overflowY: 'auto',
    padding: '5px',
  },
  addressItem: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      borderColor: '#000',
      backgroundColor: '#f9f9f9',
    },
  },
  selectedAddress: {
    borderColor: '#000',
    backgroundColor: '#f0f0f0',
  },
  addressText: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.5',
  },
  defaultBadge: {
    display: 'inline-block',
    backgroundColor: '#000',
    color: '#FFDC51',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    marginTop: '8px',
  },
};

export default AddressForm;