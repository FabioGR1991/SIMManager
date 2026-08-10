import React from 'react';

export default function DeviceEditModal({ 
  isOpen, 
  onClose, 
  onSave, 
  formData, 
  setFormData, 
  simcards = [] 
}) {
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h3 style={{ marginBottom: '15px', color: '#0f172a' }}>
          {formData.id ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}
        </h3>
        
        <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Modelo / Nombre:</label>
            <input 
              type="text" 
              value={formData.model} 
              onChange={(e) => setFormData({ ...formData, model: e.target.value })} 
              required 
              style={inputStyle}
            />
          </div>

          <datalist id="sim-options">
            {simcards.map(sim => (
              <option key={sim.id} value={sim.phone_number}>
                {sim.phone_number} ({sim.campaign || 'General'})
              </option>
            ))}
          </datalist>

          <div>
            <label style={labelStyle}>SIM Card Slot 1 (Ingresa número o selecciona):</label>
            <input
              type="text"
              list="sim-options"
              placeholder="Ej: 11 3132 - 6598"
              value={formData.sim1_phone || ''}
              onChange={(e) => setFormData({ ...formData, sim1_phone: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>SIM Card Slot 2 (Ingresa número o selecciona):</label>
            <input
              type="text"
              list="sim-options"
              placeholder="Ej: NO_TIENE o ingresa número"
              value={formData.sim2_phone || ''}
              onChange={(e) => setFormData({ ...formData, sim2_phone: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Estado del Dispositivo:</label>
            <select 
              value={formData.status} 
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={inputStyle}
            >
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO / REPUESTO</option>
              <option value="REPARACION">EN REPARACIÓN</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '500' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#0284c7', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
};

const inputStyle = {
  padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box', marginTop: '4px', fontSize: '14px'
};

const labelStyle = {
  fontSize: '12px', fontWeight: '600', color: '#475569'
};