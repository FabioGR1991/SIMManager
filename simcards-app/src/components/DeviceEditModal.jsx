import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, X, Search, ChevronDown } from 'lucide-react';

// Componente de desplegable con buscador integrado (Dark Theme)
function SearchableSimSelect({ name, value, onChange, options = [], placeholder = "-- Seleccionar SIM --" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSim = options.find((s) => String(s.id) === String(value));

  // Filtrado dinámico por número de teléfono, entidad o campaña
  const filteredOptions = options.filter((sim) => {
    const phone = String(sim.phone_number || '');
    const entity = String(sim.entity || sim.campaign || '');
    const target = `${phone} ${entity}`.toLowerCase();
    return target.includes(searchTerm.toLowerCase());
  });

  const handleSelect = (selectedId) => {
    onChange({
      target: {
        name: name,
        value: selectedId,
        type: 'select-one'
      }
    });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', marginTop: '4px' }}>
      {/* Input / Botón Principal del Select */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 10px',
          borderRadius: '6px',
          border: '1px solid #334155',
          backgroundColor: '#0f172a',
          cursor: 'pointer',
          display: 'flex',
          justifySpaceBetween: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          minHeight: '35px',
          boxSizing: 'border-box'
        }}
      >
        <span style={{ color: selectedSim ? '#ffffff' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedSim
            ? `${selectedSim.phone_number} ${(selectedSim.entity || selectedSim.campaign) ? `(${selectedSim.entity || selectedSim.campaign})` : ''}`
            : placeholder}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {value && (
            <X
              size={14}
              color="#94a3b8"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect('');
              }}
              style={{ cursor: 'pointer' }}
            />
          )}
          <ChevronDown size={16} color="#94a3b8" />
        </div>
      </div>

      {/* Menú Flotante con buscador */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '6px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)',
          zIndex: 1050,
          maxHeight: '220px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Carga de buscador dentro del menú */}
          <div style={{ padding: '6px 8px', borderBottom: '1px solid #334155', position: 'relative' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              autoFocus
              placeholder="Buscar por número o área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '5px 8px 5px 26px',
                fontSize: '12px',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: '1px solid #334155',
                borderRadius: '4px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Opciones filtradas */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            <div
              onClick={() => handleSelect('')}
              style={{
                padding: '8px 10px',
                fontSize: '13px',
                cursor: 'pointer',
                color: '#94a3b8',
                borderBottom: '1px solid #1e293b',
                backgroundColor: !value ? '#1e293b' : 'transparent'
              }}
            >
              {placeholder}
            </div>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((sim) => {
                const isSelected = String(value) === String(sim.id);
                const entityLabel = sim.entity || sim.campaign;

                return (
                  <div
                    key={sim.id}
                    onClick={() => handleSelect(sim.id)}
                    style={{
                      padding: '8px 10px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.25)' : 'transparent',
                      color: isSelected ? '#38bdf8' : '#e2e8f0',
                      fontWeight: isSelected ? 'bold' : 'normal'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#1e293b';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {sim.phone_number} {entityLabel ? `(${entityLabel})` : ''}
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '10px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                No se encontraron coincidencias
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
    team: ''
  });

  const [copiedSim1, setCopiedSim1] = useState(false);
  const [copiedSim2, setCopiedSim2] = useState(false);

  useEffect(() => {
    if (device) {
      setFormData({
        id: device.id || null,
        model: device.model || '',
        internal_name: device.internal_name || '',
        entity: device.entity || device.campaign || '',
        status: device.status || 'ACTIVO',
        assigned_operator_id: device.assigned_operator_id || device.assigned_operator1_id || '',
        assigned_operator2_id: device.assigned_operator2_id || device.assigned_operator_2_id || '',
        sim1_id: device.sim1_id || '',
        sim1_is_official: Boolean(device.sim1_is_official),
        sim2_id: device.sim2_id || '',
        sim2_is_official: Boolean(device.sim2_is_official),
        team: device.team || ''
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
        team: ''
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
      onSave({
        ...formData,
        campaign: formData.entity
      });
    } else {
      console.warn('DeviceEditModal: La propiedad "onSave" no está configurada.');
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>

        {/* CABECERA */}
        <div style={headerStyle}>
          <h3 style={{ margin: 0, color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>
            {formData.id ? `Editar Dispositivo #${formData.id}` : 'Nuevo Dispositivo'}
          </h3>
          <button type="button" onClick={onClose} style={closeBtnStyle}>
            <X size={20} color="#94a3b8" />
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

                <SearchableSimSelect
                  name="sim1_id"
                  value={formData.sim1_id}
                  onChange={handleChange}
                  placeholder="-- Seleccionar SIM --"
                  options={simcards.filter((sim) => String(sim.id) !== String(formData.sim2_id))}
                />

                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    name="sim1_is_official"
                    checked={formData.sim1_is_official}
                    onChange={handleChange}
                    style={{ accentColor: '#0284c7' }}
                  />
                  Línea Oficial
                </label>

                {selectedSim1?.wa_link && (
                  <div style={waLinkCardStyle}>
                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 'bold' }}>
                        WA ({selectedSim1.wa_type || 'Estándar'}):
                      </span>
                      <div style={{ fontSize: '12px', color: '#86efac', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedSim1.wa_link}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedSim1.wa_link, setCopiedSim1)}
                      style={copyBtnStyle}
                      title="Copiar link"
                    >
                      {copiedSim1 ? <Check size={14} color="#4ade80" /> : <Copy size={14} color="#86efac" />}
                    </button>
                  </div>
                )}
              </div>

              {/* SIM SLOT 2 */}
              <div style={simBoxStyle}>
                <label style={labelStyle}>SIM Card Slot 2</label>

                <SearchableSimSelect
                  name="sim2_id"
                  value={formData.sim2_id}
                  onChange={handleChange}
                  placeholder="-- Sin SIM Slot 2 --"
                  options={simcards.filter((sim) => String(sim.id) !== String(formData.sim1_id))}
                />

                <label style={checkboxLabelStyle}>
                  <input
                    type="checkbox"
                    name="sim2_is_official"
                    checked={formData.sim2_is_official}
                    onChange={handleChange}
                    style={{ accentColor: '#0284c7' }}
                  />
                  Línea Oficial
                </label>

                {selectedSim2?.wa_link && (
                  <div style={waLinkCardStyle}>
                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 'bold' }}>
                        WA ({selectedSim2.wa_type || 'Estándar'}):
                      </span>
                      <div style={{ fontSize: '12px', color: '#86efac', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {selectedSim2.wa_link}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedSim2.wa_link, setCopiedSim2)}
                      style={copyBtnStyle}
                      title="Copiar link"
                    >
                      {copiedSim2 ? <Check size={14} color="#4ade80" /> : <Copy size={14} color="#86efac" />}
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
                  style={selectStyle}
                >
                  <option value="ACTIVO" style={optionStyle}>ACTIVO</option>
                  <option value="INACTIVO" style={optionStyle}>INACTIVO / REPUESTO</option>
                  <option value="REPARACION" style={optionStyle}>EN REPARACIÓN</option>
                  <option value="RESERVA" style={optionStyle}>EN RESERVA</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Operador Asignado (SIM 1)</label>
                <select
                  name="assigned_operator_id"
                  value={formData.assigned_operator_id}
                  onChange={handleChange}
                  style={selectStyle}
                >
                  <option value="" style={optionStyle}>-- Sin Operador SIM 1 --</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id} style={optionStyle}>
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
                  style={selectStyle}
                >
                  <option value="" style={optionStyle}>-- Sin Operador SIM 2 --</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id} style={optionStyle}>
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

// Estilos Nativos adaptados a Tema Oscuro (Slate Dark Theme)
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px',
  width: '720px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  border: '1px solid #334155', fontFamily: 'system-ui, -apple-system, sans-serif'
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  paddingBottom: '12px', marginBottom: '15px', borderBottom: '1px solid #334155'
};

const closeBtnStyle = { border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' };

const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };

const columnStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };

const sectionTitleStyle = { margin: '0 0 5px 0', fontSize: '13px', fontWeight: 'bold', color: '#38bdf8', textTransform: 'uppercase' };

const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#94a3b8', display: 'block' };

const inputStyle = {
  padding: '8px 10px', borderRadius: '6px', border: '1px solid #334155',
  width: '100%', boxSizing: 'border-box', marginTop: '4px', fontSize: '13px',
  backgroundColor: '#0f172a', color: '#ffffff', outline: 'none'
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer'
};

const optionStyle = {
  backgroundColor: '#0f172a', color: '#ffffff'
};

const simBoxStyle = {
  backgroundColor: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid #334155'
};

const checkboxLabelStyle = {
  fontSize: '12px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', cursor: 'pointer'
};

const waLinkCardStyle = {
  marginTop: '8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
  padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
};

const copyBtnStyle = {
  border: 'none', background: 'rgba(34, 197, 94, 0.2)', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center'
};

const cancelBtnStyle = {
  padding: '8px 16px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#334155', color: '#ffffff', cursor: 'pointer', fontWeight: '500'
};

const saveBtnStyle = {
  padding: '8px 16px', borderRadius: '6px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 'bold'
};