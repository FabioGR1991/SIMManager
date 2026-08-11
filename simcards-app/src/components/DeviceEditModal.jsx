import React, { useState, useEffect } from 'react';
import { Copy, Check, X } from 'lucide-react';

export default function DeviceEditModal({ 
  isOpen, 
  onClose, 
  onSave, 
  device, 
  simcards = [], 
  operators = [] 
}) {
  const [formData, setFormData] = useState({
    id: null,
    model: '',
    internal_name: '',
    entity: '',
    status: 'ACTIVO',
    assigned_operator_id: '',
    assigned_operator2_id: '',
    sim1_id: '',
    sim1_is_official: false,
    sim2_id: '',
    sim2_is_official: false,
  });

  const [copiedSim1, setCopiedSim1] = useState(false);
  const [copiedSim2, setCopiedSim2] = useState(false);

  useEffect(() => {
    if (device) {
      setFormData({
        id: device.id || null,
        model: device.model || '',
        internal_name: device.internal_name || '',
        entity: device.entity || '',
        status: device.status || 'ACTIVO',
        assigned_operator_id: device.assigned_operator_id || device.assigned_operator1_id || '',
        assigned_operator2_id: device.assigned_operator2_id || device.assigned_operator_2_id || '',
        sim1_id: device.sim1_id || '',
        sim1_is_official: Boolean(device.sim1_is_official),
        sim2_id: device.sim2_id || '',
        sim2_is_official: Boolean(device.sim2_is_official),
      });
    } else {
      setFormData({
        id: null,
        model: '',
        internal_name: '',
        entity: '',
        status: 'ACTIVO',
        assigned_operator_id: '',
        assigned_operator2_id: '',
        sim1_id: '',
        sim1_is_official: false,
        sim2_id: '',
        sim2_is_official: false,
      });
    }
  }, [device, isOpen]);

  if (!isOpen) return null;

  const selectedSim1 = simcards.find(s => String(s.id) === String(formData.sim1_id));
  const selectedSim2 = simcards.find(s => String(s.id) === String(formData.sim2_id));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCopy = (text, setCopied) => {
    if (!text) return;

    const copyFallback = (str) => {
      const textArea = document.createElement("textarea");
      textArea.value = str;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => copyFallback(text));
    } else {
      copyFallback(text);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.sim1_id && formData.sim2_id && String(formData.sim1_id) === String(formData.sim2_id)) {
      alert('No puedes asignar la misma SIM Card en ambos slots.');
      return;
    }
    if (typeof onSave === 'function') {
      onSave(formData);
    } else {
      console.warn('DeviceEditModal: La propiedad "onSave" no está configurada.');
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        
        {/* CABECERA */}
        <div style={headerStyle}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>
            {formData.id ? `Editar Dispositivo #${formData.id}` : 'Nuevo Dispositivo'}
          </h3>
          <button type="button" onClick={onClose} style={closeBtnStyle}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* GRID DE 2 COLUMNAS */}
          <div style={gridStyle}>
            
            {/* COLUMNA IZQUIERDA: Identificación & SIMs */}
            <div style={columnStyle}>
              <h4 style={sectionTitleStyle}>General & Líneas</h4>

              <div>
                <label style={labelStyle}>Modelo / Dispositivo *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  placeholder="Ej: Samsung A14"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Entidad / Área</label>
                <input
                  type="text"
                  name="entity"
                  value={formData.entity}
                  onChange={handleChange}
                  placeholder="Ej: Administración / Ventas"
                  style={inputStyle}
                />
              </div>

              {/* SIM SLOT 1 */}
              <div style={simBoxStyle}>
                <label style={labelStyle}>SIM Card Slot 1</label>
                <select
                  name="sim1_id"
                  value={formData.sim1_id}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">-- Seleccionar SIM --</option>
                  {simcards
                    .filter((sim) => String(sim.id) !== String(formData.sim2_id))
                    .map((sim) => (
                      <option key={sim.id} value={sim.id}>
                        {sim.phone_number} {sim.campaign ? `(${sim.campaign})` : ''}
                      </option>
                    ))}
                </select>

                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    name="sim1_is_official"
                    checked={formData.sim1_is_official}
                    onChange={handleChange}
                  />
                  Línea Oficial
                </label>

                {selectedSim1?.wa_link && (
                  <div style={waLinkCardStyle}>
                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold' }}>
                        WA ({selectedSim1.wa_type || 'Estándar'}):
                      </span>
                      <div style={{ fontSize: '12px', color: '#15803d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedSim1.wa_link}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedSim1.wa_link, setCopiedSim1)}
                      style={copyBtnStyle}
                      title="Copiar link"
                    >
                      {copiedSim1 ? <Check size={14} color="#166534" /> : <Copy size={14} color="#15803d" />}
                    </button>
                  </div>
                )}
              </div>

              {/* SIM SLOT 2 */}
              <div style={simBoxStyle}>
                <label style={labelStyle}>SIM Card Slot 2</label>
                <select
                  name="sim2_id"
                  value={formData.sim2_id}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">-- Sin SIM Slot 2 --</option>
                  {simcards
                    .filter((sim) => String(sim.id) !== String(formData.sim1_id))
                    .map((sim) => (
                      <option key={sim.id} value={sim.id}>
                        {sim.phone_number} {sim.campaign ? `(${sim.campaign})` : ''}
                      </option>
                    ))}
                </select>

                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    name="sim2_is_official"
                    checked={formData.sim2_is_official}
                    onChange={handleChange}
                  />
                  Línea Oficial
                </label>

                {selectedSim2?.wa_link && (
                  <div style={waLinkCardStyle}>
                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold' }}>
                        WA ({selectedSim2.wa_type || 'Estándar'}):
                      </span>
                      <div style={{ fontSize: '12px', color: '#15803d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedSim2.wa_link}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedSim2.wa_link, setCopiedSim2)}
                      style={copyBtnStyle}
                      title="Copiar link"
                    >
                      {copiedSim2 ? <Check size={14} color="#166534" /> : <Copy size={14} color="#15803d" />}
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* COLUMNA DERECHA: Configuración & Operadores */}
            <div style={columnStyle}>
              <h4 style={sectionTitleStyle}>Interno & Operadores</h4>

              <div>
                <label style={labelStyle}>Nombre Interno</label>
                <input
                  type="text"
                  name="internal_name"
                  value={formData.internal_name}
                  onChange={handleChange}
                  placeholder="Ej: DEV-CEL-01"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Estado del Dispositivo</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO / REPUESTO</option>
                  <option value="REPARACION">EN REPARACIÓN</option>
                  <option value="RESERVA">EN RESERVA</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Operador Asignado (SIM 1)</label>
                <select
                  name="assigned_operator_id"
                  value={formData.assigned_operator_id}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">-- Sin Operador SIM 1 --</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.full_name || op.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Operador Asignado (SIM 2)</label>
                <select
                  name="assigned_operator2_id"
                  value={formData.assigned_operator2_id}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">-- Sin Operador SIM 2 --</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.full_name || op.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* BOTONES DE ACCIÓN */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>
              Cancelar
            </button>
            <button type="submit" style={saveBtnStyle}>
              Guardar Dispositivo
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: '#fff', padding: '24px', borderRadius: '12px',
  width: '720px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  paddingBottom: '12px', marginBottom: '15px', borderBottom: '1px solid #e2e8f0'
};

const closeBtnStyle = { border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' };

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };

const columnStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };

const sectionTitleStyle = { margin: '0 0 5px 0', fontSize: '13px', fontWeight: 'bold', color: '#0284c7', textTransform: 'uppercase' };

const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block' };

const inputStyle = {
  padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1',
  width: '100%', boxSizing: 'border-box', marginTop: '4px', fontSize: '13px'
};

const simBoxStyle = {
  backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0'
};

const checkboxLabelStyle = {
  fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', cursor: 'pointer'
};

const waLinkCardStyle = {
  marginTop: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
  padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
};

const copyBtnStyle = {
  border: 'none', background: '#dcfce7', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center'
};

const cancelBtnStyle = {
  padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '500'
};

const saveBtnStyle = {
  padding: '8px 16px', borderRadius: '6px', backgroundColor: '#0284c7', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold'
};