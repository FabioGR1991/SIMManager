import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function SimEditModal({ editingSim, setEditingSim, handleSaveSimEdit, teamsList = [] }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [entity, setEntity] = useState('');
  const [team, setTeam] = useState('');
  const [waType, setWaType] = useState('');
  const [waLink, setWaLink] = useState('');

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

    if (waType) {
      setWaLink((prevLink) => {
        if (!prevLink || prevLink.startsWith('https://wa.me/549')) {
          return rawValue ? `https://wa.me/549${rawValue}` : '';
        }
        return prevLink;
      });
    }
  };

  const handleWaTypeChange = (e) => {
    const newType = e.target.value;
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

  const onSubmit = (e) => {
    e.preventDefault();
    handleSaveSimEdit({
      id: editingSim.id,
      phone_number: phoneNumber,
      phoneNumber,
      entity: entity || 'General',
      campaign: entity || 'General',
      team,
      wa_type: waType,
      waType,
      wa_link: waLink,
      waLink,
    });
    setEditingSim(null);
  };

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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
      onClick={() => setEditingSim(null)}
    >
      <div
        style={{
          backgroundColor: '#17202e',
          border: '1px solid #233147',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          color: '#f8fafc'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: '20px 24px 16px 24px',
            borderBottom: '1px solid #233147',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#ffffff' }}>
            Editar SIMCard
          </h3>
          <button
            type="button"
            onClick={() => setEditingSim(null)}
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

        {/* Formulario */}
        <form onSubmit={onSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Subtítulo de Sección */}
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8', letterSpacing: '0.5px' }}>
            DATOS GENERALES
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Número de Línea *
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Entidad / Área
            </label>
            <input
              type="text"
              className="form-control"
              value={entity}
              onChange={(e) => setEntity(e.target.value)}
              placeholder="Ej: Administración / Ventas"
              required
            />
          </div>

          {teamsList && teamsList.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
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

          {/* Sección WhatsApp estilo Slot de Imagen 2 */}
          <div
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1f293d',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '4px'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8', letterSpacing: '0.5px' }}>
              CONFIGURACIÓN DE WHATSAPP
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '6px' }}>
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

          {/* Botones estilo Imagen 2 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setEditingSim(null)}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#334155',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px'
              }}
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}