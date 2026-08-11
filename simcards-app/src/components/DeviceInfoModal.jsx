import React, { useState } from 'react';
import { X, Copy, Check, Smartphone, ExternalLink } from 'lucide-react';

export default function DeviceInfoModal({ device, onClose }) {
  const [copiedSim1, setCopiedSim1] = useState(false);
  const [copiedSim2, setCopiedSim2] = useState(false);

  if (!device) return null;

  const copyToClipboard = (text, setCopied) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    const st = (status || 'ACTIVO').toUpperCase();
    let bg = 'bg-green-100 text-green-800 border-green-300';
    if (st.includes('INACTIVO') || st.includes('REPUESTO')) bg = 'bg-gray-100 text-gray-800 border-gray-300';
    if (st.includes('REPARACION')) bg = 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (st.includes('RESERVA')) bg = 'bg-blue-100 text-blue-800 border-blue-300';

    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${bg}`}>
        {st}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-150">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Información del Dispositivo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ficha de solo lectura</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo / Estructura a 2 Columnas */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          
          {/* Columna Izquierda */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Modelo / Dispositivo
              </label>
              <p className="font-medium text-slate-800 dark:text-slate-100 text-base">
                {device.model || '—'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Entidad / Área
              </label>
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {device.entity || '—'}
              </p>
            </div>

            {/* SIM 1 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-slate-500 dark:text-slate-400">
                  SIM Card Slot 1
                </span>
                {device.sim1_is_official ? (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    Línea Oficial
                  </span>
                ) : null}
              </div>
              <p className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {device.sim1_phone || device.sim1_number || 'Sin SIM asignada'}
              </p>
              
              {device.sim1_wa_link && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 flex items-center justify-between gap-2">
                  <a
                    href={device.sim1_wa_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 font-medium truncate"
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{device.sim1_wa_link}</span>
                  </a>
                  <button
                    onClick={() => copyToClipboard(device.sim1_wa_link, setCopiedSim1)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                    title="Copiar enlace de WhatsApp"
                  >
                    {copiedSim1 ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* SIM 2 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-slate-500 dark:text-slate-400">
                  SIM Card Slot 2
                </span>
                {device.sim2_is_official ? (
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    Línea Oficial
                  </span>
                ) : null}
              </div>
              <p className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {device.sim2_phone || device.sim2_number || 'Sin SIM Slot 2'}
              </p>
              
              {device.sim2_wa_link && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 flex items-center justify-between gap-2">
                  <a
                    href={device.sim2_wa_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 font-medium truncate"
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{device.sim2_wa_link}</span>
                  </a>
                  <button
                    onClick={() => copyToClipboard(device.sim2_wa_link, setCopiedSim2)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                    title="Copiar enlace de WhatsApp"
                  >
                    {copiedSim2 ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Nombre Interno
              </label>
              <p className="font-medium text-slate-700 dark:text-slate-200">
                {device.internal_name || '—'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Estado del Dispositivo
              </label>
              <div className="mt-1">
                {getStatusBadge(device.status)}
              </div>
            </div>

            {/* Operador Asignado SIM 1 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="block font-semibold text-xs text-slate-500 dark:text-slate-400 mb-1">
                Operador Asignado (SIM 1)
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {device.operator1_name || device.operator_name || device.assigned_operator_name || 'Sin Asignar'}
              </p>
            </div>

            {/* Operador Asignado SIM 2 */}
            <div className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="block font-semibold text-xs text-slate-500 dark:text-slate-400 mb-1">
                Operador Asignado (SIM 2)
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {device.operator2_name || device.assigned_operator2_name || 'Sin Asignar'}
              </p>
            </div>
          </div>

        </div>

        {/* Pie de modal */}
        <div className="flex justify-end px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}