import { useState, useEffect } from 'react';
import { X, Save, MessageCircle } from 'lucide-react';

export default function SimEditModal({ editingSim, setEditingSim, handleSaveSimEdit, teamsList = [] }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [campaign, setCampaign] = useState('');
  const [team, setTeam] = useState('');
  const [waType, setWaType] = useState('');
  const [waLink, setWaLink] = useState('');

  useEffect(() => {
    if (editingSim) {
      setPhoneNumber(editingSim.phone_number || '');
      setCampaign(editingSim.campaign || '');
      setTeam(editingSim.team || '');
      setWaType(editingSim.wa_type || '');
      setWaLink(editingSim.wa_link || '');
    }
  }, [editingSim]);

  if (!editingSim) return null;

  const handlePhoneChange = (e) => {
    let rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length > 10) rawValue = rawValue.slice(0, 10);

    let formattedValue = rawValue;
    if (rawValue.length > 6) {
      formattedValue = `${rawValue.slice(0, 2)} ${rawValue.slice(2, 6)} - ${rawValue.slice(6)}`;
    } else if (rawValue.length > 2) {
      formattedValue = `${rawValue.slice(0, 2)} ${rawValue.slice(2)}`;
    }

    setPhoneNumber(formattedValue);

    // Lógica de autorrelleno del Link al cambiar el número
    if (waType) {
      setWaLink((prevLink) => {
        // Solo actualiza si está vacío o si ya tiene el formato automático
        if (!prevLink || prevLink.startsWith('https://wa.me/549')) {
          return rawValue ? `https://wa.me/549${rawValue}` : '';
        }
        return prevLink; // Mantiene la edición manual si el usuario puso un link distinto
      });
    }
  };

  const handleWaTypeChange = (e) => {
    const newType = e.target.value;
    setWaType(newType);

    if (!newType) {
      setWaLink(''); // Limpia el link si se selecciona "Sin WhatsApp"
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

  const onSubmit = (e) => {
    e.preventDefault();
    handleSaveSimEdit(editingSim.id, phoneNumber, campaign, team, waType, waLink);
    setEditingSim(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '450px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Editar SIMCard</h3>
          <button
            type="button"
            onClick={() => setEditingSim(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Número de Línea
            </label>
            <input
              type="text"
              className="form-control"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="11 3830 - 3333"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Campaña
            </label>
            <input
              type="text"
              className="form-control"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="General"
              required
            />
          </div>

          {teamsList && teamsList.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Equipo / Sede Asignada
              </label>
              <select
                className="form-control"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
              >
                <option value="">-- Seleccionar Equipo --</option>
                {teamsList.map((t, idx) => {
                  const tName = typeof t === 'object' ? t.name : t;
                  return (
                    <option key={idx} value={tName}>
                      Equipo {tName}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Configuración de WhatsApp */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', color: '#16a34a', fontWeight: '600', fontSize: '14px' }}>
              <MessageCircle size={18} />
              <span>Ajustes de WhatsApp</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Tipo de WhatsApp
                </label>
                <select
                  className="form-control"
                  value={waType}
                  onChange={handleWaTypeChange}
                >
                  <option value="">Sin WhatsApp</option>
                  <option value="WA Normal">WA Normal</option>
                  <option value="WA Business">WA Business</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Link Directo de WhatsApp
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={waLink}
                  onChange={(e) => setWaLink(e.target.value)}
                  placeholder="https://wa.me/54911..."
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setEditingSim(null)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: 'auto',
                padding: '8px 16px'
              }}
            >
              <Save size={16} /> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}