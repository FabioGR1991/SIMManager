export default function HistoryModal({ selectedLogs, selectedPhone, setSelectedLogs, getBadgeClass }) {
  if (!selectedLogs) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '520px', width: '90%' }}>
        <h3 style={{ marginTop: 0, borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
          Historial de Línea: <span style={{ color: '#2563eb' }}>{selectedPhone}</span>
        </h3>

        {selectedLogs.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No hay registros aún.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '300px', overflowY: 'auto' }}>
            {selectedLogs.map((log) => (
              <li key={log.id} style={{ borderBottom: '1px solid #f1f5f9', padding: '10px 0' }}>
                <strong>{log.user_name || 'Usuario'}</strong> cambió a{' '}
                <span className={`status-badge ${getBadgeClass(log.new_status)}`}>
                  {log.new_status}
                </span>
                {log.created_at && (
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>
                    ({new Date(log.created_at).toLocaleString()})
                  </span>
                )}
                {log.observation && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569', fontStyle: 'italic' }}>
                    Obs: {log.observation}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => setSelectedLogs(null)}
          className="btn"
          style={{ marginTop: '15px', width: '100%', backgroundColor: '#64748b' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}