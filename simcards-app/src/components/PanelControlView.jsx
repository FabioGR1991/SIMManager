import React, { useMemo } from 'react';
import {
    Smartphone,
    ShieldCheck,
    CreditCard,
    Users,
    AlertTriangle,
    MessageSquare,
    ExternalLink,
    Activity,
    ArrowRight
} from 'lucide-react';

// Batch de frases motivacionales/positivas (31 opciones)
const MOTIVATIONAL_QUOTES = [
    // --- Tono cercano / Informal argentino ---
    "¡Buenas! Todo listo por acá, a meterle con todo hoy.",
    "Mate en mano y la flota ordenada. ¡A romperla!",
    "Control de flota al día y cero drama. ¡A darle para adelante!",
    "Organización impecable, día resuelto. ¡Que sea una jornada genial!",
    "¡Qué bueno verte de nuevo! Todo bajo control para arrancar.",
    "Sistemas OK y equipo en marcha. Hoy se avanza fuerte.",
    "Todo en regla por acá. Te espera una jornada bien productiva.",
    "Revisión al día, alertas bajo control. ¡Metele garra!",
    "Un día ordenado es un día tranquilo. ¡A meterle ritmo!",
    "Flota operativa sin sobresaltos. ¡Buen día!",

    // --- Steve Jobs ---
    "«La única forma de hacer un gran trabajo es amar lo que hacés.» — Steve Jobs",
    "«El diseño no es solo cómo se ve o cómo se siente, es cómo funciona.» — Steve Jobs",
    "«Mantente hambriento, mantente curioso.» — Steve Jobs",

    // --- Albert Einstein ---
    "«En medio de la dificultad y el caos reside la oportunidad.» — Albert Einstein",
    "«Si querés resultados distintos, no hagas siempre lo mismo.» — Albert Einstein",
    "«La medida de la inteligencia es la capacidad de cambiar.» — Albert Einstein",

    // --- Tony Robbins ---
    "«Donde va tu enfoque, fluye tu energía.» — Tony Robbins",
    "«Establecer metas es el primer paso para volver lo invisible visible.» — Tony Robbins",
    "«Tu destino se moldea en tus momentos de decisión.» — Tony Robbins",

    // --- Madre Teresa de Calcuta ---
    "«A veces sentimos que lo que hacemos es solo una gota en el mar, pero el mar sería menos sin esa gota.» — Madre Teresa",
    "«No todos podemos hacer grandes cosas, pero sí pequeñas cosas con gran amor.» — Madre Teresa",

    // --- Inspiración de Cierre / Trabajo en equipo ---
    "«La simplicidad es la máxima sofisticación.» — Leonardo da Vinci",
    "«El éxito es la suma de pequeños esfuerzos repetidos día tras día.» — Robert Collier",
    "La constancia y el orden siempre pagan. ¡Que tengas un excelente día!",
    "Paso a paso, cada detalle suma para mantener la flota impecable.",

    // --- Fabio Gómez Ramírez (Sin límites) ---
    "«Los límites son solo un reflejo de aquello que todavía no te atreves a enfrentar.» — Fabio Gómez Ramírez (Sin límites)",
    "«Tener personas con quienes compartir tu éxito es lo que realmente lo hace valioso.» — Fabio Gómez Ramírez (Sin límites)",
    "«Hay una diferencia entre trabajar para sobrevivir y trabajar para prosperar. Todo empieza en la mente.» — Fabio Gómez Ramírez (Sin límites)",
    "«La riqueza no solo se mide en términos monetarios, sino también en conocimiento, oportunidades y conexiones.» — Fabio Gómez Ramírez (Sin límites)",
    "«Tu mejor versión no solo iluminará tu propio camino, sino que también será la luz que guíe a otros hacia sus propios destinos.» — Fabio Gómez Ramírez (Sin límites)"
];

// Helper para determinar el prefijo de bienvenida por género
const getWelcomePrefix = (gender) => {
    if (!gender) return 'Bienvenido/a';
    const g = String(gender).toLowerCase();
    if (g === 'm' || g === 'masculino' || g === 'hombre') return 'Bienvenido';
    if (g === 'f' || g === 'femenino' || g === 'mujer') return 'Bienvenida';
    return 'Bienvenido/a';
};

