import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';

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

  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: '24px' }}>Gestión de Usuarios y Permisos</h1>

      <div className="table-container" style={{ marginBottom: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={18} /> Crear Nuevo Usuario
        </h3>
        <form onSubmit={onSubmitUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nombre Completo</label>
            <input type="text" className="form-control" value={uName} onChange={(e) => setUName(e.target.value)} placeholder="Ej: Juan Pérez" required />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Correo Electrónico</label>
            <input type="email" className="form-control" value={uEmail} onChange={(e) => setUEmail(e.target.value)} placeholder="juan@empresa.com" required />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Contraseña</label>
            <input type="password" className="form-control" value={uPassword} onChange={(e) => setUPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Rol / Permisos</label>
            <select className="form-control" value={uRole} onChange={(e) => handleRoleChange(e.target.value)}>
              <option value="tl">Team Leader (TL)</option>
              <option value="pl">Planificador (PL)</option>
              <option value="admin">Administrador General</option>
            </select>
          </div>

          {/* DROPDOWN DINÁMICO DESDE LA BASE DE DATOS */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Equipo Asignado</label>
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
            <button type="submit" className="btn" style={{ width: 'auto' }}>Guardar Usuario</button>
          </div>
        </form>
      </div>

      <div className="table-container">
        <h3>Usuarios Registrados</h3>
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
                <td><strong>#{u.id}</strong></td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    backgroundColor: u.role === 'admin' ? '#dbeafe' : u.role === 'pl' ? '#f3e8ff' : '#f1f5f9',
                    color: u.role === 'admin' ? '#1e40af' : u.role === 'pl' ? '#6b21a8' : '#475569'
                  }}>
                    {u.role === 'admin' ? 'Administrador' : u.role === 'pl' ? 'Planificador' : 'Team Leader'}
                  </span>
                </td>
                <td>{u.team || 'Sin asignar'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingUser({ ...u, password: '' })}
                      title="Editar usuario"
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                    >
                      ✏️
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u)}
                      title="Eliminar usuario"
                      style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                    >
                      🗑️
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