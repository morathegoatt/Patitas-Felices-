// src/components/AgendarCita.js (ACTUALIZADO CON ID AUTOMÁTICO)
import React, { useState } from 'react';
import axios from 'axios';

// 1. Recibimos el ID del dueño logueado como un "prop"
function AgendarCita({ idDueñoLogueado }) { 

  const [mascotaData, setMascotaData] = useState({
    nombre: '',
    especie: 'Perro',
    raza: '',
    fecha_nacimiento: '',
    sexo: 'M',
    // El id_dueño ya no es un campo de texto, viene del prop
  });

  const [citaData, setCitaData] = useState({
    fecha: '',
    hora: '',
    motivo: ''
  });

  const handleMascotaChange = (e) => {
    setMascotaData({ ...mascotaData, [e.target.name]: e.target.value });
  };

  const handleCitaChange = (e) => {
    setCitaData({ ...citaData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Registro de la mascota
     const mascotaPayload = {
  ...mascotaData,
  id_dueño: idDueñoLogueado, //  Usamos el ID del prop
  fecha_nacimiento: mascotaData.fecha_nacimiento === '' ? null : mascotaData.fecha_nacimiento
};

      const resMascota = await axios.post('https://patitas-felices-backend-2ocz.onrender.com/api/mascotas/registro', mascotaPayload);
      const nuevaMascota = resMascota.data;

      alert(`Mascota registrada: ${nuevaMascota.nombre} (ID: ${nuevaMascota.id_mascota})`);

      // --- PASO 2: Agendar la Cita ---
      const citaPayload = {
        ...citaData,
        id_mascota: nuevaMascota.id_mascota 
      };

      const resCita = await axios.post('https://patitas-felices-backend-2ocz.onrender.com/api/citas/agendar', citaPayload);
      const nuevaCita = resCita.data;

      alert(`¡Cita agendada con éxito para el ${nuevaCita.fecha} a las ${nuevaCita.hora}!`);

      // Limpiar formularios
      setMascotaData({ nombre: '', especie: 'Perro', raza: '', fecha_nacimiento: '', sexo: 'M' });
      setCitaData({ fecha: '', hora: '', motivo: '' });

    } catch (err) {
      console.error(err);
      if (err.response) {
        alert('Error en el proceso: ' + err.response.data.error);
      } else if (err.request) {
        alert('Error: No se puede conectar al servidor.');
      } else {
        alert('Error: ' + err.message);
  }
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '20px' }}>
      <h2>Agendar Cita (Registrando Nueva Mascota)</h2>
      <form onSubmit={handleSubmit}>

        {/* 3. HEMOS ELIMINADO EL CAMPO "ID del Dueño" */}

        <h4>Datos de la Mascota</h4>
        <div style={{ marginBottom: '10px' }}>
          <label>Nombre Mascota: </label>
          <input type="text" name="nombre" value={mascotaData.nombre} onChange={handleMascotaChange} required />
        </div>
        {/* Aquí puedes añadir más campos para especie, raza, etc. */}

        <h4>Datos de la Cita</h4>
        <div style={{ marginBottom: '10px' }}>
          <label>Fecha: </label>
          <input type="date" name="fecha" value={citaData.fecha} onChange={handleCitaChange} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Hora: </label>
          <input type="time" name="hora" value={citaData.hora} onChange={handleCitaChange} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Motivo: </label>
          <input type="text" name="motivo" value={citaData.motivo} onChange={handleCitaChange} required />
        </div>

        <button type="submit">Registrar Mascota y Agendar Cita</button>
      </form>
    </div>
  );
}

export default AgendarCita;