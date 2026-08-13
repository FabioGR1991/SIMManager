import { useState, useEffect } from 'react';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';

export default function UsersView({
  usersList = [],
  teamsList = [],
  handleCreateUser,
  setEditingUser,
  handleDeleteUser
}) {
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uRole, setURole] = useState('tl');
  const [uTeam, setUTeam] = useState('');

  // Sincronizar el equipo por defecto cuando cargan los equipos dinámicos
  useEffect(() => {
    if (teamsList.length > 0 && !uTeam) {
      const firstTeam = typeof teamsList[0] === 'object' ? teamsList[0].name : teamsList[0];
      setUTeam(firstTeam);
    }
  }, [teamsList]);

  // Manejar cambio de rol con auto-asignación a "Monte Olimpo" para admins
  const handleRoleChange = (newRole) => {
    setURole(newRole);
    if (newRole === 'admin') {
      const monteOlimpoExists = teamsList.some(t => {
        const name = typeof t === 'object' ? t.name : t;
        return name.toLowerCase() === 'monte olimpo';
      });
      if (monteOlimpoExists) {
        setUTeam('Monte Olimpo');
      }
    }
  };

  const onSubmitUser = (e) => {
    e.preventDefault();
    handleCreateUser({ name: uName, email: uEmail, password: uPassword, role: uRole, team: uTeam }, () => {
      setUName('');
      setUEmail('');
      setUPassword('');
      setURole('tl');
      const defaultTeam = typeof teamsList[0] === 'object' ? teamsList[0].name : (teamsList[0] || '');
      setUTeam(defaultTeam);
    });
  };

  // Helper para badge de rol neón
  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return {
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.3)'
        };
      case 'pl':
        return {
          backgroundColor: 'rgba(168, 85, 247, 0.12)',
          color: '#c084fc',
          border: '1px solid rgba(168, 85, 247, 0.3)'
        };
      default: // 'tl'
        return {
          backgroundColor: 'rgba(148, 163, 184, 0.12)',
          color: '#cbd5e1',
          border: '1px solid rgba(148, 163, 184, 0.25)'
        };
    }
  };

  return (
    <div className="view-animated">
      <h1 style={{ marginTop: 0, fontSize: '24px', color: '#ffffff', marginBottom: '20px' }}>
        Gestión de Usuarios y Permisos
      </h1>

      {/* Formulario de Alta */}
      <div className="table-container" style={{ marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
          <UserPlus size={18} className="text-cyan-400" /> Crear Nuevo Usuario
        </h3>
        <form onSubmit={onSubmitUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Nombre Completo</label>
            <input type="text" className="form-control" value={uName} onChange={(e) => setUName(e.target.value)} placeholder="Ej: Juan Pérez" required />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Correo Electrónico</label>
            <input type="email" className="form-control" value={uEmail} onChange={(e) => setUEmail(e.target.value)} placeholder="juan@empresa.com" required />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Contraseña</label>
            <input type="password" className="form-control" value={uPassword} onChange={(e) => setUPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Rol / Permisos</label>
            <select className="form-control" value={uRole} onChange={(e) => handleRoleChange(e.target.value)}>
              <option value="tl">Team Leader (TL)</option>
              <option value="pl">Planificador (PL)</option>
              <option value="admin">Administrador General</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Equipo Asignado</label>
            <select
              className="form-control"
              value={uTeam}
              onChange={(e) => setUTeam(e.target.value)}
              required
            >
              <option value="">-- Seleccionar Equipo --</option>
              {teamsList.map((team, index) => {
                const teamName = typeof team === 'object' ? team.name : team;
                const teamId = typeof team === 'object' ? team.id : index;
                return (
                  <option key={teamId} value={teamName}>
                    {teamName}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
            <button type="submit" className="btn-primary">Guardar Usuario</button>
          </div>
        </form>
      </div>

      {/* Tabla de Usuarios Registrados */}
      <div className="table-container">
        <h3 style={{ margin: '0 0 15px 0', color: '#ffffff' }}>Usuarios Registrados</h3>
        <table>
          <thead>
            <tr>
              <th># ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Equipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: '700', color: '#ffffff' }}>#{u.id}</td>
                <td style={{ color: '#ffffff', fontWeight: '500' }}>{u.name}</td>
                <td style={{ color: '#cbd5e1' }}>{u.email}</td>
                <td>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'inline-block',
                    ...getRoleBadgeStyle(u.role)
                  }}>
                    {u.role === 'admin' ? 'Administrador' : u.role === 'pl' ? 'Planificador' : 'Team Leader'}
                  </span>
                </td>
                <td style={{ color: '#cbd5e1' }}>{u.team || 'Sin asignar'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

                    {/* Botón Editar - Estilo Imagen 1 */}
                    <button
                      type="button"
                      onClick={() => setEditingUser({ ...u, password: '' })}
                      title="Editar usuario"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Pencil size={15} color="#ea580c" />
                    </button>

                    {/* Botón Eliminar - Estilo Imagen 1 */}
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u)}
                      title="Eliminar usuario"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Trash2 size={15} color="#ef4444" />
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}