import React, { useState } from 'react';
import axios from 'axios';

/**
 * Formulario de registro para nuevos dueños de mascotas.
 * Envía los datos a la API y gestiona la respuesta del servidor.
 */
function RegistroCliente() {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('https://patitas-felices-backend-2ocz.onrender.com/api/clientes/registro', formData);
      
      alert(`¡Bienvenido ${res.data.nombre}! Tu cuenta ha sido creada. Ahora puedes iniciar sesión.`);
      
      // Limpiamos el formulario para evitar duplicados accidentales
      setFormData({ nombre: '', direccion: '', telefono: '', email: '', password: '' });

    } catch (err) {
      console.error("Error durante el registro:", err);
      // Mensaje de error amigable para el usuario
      const errorMsg = err.response?.data?.error || 'No se pudo conectar con el servidor. Intenta más tarde.';
      alert(errorMsg);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Nombre Completo</label>
          <input 
            type="text" name="nombre" 
            value={formData.nombre} onChange={handleChange} required 
            style={styles.input}
          />
        </div>

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

        <div style={styles.formGroup}>
          <label style={styles.label}>Dirección</label>
          <input 
            type="text" name="direccion" 
            value={formData.direccion} onChange={handleChange} 
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Teléfono</label>
          <input 
            type="text" name="telefono" 
            value={formData.telefono} onChange={handleChange} 
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>Registrarse</button>
      </form>
    </div>
  );
}

// Estilos encapsulados para mantener el componente ordenado
const styles = {
  container: { 
    padding: '25px', 
    border: '1px solid #e0e0e0', 
    borderRadius: '10px', 
    backgroundColor: '#fff',
    maxWidth: '400px',
    margin: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: '500', color: '#555' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' },
  button: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: '#007bff', 
    color: 'white', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    fontSize: '16px',
    fontWeight: 'bold' 
  }
};

export default RegistroCliente;