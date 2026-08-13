import { X, History, Clock, User, MessageSquare } from 'lucide-react';

export default function HistoryModal({ selectedLogs, selectedPhone, setSelectedLogs, getBadgeClass }) {
  if (!selectedLogs) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
      onClick={() => setSelectedLogs(null)}
    >
      <div
        style={{
          backgroundColor: '#17202e',
          border: '1px solid #233147',
          borderRadius: '12px',
          maxWidth: '540px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
          color: '#f8fafc'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del Modal */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #233147',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={18} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#ffffff' }}>
              Historial de Línea
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSelectedLogs(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Subencabezado con el teléfono */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#111827',
            borderBottom: '1px solid #233147',
            fontSize: '13px',
            color: '#94a3b8'
          }}
        >
          Línea: <strong style={{ color: '#38bdf8', fontSize: '14px', marginLeft: '4px' }}>{selectedPhone}</strong>
        </div>

        {/* Contenido / Lista de Logs */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {selectedLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
              <History size={36} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>No hay registros de cambios para esta línea aún.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #1f293d',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>
                      <User size={14} color="#64748b" />
                      <span>{log.user_name || 'Usuario'}</span>
                    </div>

                    {log.created_at && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                        <Clock size={12} />
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                    <span>Cambió estado a:</span>
                    <span className={`status-badge ${getBadgeClass(log.new_status)}`}>
                      {log.new_status}
                    </span>
                  </div>

                  {log.observation && (
                    <div style={{
                      marginTop: '2px',
                      padding: '8px 10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '6px',
                      borderLeft: '3px solid #64748b',
                      fontSize: '12px',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px'
                    }}>
                      <MessageSquare size={14} color="#64748b" style={{ marginTop: '1px', flexShrink: 0 }} />
                      <span style={{ fontStyle: 'italic' }}>{log.observation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #233147',
            backgroundColor: '#17202e',
            textAlign: 'right'
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedLogs(null)}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}