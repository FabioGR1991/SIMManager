import React from 'react';
import faviconLogo from '../assets/simfinity-favicon.png';
import {
  LogOut,
  Users,
  LayoutDashboard,
  RefreshCw,
  Smartphone,
  MapPin,
  UserCheck,
  Home
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
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '11px 14px 11px 16px',
      borderRadius: '12px',
      border: isSelected ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
      // Degradado cósmico/neón para la pestaña activa
      background: isSelected
        ? 'linear-gradient(90deg, rgba(2, 132, 199, 0.55) 0%, rgba(99, 102, 241, 0.35) 50%, rgba(217, 119, 6, 0.25) 100%)'
        : 'transparent',
      color: isSelected ? '#ffffff' : '#94a3b8',
      fontWeight: isSelected ? '600' : '500',
      fontSize: '14px',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isSelected ? '0 4px 20px rgba(2, 132, 199, 0.25)' : 'none',
      overflow: 'hidden'
    };
  };

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      // Fondo "Cielo Universal": Azul cósmico profundo
      background: 'linear-gradient(180deg, #0d1527 0%, #080d1a 60%, #050811 100%)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px 16px',
      height: 'calc(100vh - 24px)',
      margin: '12px 0 12px 12px',
      borderRadius: '20px',
      boxSizing: 'border-box',
      border: '1px solid rgba(56, 189, 248, 0.15)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.08)'
    }}>
      {/* Sección Superior - Logo y Menú */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

        {/* Branding SIMFinity */}
        <div style={{
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Favicon */}
          <div style={{
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img
              src={faviconLogo}
              alt="SIMFinity Logo"
              style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '10px' }}
            />
          </div>

          <div>
            <h1 style={{
              fontSize: '22px',
              margin: 0,
              fontWeight: '900',
              lineHeight: 1,
              letterSpacing: '-0.5px',
              fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
              filter: 'drop-shadow(0px 2px 6px rgba(168, 85, 247, 0.35))'
            }}>
              <span style={{ color: '#ffffff' }}>SIM</span>
              <span style={{
                background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                finity
              </span>
            </h1>

            <small style={{ color: '#64748b', fontSize: '11px', display: 'block', marginTop: '4px', fontWeight: '500' }}>
              {isAdmin
                ? 'Administración Global'
                : (user?.role === 'pl' || user?.role === 'Planificador')
                  ? `PL • ${user?.team || 'Sin Equipo'}`
                  : `TL • ${user?.team || 'Sin Equipo'}`}
            </small>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>

          {/* Item: Panel de Control */}
          <button
            onClick={() => {
              setActiveTab('panel');
              setTargetDeviceId(null);
            }}
            style={getButtonStyle('panel')}
          >
            {activeTab === 'panel' && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                backgroundColor: '#38bdf8',
                boxShadow: '0 0 12px #38bdf8'
              }} />
            )}
            <Home size={18} color={activeTab === 'panel' ? '#ffffff' : '#94a3b8'} />
            <span>Panel de Control</span>
          </button>

          {/* Item: Inventario SIMs */}
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setTargetDeviceId(null);
            }}
            style={getButtonStyle('dashboard')}
          >
            {activeTab === 'dashboard' && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                backgroundColor: '#38bdf8',
                boxShadow: '0 0 12px #38bdf8'
              }} />
            )}
            <LayoutDashboard size={18} color={activeTab === 'dashboard' ? '#ffffff' : '#94a3b8'} />
            <span>Inventario SIMs</span>
          </button>

          {/* Item: Dispositivos */}
          <button
            onClick={() => setActiveTab('devices')}
            style={getButtonStyle('devices')}
          >
            {activeTab === 'devices' && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                backgroundColor: '#38bdf8',
                boxShadow: '0 0 12px #38bdf8'
              }} />
            )}
            <Smartphone size={18} color={activeTab === 'devices' ? '#ffffff' : '#94a3b8'} />
            <span>Dispositivos</span>
          </button>

          {/* Item: Operadores */}
          <button
            onClick={() => setActiveTab('operators')}
            style={getButtonStyle('operators')}
          >
            {activeTab === 'operators' && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                backgroundColor: '#38bdf8',
                boxShadow: '0 0 12px #38bdf8'
              }} />
            )}
            <UserCheck size={18} color={activeTab === 'operators' ? '#ffffff' : '#94a3b8'} />
            <span>Operadores</span>
          </button>

          {/* Opciones Admin */}
          {isAdmin && (
            <>
              <div style={{ margin: '14px 0 4px 0', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', letterSpacing: '0.8px', paddingLeft: '8px' }}>
                  Gestión Admin
                </span>
              </div>

              {/* Item: Equipos / Ciudades */}
              <button
                onClick={() => setActiveTab('teams')}
                style={getButtonStyle('teams')}
              >
                {activeTab === 'teams' && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: '#38bdf8',
                    boxShadow: '0 0 12px #38bdf8'
                  }} />
                )}
                <MapPin size={18} color={activeTab === 'teams' ? '#ffffff' : '#94a3b8'} />
                <span>Equipos / Ciudades</span>
              </button>

              {/* Item: Usuarios y Permisos */}
              <button
                onClick={() => setActiveTab('users')}
                style={getButtonStyle('users')}
              >
                {activeTab === 'users' && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: '#38bdf8',
                    boxShadow: '0 0 12px #38bdf8'
                  }} />
                )}
                <Users size={18} color={activeTab === 'users' ? '#ffffff' : '#94a3b8'} />
                <span>Usuarios y Permisos</span>
              </button>

              {/* Item: Conciliación Movistar */}
              <button
                onClick={() => setActiveTab('sync')}
                style={getButtonStyle('sync')}
              >
                {activeTab === 'sync' && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: '#38bdf8',
                    boxShadow: '0 0 12px #38bdf8'
                  }} />
                )}
                <RefreshCw size={18} color={activeTab === 'sync' ? '#ffffff' : '#94a3b8'} />
                <span>Conciliación Movistar</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Footer (Usuario y Logout) */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', marginTop: '12px' }}>
        <div style={{
          fontSize: '12px',
          marginBottom: '10px',
          color: '#94a3b8',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '10px 12px',
          borderRadius: '12px'
        }}>
          <span style={{ color: '#64748b', display: 'block', fontSize: '10px', marginBottom: '2px', fontWeight: '500' }}>Conectado como:</span>
          <strong style={{ color: '#f8fafc', fontSize: '13px' }}>{user?.name || 'Usuario'}</strong>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.18)',
            borderRadius: '12px',
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