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
import SimActionDialog from './SimActionDialog';

export default function DevicesView({ API_URL, token, simcards = [] }) {
  const [devices, setDevices] = useState([]);
  const [operators, setOperators] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [deviceDialog, setDeviceDialog] = useState(null);

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
      setDeviceDialog({
        type: 'notice',
        title: 'No hay dispositivos para exportar',
        messagePrefix: 'No se encontraron registros con los filtros actuales.'
      });
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
      setDeviceDialog({
        type: 'notice',
        title: 'No se pudo guardar el dispositivo',
        messagePrefix: serverMessage || 'Ocurrió un error al guardar los cambios. Intentá nuevamente.'
      });
    }
  };

  const handleDeleteDevice = async (id) => {
    if (deviceDialog?.action !== 'delete') {
      const device = devices.find((item) => item.id === id);
      setDeviceDialog({
        type: 'confirm',
        tone: 'danger',
        action: 'delete',
        deviceId: id,
        title: '¿Eliminar dispositivo?',
        messagePrefix: 'Se quitará del inventario ',
        highlighted: device?.model || `el dispositivo #${id}`,
        messageSuffix: '. Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar dispositivo'
      });
      return;
    }
    try {
      await axios.delete(`${API_URL}/devices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDevices();
      if (selectedDevice?.id === id) {
        setSelectedDevice(null);
      }
      setDeviceDialog(null);
    } catch (err) {
      setDeviceDialog({
        type: 'notice',
        title: 'No se pudo eliminar el dispositivo',
        messagePrefix: err.response?.data?.error || 'Ocurrió un error al eliminarlo. Intentá nuevamente.'
      });
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

  const handleDeviceDialogConfirm = () => {
    if (deviceDialog?.action === 'delete') {
      return handleDeleteDevice(deviceDialog.deviceId);
    }
    setDeviceDialog(null);
  };

  return (
    <div className="app-view-root devices-view">

      <div className="titanium-module-header devices-titanium-header">
        <div className="titanium-header-glint" aria-hidden="true" />
        <div className="titanium-header-main">
          <div className="titanium-header-icon"><Smartphone size={24} /></div>
          <div className="titanium-header-copy">
            <div className="titanium-header-title-row">
              <h1>Dispositivos Inventariados</h1>
              <span className="titanium-header-badge"><Cpu size={13} /> Control de Hardware</span>
            </div>
            <p>Administrá el parque de terminales, vinculación de líneas SIM y el estado operativo general del equipamiento.</p>
          </div>
        </div>
        <div className="titanium-header-actions">
          <button
            type="button"
            onClick={() => {
              setEditingDevice(null);
              setShowModal(true);
            }}
            className="btn teams-create-button devices-create-button"
          >
            <Plus size={18} /> Nuevo Dispositivo
          </button>
        </div>
      </div>

      {/* FICHA DESTACADA SUPERIOR */}
      <div className="device-card devices-highlight-card">
        {selectedDevice ? (
          (() => {
            const op1 = selectedDevice.operator1_name || selectedDevice.assigned_operator_name || selectedDevice.operator_1_name || selectedDevice.operator1 || selectedDevice.assigned_operator_1_name || null;
            const op2 = selectedDevice.operator2_name || selectedDevice.assigned_operator2_name || selectedDevice.operator_2_name || selectedDevice.operator2 || selectedDevice.assigned_operator_2_name || null;

            const hasOp1 = Boolean(op1 && String(op1).trim() !== '');
            const hasOp2 = Boolean(op2 && String(op2).trim() !== '');

            const isSameOperator = hasOp1 && hasOp2 && op1 === op2;

            return (
              <div className="devices-highlight-layout">

              <div className="devices-highlight-main">
                <div className="devices-phone-frame">
                    <img
                      src={movilTandemImg}
                      alt="Móvil Tandem"
                    className="devices-phone-image"
                    />
                  </div>

                  <div>
                  <div className="devices-highlight-title-row">
                    <span className="devices-id-chip">
                        #{selectedDevice.id}
                      </span>
                    <h3 className="devices-highlight-model">{selectedDevice.model}</h3>
                      {selectedDevice.internal_name && (
                      <span className="devices-highlight-internal-name">({selectedDevice.internal_name})</span>
                      )}
                      {selectedDevice.entity && (
                      <span className="devices-entity-chip">
                          {selectedDevice.entity}
                        </span>
                      )}
                    </div>

                  <div className="devices-highlight-sim-list">
                    <div className="devices-highlight-sim-row">
                      <strong>SIM 1:</strong>
                      <span className={`devices-highlight-phone ${selectedDevice.sim1_phone ? '' : 'is-empty'}`}>
                          {selectedDevice.sim1_phone || 'Sin Asignar'}
                        </span>
                        {hasOp1 && !isSameOperator && (
                          <span className="devices-operator-chip">
                            <User size={12} aria-hidden="true" /> {op1}
                          </span>
                        )}
                      </div>

                      <div className="devices-highlight-sim-row">
                        <strong>SIM 2:</strong>
                        <span className={`devices-highlight-phone ${selectedDevice.sim2_phone ? '' : 'is-empty'}`}>
                          {selectedDevice.sim2_phone || 'Sin Asignar'}
                        </span>
                        {hasOp2 && !isSameOperator && (
                          <span className="devices-operator-chip is-secondary">
                            <User size={12} aria-hidden="true" /> {op2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="devices-highlight-meta">
                  {isSameOperator && (
                    <div className="devices-highlight-operator">
                      <div className="devices-highlight-operator-avatar">
                        {op1.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="devices-highlight-operator-label">
                          Operador Asignado
                        </span>
                        <span className="devices-highlight-operator-name">
                          {op1}
                        </span>
                      </div>
                    </div>
                  )}

                  {!hasOp1 && !hasOp2 && (
                    <div className="devices-no-operator">
                      Sin operador asignado
                    </div>
                  )}

                  <button
                    onClick={() => setShowInfoModal(true)}
                    className="devices-info-button"
                    aria-label={`Ver información de ${selectedDevice.model}`}
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
      <div className="devices-filter-bar">
        <div className="devices-search-wrap">
          <Search className="devices-search-icon" size={16} aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por modelo, nombre interno, entidad, línea u operador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="devices-search-input"
            aria-label="Buscar dispositivos por modelo, nombre interno, entidad, línea u operador"
          />
        </div>

        <div className="devices-filter-group">
          <Filter size={15} aria-hidden="true" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="devices-filter-select"
            aria-label="Filtrar dispositivos por estado"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO / REPUESTO</option>
            <option value="REPARACION">EN REPARACIÓN</option>
            <option value="RESERVA">EN RESERVA</option>
          </select>
        </div>

        <div className="devices-filter-group">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="devices-filter-select"
            aria-label="Filtrar dispositivos por entidad"
          >
            {uniqueEntities.map((ent, idx) => (
              <option key={idx} value={ent}>
                {ent === 'TODAS' ? 'Todas las Entidades' : ent}
              </option>
            ))}
          </select>
        </div>

        {(searchTerm || statusFilter !== 'TODOS' || entityFilter !== 'TODAS') && (
          <button
            onClick={handleClearFilters}
            className="devices-clear-button"
            title="Restablecer filtros"
            aria-label="Restablecer filtros de dispositivos"
          >
            <RotateCcw size={14} /> Limpiar
          </button>
        )}

        <button
          type="button"
          onClick={handleExportCSV}
          className="devices-export-button"
          title="Exportar resultados a un archivo CSV"
        >
          <Download size={15} color="#38bdf8" />
          Exportar CSV ({devices.length})
        </button>
      </div>

      {/* TABLA DE DISPOSITIVOS */}
      <div className="table-container devices-table-panel">
        <table className="devices-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>DISPOSITIVO / DETALLE</th>
              <th>SIM CARD 1</th>
              <th>SIM CARD 2</th>
              <th>ESTADO</th>
              <th className="devices-actions-heading">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {devices.length > 0 ? (
              devices.map((device) => (
                <tr key={device.id}>
                <td className="devices-table-id">#{device.id}</td>

                <td className="devices-table-details">
                    <button
                    type="button"
                    onClick={() => setSelectedDevice(device)}
                    className="devices-table-model"
                    aria-label={`Ver detalles de ${device.model}`}
                    >
                    {device.model}
                    </button>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {device.internal_name && <span>Interno: <strong style={{ color: '#cbd5e1' }}>{device.internal_name}</strong></span>}
                      {device.entity && (
                        <span style={{ backgroundColor: '#334155', padding: '1px 6px', borderRadius: '4px', color: '#e2e8f0' }}>
                          {device.entity}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="devices-table-sim">
                    {device.sim1_phone ? (
                      <>
                        <div className="devices-table-phone">{device.sim1_phone}</div>
                        {(device.operator1_name || device.assigned_operator_name) && (
                          <div className="devices-table-operator">Op: {device.operator1_name || device.assigned_operator_name}</div>
                        )}
                      </>
                    ) : (
                      <span className="devices-no-sim">NO_TIENE</span>
                    )}
                  </td>

                  <td className="devices-table-sim">
                    {device.sim2_phone ? (
                      <>
                        <div className="devices-table-phone">{device.sim2_phone}</div>
                        {(device.operator2_name || device.assigned_operator2_name) && (
                          <div className="devices-table-operator">Op: {device.operator2_name || device.assigned_operator2_name}</div>
                        )}
                      </>
                    ) : (
                      <span className="devices-no-sim">NO_TIENE</span>
                    )}
                  </td>

                  <td className="devices-table-status">
                    <span className={`devices-status-badge ${device.status === 'ACTIVO' ? 'is-active' : ''}`}>
                      {device.status}
                    </span>
                  </td>

                  <td className="devices-table-actions">
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => {
                          setEditingDevice(device);
                          setShowModal(true);
                        }}
                        className="devices-action-button devices-edit-action"
                        title="Editar"
                        aria-label={`Editar dispositivo ${device.model}`}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleOpenHistory(device)}
                        className="devices-action-button devices-history-action"
                        title="Historial"
                        aria-label={`Ver historial de ${device.model}`}
                      >
                        <History size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        className="devices-action-button devices-delete-action"
                        title="Eliminar"
                        aria-label={`Eliminar dispositivo ${device.model}`}
                      >
                        <Trash2 size={15} />
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
        <div className="sim-glass-overlay" style={modalOverlayStyle} role="presentation">
          <div style={{ ...modalContentStyle, width: '520px' }} role="dialog" aria-modal="true" aria-labelledby="device-history-title">

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <h3 id="device-history-title" style={{ color: '#ffffff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                Historial de Dispositivo: <span style={{ color: '#38bdf8' }}>{selectedDevice?.model} (#{selectedDevice?.id})</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
                aria-label="Cerrar historial del dispositivo"
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

      <SimActionDialog
        dialog={deviceDialog}
        onClose={() => setDeviceDialog(null)}
        onConfirm={handleDeviceDialogConfirm}
      />

    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', border: '1px solid #334155'
};