// Componente visual para gráficos de Dona en SVG nativo (Modo Oscuro)
function DonutChart({ percentage, color = '#38bdf8', label, sublabel }) {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                <svg width="90" height="90" viewBox="0 0 90 90">
                    <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        fill="transparent"
                        stroke="#233147"
                        strokeWidth="10"
                    />
                    <circle
                        cx="45"
                        cy="45"
                        r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 45 45)"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '14px', color: '#ffffff'
                }}>
                    {percentage}%
                </div>
            </div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f1f5f9' }}>{label}</div>
                {sublabel && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{sublabel}</div>}
            </div>
        </div>
    );
}

export default function PanelControlView({
    user = { name: 'Usuario', gender: 'M' },
    devices = [],
    simcards = [],
    operators = [],
    onNavigate // Función opcional para cambiar de pestaña al hacer clic en accesos directos
}) {
    // Frase aleatoria calculada al montar el componente
    const randomQuote = useMemo(() => {
        return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    }, []);

    // --- CÁLCULOS Y MÉTRICAS EN TIEMPO REAL ---
    const totalDevices = devices.length;
    const activeDevices = devices.filter(d => (d.status || 'ACTIVO').toUpperCase() === 'ACTIVO').length;
    const repairDevices = devices.filter(d => (d.status || '').toUpperCase() === 'REPARACION').length;
    const reserveDevices = devices.filter(d => (d.status || '').toUpperCase() === 'RESERVA').length;

    const activeDevicePct = totalDevices > 0 ? Math.round((activeDevices / totalDevices) * 100) : 0;

    // SIM Cards asignadas vs libres
    const assignedSimIds = new Set();
    devices.forEach(d => {
        if (d.sim1_id) assignedSimIds.add(String(d.sim1_id));
        if (d.sim2_id) assignedSimIds.add(String(d.sim2_id));
    });

    const totalSims = simcards.length;
    const assignedSimsCount = simcards.filter(s => assignedSimIds.has(String(s.id))).length;
    const freeSimsCount = totalSims - assignedSimsCount;
    const simOccupancyPct = totalSims > 0 ? Math.round((assignedSimsCount / totalSims) * 100) : 0;

    // Líneas oficiales
    const officialSimsCount = simcards.filter(s => s.is_official || s.sim1_is_official).length;
    const officialPct = totalSims > 0 ? Math.round((officialSimsCount / totalSims) * 100) : 0;

    // WhatsApp Types (Estándar vs Business)
    const waBusinessCount = simcards.filter(s => String(s.wa_type || '').toLowerCase().includes('business')).length;
    const waBusinessPct = totalSims > 0 ? Math.round((waBusinessCount / totalSims) * 100) : 0;

    // Operadores
    const totalOperators = operators.length;
    const assignedOperatorIds = new Set();
    devices.forEach(d => {
        if (d.assigned_operator_id) assignedOperatorIds.add(String(d.assigned_operator_id));
        if (d.assigned_operator2_id) assignedOperatorIds.add(String(d.assigned_operator2_id));
    });
    const activeOperatorsCount = assignedOperatorIds.size;

    // --- DETECTOR DE INCONSISTENCIAS / AUDITORÍA ---
    const unassignedSims = simcards.filter(s => !assignedSimIds.has(String(s.id)));
    const dualSimMissingOp = devices.filter(d => d.sim2_id && !d.assigned_operator2_id);

    // Lista de WhatsApps rápidos (primeras 4 SIMs con link de WhatsApp)
    const quickWaList = simcards.filter(s => s.wa_link || s.phone_number || s.phone).slice(0, 4);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>

            {/* 1. CABECERA DE BIENVENIDA */}
            <div style={{
                backgroundColor: '#0284c7',
                backgroundImage: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff',
                padding: '20px 24px',
                borderRadius: '12px',
                border: '1px solid #0369a1',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>
                    {getWelcomePrefix(user.gender)}, {user.name || 'Usuario'}! 👋
                </h2>
                <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#e0f2fe', opacity: 0.95 }}>
                    💬 "{randomQuote}"
                </p>
            </div>

            {/* 2. KPIS SUPERIORES (FILA DE TARJETAS) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>

                {/* Tarjeta Dispositivos */}
                <div style={kpiCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={kpiTitleStyle}>DISPOSITIVOS TOTALES</span>
                            <div style={kpiValueStyle}>{activeDevices} <span style={{ fontSize: '14px', color: '#64748b' }}>/ {totalDevices}</span></div>
                        </div>
                        <div style={{ ...kpiIconBoxStyle, backgroundColor: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8' }}>
                            <Smartphone size={20} />
                        </div>
                    </div>
                    <div style={kpiSubtextStyle}>
                        <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{activeDevicePct}% Activos</span>
                        {repairDevices > 0 && <span> • 🛠️ {repairDevices} Reparación</span>}
                        {reserveDevices > 0 && <span> • 📦 {reserveDevices} Reserva</span>}
                    </div>
                </div>

                {/* Tarjeta Líneas Oficiales */}
                <div style={kpiCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={kpiTitleStyle}>LÍNEAS OFICIALES</span>
                            <div style={kpiValueStyle}>{officialPct}%</div>
                        </div>
                        <div style={{ ...kpiIconBoxStyle, backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
                            <ShieldCheck size={20} />
                        </div>
                    </div>
                    <div style={kpiSubtextStyle}>
                        <span>{officialSimsCount} de {totalSims} SIMs oficiales</span>
                    </div>
                </div>

                {/* Tarjeta Ocupación SIMs */}
                <div style={kpiCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={kpiTitleStyle}>OCUPACIÓN DE SIMS</span>
                            <div style={kpiValueStyle}>{simOccupancyPct}%</div>
                        </div>
                        <div style={{ ...kpiIconBoxStyle, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                            <CreditCard size={20} />
                        </div>
                    </div>
                    <div style={kpiSubtextStyle}>
                        <span>{assignedSimsCount} Asignadas</span> • <span style={{ color: freeSimsCount > 0 ? '#fbbf24' : '#94a3b8', fontWeight: 'bold' }}>{freeSimsCount} Libres</span>
                    </div>
                </div>

                {/* Tarjeta Operadores */}
                <div style={kpiCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={kpiTitleStyle}>OPERADORES ACTIVOS</span>
                            <div style={kpiValueStyle}>{activeOperatorsCount} <span style={{ fontSize: '14px', color: '#64748b' }}>/ {totalOperators}</span></div>
                        </div>
                        <div style={{ ...kpiIconBoxStyle, backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                            <Users size={20} />
                        </div>
                    </div>
                    <div style={kpiSubtextStyle}>
                        <span>{totalOperators - activeOperatorsCount} sin dispositivo asignado</span>
                    </div>
                </div>

            </div>

            {/* 3. FILA CENTRAL: GRÁFICOS Y AUDITORÍA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* Métrica Visual (Donas) */}
                <div style={panelBoxStyle}>
                    <h4 style={panelTitleStyle}>📊 Distribución y Salud de Flota</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0' }}>
                        <DonutChart
                            percentage={activeDevicePct}
                            color="#38bdf8"
                            label="Dispositivos Activos"
                            sublabel={`${activeDevices} de ${totalDevices} equipos`}
                        />
                        <DonutChart
                            percentage={simOccupancyPct}
                            color="#34d399"
                            label="Ocupación de SIMs"
                            sublabel={`${assignedSimsCount} de ${totalSims} instaladas`}
                        />
                        <DonutChart
                            percentage={waBusinessPct}
                            color="#a855f7"
                            label="WhatsApp Business"
                            sublabel={`${waBusinessCount} líneas corporativas`}
                        />
                    </div>
                </div>

                {/* Panel de Auditoría / Alertas */}
                <div style={panelBoxStyle}>
                    <h4 style={{ ...panelTitleStyle, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={16} /> Auditoría e Inconsistencias
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {unassignedSims.length > 0 ? (
                            <div style={alertItemStyle('rgba(239, 68, 68, 0.12)', '#ef4444')}>
                                <span style={{ fontWeight: 'bold', color: '#fca5a5' }}>🔴 {unassignedSims.length} SIM Cards activas sin dispositivo</span>
                                <span style={{ fontSize: '11px', color: '#f87171' }}>Tienen número pero no figuran en ningún Slot 1 o Slot 2.</span>
                            </div>
                        ) : (
                            <div style={alertItemStyle('rgba(34, 197, 94, 0.12)', '#22c55e')}>
                                <span style={{ fontWeight: 'bold', color: '#86efac' }}>🟢 Todas las SIMs están correctamente asignadas.</span>
                            </div>
                        )}

                        {repairDevices > 0 && (
                            <div style={alertItemStyle('rgba(245, 158, 11, 0.12)', '#f59e0b')}>
                                <span style={{ fontWeight: 'bold', color: '#fcd34d' }}>🟡 {repairDevices} Dispositivos en estado "EN REPARACIÓN"</span>
                                <span style={{ fontSize: '11px', color: '#fbbf24' }}>Verifica si requieren devolución o reasignación de SIM.</span>
                            </div>
                        )}

                        {dualSimMissingOp.length > 0 && (
                            <div style={alertItemStyle('rgba(59, 130, 246, 0.12)', '#3b82f6')}>
                                <span style={{ fontWeight: 'bold', color: '#93c5fd' }}>🔵 {dualSimMissingOp.length} Dispositivos Dual-SIM sin Operador 2</span>
                                <span style={{ fontSize: '11px', color: '#60a5fa' }}>El Slot 2 tiene SIM pero no tiene un operador vinculado.</span>
                            </div>
                        )}

                        {typeof onNavigate === 'function' && (
                            <button
                                onClick={() => onNavigate('devices')}
                                style={{
                                    marginTop: '4px',
                                    alignSelf: 'flex-start',
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#38bdf8',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                Ir a gestionar dispositivos <ArrowRight size={14} />
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* 4. FILA INFERIOR: ACCESOS RÁPIDOS & ACTIVIDAD */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* Accesos Rápidos a WhatsApp */}
                <div style={panelBoxStyle}>
                    <h4 style={panelTitleStyle}>📲 Enlaces Express a WhatsApp</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {quickWaList.length > 0 ? (
                            quickWaList.map((sim) => (
                                <div
                                    key={sim.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        backgroundColor: '#111827',
                                        borderRadius: '6px',
                                        border: '1px solid #233147'
                                    }}
                                >
                                    <div>
                                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>
                                            {sim.phone_number || sim.phone}
                                        </span>
                                        <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>
                                            ({sim.entity || sim.campaign || 'General'})
                                        </span>
                                    </div>

                                    {sim.wa_link ? (
                                        <a
                                            href={sim.wa_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                backgroundColor: '#16a34a',
                                                color: '#fff',
                                                padding: '4px 10px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <MessageSquare size={12} /> Chat <ExternalLink size={10} />
                                        </a>
                                    ) : (
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>Sin Link WA</span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <span style={{ fontSize: '12px', color: '#64748b' }}>No hay líneas registradas con WhatsApp.</span>
                        )}
                    </div>
                </div>

                {/* Registro de Actividad Reciente */}
                <div style={panelBoxStyle}>
                    <h4 style={panelTitleStyle}>⏱️ Actividad del Sistema</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <Activity size={16} color="#38bdf8" style={{ marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: '500' }}>
                                    Panel de Control cargado correctamente
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>Hace un momento</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <Activity size={16} color="#34d399" style={{ marginTop: '2px' }} />
                            <div>
                                <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: '500' }}>
                                    Métricas sincronizadas ({totalDevices} dispositivos / {totalSims} SIMs)
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>Hace un momento</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}

// ESTILOS DEL PANEL (MODO OSCURO)
const kpiCardStyle = {
    backgroundColor: '#17202e',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #233147',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
};

const kpiTitleStyle = {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: '0.5px'
};

const kpiValueStyle = {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: '4px'
};

const kpiIconBoxStyle = {
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const kpiSubtextStyle = {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '10px',
    borderTop: '1px solid #233147',
    paddingTop: '6px'
};

const panelBoxStyle = {
    backgroundColor: '#17202e',
    padding: '18px',
    borderRadius: '10px',
    border: '1px solid #233147',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
};

const panelTitleStyle = {
    margin: '0 0 14px 0',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#f8fafc',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

const alertItemStyle = (bgColor, borderColor) => ({
    backgroundColor: bgColor,
    borderLeft: `4px solid ${borderColor}`,
    padding: '8px 12px',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '12px'
});