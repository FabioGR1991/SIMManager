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
        <div className="control-donut">
            <div className="control-donut-visual">
                <svg className="control-donut-chart" width="90" height="90" viewBox="0 0 90 90">
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
                <div className="control-donut-value">
                    {percentage}%
                </div>
            </div>
            <div className="control-donut-label">
                <div>{label}</div>
                {sublabel && <div>{sublabel}</div>}
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
        <div className="app-view-root control-dashboard">

            {/* 1. CABECERA DE BIENVENIDA */}
            <div className="titanium-module-header control-welcome">
                <div className="titanium-header-glint" aria-hidden="true" />
                <div className="titanium-header-main">
                    <div className="titanium-header-icon"><Activity size={24} /></div>
                    <div className="titanium-header-copy">
                        <div className="titanium-header-title-row">
                            <h1>{getWelcomePrefix(user.gender)}, {user.name || 'Usuario'}!</h1>
                        </div>
                        <p>Paso a paso, cada detalle suma para mantener la flota impecable.</p>
                        <span className="control-welcome-quote">“{randomQuote}”</span>
                    </div>
                </div>
            </div>

            {/* 2. KPIS SUPERIORES (FILA DE TARJETAS) */}
            <div className="control-kpi-grid">

                {/* Tarjeta Dispositivos */}
                <div className="control-kpi-card control-kpi-devices">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span className="control-kpi-title">DISPOSITIVOS TOTALES</span>
                            <div className="control-kpi-value">{activeDevices} <span>/ {totalDevices}</span></div>
                        </div>
                        <div className="control-kpi-icon">
                            <Smartphone size={20} />
                        </div>
                    </div>
                    <div className="control-kpi-subtext">
                        <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{activeDevicePct}% Activos</span>
                        {repairDevices > 0 && <span> • 🛠️ {repairDevices} Reparación</span>}
                        {reserveDevices > 0 && <span> • 📦 {reserveDevices} Reserva</span>}
                    </div>
                </div>

                {/* Tarjeta Líneas Oficiales */}
                <div className="control-kpi-card control-kpi-lines">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span className="control-kpi-title">LÍNEAS OFICIALES</span>
                            <div className="control-kpi-value">{officialPct}%</div>
                        </div>
                        <div className="control-kpi-icon">
                            <ShieldCheck size={20} />
                        </div>
                    </div>
                    <div className="control-kpi-subtext">
                        <span>{officialSimsCount} de {totalSims} SIMs oficiales</span>
                    </div>
                </div>

                {/* Tarjeta Ocupación SIMs */}
                <div className="control-kpi-card control-kpi-sims">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span className="control-kpi-title">OCUPACIÓN DE SIMS</span>
                            <div className="control-kpi-value">{simOccupancyPct}%</div>
                        </div>
                        <div className="control-kpi-icon">
                            <CreditCard size={20} />
                        </div>
                    </div>
                    <div className="control-kpi-subtext">
                        <span>{assignedSimsCount} Asignadas</span> • <span style={{ color: freeSimsCount > 0 ? '#fbbf24' : '#94a3b8', fontWeight: 'bold' }}>{freeSimsCount} Libres</span>
                    </div>
                </div>

                {/* Tarjeta Operadores */}
                <div className="control-kpi-card control-kpi-operators">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span className="control-kpi-title">OPERADORES ACTIVOS</span>
                            <div className="control-kpi-value">{activeOperatorsCount} <span>/ {totalOperators}</span></div>
                        </div>
                        <div className="control-kpi-icon">
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="control-kpi-subtext">
                        <span>{totalOperators - activeOperatorsCount} sin dispositivo asignado</span>
                    </div>
                </div>

            </div>

            {/* 3. FILA CENTRAL: GRÁFICOS Y AUDITORÍA */}
            <div className="control-content-grid">

                {/* Métrica Visual (Donas) */}
                <div className="control-panel control-fleet-panel">
                    <h4 className="control-panel-title">📊 Distribución y Salud de Flota</h4>
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
                <div className="control-panel control-audit-panel">
                    <h4 className="control-panel-title control-audit-title">
                        <AlertTriangle className="control-audit-icon" size={16} /> Auditoría e Inconsistencias
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {unassignedSims.length > 0 ? (
                            <div className="control-audit-alert">
                                <span className="control-audit-alert-title"><span className="control-alert-pulse">●</span> {unassignedSims.length} SIM Cards activas sin dispositivo</span>
                                <span style={{ fontSize: '11px', color: '#f87171' }}>Tienen número pero no figuran en ningún Slot 1 o Slot 2.</span>
                            </div>
                        ) : (
                            <div className="control-audit-ok">
                                <span className="control-audit-alert-title">Todas las SIMs están correctamente asignadas.</span>
                            </div>
                        )}

                        {repairDevices > 0 && (
                            <div className="control-audit-warning">
                                <span className="control-audit-alert-title">{repairDevices} Dispositivos en estado "EN REPARACIÓN"</span>
                                <span style={{ fontSize: '11px', color: '#fbbf24' }}>Verifica si requieren devolución o reasignación de SIM.</span>
                            </div>
                        )}

                        {dualSimMissingOp.length > 0 && (
                            <div className="control-audit-info">
                                <span className="control-audit-alert-title">{dualSimMissingOp.length} Dispositivos Dual-SIM sin Operador 2</span>
                                <span style={{ fontSize: '11px', color: '#60a5fa' }}>El Slot 2 tiene SIM pero no tiene un operador vinculado.</span>
                            </div>
                        )}

                        {typeof onNavigate === 'function' && (
                            <button
                                onClick={() => onNavigate('devices')}
                                className="control-audit-link"
                            >
                                Ir a gestionar dispositivos <ArrowRight size={14} />
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* 4. FILA INFERIOR: ACCESOS RÁPIDOS & ACTIVIDAD */}
            <div className="control-content-grid">

                {/* Accesos Rápidos a WhatsApp */}
                <div className="control-panel control-quick-panel">
                    <h4 className="control-panel-title">📲 Enlaces Express a WhatsApp</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {quickWaList.length > 0 ? (
                            quickWaList.map((sim) => (
                                <div
                                    key={sim.id}
                                    className="control-quick-row"
                                >
                                    <div>
                                        <span className="control-quick-phone">
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
                                            className="control-quick-link"
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
                <div className="control-panel control-activity-panel">
                    <h4 className="control-panel-title">⏱️ Actividad del Sistema</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="control-activity-row">
                            <Activity size={16} color="#38bdf8" style={{ marginTop: '2px' }} />
                            <div>
                                <div className="control-activity-message">
                                    Panel de Control cargado correctamente
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>Hace un momento</div>
                            </div>
                        </div>

                        <div className="control-activity-row is-success">
                            <Activity size={16} color="#34d399" style={{ marginTop: '2px' }} />
                            <div>
                                <div className="control-activity-message">
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
