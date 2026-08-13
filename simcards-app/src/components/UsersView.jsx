import { useState, useEffect } from 'react';
import { UserPlus, SquarePen, Trash2, Users, ShieldCheck } from 'lucide-react';

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

      {/* ------------------------------------------------------------------ */}
      {/* CABECERA EN 2 LÍNEAS INDEPENDIENTES                               */}
      {/* ------------------------------------------------------------------ */}
      <div style={{ marginBottom: '28px', width: '100%' }}>

        {/* LÍNEA 1: Icono + Título (1 sola línea) + Píldora */}
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
            <Users size={24} />
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
            Gestión de Usuarios y Permisos
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
            <ShieldCheck size={14} />
            <span>Control de Acceso</span>
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
            Administrá el alta de nuevos usuarios, asignación de roles y niveles de acceso para cada equipo de la plataforma.
          </p>
        </div>

      </div>

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
              <th>NOMBRE</th>
              <th>EMAIL</th>
              <th>ROL</th>
              <th>EQUIPO</th>
              <th>ACCIONES</th>
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
                  {/* Solo Editar y Eliminar (Sin fondo blanco) */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>

                    {/* Botón Editar */}
                    <button
                      type="button"
                      onClick={() => setEditingUser({ ...u, password: '' })}
                      title="Editar usuario"
                      style={actionButtonStyle}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <SquarePen size={19} color="#3b82f6" />
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u)}
                      title="Eliminar usuario"
                      style={actionButtonStyle}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 size={19} color="#f87171" />
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

// Estilo base para los botones de acción sin fondo
const actionButtonStyle = {
  background: 'transparent',
  border: 'none',
  padding: '6px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, transform 0.1s ease',
};