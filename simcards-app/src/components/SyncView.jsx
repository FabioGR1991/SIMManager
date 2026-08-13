import { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertTriangle, HelpCircle, FileText, Download, Filter } from 'lucide-react';

export default function SyncView({ API_URL, token }) {
  const [parsedLines, setParsedLines] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('ALL');

  // Lectura automática de CSV exportado desde Excel (detecta ; o ,)
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r\n|\n/);
      if (lines.length < 2) return;

      const firstLine = lines[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';

      const headers = firstLine.split(delimiter).map(h =>
        h.trim().replace(/^["']|["']$/g, '').toLowerCase()
      );

      const phoneIdx = headers.findIndex(h => h.includes('numero') || h.includes('número') || h.includes('linea') || h.includes('línea'));
      const planIdx = headers.findIndex(h => h.includes('plan'));
      const statusIdx = headers.findIndex(h => h.includes('estado'));

      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
        const phoneValue = phoneIdx !== -1 ? cols[phoneIdx] : cols[0];

        if (phoneValue) {
          data.push({
            phone: phoneValue,
            plan: planIdx !== -1 ? (cols[planIdx] || 'S/I') : 'S/I',
            status: statusIdx !== -1 ? (cols[statusIdx] || 'S/I') : 'S/I'
          });
        }
      }

      setParsedLines(data);
    };

    reader.readAsText(file);
  };

  const handleProcessSync = async () => {
    if (parsedLines.length === 0) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/admin/sync`,
        { movistarLines: parsedLines },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSummary(res.data.summary);

      const detailsRes = await axios.get(`${API_URL}/admin/sync/${res.data.reconciliationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(detailsRes.data);
    } catch (err) {
      alert('Error al ejecutar el Crosscheck.');
    } finally {
      setLoading(false);
    }
  };

  // Función para descargar los datos procesados en CSV
  const handleDownloadCSV = () => {
    if (!results || results.length === 0) return;

    const headers = [
      "Número de Línea",
      "Estado Crosscheck",
      "Plan Movistar",
      "Estado Movistar",
      "Campaña / Estado App"
    ];

    const rows = results.map(r => {
      const estadoTexto = r.status === 'MATCHED'
        ? 'Conciliado'
        : r.status === 'ORPHAN_MOVISTAR'
          ? 'Sin registrar en App'
          : 'Faltante en Movistar';

      const campanaTexto = r.app_campaign
        ? `${r.app_campaign} (${r.app_status || ''})`
        : 'N/A';

      return [
        `"${r.phone_number || ''}"`,
        `"${estadoTexto}"`,
        `"${r.movistar_plan || '-'}"`,
        `"${r.movistar_status || '-'}"`,
        `"${campanaTexto}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(row => row.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `Resultado_Conciliacion_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredResults = results.filter(r => filter === 'ALL' || r.status === filter);

  return (
    <div className="view-animated" style={{ padding: '10px' }}>

      {/* Encabezado Principal */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700', margin: 0 }}>
          Conciliación Masiva (Movistar vs App)
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
          Realizá un crosscheck en tiempo real entre el listado exportado del operador y la base de datos interna.
        </p>
      </div>

      {/* Carga de Archivo (Card Cristal) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        marginBottom: '24px'
      }}>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#cbd5e1' }}>
          Seleccioná o arrastrá el archivo CSV exportado desde la plataforma de Movistar:
        </p>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Custom File Input Trigger */}
          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px dashed rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            padding: '10px 18px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}>
            <FileText size={16} />
            {fileName ? 'Cambiar archivo CSV' : 'Seleccionar archivo CSV'}
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              style={{ display: 'none' }}
            />
          </label>

          {/* Badge del Archivo Cargado */}
          {parsedLines.length > 0 && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              <span>{fileName}</span>
              <span style={{
                backgroundColor: '#0284c7',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px'
              }}>
                {parsedLines.length} líneas
              </span>
            </div>
          )}

          {/* Botón Iniciar Crosscheck */}
          <button
            onClick={handleProcessSync}
            disabled={parsedLines.length === 0 || loading}
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: parsedLines.length === 0
                ? 'rgba(255, 255, 255, 0.1)'
                : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
              color: parsedLines.length === 0 ? '#64748b' : '#ffffff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: parsedLines.length === 0 || loading ? 'not-allowed' : 'pointer',
              boxShadow: parsedLines.length > 0 ? '0 4px 14px rgba(2, 132, 199, 0.35)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Upload size={16} /> {loading ? 'Procesando...' : 'Iniciar Crosscheck'}
          </button>
        </div>
      </div>

      {/* Dashboard KPI Neón */}
      {summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>

          {/* Total Movistar */}
          <div style={kpiCardStyle('#38bdf8', 'rgba(56, 189, 248, 0.15)')}>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
              Total en Movistar
            </span>
            <h3 style={{ margin: '8px 0 0 0', color: '#ffffff', fontSize: '26px', fontWeight: '700' }}>
              {summary.total}
            </h3>
          </div>

          {/* Conciliadas */}
          <div style={kpiCardStyle('#4ade80', 'rgba(74, 222, 128, 0.15)')}>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
              Conciliadas (Match)
            </span>
            <h3 style={{ margin: '8px 0 0 0', color: '#4ade80', fontSize: '26px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={22} /> {summary.matchedCount}
            </h3>
          </div>

          {/* Huérfanas */}
          <div style={kpiCardStyle('#fbbf24', 'rgba(251, 191, 36, 0.15)')}>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
              Huérfanas (Solo Movistar)
            </span>
            <h3 style={{ margin: '8px 0 0 0', color: '#fbbf24', fontSize: '26px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={22} /> {summary.orphansCount}
            </h3>
          </div>

          {/* Faltantes */}
          <div style={kpiCardStyle('#f87171', 'rgba(248, 113, 113, 0.15)')}>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
              Faltantes (Solo App)
            </span>
            <h3 style={{ margin: '8px 0 0 0', color: '#f87171', fontSize: '26px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={22} /> {summary.missingCount}
            </h3>
          </div>

        </div>
      )}

      {/* Tabla de Resultados y Filtros */}
      {results.length > 0 && (
        <div className="table-container">

          {/* Barra de Filtros y Botón Exportar */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', marginRight: '6px' }}>
              <Filter size={15} />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Filtrar:</span>
            </div>

            <button onClick={() => setFilter('ALL')} style={filterBtnStyle(filter === 'ALL')}>
              Todos ({results.length})
            </button>
            <button onClick={() => setFilter('MATCHED')} style={filterBtnStyle(filter === 'MATCHED')}>
              Conciliadas
            </button>
            <button onClick={() => setFilter('ORPHAN_MOVISTAR')} style={filterBtnStyle(filter === 'ORPHAN_MOVISTAR')}>
              Huérfanas (En Movistar)
            </button>
            <button onClick={() => setFilter('MISSING_MOVISTAR')} style={filterBtnStyle(filter === 'MISSING_MOVISTAR')}>
              Faltantes (En App)
            </button>

            {/* Botón Exportar CSV */}
            <button
              onClick={handleDownloadCSV}
              style={{
                marginLeft: 'auto',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
            >
              <Download size={15} /> Descargar Informe CSV
            </button>
          </div>

          {/* Tabla de Resultados Oscura */}
          <table>
            <thead>
              <tr>
                <th>Número de Línea</th>
                <th>Estado Crosscheck</th>
                <th>Plan Movistar</th>
                <th>Estado Movistar</th>
                <th>Campaña / Estado App</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: '700', color: '#ffffff' }}>{r.phone_number}</td>
                  <td>
                    <span className={`status-badge ${r.status === 'MATCHED' ? 'badge-activo' :
                        r.status === 'ORPHAN_MOVISTAR' ? 'badge-stock' : 'badge-quemado'
                      }`}>
                      {r.status === 'MATCHED' ? 'Conciliado' : r.status === 'ORPHAN_MOVISTAR' ? 'Sin registrar en App' : 'Faltante en Movistar'}
                    </span>
                  </td>
                  <td style={{ color: '#cbd5e1' }}>{r.movistar_plan || '-'}</td>
                  <td style={{ color: '#cbd5e1' }}>{r.movistar_status || '-'}</td>
                  <td style={{ color: '#cbd5e1' }}>
                    {r.app_campaign ? `${r.app_campaign} (${r.app_status})` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

    </div>
  );
}

// Estilos dinámicos auxiliares
const kpiCardStyle = (borderColor, bgGlow) => ({
  background: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  padding: '18px 20px',
  borderRadius: '14px',
  border: `1px solid rgba(255, 255, 255, 0.08)`,
  borderLeft: `4px solid ${borderColor}`,
  boxShadow: `0 10px 25px rgba(0, 0, 0, 0.3), inset 0 0 15px ${bgGlow}`
});

const filterBtnStyle = (active) => ({
  padding: '7px 14px',
  borderRadius: '8px',
  border: active ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
  backgroundColor: active ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
  color: active ? '#38bdf8' : '#94a3b8',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600',
  transition: 'all 0.2s ease'
});