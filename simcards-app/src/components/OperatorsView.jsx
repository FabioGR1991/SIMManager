import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, Plus, Edit, Trash2, Smartphone, ShieldAlert } from 'lucide-react';

const DEFAULT_TEAMS = ['Tokio', 'Roma', 'Madrid', 'Berlín', 'Buenos Aires'];

export default function OperatorsView({ API_URL, token, user }) {
  const [operators, setOperators] = useState([]);
  const [teams, setTeams] = useState(DEFAULT_TEAMS);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState(null);

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
      alert(err.response?.data?.error || 'Error al guardar el operador');
    }
  };

  const handleDelete = async (operator) => {
    if (!window.confirm(`¿Estás seguro de eliminar al operador ${operator.full_name}?`)) return;

    try {
      await axios.delete(`${API_URL}/operators/${operator.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selectedOperator?.id === operator.id) setSelectedOperator(null);
      fetchOperators();
    } catch (err) {
      alert('Error al eliminar el operador');
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'Administrador';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header + Botón Crear */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>Gestión de Operadores</h2>
          <small style={{ color: '#64748b' }}>Administra los representantes asignados a los dispositivos</small>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#0284c7', color: '#fff', border: 'none',
            padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
          }}
        >
          <Plus size={18} /> Nuevo Operador
        </button>
      </div>

      {/* Ficha Destacada Superior */}
      {selectedOperator ? (
        <div style={{
          backgroundColor: '#fff', padding: '20px', borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #0284c7',
          display: 'flex', alignItems: 'center', gap: '20px'
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e0f2fe',
            color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: 'bold'
          }}>
            {selectedOperator.full_name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{selectedOperator.full_name}</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
              Turno: <strong>{selectedOperator.shift}</strong> | Campaña: <strong>{selectedOperator.campaign || 'Sin asignar'}</strong> | Equipo: <strong>{selectedOperator.team || 'Sin asignar'}</strong>
            </p>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={16} color="#64748b" />
              <span style={{ fontSize: '13px', color: '#334155' }}>Dispositivos vinculados:</span>
              {selectedOperator.assigned_devices ? (
                selectedOperator.assigned_devices.split(', ').map((dev, idx) => (
                  <span key={idx} style={{
                    backgroundColor: '#f1f5f9', color: '#334155', padding: '2px 8px',
                    borderRadius: '12px', fontSize: '12px', border: '1px solid #cbd5e1'
                  }}>
                    {dev}
                  </span>
                ))
              ) : (
                <em style={{ fontSize: '12px', color: '#94a3b8' }}>Sin dispositivos asignados</em>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px', color: '#64748b' }}>
          Selecciona un operador de la lista para ver sus detalles.
        </div>
      )}

      {/* Tabla de Operadores */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '12px 16px' }}>Operador</th>
              <th style={{ padding: '12px 16px' }}>Turno</th>
              <th style={{ padding: '12px 16px' }}>Campaña/s</th>
              {isAdmin && <th style={{ padding: '12px 16px' }}>Equipo</th>}
              <th style={{ padding: '12px 16px' }}>Dispositivos Asignados</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((op) => (
              <tr
                key={op.id}
                onClick={() => setSelectedOperator(op)}
                style={{
                  borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                  backgroundColor: selectedOperator?.id === op.id ? '#f0f9ff' : 'transparent'
                }}
              >
                <td style={{ padding: '12px 16px', fontWeight: '500', color: '#0f172a' }}>
                  {op.full_name}
                </td>
                <td style={{ padding: '12px 16px', color: '#334155' }}>{op.shift}</td>
                <td style={{ padding: '12px 16px', color: '#334155' }}>{op.campaign || '-'}</td>
                {isAdmin && (
                  <td style={{ padding: '12px 16px', color: '#0369a1', fontWeight: '500' }}>
                    {op.team || '-'}
                  </td>
                )}
                <td style={{ padding: '12px 16px' }}>
                  {op.assigned_devices ? (
                    <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                      {op.assigned_devices.split(', ').length} equipo(s)
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>Ninguno</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpenModal(op)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', marginRight: '8px' }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(op)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {operators.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? "6" : "5"} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                  No hay operadores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>
              {editingOperator ? 'Editar Operador' : 'Nuevo Operador'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                  Turno *
                </label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                >
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                  Campaña/s
                </label>
                <input
                  type="text"
                  placeholder="Ej: Portabilidad / Ventas"
                  value={formData.campaign}
                  onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              {/* Selector de Equipo disponible únicamente para Administradores */}
              {isAdmin && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                    Equipo / Ciudad
                  </label>
                  <select
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
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
                  style={{ padding: '8px 14px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 14px', borderRadius: '4px', border: 'none', background: '#0284c7', color: '#fff', cursor: 'pointer', fontWeight: '500' }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}