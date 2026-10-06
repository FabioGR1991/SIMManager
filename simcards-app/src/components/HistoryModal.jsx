import { X, History, Clock, User, MessageSquare } from 'lucide-react';

export default function HistoryModal({ selectedLogs, selectedPhone, setSelectedLogs, getBadgeClass }) {
  if (!selectedLogs) return null;

  return (
    <div
      className="sim-glass-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setSelectedLogs(null);
      }}
    >
      <section className="sim-glass-modal sim-history-modal" role="dialog" aria-modal="true" aria-labelledby="sim-history-title">
        <div className="sim-glass-glint" aria-hidden="true" />
        <header className="sim-glass-modal-header">
          <div className="sim-glass-modal-heading">
            <span className="sim-glass-modal-icon"><History size={20} /></span>
            <h2 id="sim-history-title">Historial de Línea</h2>
          </div>
          <button type="button" className="sim-glass-close" onClick={() => setSelectedLogs(null)} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </header>

        <div className="sim-history-phone">
          Línea: <strong>{selectedPhone}</strong>
        </div>

        <div className="sim-history-content">
          {selectedLogs.length === 0 ? (
            <div className="sim-history-empty">
              <History size={36} aria-hidden="true" />
              <p>No hay registros de cambios para esta línea aún.</p>
            </div>
          ) : (
            <div className="sim-history-list">
              {selectedLogs.map((log) => (
                <article className="sim-history-entry" key={log.id}>
                  <div className="sim-history-meta">
                    <span className="sim-history-user"><User size={15} /> {log.user_name || 'Usuario'}</span>
                    {log.created_at && (
                      <time className="sim-history-date" dateTime={log.created_at}>
                        <Clock size={13} /> {new Date(log.created_at).toLocaleString()}
                      </time>
                    )}
                  </div>
                  <div className="sim-history-status">
                    <span>Cambió estado a:</span>
                    <span className={`status-badge ${getBadgeClass(log.new_status)}`}>{log.new_status}</span>
                  </div>
                  {log.observation && (
                    <p className="sim-history-observation">
                      <MessageSquare size={14} aria-hidden="true" />
                      <span>{log.observation}</span>
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="sim-glass-modal-footer">
          <button type="button" className="sim-glass-button is-primary" onClick={() => setSelectedLogs(null)}>
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  );
}
