import { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertTriangle, HelpCircle, FileText } from 'lucide-react';

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

    // Se agrega el caracter BOM (\uFEFF) para que Excel abra las tildes y eñes correctamente
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
    <div style={{ padding: '10px' }}>
      <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>Conciliación Masiva (Movistar vs App)</h2>

      {/* Carga de Archivo */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#64748b' }}>
          Sube el archivo CSV exportado de Movistar.
        </p>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input type="file" accept=".csv" onChange={handleCSVUpload} />
          {parsedLines.length > 0 && (
            <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: 'bold' }}>
              <FileText size={14} /> {parsedLines.length} líneas cargadas ({fileName})
            </span>
          )}
          <button
            onClick={handleProcessSync}
            disabled={parsedLines.length === 0 || loading}
            className="btn"
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Upload size={16} /> {loading ? 'Procesando...' : 'Iniciar Crosscheck'}
          </button>
        </div>
      </div>

      {/* Dashboard KPI */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
          <div style={cardStyle('#0284c7')}>
            <small style={{ color: '#64748b' }}>Total en Movistar</small>
            <h3 style={{ margin: '5px 0 0 0', color: '#0f172a' }}>{summary.total}</h3>
          </div>
          <div style={cardStyle('#16a34a')}>
            <small style={{ color: '#64748b' }}>Conciliadas (Match)</small>
            <h3 style={{ margin: '5px 0 0 0', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={20} /> {summary.matchedCount}
            </h3>
          </div>
          <div style={cardStyle('#eab308')}>
            <small style={{ color: '#64748b' }}>Huérfanas (Solo Movistar)</small>
            <h3 style={{ margin: '5px 0 0 0', color: '#ca8a04', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={20} /> {summary.orphansCount}
            </h3>
          </div>
          <div style={cardStyle('#dc2626')}>
            <small style={{ color: '#64748b' }}>Faltantes (Solo App)</small>
            <h3 style={{ margin: '5px 0 0 0', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={20} /> {summary.missingCount}
            </h3>
          </div>
        </div>
      )}

      {/* Tabla de Resultados */}
      {results.length > 0 && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
            <button onClick={() => setFilter('ALL')} style={filterBtnStyle(filter === 'ALL')}>Todos ({results.length})</button>
            <button onClick={() => setFilter('MATCHED')} style={filterBtnStyle(filter === 'MATCHED')}>Conciliadas</button>
            <button onClick={() => setFilter('ORPHAN_MOVISTAR')} style={filterBtnStyle(filter === 'ORPHAN_MOVISTAR')}>Huérfanas (En Movistar)</button>
            <button onClick={() => setFilter('MISSING_MOVISTAR')} style={filterBtnStyle(filter === 'MISSING_MOVISTAR')}>Faltantes (En App)</button>

            {/* Botón de Descarga de CSV */}
            <button
              onClick={handleDownloadCSV}
              style={{
                marginLeft: 'auto',
                backgroundColor: '#16a34a',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar Informe CSV
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '10px' }}>Número de Línea</th>
                <th style={{ padding: '10px' }}>Estado Crosscheck</th>
                <th style={{ padding: '10px' }}>Plan Movistar</th>
                <th style={{ padding: '10px' }}>Estado Movistar</th>
                <th style={{ padding: '10px' }}>Campaña / Estado App</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.phone_number}</td>
                  <td style={{ padding: '10px' }}>
                    <span className={`badge ${
                      r.status === 'MATCHED' ? 'badge-activo' :
                      r.status === 'ORPHAN_MOVISTAR' ? 'badge-stock' : 'badge-quemado'
                    }`}>
                      {r.status === 'MATCHED' ? 'Conciliado' : r.status === 'ORPHAN_MOVISTAR' ? 'Sin registrar en App' : 'Faltante en Movistar'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: '#475569' }}>{r.movistar_plan || '-'}</td>
                  <td style={{ padding: '10px', color: '#475569' }}>{r.movistar_status || '-'}</td>
                  <td style={{ padding: '10px', color: '#475569' }}>
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

const cardStyle = (color) => ({
  backgroundColor: '#fff',
  padding: '15px',
  borderRadius: '8px',
  borderLeft: `5px solid ${color}`,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
});

const filterBtnStyle = (active) => ({
  padding: '6px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  backgroundColor: active ? '#0284c7' : '#fff',
  color: active ? '#fff' : '#475569',
  cursor: 'pointer'
});