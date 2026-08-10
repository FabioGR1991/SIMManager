import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, History, Trash2, Plus, X } from "lucide-react";
import movilTandemImg from '../assets/moviltandem.png';
import DeviceEditModal from './DeviceEditModal';

export default function DevicesView({ API_URL, token, simcards = [] }) {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [formData, setFormData] = useState({ id: null, model: '', sim1_phone: '', sim2_phone: 'NO_TIENE', status: 'ACTIVO' });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await axios.get(`${API_URL}/devices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevices(res.data);
      if (res.data.length > 0 && !selectedDevice) {
        setSelectedDevice(res.data[0]);
      }
    } catch (err) {
      console.error('Error al obtener dispositivos', err);
    }
  };

  const handleOpenHistory = async (device) => {
    setSelectedDevice(device);
    try {
      const res = await axios.get(`${API_URL}/devices/${device.id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeviceHistory(res.data);
    } catch (err) {
      console.error('Error al obtener historial:', err);
      setDeviceHistory([
        { id: 1, date: new Date().toLocaleDateString(), action: 'Registro inicial', details: `Dispositivo ${device.model} creado` }
      ]);
    }
    setShowHistoryModal(true);
  };

  const handleSaveDevice = async (e) => {
    e.preventDefault();

    const payload = {
      model: formData.model?.trim(),
      sim1_phone: formData.sim1_phone?.trim() || null,
      sim2_phone: formData.sim2_phone?.trim() || 'NO_TIENE',
      status: formData.status
    };

    try {
      if (formData.id) {
        await axios.put(`${API_URL}/devices/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/devices`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowModal(false);
      fetchDevices();
    } catch (err) {
      console.error('Error en la petición de dispositivo:', err.response?.data || err);
      const serverMessage = err.response?.data?.error || err.response?.data?.message;
      alert(serverMessage ? `Error: ${serverMessage}` : 'Error al guardar dispositivo.');
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!window.confirm('¿Deseas eliminar este dispositivo del inventario?')) return;
    try {
      await axios.delete(`${API_URL}/devices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDevices();
      if (selectedDevice?.id === id) {
        setSelectedDevice(null);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar el dispositivo');
    }
  };

  return (
    <div style={{ padding: '15px' }}>
      
      {/* CABECERA SECCIÓN */}
      <div className="devices-header">
        <h2 className="devices-title">Dispositivos Inventariados</h2>
        <button 
          className="btn-primary" 
          onClick={() => {
            setFormData({ id: null, model: '', sim1_phone: '', sim2_phone: 'NO_TIENE', status: 'ACTIVO' });
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Nuevo Dispositivo
        </button>
      </div>

      {/* TARJETA VISTA PREVIA */}
      <div className="device-card">
        {selectedDevice ? (
          <div className="device-info-wrapper">
            <div className="device-icon-box">
              <img 
                src={movilTandemImg} 
                alt="Móvil Tandem" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>

            <div className="device-details">
              <div className="device-title-row">
                <span className="badge-id">#{selectedDevice.id}</span>
                <h3 className="device-model">{selectedDevice.model}</h3>
              </div>

              <div className="sim-row">
                <span className="sim-label">SIM 1</span>
                <span className={selectedDevice.sim1_phone ? "sim-value-active" : "sim-value-empty"}>
                  {selectedDevice.sim1_phone || 'Sin Asignar'}
                </span>
              </div>

              <div className="sim-row">
                <span className="sim-label">SIM 2</span>
                <span className={selectedDevice.sim2_phone && selectedDevice.sim2_phone !== 'NO_TIENE' ? "sim-value-active" : "sim-value-empty"}>
                  {selectedDevice.sim2_phone === 'NO_TIENE' ? 'No Tiene / N/A' : (selectedDevice.sim2_phone || 'Sin Asignar')}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: '#64748b', fontStyle: 'italic', padding: '10px 0' }}>
            Selecciona un dispositivo de la lista inferior para ver el detalle.
          </p>
        )}
      </div>

      {/* TABLA DE DISPOSITIVOS */}
      <div className="table-container" style={{ marginTop: '20px' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>MODELO</th>
              <th>SIM CARD 1</th>
              <th>SIM CARD 2</th>
              <th>ESTADO</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id}>
                <td style={{ fontWeight: 'bold' }}>#{device.id}</td>
                <td 
                  onClick={() => setSelectedDevice(device)} 
                  style={{ color: '#0284c7', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {device.model}
                </td>
                <td>{device.sim1_phone || '-'}</td>
                <td>{device.sim2_phone === 'NO_TIENE' ? 'N/A' : (device.sim2_phone || '-')}</td>
                <td>
                  <span className={`status-badge ${device.status === 'ACTIVO' ? 'badge-activo' : 'badge-stock'}`}>
                    {device.status}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => { setFormData(device); setShowModal(true); }}
                      style={iconBtnStyle} title="Editar"
                    >
                      <Edit2 size={16} color="#d97706" />
                    </button>
                    <button 
                      onClick={() => handleOpenHistory(device)} 
                      style={iconBtnStyle} 
                      title="Historial"
                    >
                      <History size={16} color="#0284c7" />
                    </button>
                    <button 
                      onClick={() => handleDeleteDevice(device.id)}
                      style={iconBtnStyle} 
                      title="Eliminar"
                    >
                      <Trash2 size={16} color="#dc2626" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL COMPONENTIZADO DE EDICIÓN / CREACIÓN */}
      <DeviceEditModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveDevice}
        formData={formData}
        setFormData={setFormData}
        simcards={simcards}
      />

      {/* MODAL DE HISTORIAL */}
      {showHistoryModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, width: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: '#0f172a', margin: 0 }}>
                Historial - {selectedDevice?.model} (#{selectedDevice?.id})
              </h3>
              <button 
                onClick={() => setShowHistoryModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {deviceHistory.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {deviceHistory.map((item, idx) => (
                    <li key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                        {item.date || item.created_at || 'Fecha N/A'}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                        {item.action || 'Cambio registrado'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#475569' }}>
                        {item.details || item.description || 'Sin detalle adicional'}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                  No hay registros de historial para este dispositivo.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                onClick={() => setShowHistoryModal(false)} 
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '500' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const iconBtnStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  padding: '6px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
};