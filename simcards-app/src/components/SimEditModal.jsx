import { useState, useEffect } from 'react';
import { CreditCard, MessageCircle, X } from 'lucide-react';
import SimModalPortal from './SimModalPortal';

export default function SimEditModal({ editingSim, setEditingSim, handleSaveSimEdit, teamsList = [] }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [entity, setEntity] = useState('');
  const [team, setTeam] = useState('');
  const [waType, setWaType] = useState('');
  const [waLink, setWaLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingSim) {
      setPhoneNumber(editingSim.phone_number || '');
      setEntity(editingSim.entity || editingSim.campaign || '');
      setTeam(editingSim.team || '');
      setWaType(editingSim.wa_type || '');
      setWaLink(editingSim.wa_link || '');
    }
  }, [editingSim]);

  if (!editingSim) return null;

  const handlePhoneChange = (event) => {
    let rawValue = event.target.value.replace(/\D/g, '');
    if (rawValue.length > 10) rawValue = rawValue.slice(0, 10);

    let formattedValue = rawValue;
    if (rawValue.length > 6) {
      formattedValue = `${rawValue.slice(0, 2)} ${rawValue.slice(2, 6)} - ${rawValue.slice(6)}`;
    } else if (rawValue.length > 2) {
      formattedValue = `${rawValue.slice(0, 2)} ${rawValue.slice(2)}`;
    }

    setPhoneNumber(formattedValue);

    if (waType) {
      setWaLink((prevLink) => {
        if (!prevLink || prevLink.startsWith('https://wa.me/549')) {
          return rawValue ? `https://wa.me/549${rawValue}` : '';
        }
        return prevLink;
      });
    }
  };

  const handleWaTypeChange = (event) => {
    const newType = event.target.value;
    setWaType(newType);

    if (!newType) {
      setWaLink('');
    } else {
      const digits = phoneNumber.replace(/\D/g, '');
      setWaLink((prevLink) => {
        if (!prevLink || prevLink.startsWith('https://wa.me/549')) {
          return digits ? `https://wa.me/549${digits}` : 'https://wa.me/549';
        }
        return prevLink;
      });
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const saved = await handleSaveSimEdit({
        id: editingSim.id,
        phone_number: phoneNumber,
        phoneNumber,
        entity: entity || 'General',
        campaign: entity || 'General',
        team,
        wa_type: waType,
        waType,
        wa_link: waLink,
        waLink
      });
      if (saved) setEditingSim(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SimModalPortal onBackdropMouseDown={() => !isSaving && setEditingSim(null)}>
      <section className="sim-glass-modal sim-inventory-modal-card" role="dialog" aria-modal="true" aria-labelledby="sim-edit-title">
        <div className="sim-glass-glint" aria-hidden="true" />
        <header className="sim-glass-modal-header">
          <div className="sim-glass-modal-heading">
            <span className="sim-glass-modal-icon"><CreditCard size={20} /></span>
            <h2 id="sim-edit-title">Editar SIMCard</h2>
          </div>
          <button
            type="button"
            className="sim-glass-close"
            onClick={() => setEditingSim(null)}
            aria-label="Cerrar modal"
            disabled={isSaving}
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={onSubmit} className="sim-glass-form">
          <section className="sim-glass-form-section">
            <h3>Datos Generales</h3>
            <label className="sim-glass-field">
              <span>Número de Línea *</span>
              <input
                type="text"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="11 3830 - 3333"
                required
              />
            </label>
            <label className="sim-glass-field">
              <span>Entidad / Área</span>
              <input
                type="text"
                value={entity}
                onChange={(event) => setEntity(event.target.value)}
                placeholder="Ej: Administración / Ventas"
                required
              />
            </label>
            {teamsList.length > 0 && (
              <label className="sim-glass-field">
                <span>Equipo / Sede Asignada</span>
                <select value={team} onChange={(event) => setTeam(event.target.value)}>
                  <option value="">-- Seleccionar Equipo --</option>
                  {teamsList.map((item, index) => {
                    const teamName = typeof item === 'object' ? item.name : item;
                    return <option key={index} value={teamName}>Equipo {teamName}</option>;
                  })}
                </select>
              </label>
            )}
          </section>

          <section className="sim-glass-form-section">
            <h3><MessageCircle size={15} /> Configuración de WhatsApp</h3>
            <label className="sim-glass-field">
              <span>Tipo de WhatsApp</span>
              <select value={waType} onChange={handleWaTypeChange}>
                <option value="">Sin WhatsApp</option>
                <option value="WA Normal">WA Normal</option>
                <option value="WA Business">WA Business</option>
              </select>
            </label>
            <label className="sim-glass-field">
              <span>Link Directo de WhatsApp</span>
              <input
                type="text"
                value={waLink}
                onChange={(event) => setWaLink(event.target.value)}
                placeholder="https://wa.me/54911..."
              />
            </label>
          </section>

          <footer className="sim-glass-modal-footer">
            <button
              type="button"
              className="sim-glass-button is-secondary"
              onClick={() => setEditingSim(null)}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button type="submit" className="sim-glass-button is-primary" disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </footer>
        </form>
      </section>
    </SimModalPortal>
  );
}
