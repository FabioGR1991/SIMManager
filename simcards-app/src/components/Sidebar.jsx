import React from 'react';
import { 
  LogOut, 
  Users, 
  LayoutDashboard, 
  RefreshCw, 
  Smartphone, 
  MapPin, 
  UserCheck, 
  Home,
  Radio
} from 'lucide-react';

export default function Sidebar({
  user,
  isAdmin,
  activeTab,
  setActiveTab,
  setTargetDeviceId,
  handleLogout
}) {
  const getButtonStyle = (tabKey) => {
    const isSelected = activeTab === tabKey;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 12px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      backgroundColor: isSelected ? '#0284c7' : 'transparent',
      color: isSelected ? '#ffffff' : '#94a3b8',
      fontWeight: isSelected ? '600' : '500',
      fontSize: '14px',
      transition: 'all 0.2s ease'
    };
  };

  return (
    <aside style={{
      width: '250px',
      minWidth: '250px',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px',
      height: '100vh',
      boxSizing: 'border-box',
      borderRight: '1px solid #1e293b'
    }}>
      {/* Sección Superior - Logo y Menú */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        
        {/* Branding SIMFinity */}
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid #1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radio size={20} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 'bold', color: '#ffffff', lineHeight: 1 }}>
              SIM<span style={{ color: '#38bdf8' }}>Finity</span>
            </h1>
            <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '4px' }}>
              {isAdmin 
                ? 'Administración Global' 
                : (user?.role === 'pl' || user?.role === 'Planificador')
                  ? `PL • ${user?.team || 'Sin Equipo'}`
                  : `TL • ${user?.team || 'Sin Equipo'}`}
            </small>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          
          <button
            onClick={() => {
              setActiveTab('panel');
              setTargetDeviceId(null);
            }}
            style={getButtonStyle('panel')}
          >
            <Home size={18} />
            <span>Panel de Control</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('dashboard');
              setTargetDeviceId(null);
            }}
            style={getButtonStyle('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Inventario SIMs</span>
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            style={getButtonStyle('devices')}
          >
            <Smartphone size={18} />
            <span>Dispositivos</span>
          </button>

          <button
            onClick={() => setActiveTab('operators')}
            style={getButtonStyle('operators')}
          >
            <UserCheck size={18} />
            <span>Operadores</span>
          </button>

          {/* Opciones Admin */}
          {isAdmin && (
            <>
              <div style={{ margin: '12px 0 4px 0', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', color: '#475569', letterSpacing: '0.5px' }}>
                  Gestión Admin
                </span>
              </div>

              <button
                onClick={() => setActiveTab('teams')}
                style={getButtonStyle('teams')}
              >
                <MapPin size={18} />
                <span>Equipos / Ciudades</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                style={getButtonStyle('users')}
              >
                <Users size={18} />
                <span>Usuarios y Permisos</span>
              </button>

              <button
                onClick={() => setActiveTab('sync')}
                style={getButtonStyle('sync')}
              >
                <RefreshCw size={18} />
                <span>Conciliación Movistar</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Footer (Usuario y Logout) */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: '15px', marginTop: '15px' }}>
        <div style={{ fontSize: '12px', marginBottom: '12px', color: '#94a3b8', backgroundColor: '#1e293b', padding: '10px', borderRadius: '8px' }}>
          <span style={{ color: '#64748b', display: 'block', fontSize: '10px', marginBottom: '2px' }}>Conectado como:</span>
          <strong style={{ color: '#f8fafc', fontSize: '13px' }}>{user?.name || 'Usuario'}</strong>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '13px',
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}