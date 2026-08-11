import React, { useState } from 'react';
import { X, Copy, Check, Smartphone, ExternalLink, User } from 'lucide-react';

export default function DeviceInfoModal({ device, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!device) return null;

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getWaLink = (phone, customLink) => {
    if (customLink && customLink.trim() !== '') return customLink;
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (!digits) return null;
    const formattedDigits = digits.startsWith('549') ? digits : `549${digits}`;
    return `https://wa.me/${formattedDigits}`;
  };

  const waLink1 = getWaLink(device.sim1_phone || device.sim1_number, device.sim1_wa_link);
  const waLink2 = getWaLink(device.sim2_phone || device.sim2_number, device.sim2_wa_link);

  const getStatusStyle = (status) => {
    const st = (status || 'ACTIVO').toUpperCase();
    if (st.includes('REPARACION')) return { bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
    if (st.includes('RESERVA')) return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
    if (st.includes('INACTIVO') || st.includes('REPUESTO')) return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    return { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
  };

  const statusStyle = getStatusStyle(device.status);

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        
        {/* Cabecera */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={iconBoxStyle}>
              <Smartphone size={20} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Información del Dispositivo
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Ficha de solo lectura</p>
            </div>
          </div>
          <button onClick={onClose} style={closeIconBtnStyle}>
            <X size={18} color="#64748b" />
          </button>
        </div>

        {/* Cuerpo / Formato a 2 Columnas */}
        <div style={bodyGridStyle}>
          
          {/* Columna Izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Modelo / Dispositivo</label>
              <p style={{ margin: '2px 0 0', fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>
                {device.model || '—'}
              </p>
            </div>

            <div>
              <label style={labelStyle}>Entidad / Área</label>
              <p style={{ margin: '2px 0 0', fontWeight: '600', color: '#0369a1' }}>
                {device.entity ? (
                  <span style={entityBadgeStyle}>{device.entity}</span>
                ) : '—'}
              </p>
            </div>

            {/* Bloque SIM 1 */}
            <div style={cardSectionStyle}>
              <div style={flexSpaceBetween}>
                <span style={cardSubTitleStyle}>SIM Card Slot 1</span>
                {device.sim1_is_official && <span style={officialBadgeStyle}>Línea Oficial</span>}
              </div>
              <p style={phoneTextStyle}>
                {device.sim1_phone || device.sim1_number || 'Sin SIM asignada'}
              </p>
              {waLink1 && (
                <div style={waRowStyle}>
                  <a href={waLink1} target="_blank" rel="noreferrer" style={waLinkStyle}>
                    <ExternalLink size={13} />
                    <span style={truncateStyle}>{waLink1}</span>
                  </a>
                  <button onClick={() => handleCopy(waLink1, 'sim1')} style={copyBtnStyle}>
                    {copiedKey === 'sim1' ? <Check size={14} color="#16a34a" /> : <Copy size={14} color="#64748b" />}
                  </button>
                </div>
              )}
            </div>

            {/* Bloque SIM 2 */}
            <div style={cardSectionStyle}>
              <div style={flexSpaceBetween}>
                <span style={cardSubTitleStyle}>SIM Card Slot 2</span>
                {device.sim2_is_official && <span style={officialBadgeStyle}>Línea Oficial</span>}
              </div>
              <p style={phoneTextStyle}>
                {device.sim2_phone || device.sim2_number || 'Sin SIM Slot 2'}
              </p>
              {waLink2 && (
                <div style={waRowStyle}>
                  <a href={waLink2} target="_blank" rel="noreferrer" style={waLinkStyle}>
                    <ExternalLink size={13} />
                    <span style={truncateStyle}>{waLink2}</span>
                  </a>
                  <button onClick={() => handleCopy(waLink2, 'sim2')} style={copyBtnStyle}>
                    {copiedKey === 'sim2' ? <Check size={14} color="#16a34a" /> : <Copy size={14} color="#64748b" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Nombre Interno</label>
              <p style={{ margin: '2px 0 0', fontWeight: '500', color: '#334155' }}>
                {device.internal_name || '—'}
              </p>
            </div>

            <div>
              <label style={labelStyle}>Estado del Dispositivo</label>
              <div style={{ marginTop: '4px' }}>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.color,
                  border: `1px solid ${statusStyle.border}`
                }}>
                  {(device.status || 'ACTIVO').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Operador Asignado SIM 1 */}
            <div style={cardSectionStyle}>
              <span style={cardSubTitleStyle}>Operador Asignado (SIM 1)</span>
              <p style={operatorTextStyle}>
                <User size={14} color="#64748b" />
                {device.operator1_name || device.assigned_operator_name || device.operator_name || 'Sin Asignar'}
              </p>
            </div>

            {/* Operador Asignado SIM 2 */}
            <div style={cardSectionStyle}>
              <span style={cardSubTitleStyle}>Operador Asignado (SIM 2)</span>
              <p style={operatorTextStyle}>
                <User size={14} color="#64748b" />
                {device.operator2_name || device.assigned_operator2_name || 'Sin Asignar'}
              </p>
            </div>
          </div>

        </div>

        {/* Pie de modal */}
        <div style={footerStyle}>
          <button onClick={onClose} style={closeBtnStyle}>
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

// Estilos nativos en objeto
const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '16px'
};

const modalStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '560px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
  fontFamily: 'system-ui, -apple-system, sans-serif'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc'
};

const iconBoxStyle = {
  padding: '8px',
  backgroundColor: '#e0f2fe',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const closeIconBtnStyle = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center'
};

const bodyGridStyle = {
  padding: '20px',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px'
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#94a3b8',
  display: 'block'
};

const cardSectionStyle = {
  padding: '10px 12px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0'
};

const cardSubTitleStyle = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#64748b'
};

const phoneTextStyle = {
  margin: '4px 0 0',
  fontFamily: 'monospace',
  fontWeight: '600',
  fontSize: '13px',
  color: '#0f172a'
};

const operatorTextStyle = {
  margin: '4px 0 0',
  fontWeight: '600',
  fontSize: '13px',
  color: '#0f172a',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const flexSpaceBetween = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const officialBadgeStyle = {
  fontSize: '10px',
  fontWeight: '700',
  color: '#0284c7',
  backgroundColor: '#e0f2fe',
  padding: '1px 6px',
  borderRadius: '4px'
};

const entityBadgeStyle = {
  backgroundColor: '#e0f2fe',
  color: '#0369a1',
  padding: '2px 8px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '700'
};

const waRowStyle = {
  marginTop: '8px',
  paddingTop: '6px',
  borderTop: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px'
};

const waLinkStyle = {
  fontSize: '11px',
  color: '#16a34a',
  textDecoration: 'none',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  overflow: 'hidden'
};

const truncateStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '160px'
};

const copyBtnStyle = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: '2px 4px',
  borderRadius: '4px'
};

const footerStyle = {
  padding: '12px 20px',
  borderTop: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  display: 'flex',
  justifyContent: 'flex-end'
};

const closeBtnStyle = {
  padding: '6px 16px',
  fontSize: '13px',
  fontWeight: '600',
  color: '#334155',
  backgroundColor: '#e2e8f0',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};