export default function UserEditModal({
  editingUser,
  setEditingUser,
  handleUpdateUser,
  teamsList = []
}) {
  if (!editingUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (handleUpdateUser) {
      await handleUpdateUser(e);
    }

    try {
      const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (loggedUser && loggedUser.id === editingUser.id) {
        const updatedSessionUser = {
          ...loggedUser,
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          team: editingUser.team
        };
        localStorage.setItem('user', JSON.stringify(updatedSessionUser));
        window.location.reload();
      }
    } catch (err) {
      console.error('Error actualizando sesión local:', err);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
        <h3 style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          Editar Usuario: <span style={{ color: '#2563eb' }}>{editingUser.name}</span>
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nombre Completo</label>
            <input
              type="text"
              className="form-control"
              value={editingUser.name || ''}
              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              value={editingUser.email || ''}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Rol / Permisos</label>
            <select
              className="form-control"
              value={editingUser.role || 'tl'}
              onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
            >
              <option value="tl">Team Leader (TL)</option>
              <option value="pl">Planificador (PL)</option>
              <option value="admin">Administrador General</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Equipo Asignado</label>
            <select
              className="form-control"
              value={editingUser.team || ''}
              onChange={(e) => setEditingUser({ ...editingUser, team: e.target.value })}
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

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Nueva Contraseña (Opcional)</label>
            <input
              type="password"
              className="form-control"
              placeholder="Dejar en blanco para no modificar"
              value={editingUser.password || ''}
              onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="btn" style={{ flex: 1 }}>Guardar Cambios</button>
            <button type="button" onClick={() => setEditingUser(null)} className="btn" style={{ flex: 1, backgroundColor: '#64748b' }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}