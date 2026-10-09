import {
    Smartphone,
    CheckCircle2,
    AlertTriangle,
    CreditCard,
    Users,
    MessageCircle,
    ExternalLink,
    Activity,
    ArrowRight,
    CircleCheck
} from 'lucide-react';

export default function PanelControlView({
    user = { name: 'Usuario', role: 'tl' },
    devices = [],
    simcards = [],
    operators = [],
    onNavigate
}) {
    const totalDevices = devices.length;
    const activeDevices = devices.filter(d => (d.status || 'ACTIVO').toUpperCase() === 'ACTIVO').length;
    const repairDevices = devices.filter(d => (d.status || '').toUpperCase() === 'REPARACION').length;
    const reserveDevices = devices.filter(d => (d.status || '').toUpperCase() === 'RESERVA').length;
    const activeDevicePct = totalDevices > 0 ? Math.round((activeDevices / totalDevices) * 100) : 0;

    const assignedSimIds = new Set();
    devices.forEach(d => {
        if (d.sim1_id) assignedSimIds.add(String(d.sim1_id));
        if (d.sim2_id) assignedSimIds.add(String(d.sim2_id));
    });

    const totalSims = simcards.length;
    const assignedSimsCount = simcards.filter(s => assignedSimIds.has(String(s.id))).length;
    const freeSimsCount = totalSims - assignedSimsCount;
    const simOccupancyPct = totalSims > 0 ? Math.round((assignedSimsCount / totalSims) * 100) : 0;

    const assignedOperatorIds = new Set();
    devices.forEach(d => {
        if (d.assigned_operator_id) assignedOperatorIds.add(String(d.assigned_operator_id));
        if (d.assigned_operator2_id) assignedOperatorIds.add(String(d.assigned_operator2_id));
    });
    const totalOperators = operators.length;
    const activeOperatorsCount = assignedOperatorIds.size;
    const assignedOperatorPct = totalOperators > 0
        ? Math.min(100, Math.round((activeOperatorsCount / totalOperators) * 100))
        : 0;

    const unassignedSims = simcards.filter(
        sim => sim.status === 'Activo' && !assignedSimIds.has(String(sim.id))
    );
    const dualSimMissingOp = devices.filter(d => d.sim2_id && !d.assigned_operator2_id);
    const quickWaList = simcards.filter(s => s.wa_link || s.phone_number || s.phone).slice(0, 4);
    const isAdmin = user.role === 'admin' || user.role === 'Administrador';
    const roleLabel = isAdmin
        ? 'Admin General'
        : user.role === 'pl' || user.role === 'Planificador'
            ? 'Planificador'
            : 'Team Leader';

    return (
        <div className="app-view-root control-dashboard">
            <header className="control-dashboard-header">
                <h1>Panel de Control</h1>
                <div className="control-dashboard-context" aria-label={`Rol: ${roleLabel}; alcance: ${isAdmin ? 'Flota Global' : user.team || 'Sin equipo'}`}>
                    <span>{roleLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{isAdmin ? 'Flota Global' : user.team || 'Sin equipo'}</span>
                </div>
            </header>

            <section
                className={`control-attention-panel${unassignedSims.length > 0 ? ' has-critical' : ''}`}
                aria-labelledby="control-attention-title"
            >
                <div className="control-attention-copy">
                    <div className="control-attention-heading">
                        {unassignedSims.length > 0
                            ? <AlertTriangle size={19} aria-hidden="true" />
                            : <CircleCheck size={19} aria-hidden="true" />}
                        <h2 id="control-attention-title">Atención requerida</h2>
                    </div>
                    {unassignedSims.length > 0 ? (
                        <p>
                            <strong>{unassignedSims.length} SIM {unassignedSims.length === 1 ? 'activa' : 'activas'}</strong>
                            {' '}sin dispositivo asignado en Slot 1 o Slot 2.
                        </p>
                    ) : (
                        <p>No hay SIMs activas sin dispositivo asignado.</p>
                    )}
                    {(repairDevices > 0 || dualSimMissingOp.length > 0) && (
                        <ul className="control-attention-secondary">
                            {repairDevices > 0 && (
                                <li>{repairDevices} {repairDevices === 1 ? 'dispositivo en reparación' : 'dispositivos en reparación'}</li>
                            )}
                            {dualSimMissingOp.length > 0 && (
                                <li>{dualSimMissingOp.length} {dualSimMissingOp.length === 1 ? 'dispositivo Dual-SIM sin operador 2' : 'dispositivos Dual-SIM sin operador 2'}</li>
                            )}
                        </ul>
                    )}
                </div>
                {unassignedSims.length > 0 && typeof onNavigate === 'function' && (
                    <button
                        type="button"
                        onClick={() => onNavigate('devices')}
                        className="control-attention-action"
                    >
                        Gestionar Dispositivos <ArrowRight size={16} aria-hidden="true" />
                    </button>
                )}
            </section>

            <section className="control-metrics-section" aria-labelledby="control-metrics-title">
                <h2 id="control-metrics-title" className="control-section-title">Métricas clave de la flota</h2>
                <div className="control-kpi-grid">
                    <article className="control-kpi-card control-kpi-devices">
                        <div className="control-kpi-heading">
                            <Smartphone size={18} aria-hidden="true" />
                            <span className="control-kpi-title">Dispositivos</span>
                        </div>
                        <div className="control-kpi-value">{activeDevices} <span>/ {totalDevices}</span></div>
                        <div
                            className="control-kpi-progress"
                            role="progressbar"
                            aria-label="Porcentaje de dispositivos activos"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow={activeDevicePct}
                        >
                            <span style={{ width: `${activeDevicePct}%` }} />
                        </div>
                        <p className={`control-kpi-footnote${activeDevicePct === 100 && repairDevices === 0 ? ' is-healthy' : ''}`}>
                            {activeDevicePct === 100 && repairDevices === 0
                                ? <><CheckCircle2 size={14} aria-hidden="true" /> Saludable · {activeDevicePct}%</>
                                : <>{repairDevices > 0 ? `${repairDevices} en reparación` : `${activeDevicePct}% activos`}{reserveDevices > 0 ? ` · ${reserveDevices} en reserva` : ''}</>}
                        </p>
                    </article>

                    <article className="control-kpi-card control-kpi-sims">
                        <div className="control-kpi-heading">
                            <CreditCard size={18} aria-hidden="true" />
                            <span className="control-kpi-title">Ocupación SIMs</span>
                        </div>
                        <div className="control-kpi-value">{simOccupancyPct}% <span>({assignedSimsCount}/{totalSims})</span></div>
                        <div
                            className="control-kpi-progress"
                            role="progressbar"
                            aria-label="Porcentaje de SIMs asignadas"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow={simOccupancyPct}
                        >
                            <span style={{ width: `${simOccupancyPct}%` }} />
                        </div>
                        <p className="control-kpi-footnote">{freeSimsCount} libres</p>
                    </article>

                    <article className="control-kpi-card control-kpi-operators">
                        <div className="control-kpi-heading">
                            <Users size={18} aria-hidden="true" />
                            <span className="control-kpi-title">Operadores activos</span>
                        </div>
                        <div className="control-kpi-value">{activeOperatorsCount} <span>/ {totalOperators}</span></div>
                        <div
                            className="control-kpi-progress"
                            role="progressbar"
                            aria-label="Porcentaje de operadores asignados"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-valuenow={assignedOperatorPct}
                        >
                            <span style={{ width: `${assignedOperatorPct}%` }} />
                        </div>
                        <p className="control-kpi-footnote">{Math.max(0, totalOperators - activeOperatorsCount)} sin asignar</p>
                    </article>
                </div>
            </section>

            <section className="control-lower-section" aria-labelledby="control-lower-title">
                <h2 id="control-lower-title" className="control-section-title">Gestión rápida y actividad</h2>
                <div className="control-content-grid">
                    <article className="control-panel control-quick-panel">
                        <h3 className="control-panel-title">Enlaces express a WhatsApp</h3>
                        <div className="control-quick-list">
                            {quickWaList.length > 0 ? quickWaList.map(sim => (
                                <div key={sim.id} className="control-quick-row">
                                    <div className="control-quick-copy">
                                        <span className="control-quick-phone">{sim.phone_number || sim.phone}</span>
                                        <span className="control-quick-entity">{sim.entity || sim.campaign || 'General'}</span>
                                    </div>
                                    {sim.wa_link ? (
                                        <a
                                            href={sim.wa_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="control-quick-link"
                                            aria-label={`Abrir WhatsApp para ${sim.phone_number || sim.phone}`}
                                        >
                                            <MessageCircle size={14} aria-hidden="true" /> Abrir chat <ExternalLink size={12} aria-hidden="true" />
                                        </a>
                                    ) : <span className="control-quick-empty">Sin enlace</span>}
                                </div>
                            )) : <p className="control-empty-state">No hay líneas registradas.</p>}
                        </div>
                    </article>

                    <article className="control-panel control-activity-panel">
                        <h3 className="control-panel-title">Actividad reciente del sistema</h3>
                        <div className="control-activity-list">
                            <div className="control-activity-row">
                                <CheckCircle2 size={17} aria-hidden="true" />
                                <div>
                                    <p className="control-activity-message">Panel de Control cargado correctamente</p>
                                    <span className="control-activity-time">Estado actual</span>
                                </div>
                            </div>
                            <div className="control-activity-row">
                                <Activity size={17} aria-hidden="true" />
                                <div>
                                    <p className="control-activity-message">Métricas sincronizadas</p>
                                    <span className="control-activity-time">{totalDevices} dispositivos · {totalSims} SIMs</span>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </section>
        </div>
    );
}
