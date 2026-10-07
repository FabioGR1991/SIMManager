import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, Plus, Edit, Trash2, Smartphone, Shield, X } from 'lucide-react';
import SimActionDialog from './SimActionDialog';

const DEFAULT_TEAMS = ['Tokio', 'Roma', 'Madrid', 'Berlín', 'Buenos Aires'];

export default function OperatorsView({ API_URL, token, user }) {
  const [operators, setOperators] = useState([]);
  const [teams, setTeams] = useState(DEFAULT_TEAMS);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState(null);
  const [operatorDialog, setOperatorDialog] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    shift: 'Mañana',
    campaign: '',
    team: ''
  });

  useEffect(() => {
    fetchOperators();
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${API_URL}/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.length > 0) {
        const teamNames = res.data.map(t => (typeof t === 'string' ? t : t.name));
        setTeams(teamNames);
      }
    } catch (err) {
      console.error('Error al cargar la lista de equipos:', err);
    }
  };

  const fetchOperators = async () => {
    try {
      const res = await axios.get(`${API_URL}/operators`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOperators(res.data);
      if (res.data.length > 0 && !selectedOperator) {
        setSelectedOperator(res.data[0]);
      } else if (selectedOperator) {
        const updated = res.data.find(o => o.id === selectedOperator.id);
        setSelectedOperator(updated || res.data[0] || null);
      }
    } catch (err) {
      console.error('Error al cargar operadores:', err);
    }
  };

  const handleOpenModal = (operator = null) => {
    if (operator) {
      setEditingOperator(operator);
      setFormData({
        full_name: operator.full_name,
        shift: operator.shift,
        campaign: operator.campaign || '',
        team: operator.team || ''
      });
    } else {
      setEditingOperator(null);
      setFormData({
        full_name: '',
        shift: 'Mañana',
        campaign: '',
        team: user?.team || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOperator) {
        await axios.put(
          `${API_URL}/operators/${editingOperator.id}`,
          { ...formData, status: editingOperator.status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/operators`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setIsModalOpen(false);
      fetchOperators();
    } catch (err) {
      setOperatorDialog({
        type: 'notice',
        title: 'No se pudo guardar el operador',
        messagePrefix: err.response?.data?.error || 'Ocurrió un error al guardar los cambios. Intentá nuevamente.'
      });
    }
  };

  const handleDelete = async (operator) => {
    if (operatorDialog?.action !== 'delete' || operatorDialog.operatorId !== operator.id) {
      setOperatorDialog({
        type: 'confirm',
        tone: 'danger',
        action: 'delete',
        operatorId: operator.id,
        title: '¿Eliminar operador?',
        messagePrefix: 'Se eliminará a ',
        highlighted: operator.full_name,
        messageSuffix: '. Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar operador'
      });
      return;
    }

    try {
      await axios.delete(`${API_URL}/operators/${operator.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selectedOperator?.id === operator.id) setSelectedOperator(null);
      fetchOperators();
      setOperatorDialog(null);
    } catch (err) {
      setOperatorDialog({
        type: 'notice',
        title: 'No se pudo eliminar el operador',
        messagePrefix: err.response?.data?.error || 'Ocurrió un error al eliminarlo. Intentá nuevamente.'
      });
    }
  };

  const handleOperatorDialogConfirm = () => {
    if (operatorDialog?.action === 'delete') {
      const operator = operators.find((item) => item.id === operatorDialog.operatorId);
      if (operator) return handleDelete(operator);
    }
    setOperatorDialog(null);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'Administrador';

  return (
    <div className="app-view-root operators-view">

      <div className="titanium-module-header operators-header">
        <div className="titanium-header-glint" aria-hidden="true" />
        <div className="titanium-header-main">
          <div className="titanium-header-icon"><UserCheck size={24} /></div>
          <div className="titanium-header-copy">
            <div className="titanium-header-title-row">
              <h1>Gestión de Operadores</h1>
              <span className="titanium-header-badge"><Shield size={13} /> Representantes & Turnos</span>
            </div>
            <p>Administrá los representantes asignados a los dispositivos, controlá turnos y gestioná las campañas asociadas.</p>
          </div>
        </div>
        <div className="titanium-header-actions">
          <button type="button" onClick={() => handleOpenModal()} className="btn operators-create-button">
            <Plus size={18} /> Nuevo Operador
          </button>
        </div>
      </div>

      {/* FICHA DESTACADA SUPERIOR */}
      {selectedOperator ? (
        <div className="operators-highlight-card">
          <div className="operators-avatar">
            {selectedOperator.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="operators-highlight-content">
            <h3 className="operators-highlight-name">
              {selectedOperator.full_name}
            </h3>
            <div className="operators-info-tags">
              <span className="operators-info-chip">Turno <strong>{selectedOperator.shift}</strong></span>
              <span className="operators-info-chip">Campaña <strong>{selectedOperator.campaign || 'Sin asignar'}</strong></span>
              <span className="operators-info-chip">Equipo <strong>{selectedOperator.team || 'Sin asignar'}</strong></span>
            </div>
            <div className="operators-device-tags">
              <Smartphone size={16} />
              <span className="operators-device-label">Dispositivos vinculados:</span>
              {selectedOperator.assigned_devices ? (
                selectedOperator.assigned_devices.split(', ').map((dev, idx) => (
                  <span key={idx} className="operators-device-chip">
                    {dev}
                  </span>
                ))
              ) : (
                <em className="operators-no-devices">Sin dispositivos asignados</em>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="operators-empty-highlight">
          Selecciona un operador de la lista para ver sus detalles.
        </div>
      )}

      {/* TABLA DE OPERADORES */}
      <div className="table-container operators-table-panel">
        <table className="operators-table">
          <thead>
            <tr>
              <th>OPERADOR</th>
              <th>TURNO</th>
              <th>CAMPAÑA/S</th>
              {isAdmin && <th>EQUIPO</th>}
              <th>DISPOSITIVOS ASIGNADOS</th>
              <th style={{ textAlign: 'right' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((op) => {
              const isSelected = selectedOperator?.id === op.id;
              return (
                <tr
                  key={op.id}
                  style={{
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <td className="operators-name-cell">
                    <button
                      type="button"
                      className="operators-select-button"
                      onClick={() => setSelectedOperator(op)}
                      aria-pressed={isSelected}
                    >
                      {op.full_name}
                    </button>
                  </td>
                  <td>
                    <span className={`operators-shift-badge ${op.shift === 'Mañana' ? 'is-morning' : op.shift === 'Tarde' ? 'is-afternoon' : 'is-other'}`}>
                      {op.shift}
                    </span>
                  </td>
                  <td>{op.campaign || '-'}</td>
                  {isAdmin && (
                    <td className="operators-team-cell">
                      {op.team || '-'}
                    </td>
                  )}
                  <td>
                    {op.assigned_devices ? (
                      <span className="operators-device-count">
                        {op.assigned_devices.split(', ').length} equipo(s)
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '12px' }}>Ninguno</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(op)}
                      className="operators-action-button operators-edit-button"
                      title="Editar Operador"
                      aria-label={`Editar operador ${op.full_name}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(op)}
                      className="operators-action-button operators-delete-button"
                      title="Eliminar Operador"
                      aria-label={`Eliminar operador ${op.full_name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {operators.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? "6" : "5"} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                  No hay operadores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR / EDITAR */}
      {isModalOpen && (
        <div className="sim-glass-overlay" role="presentation">
          <div
            className="sim-glass-operator-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="operator-modal-title"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 id="operator-modal-title" style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>
                {editingOperator ? 'Editar Operador' : 'Nuevo Operador'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                aria-label="Cerrar formulario de operador"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}>
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}>
                  Turno *
                </label>
                <select
                  className="form-control"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                >
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}>
                  Campaña/s
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Portabilidad / Ventas"
                  value={formData.campaign}
                  onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                />
              </div>

              {/* Selector de Equipo únicamente para Administradores */}
              {isAdmin && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}>
                    Equipo / Ciudad
                  </label>
                  <select
                    className="form-control"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                  >
                    <option value="">Seleccionar Equipo...</option>
                    {teams.map((t) => (
                      <option key={t} value={t}>
                        Equipo {t}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="sim-glass-button is-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="sim-glass-button is-primary"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SimActionDialog
        dialog={operatorDialog}
        onClose={() => setOperatorDialog(null)}
        onConfirm={handleOperatorDialogConfirm}
      />

    </div>
  );
}