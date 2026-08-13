import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Smartphone,
  Cpu,
  Edit2,
  History,
  Trash2,
  Plus,
  Search,
  Filter,
  RotateCcw,
  X,
  Info,
  User,
  Download
} from "lucide-react";
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
      setDeviceHistory([]);
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

  // Helper para formatear fecha y hora
  const formatDateTime = (rawDate) => {
    if (!rawDate) return '';
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return rawDate;
    return d.toLocaleString('es-AR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div style={{ padding: '15px', color: '#f8fafc' }}>

      {/* ------------------------------------------------------------------ */}
      {/* CABECERA FUTURISTA DE LA SECCIÓN                                   */}
      {/* ------------------------------------------------------------------ */}
      <div style={{ marginBottom: '28px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>

        <div style={{ flex: '1 1 600px' }}>
          {/* LÍNEA 1: Icono + Título + Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            width: '100%',
            flexWrap: 'nowrap'
          }}>

            {/* Icono Neón */}
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(14, 165, 233, 0.12)',
              border: '1.5px solid rgba(56, 189, 248, 0.6)',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              color: '#38bdf8',
              flexShrink: 0
            }}>
              <Smartphone size={24} />
            </div>

            {/* Título Principal con Gradiente */}
            <h1 style={{
              margin: 0,
              fontSize: '30px',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              whiteSpace: 'nowrap',
              background: 'linear-gradient(180deg, #ffffff 30%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 12px rgba(56, 189, 248, 0.35))'
            }}>
              Dispositivos Inventariados
            </h1>

            {/* Badge Píldora */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              borderRadius: '20px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              fontSize: '13px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}>
              <Cpu size={14} />
              <span>Control de Hardware</span>
            </div>

          </div>

          {/* LÍNEA 2: Subtítulo en contenedor traslúcido */}
          <div style={{
            marginTop: '12px',
            padding: '10px 16px',
            borderRadius: '10px',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#94a3b8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              Administrá el parque de terminales, vinculación de líneas SIM y el estado operativo general del equipamiento.
            </p>
          </div>
        </div>

        {/* BOTÓN ACCIÓN PRINCIPAL */}
        <button
          type="button"
          onClick={() => {
            setEditingDevice(null);
            setShowModal(true);
          }}
          style={{
            width: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '4px',
            boxShadow: '0 0 12px rgba(2, 132, 199, 0.35)'
          }}
        >
          <Plus size={18} /> Nuevo Dispositivo
        </button>

      </div>

      {/* FICHA DESTACADA SUPERIOR */}
      <div className="device-card" style={{ backgroundColor: '#1e293b', padding: '18px 20px', borderRadius: '10px', border: '1px solid #334155', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)' }}>
        {selectedDevice ? (
          (() => {
            const op1 = selectedDevice.operator1_name || selectedDevice.assigned_operator_name || selectedDevice.operator_1_name || selectedDevice.operator1 || selectedDevice.assigned_operator_1_name || null;
            const op2 = selectedDevice.operator2_name || selectedDevice.assigned_operator2_name || selectedDevice.operator_2_name || selectedDevice.operator2 || selectedDevice.assigned_operator_2_name || null;

            const hasOp1 = Boolean(op1 && String(op1).trim() !== '');
            const hasOp2 = Boolean(op2 && String(op2).trim() !== '');

            const isSameOperator = hasOp1 && hasOp2 && op1 === op2;

            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '130px', height: '130px', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '8px' }}>
                    <img
                      src={movilTandemImg}
                      alt="Móvil Tandem"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ backgroundColor: '#334155', color: '#cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                        #{selectedDevice.id}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: 'bold' }}>{selectedDevice.model}</h3>
                      {selectedDevice.internal_name && (
                        <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>({selectedDevice.internal_name})</span>
                      )}
                      {selectedDevice.entity && (
                        <span style={{ backgroundColor: '#0369a1', color: '#e0f2fe', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                          {selectedDevice.entity}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#94a3b8', width: '48px' }}>SIM 1:</strong>
                        <span style={{ color: selectedDevice.sim1_phone ? '#4ade80' : '#64748b', fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {selectedDevice.sim1_phone || 'Sin Asignar'}
                        </span>
                        {hasOp1 && !isSameOperator && (
                          <span style={{ backgroundColor: '#0369a1', color: '#e0f2fe', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <User size={12} color="#e0f2fe" /> {op1}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#94a3b8', width: '48px' }}>SIM 2:</strong>
                        <span style={{ color: selectedDevice.sim2_phone ? '#4ade80' : '#64748b', fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {selectedDevice.sim2_phone || 'Sin Asignar'}
                        </span>
                        {hasOp2 && !isSameOperator && (
                          <span style={{ backgroundColor: '#6b21a8', color: '#f3e8ff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <User size={12} color="#f3e8ff" /> {op2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {isSameOperator && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                        {op1.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', display: 'block', letterSpacing: '0.5px' }}>
                          Operador Asignado
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>
                          {op1}
                        </span>
                      </div>
                    </div>
                  )}

                  {!hasOp1 && !hasOp2 && (
                    <div style={{ padding: '6px 12px', backgroundColor: '#0f172a', borderRadius: '6px', border: '1px solid #334155', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                      Sin operador asignado
                    </div>
                  )}

                  <button
                    onClick={() => setShowInfoModal(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                    }}
                  >
                    <Info size={16} /> + Info
                  </button>
                </div>

              </div>
            );
          })()
        ) : (
          <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
            Selecciona un dispositivo de la lista inferior para ver el detalle.
          </p>
        )}
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div style={{ backgroundColor: '#1e293b', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '15px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Buscar por modelo, nombre interno, entidad, línea u operador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={15} color="#94a3b8" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #334155', fontSize: '13px', backgroundColor: '#0f172a', color: '#f8fafc' }}
          >
            <option value="TODOS" style={{ backgroundColor: '#0f172a' }}>Todos los Estados</option>
            <option value="ACTIVO" style={{ backgroundColor: '#0f172a' }}>ACTIVO</option>
            <option value="INACTIVO" style={{ backgroundColor: '#0f172a' }}>INACTIVO / REPUESTO</option>
            <option value="REPARACION" style={{ backgroundColor: '#0f172a' }}>EN REPARACIÓN</option>
            <option value="RESERVA" style={{ backgroundColor: '#0f172a' }}>EN RESERVA</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #334155', fontSize: '13px', backgroundColor: '#0f172a', color: '#f8fafc' }}
          >
            {uniqueEntities.map((ent, idx) => (
              <option key={idx} value={ent} style={{ backgroundColor: '#0f172a' }}>
                {ent === 'TODAS' ? 'Todas las Entidades' : ent}
              </option>
            ))}
          </select>
        </div>

        {(searchTerm || statusFilter !== 'TODOS' || entityFilter !== 'TODAS') && (
          <button
            onClick={handleClearFilters}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#cbd5e1', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
            title="Restablecer filtros"
          >
            <RotateCcw size={14} /> Limpiar
          </button>
        )}

        <button
          type="button"
          onClick={handleExportCSV}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px', fontWeight: '500', color: '#38bdf8', backgroundColor: 'rgba(2, 132, 199, 0.15)', border: '1px solid #0284c7', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap'
          }}
          title="Exportar resultados a un archivo CSV"
        >
          <Download size={15} color="#38bdf8" />
          Exportar CSV ({devices.length})
        </button>
      </div>

      {/* TABLA DE DISPOSITIVOS */}
      <div className="table-container" style={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>DISPOSITIVO / DETALLE</th>
              <th style={{ padding: '12px' }}>SIM CARD 1</th>
              <th style={{ padding: '12px' }}>SIM CARD 2</th>
              <th style={{ padding: '12px' }}>ESTADO</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {devices.length > 0 ? (
              devices.map((device) => (
                <tr key={device.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#94a3b8' }}>#{device.id}</td>

                  <td style={{ padding: '12px' }}>
                    <div
                      onClick={() => setSelectedDevice(device)}
                      style={{ color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {device.model}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {device.internal_name && <span>Interno: <strong style={{ color: '#cbd5e1' }}>{device.internal_name}</strong></span>}
                      {device.entity && (
                        <span style={{ backgroundColor: '#334155', padding: '1px 6px', borderRadius: '4px', color: '#e2e8f0' }}>
                          {device.entity}
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '600', color: device.sim1_phone ? '#f8fafc' : '#64748b' }}>
                      {device.sim1_phone || '-'}
                    </div>
                    {(device.operator1_name || device.assigned_operator_name) && (
                      <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px' }}>
                        Op: {device.operator1_name || device.assigned_operator_name}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '600', color: device.sim2_phone ? '#f8fafc' : '#64748b' }}>
                      {device.sim2_phone || '-'}
                    </div>
                    {(device.operator2_name || device.assigned_operator2_name) && (
                      <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px' }}>
                        Op: {device.operator2_name || device.assigned_operator2_name}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                      backgroundColor: device.status === 'ACTIVO' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                      color: device.status === 'ACTIVO' ? '#4ade80' : '#94a3b8',
                      border: device.status === 'ACTIVO' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(148, 163, 184, 0.3)'
                    }}>
                      {device.status}
                    </span>
                  </td>

                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => {
                          setEditingDevice(device);
                          setShowModal(true);
                        }}
                        style={iconBtnStyle}
                        title="Editar"
                      >
                        <Edit2 size={15} color="#f59e0b" />
                      </button>
                      <button
                        onClick={() => handleOpenHistory(device)}
                        style={iconBtnStyle}
                        title="Historial"
                      >
                        <History size={15} color="#38bdf8" />
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        style={iconBtnStyle}
                        title="Eliminar"
                      >
                        <Trash2 size={15} color="#f87171" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontStyle: 'italic' }}>
                  No se encontraron dispositivos con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DeviceEditModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveDevice}
        device={editingDevice}
        simcards={simcards}
        operators={operators}
      />

      {showInfoModal && selectedDevice && (
        <DeviceInfoModal
          device={selectedDevice}
          onClose={() => setShowInfoModal(false)}
        />
      )}

      {/* MODAL DE HISTORIAL ESTILIZADO */}
      {showHistoryModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, width: '520px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <h3 style={{ color: '#ffffff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                Historial de Dispositivo: <span style={{ color: '#38bdf8' }}>{selectedDevice?.model} (#{selectedDevice?.id})</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#94a3b8" />
              </button>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
              {deviceHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {deviceHistory.map((item, idx) => {
                    const userName = item.user_name || item.created_by || item.user || 'Sistema';
                    const actionLabel = item.action || 'Modificación';
                    const rawDate = item.created_at || item.date || item.timestamp;
                    const dateFormatted = formatDateTime(rawDate);

                    return (
                      <div
                        key={idx}
                        style={{
                          paddingBottom: '12px',
                          borderBottom: '1px solid #334155',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '14px' }}>
                          <strong style={{ color: '#ffffff' }}>{userName}</strong>
                          <span style={{ color: '#cbd5e1', fontSize: '13px' }}>realizó</span>

                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            display: 'inline-block'
                          }}>
                            {actionLabel}
                          </span>

                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                            ({dateFormatted})
                          </span>
                        </div>

                        {(item.details || item.description) && (
                          <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px', backgroundColor: '#0f172a', padding: '6px 10px', borderRadius: '6px', border: '1px solid #334155' }}>
                            {item.details || item.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0', margin: 0 }}>
                  No hay registros de historial para este dispositivo.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #334155' }}>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#475569',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
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
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '6px',
  padding: '6px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justify: 'center'
};

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', border: '1px solid #334155'
};