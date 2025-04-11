import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>403 - Acceso no autorizado</h1>
      <p>No tienes permisos para acceder a esta página</p>
      <button onClick={() => navigate(-1)}>Volver atrás</button>
      <button onClick={() => navigate('/home')}>Ir al inicio</button>
    </div>
  );
};

export default Unauthorized;