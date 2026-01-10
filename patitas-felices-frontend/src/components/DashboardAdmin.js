import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Modal para registrar diagnóstico médico y tratamiento.
 * Permite agregar múltiples líneas de medicamentos dinámicamente.
 */
const ModalConsulta = ({ cita, idVeterinario, onClose, onSuccess }) => {
  const [diagnostico, setDiagnostico] = useState('');
  const [notas, setNotas] = useState('');
  const [medicamentos, setMedicamentos] = useState([
    { num_linea: 1, nombre_farmaco: '', dosis: '', frecuencia: '' }
  ]);

  const handleMedChange = (index, e) => {
    const nuevosMeds = [...medicamentos];
    nuevosMeds[index][e.target.name] = e.target.value;
    setMedicamentos(nuevosMeds);
  };

  const agregarMedicamento = () => {
    setMedicamentos([
      ...medicamentos,
      { num_linea: medicamentos.length + 1, nombre_farmaco: '', dosis: '', frecuencia: '' }
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id_cita: cita.id_cita,
        id_veterinario: idVeterinario,
        diagnostico,
        notas,
        // Filtramos entradas vacías para no enviar basura a la BD
        medicamentos: medicamentos.filter(m => m.nombre_farmaco.trim() !== '') 
      };

      await axios.post('https://patitas-felices-backend-2ocz.onrender.com/api/admin/consulta-completa', payload);

      alert('Consulta y tratamiento registrados exitosamente.');
      onSuccess(); // Recarga la tabla padre y cierra el modal

    } catch (err) {
      console.error(err);
      alert('Error al guardar consulta: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="modal-overlay" style={styles.overlay}>
      <div className="modal-content" style={styles.modal}>
        <h2>Atender Paciente: {cita.nombre_mascota}</h2>
        <p><strong>Dueño:</strong> {cita.nombre_dueño} | <strong>Motivo:</strong> {cita.motivo}</p>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label>Diagnóstico:</label>
            <input 
              type="text" value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} 
              required style={styles.inputFull} 
            />
          </div>
          
          <div style={styles.formGroup}>
            <label>Notas Clínicas:</label>
            <textarea 
              value={notas} onChange={(e) => setNotas(e.target.value)} 
              style={styles.textarea}
            />
          </div>

          <hr />
          <h4>Receta Médica</h4>
          {medicamentos.map((med, index) => (
            <div key={index} style={styles.medRow}>
              <input name="nombre_farmaco" placeholder="Fármaco" value={med.nombre_farmaco} onChange={(e) => handleMedChange(index, e)} style={styles.inputMed} />
              <input name="dosis" placeholder="Dosis" value={med.dosis} onChange={(e) => handleMedChange(index, e)} style={styles.inputMed} />
              <input name="frecuencia" placeholder="Frecuencia" value={med.frecuencia} onChange={(e) => handleMedChange(index, e)} style={styles.inputMed} />
            </div>
          ))}
          
          <button type="button" onClick={agregarMedicamento} style={styles.btnAdd}>+ Agregar Medicamento</button>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.btnCancel}>Cancelar</button>
            <button type="submit" style={styles.btnSave}>Finalizar Consulta</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Tabla de gestión de clientes registrados.
 */
const ListaClientes = () => {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await axios.get('https://patitas-felices-backend-2ocz.onrender.com/api/admin/clientes');
        setClientes(res.data);
      } catch (error) {
        console.error("Error cargando clientes", error);
      }
    };
    fetchClientes();
  }, []);

  return (
    <div style={styles.section}>
      <h3>Directorio de Clientes</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id_dueño}>
              <td>{c.id_dueño}</td>
              <td>{c.nombre}</td>
              <td>{c.email}</td>
              <td>{c.telefono || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Tabla de citas pendientes y gestión de atención.
 */
const ListaCitas = ({ idVeterinario }) => {
  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  const fetchCitas = async () => {
    try {
      const res = await axios.get('https://patitas-felices-backend-2ocz.onrender.com/api/admin/citas');
      setCitas(res.data);
    } catch (err) {
      console.error('Error al cargar agenda:', err);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  const handleSuccess = () => {
    setCitaSeleccionada(null);
    fetchCitas(); // Refrescar lista tras atender
  };

  return (
    <div style={styles.section}>
      <h3>Agenda del Día (Pendientes)</h3>
      {citas.length === 0 ? <p>No hay citas pendientes.</p> : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Dueño</th>
              <th>Motivo</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {citas.map(cita => (
              <tr key={cita.id_cita}>
                <td>{cita.fecha.split('T')[0]} {cita.hora}</td>
                <td>{cita.nombre_mascota}</td>
                <td>{cita.nombre_dueño}</td>
                <td>{cita.motivo}</td>
                <td>
                  <button onClick={() => setCitaSeleccionada(cita)} style={styles.btnAction}>
                    Atender
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {citaSeleccionada && (
        <ModalConsulta
          cita={citaSeleccionada}
          idVeterinario={idVeterinario}
          onClose={() => setCitaSeleccionada(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

const DashboardAdmin = ({ user }) => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
        <h2>Panel Médico Veterinario</h2>
        <span style={{ color: '#666' }}>Sesión activa: Dr/a. {user.nombre} (ID: {user.id})</span>
      </header>

      <ListaCitas idVeterinario={user.id} />
      <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />
      <ListaClientes />
    </div>
  );
};

// Estilos simples en objeto para mantener el archivo limpio
const styles = {
  section: { marginBottom: '30px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' },
  formGroup: { marginBottom: '15px' },
  inputFull: { width: '100%', padding: '8px', marginTop: '5px' },
  textarea: { width: '100%', height: '80px', padding: '8px', marginTop: '5px' },
  medRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  inputMed: { flex: 1, padding: '8px' },
  btnAdd: { backgroundColor: '#e9ecef', border: '1px solid #ced4da', padding: '5px 10px', cursor: 'pointer', marginBottom: '20px' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
  btnCancel: { padding: '10px 20px', cursor: 'pointer', background: 'none', border: '1px solid #ccc' },
  btnSave: { padding: '10px 20px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none' },
  btnAction: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }
};

export default DashboardAdmin;