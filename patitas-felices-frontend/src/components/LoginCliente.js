import React, { useState } from 'react';
import axios from 'axios';

/**
 * Componente de acceso para dueños de mascotas.
 * Gestiona la autenticación y devuelve el token al componente principal.
 */
const LoginCliente = ({ onLoginSuccess }) => {
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
      const res = await axios.post('https://patitas-felices-backend-2ocz.onrender.com/api/auth/login-cliente', formData);
      const { token, nombre } = res.data;

      // Notificación de éxito y elevación del estado (token) a App.js
      alert(`¡Bienvenido de nuevo, ${nombre}!`);
      onLoginSuccess(token);

    } catch (err) {
      console.error('Error de autenticación:', err);
      const errorMsg = err.response?.data?.error || 'No se pudo conectar con el servidor.';
      alert(errorMsg);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Acceso Clientes</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Correo Electrónico</label>
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
        <button type="submit" style={styles.button}>Entrar</button>
      </form>
    </div>
  );
};

const styles = {
  container: { 
    padding: '25px', 
    border: '1px solid #ddd', 
    borderRadius: '8px', 
    backgroundColor: '#fff',
    maxWidth: '350px',
    margin: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  title: { textAlign: 'center', color: '#007bff', marginTop: 0 },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', color: '#555', fontSize: '0.9em' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' },
  button: { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default LoginCliente;