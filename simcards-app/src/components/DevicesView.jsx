import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Edit2, History, Trash2, Plus, Search, Filter, RotateCcw, X, Info, User, Download } from "lucide-react";
import movilTandemImg from '../assets/moviltandem.png';
import DeviceEditModal from './DeviceEditModal';
import DeviceInfoModal from './DeviceInfoModal';

export default function DevicesView({ API_URL, token, simcards = [] }) {
  const [devices, setDevices] = useState([]);
  const [operators, setOperators] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [deviceHistory, setDeviceHistory] = useState([]);

  // Estados de Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [entityFilter, setEntityFilter] = useState('TODAS');

  useEffect(() => {
    fetchDevices();
    fetchOperators();
  }, [searchTerm, statusFilter, entityFilter]);

  const fetchDevices = async () => {
    try {
      const res = await axios.get(`${API_URL}/devices`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: searchTerm || undefined,
          status: statusFilter !== 'TODOS' ? statusFilter : undefined,
          entity: entityFilter !== 'TODAS' ? entityFilter : undefined,
        }
      });
      setDevices(res.data);
      if (res.data.length > 0 && !selectedDevice) {
        setSelectedDevice(res.data[0]);
      }
    } catch (err) {
      console.error('Error al obtener dispositivos:', err);
    }
  };

  const fetchOperators = async () => {
    try {
      const res = await axios.get(`${API_URL}/operators`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOperators(res.data);
    } catch (err) {
      console.error('Error al obtener operadores:', err);
    }
  };

  // Obtener lista única de entidades para el filtro
  const uniqueEntities = useMemo(() => {
    const entities = devices
      .map(d => d.entity)
      .filter((e) => Boolean(e) && e.trim() !== '');
    return ['TODAS', ...Array.from(new Set(entities))];
  }, [devices]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('TODOS');
    setEntityFilter('TODAS');
  };

  // FUNCIÓN PARA EXPORTAR DISPOSITIVOS A CSV
  const handleExportCSV = () => {
    if (!devices || devices.length === 0) {
      alert('No hay registros para exportar con los filtros actuales.');
      return;
    }

    const headers = [
      'ID',
      'Modelo',
      'Nombre Interno',
      'Entidad / Área',
      'SIM Card 1',
      'Operador SIM 1',
      'SIM Card 2',
      'Operador SIM 2',
      'Estado'
    ];

    const rows = devices.map(d => {
      const op1 = d.operator1_name || d.assigned_operator_name || d.operator_1_name || d.operator1 || d.assigned_operator_1_name || '';
      const op2 = d.operator2_name || d.assigned_operator2_name || d.operator_2_name || d.operator2 || d.assigned_operator_2_name || '';

      return [
        `"${d.id ?? ''}"`,
        `"${d.model ?? ''}"`,
        `"${d.internal_name ?? ''}"`,
        `"${d.entity ?? ''}"`,
        `"${d.sim1_phone ?? ''}"`,
        `"${op1}"`,
        `"${d.sim2_phone ?? ''}"`,
        `"${op2}"`,
        `"${d.status ?? ''}"`
      ].join(';');
    });

    // Encabezado BOM UTF-8 (\uFEFF) para garantizar compatibilidad con Excel
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const dateStr = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Informe_Dispositivos_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleSaveDevice = async (dataToSave) => {
    try {
      if (dataToSave.id) {
        await axios.put(`${API_URL}/devices/${dataToSave.id}`, dataToSave, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/devices`, dataToSave, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowModal(false);
      fetchDevices();
    } catch (err) {
      console.error('Error en la petición de dispositivo:', err.response?.data || err);
      const serverMessage = err.response?.data?.error || err.response?.data?.message;
      alert(serverMessage ? `Error: ${serverMessage}` : 'Error al guardar el dispositivo.');
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
      
      {/* CABECERA DE LA SECCIÓN */}
      <div className="devices-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 className="devices-title" style={{ margin: 0, color: '#0f172a' }}>Dispositivos Inventariados</h2>
        <button 
          className="btn-primary" 
          onClick={() => {
            setEditingDevice(null);
            setShowModal(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Plus size={18} /> Nuevo Dispositivo
        </button>
      </div>

      {/* FICHA DESTACADA SUPERIOR (SELECCIONADO) */}
      <div className="device-card" style={{ backgroundColor: '#fff', padding: '18px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {selectedDevice ? (
          (() => {
            const op1 = selectedDevice.operator1_name || selectedDevice.assigned_operator_name || selectedDevice.operator_1_name || selectedDevice.operator1 || selectedDevice.assigned_operator_1_name || null;
            const op2 = selectedDevice.operator2_name || selectedDevice.assigned_operator2_name || selectedDevice.operator_2_name || selectedDevice.operator2 || selectedDevice.assigned_operator_2_name || null;

            const hasOp1 = Boolean(op1 && String(op1).trim() !== '');
            const hasOp2 = Boolean(op2 && String(op2).trim() !== '');

            const isSameOperator = hasOp1 && hasOp2 && op1 === op2;

            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                
                {/* Lado Izquierdo: Icono + Detalles del teléfono + SIM 1 y SIM 2 apiladas */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '6px' }}>
                    <img 
                      src={movilTandemImg} 
                      alt="Móvil Tandem" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                        #{selectedDevice.id}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 'bold' }}>{selectedDevice.model}</h3>
                      {selectedDevice.internal_name && (
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>({selectedDevice.internal_name})</span>
                      )}
                      {selectedDevice.entity && (
                        <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                          {selectedDevice.entity}
                        </span>
                      )}
                    </div>

                    {/* Contenedor de 2 líneas apiladas */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                      
                      {/* LÍNEA SIM 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#475569', width: '42px' }}>SIM 1:</strong>
                        <span style={{ color: selectedDevice.sim1_phone ? '#15803d' : '#94a3b8', fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {selectedDevice.sim1_phone || 'Sin Asignar'}
                        </span>
                        {hasOp1 && !isSameOperator && (
                          <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <User size={12} color="#0369a1" /> {op1}
                          </span>
                        )}
                      </div>

                      {/* LÍNEA SIM 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#475569', width: '42px' }}>SIM 2:</strong>
                        <span style={{ color: selectedDevice.sim2_phone ? '#15803d' : '#94a3b8', fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {selectedDevice.sim2_phone || 'Sin Asignar'}
                        </span>
                        {hasOp2 && !isSameOperator && (
                          <span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <User size={12} color="#7e22ce" /> {op2}
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Lado Derecho */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  
                  {isSameOperator && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                        {op1.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', display: 'block', letterSpacing: '0.5px' }}>
                          Operador Asignado
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b' }}>
                          {op1}
                        </span>
                      </div>
                    </div>
                  )}

                  {!hasOp1 && !hasOp2 && (
                    <div style={{ padding: '6px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                      Sin operador asignado
                    </div>
                  )}

                  <button
                    onClick={() => setShowInfoModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      backgroundColor: '#0284c7',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Info size={16} /> + Info
                  </button>
                </div>

              </div>
            );
          })()
        ) : (
          <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>
            Selecciona un dispositivo de la lista inferior para ver el detalle.
          </p>
        )}
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Búsqueda */}
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar por modelo, nombre interno, entidad, línea u operador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Filtro por Estado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={15} color="#64748b" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO / REPUESTO</option>
            <option value="REPARACION">EN REPARACIÓN</option>
            <option value="RESERVA">EN RESERVA</option>
          </select>
        </div>

        {/* Filtro por Entidad */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
          >
            {uniqueEntities.map((ent, idx) => (
              <option key={idx} value={ent}>
                {ent === 'TODAS' ? 'Todas las Entidades' : ent}
              </option>
            ))}
          </select>
        </div>

        {/* Limpiar Filtros */}
        {(searchTerm || statusFilter !== 'TODOS' || entityFilter !== 'TODAS') && (
          <button
            onClick={handleClearFilters}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
            title="Restablecer filtros"
          >
            <RotateCcw size={14} /> Limpiar
          </button>
        )}

        {/* BOTÓN EXPORTAR CSV */}
        <button
          type="button"
          onClick={handleExportCSV}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#0284c7',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '6px',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
          title="Exportar resultados a un archivo CSV"
        >
          <Download size={15} color="#0284c7" />
          Exportar CSV ({devices.length})
        </button>

      </div>

      {/* TABLA DE DISPOSITIVOS */}
      <div className="table-container" style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 12px' }}>ID</th>
              <th style={{ padding: '10px 12px' }}>DISPOSITIVO / DETALLE</th>
              <th style={{ padding: '10px 12px' }}>SIM CARD 1</th>
              <th style={{ padding: '10px 12px' }}>SIM CARD 2</th>
              <th style={{ padding: '10px 12px' }}>ESTADO</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {devices.length > 0 ? (
              devices.map((device) => (
                <tr key={device.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#64748b' }}>#{device.id}</td>
                  
                  {/* Modelo + Nombre Interno + Entidad */}
                  <td style={{ padding: '10px 12px' }}>
                    <div 
                      onClick={() => setSelectedDevice(device)} 
                      style={{ color: '#0284c7', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {device.model}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {device.internal_name && <span>Interno: <strong>{device.internal_name}</strong></span>}
                      {device.entity && (
                        <span style={{ backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', color: '#334155' }}>
                          {device.entity}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* SIM 1 + Operador 1 */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: '600', color: device.sim1_phone ? '#1e293b' : '#94a3b8' }}>
                      {device.sim1_phone || '-'}
                    </div>
                    {(device.operator1_name || device.assigned_operator_name) && (
                      <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '2px' }}>
                        Op: {device.operator1_name || device.assigned_operator_name}
                      </div>
                    )}
                  </td>

                  {/* SIM 2 + Operador 2 */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: '600', color: device.sim2_phone ? '#1e293b' : '#94a3b8' }}>
                      {device.sim2_phone || '-'}
                    </div>
                    {(device.operator2_name || device.assigned_operator2_name) && (
                      <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '2px' }}>
                        Op: {device.operator2_name || device.assigned_operator2_name}
                      </div>
                    )}
                  </td>

                  {/* Estado */}
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: device.status === 'ACTIVO' ? '#dcfce7' : '#f1f5f9',
                      color: device.status === 'ACTIVO' ? '#15803d' : '#64748b'
                    }}>
                      {device.status}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => { 
                          setEditingDevice(device); 
                          setShowModal(true); 
                        }}
                        style={iconBtnStyle} 
                        title="Editar"
                      >
                        <Edit2 size={15} color="#d97706" />
                      </button>
                      <button 
                        onClick={() => handleOpenHistory(device)} 
                        style={iconBtnStyle} 
                        title="Historial"
                      >
                        <History size={15} color="#0284c7" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDevice(device.id)}
                        style={iconBtnStyle} 
                        title="Eliminar"
                      >
                        <Trash2 size={15} color="#dc2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontStyle: 'italic' }}>
                  No se encontraron dispositivos con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL COMPONENTIZADO DE EDICIÓN / CREACIÓN */}
      <DeviceEditModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveDevice}
        device={editingDevice}
        simcards={simcards}
        operators={operators}
      />

      {/* MODAL DE VISTA RÁPIDA / + INFO (SOLO LECTURA) */}
      {showInfoModal && selectedDevice && (
        <DeviceInfoModal
          device={selectedDevice}
          onClose={() => setShowInfoModal(false)}
        />
      )}

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