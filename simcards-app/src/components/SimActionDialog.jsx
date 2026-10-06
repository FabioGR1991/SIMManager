import { useEffect, useState } from 'react';
import { AlertTriangle, Info, MessageSquare, X } from 'lucide-react';
import SimModalPortal from './SimModalPortal';

export default function SimActionDialog({ dialog, onConfirm, onClose }) {
  const [observation, setObservation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setObservation('');
    setIsSubmitting(false);
  }, [dialog]);

  if (!dialog) return null;

  const isNotice = dialog.type === 'notice';
  const isPrompt = dialog.type === 'prompt';
  const isDanger = dialog.tone === 'danger';

  const handleConfirm = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(observation);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SimModalPortal onBackdropMouseDown={() => !isSubmitting && onClose()}>
      <section
        className={`sim-glass-dialog sim-inventory-modal-card${isDanger ? ' is-danger' : ''}`}
        role={isNotice ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="sim-dialog-title"
        aria-describedby="sim-dialog-message"
      >
        <div className="sim-glass-glint" aria-hidden="true" />
        <header className="sim-glass-dialog-header">
          <div className={`sim-glass-dialog-icon${isDanger ? ' is-danger' : ''}`}>
            {isDanger ? <AlertTriangle size={20} /> : isNotice ? <Info size={20} /> : <MessageSquare size={20} />}
          </div>
          <h2 id="sim-dialog-title">{dialog.title}</h2>
          <button type="button" className="sim-glass-close" onClick={onClose} aria-label="Cerrar" disabled={isSubmitting}>
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleConfirm}>
          <div className="sim-glass-dialog-body">
            <p id="sim-dialog-message">
              {dialog.messagePrefix}
              {dialog.highlighted && <strong className="sim-glass-highlight">{dialog.highlighted}</strong>}
              {dialog.messageSuffix}
            </p>
            {isPrompt && (
              <label className="sim-glass-field">
                <span>Observación (opcional)</span>
                <textarea
                  autoFocus
                  value={observation}
                  onChange={(event) => setObservation(event.target.value)}
                  placeholder="Agregá un detalle sobre el cambio"
                  rows={3}
                />
              </label>
            )}
          </div>
          <footer className="sim-glass-dialog-footer">
            {!isNotice && (
              <button type="button" className="sim-glass-button is-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </button>
            )}
            <button
              type={isPrompt || !isNotice ? 'submit' : 'button'}
              className="sim-glass-button is-primary"
              onClick={isNotice ? onClose : undefined}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando…' : dialog.confirmLabel || (isNotice ? 'Entendido' : 'Confirmar')}
            </button>
          </footer>
        </form>
      </section>
    </SimModalPortal>
  );
}
