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
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '540px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del Modal */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={20} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>
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
              color: '#64748b',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            title="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Subencabezado con el teléfono */}
        <div style={{ padding: '12px 24px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#475569' }}>
          Línea: <strong style={{ color: '#2563eb', fontSize: '15px' }}>{selectedPhone}</strong>
        </div>

        {/* Contenido / Lista de Logs */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {selectedLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
              <History size={36} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>No hay registros de cambios para esta línea aún.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                      <User size={14} color="#64748b" />
                      <span>{log.user_name || 'Usuario'}</span>
                    </div>

                    {log.created_at && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8' }}>
                        <Clock size={12} />
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                    <span>Cambió estado a:</span>
                    <span className={`status-badge ${getBadgeClass(log.new_status)}`}>
                      {log.new_status}
                    </span>
                  </div>

                  {log.observation && (
                    <div style={{
                      marginTop: '2px',
                      padding: '8px 10px',
                      backgroundColor: '#ffffff',
                      borderRadius: '6px',
                      borderLeft: '3px solid #94a3b8',
                      fontSize: '12px',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px'
                    }}>
                      <MessageSquare size={14} color="#94a3b8" style={{ marginTop: '1px', flexShrink: 0 }} />
                      <span style={{ fontStyle: 'italic' }}>{log.observation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', textAlign: 'right' }}>
          <button
            type="button"
            onClick={() => setSelectedLogs(null)}
            className="btn"
            style={{
              width: 'auto',
              minWidth: '100px',
              backgroundColor: '#64748b',
              padding: '8px 18px',
              fontSize: '14px'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}