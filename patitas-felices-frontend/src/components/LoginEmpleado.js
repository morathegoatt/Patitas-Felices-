import React, { useState } from 'react';
import axios from 'axios';

/**
 * Portal de acceso administrativo para veterinarios y empleados.
 * Gestiona la autenticación del personal interno.
 */
const LoginEmpleado = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Petición al endpoint de empleados
      const res = await axios.post('https://patitas-felices-backend-2ocz.onrender.com/api/auth/login-empleado', formData);
      const { token, nombre } = res.data;

      // Feedback de éxito
      alert(`Bienvenido al sistema, Dr/a. ${nombre}.`);
      onLoginSuccess(token);

    } catch (err) {
      console.error('Error de acceso administrativo:', err);
      const errorMsg = err.response?.data?.error || 'No se pudo conectar con el servidor.';
      alert(errorMsg);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Portal Personal</h2>
      <form onSubmit={handleSubmit}>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Email Corporativo</label>
          <input 
            type="email" name="email" 
            value={formData.email} onChange={handleChange} required 
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Contraseña</label>
          <input 
            type="password" name="password" 
            value={formData.password} onChange={handleChange} required 
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>Acceso Administrativo</button>
      </form>
    </div>
  );
};

// Estilos encapsulados (Tema oscuro/corporativo para diferenciar del cliente)
const styles = {
  container: { 
    padding: '25px', 
    border: '1px solid #c3c3c3', 
    borderRadius: '8px', 
    backgroundColor: '#f4f4f4', // Fondo gris claro
    maxWidth: '350px',
    margin: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  title: { textAlign: 'center', color: '#333', marginTop: 0 },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', color: '#333', fontSize: '0.9em', fontWeight: 'bold' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' },
  button: { 
    width: '100%', 
    padding: '10px', 
    backgroundColor: '#4a4a4a', // Botón gris oscuro
    color: 'white', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  }
};

export default LoginEmpleado;