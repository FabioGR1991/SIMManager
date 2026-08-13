import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, Plus, Edit, Trash2, Smartphone, Shield, X } from 'lucide-react';

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
    <div className="view-animated">

      {/* ------------------------------------------------------------------ */}
      {/* CABECERA EN 2 LÍNEAS INDEPENDIENTES                               */}
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
              justifyContent: 'center',
              color: '#38bdf8',
              flexShrink: 0
            }}>
              <UserCheck size={24} />
            </div>

            {/* Título */}
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
              Gestión de Operadores
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
              <Shield size={14} />
              <span>Representantes & Turnos</span>
            </div>

          </div>

          {/* LÍNEA 2: Subtítulo */}
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
              Administrá los representantes asignados a los dispositivos, controlá turnos y gestioná las campañas asociadas.
            </p>
          </div>
        </div>

        {/* BOTÓN NUEVO OPERADOR */}
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="btn"
          style={{
            width: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '4px',
            boxShadow: '0 0 12px rgba(37, 99, 235, 0.3)'
          }}
        >
          <Plus size={18} /> Nuevo Operador
        </button>

      </div>

      {/* FICHA DESTACADA SUPERIOR */}
      {selectedOperator ? (
        <div style={{
          backgroundColor: '#0f172a',
          padding: '20px',
          borderRadius: '10px',
          border: '1px solid #1e293b',
          borderLeft: '4px solid #38bdf8',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#1e293b',
            color: '#38bdf8',
            border: '1px solid #38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 'bold'
          }}>
            {selectedOperator.full_name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '18px' }}>
              {selectedOperator.full_name}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>
              Turno: <strong style={{ color: '#38bdf8' }}>{selectedOperator.shift}</strong> |
              Campaña: <strong style={{ color: '#f8fafc' }}>{selectedOperator.campaign || 'Sin asignar'}</strong> |
              Equipo: <strong style={{ color: '#38bdf8' }}>{selectedOperator.team || 'Sin asignar'}</strong>
            </p>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Smartphone size={16} color="#94a3b8" />
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Dispositivos vinculados:</span>
              {selectedOperator.assigned_devices ? (
                selectedOperator.assigned_devices.split(', ').map((dev, idx) => (
                  <span key={idx} style={{
                    backgroundColor: '#1e293b',
                    color: '#38bdf8',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    border: '1px solid #334155',
                    fontWeight: '500'
                  }}>
                    {dev}
                  </span>
                ))
              ) : (
                <em style={{ fontSize: '12px', color: '#64748b' }}>Sin dispositivos asignados</em>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '16px', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#94a3b8', marginBottom: '20px' }}>
          Selecciona un operador de la lista para ver sus detalles.
        </div>
      )}

      {/* TABLA DE OPERADORES */}
      <div className="table-container">
        <table>
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
                  onClick={() => setSelectedOperator(op)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <td style={{ fontWeight: '600', color: '#f8fafc' }}>
                    {op.full_name}
                  </td>
                  <td style={{ color: '#cbd5e1' }}>{op.shift}</td>
                  <td style={{ color: '#cbd5e1' }}>{op.campaign || '-'}</td>
                  {isAdmin && (
                    <td style={{ color: '#38bdf8', fontWeight: '500' }}>
                      {op.team || '-'}
                    </td>
                  )}
                  <td>
                    {op.assigned_devices ? (
                      <span style={{
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        fontWeight: '600'
                      }}>
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
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38bdf8', marginRight: '8px', padding: '4px' }}
                      title="Editar Operador"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(op)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: '4px' }}
                      title="Eliminar Operador"
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
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            padding: '24px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '420px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>
                {editingOperator ? 'Editar Operador' : 'Nuevo Operador'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
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
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    background: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ width: 'auto', padding: '8px 18px', fontSize: '14px', backgroundColor: '#0284c7' }}
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