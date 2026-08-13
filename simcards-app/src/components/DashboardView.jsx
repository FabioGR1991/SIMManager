import { useState, useMemo } from 'react';
import {
  Smartphone,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  MessageCircle,
  ExternalLink,
  Filter,
  RotateCcw,
  Download,
  SquarePen,
  ClipboardList,
  Trash2
} from 'lucide-react';

export default function DashboardView({
  simcards = [],
  user,
  handleCreateSim,
  handleEditPhone,
  handleViewHistory,
  handleDeleteSim,
  handleStatusChange,
  getBadgeClass,
  navigateToDevice
}) {
  const [newPhone, setNewPhone] = useState('');
  const [newEntity, setNewEntity] = useState('');

  // Estados para Búsqueda y Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [entityFilter, setEntityFilter] = useState('TODOS');

  // Estados para Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // 1. MEMOIZACIÓN DE MÉTRICAS
  const metrics = useMemo(() => ({
    total: simcards.length,
    activos: simcards.filter((s) => s.status === 'Activo').length,
    bloqueados: simcards.filter((s) => s.status?.toLowerCase().includes('bloqueado')).length,
    quemados: simcards.filter((s) => s.status === 'Quemado').length,
  }), [simcards]);

  // 2. MEMOIZACIÓN DE ENTIDADES ÚNICAS
  const uniqueEntities = useMemo(() => {
    return Array.from(
      new Set(
        simcards
          .map((s) => s.entity || s.campaign)
          .filter(Boolean)
      )
    );
  }, [simcards]);

  // Comprobar si hay algún filtro activo
  const isFiltered = Boolean(searchTerm.trim()) || statusFilter !== 'TODOS' || entityFilter !== 'TODOS';

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);

    if (value.length > 6) {
      value = `${value.slice(0, 2)} ${value.slice(2, 6)} - ${value.slice(6)}`;
    } else if (value.length > 2) {
      value = `${value.slice(0, 2)} ${value.slice(2)}`;
    }

    setNewPhone(value);
  };

  const onSubmitSim = (e) => {
    e.preventDefault();
    if (!newPhone) return;
    handleCreateSim(newPhone, newEntity);
    setNewPhone('');
    setNewEntity('');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('TODOS');
    setEntityFilter('TODOS');
    setCurrentPage(1);
  };

  // 3. MEMOIZACIÓN DEL FILTRADO
  const filteredSimcards = useMemo(() => {
    const cleanSearch = searchTerm.replace(/\D/g, '');
    const rawSearchText = searchTerm.toLowerCase().trim();

    return simcards.filter((sim) => {
      // 1. Filtro por Estado
      if (statusFilter !== 'TODOS' && sim.status !== statusFilter) {
        return false;
      }

      // 2. Filtro por Entidad / Área
      const simEntity = sim.entity || sim.campaign || '';
      if (entityFilter !== 'TODOS' && simEntity !== entityFilter) {
        return false;
      }

      // 3. Búsqueda por Texto
      if (!searchTerm) return true;

      const cleanPhone = (sim.phone_number || '').replace(/\D/g, '');
      const matchesPhone = cleanSearch !== '' && cleanPhone.includes(cleanSearch);

      const matchesEntity = simEntity.toLowerCase().includes(rawSearchText);
      const matchesUser = (sim.user_name || '').toLowerCase().includes(rawSearchText);
      const matchesTeam = (sim.team || '').toLowerCase().includes(rawSearchText);
      const matchesWaType = (sim.wa_type || '').toLowerCase().includes(rawSearchText);
      const matchesWaLink = (sim.wa_link || '').toLowerCase().includes(rawSearchText);

      return matchesPhone || matchesEntity || matchesUser || matchesTeam || matchesWaType || matchesWaLink;
    });
  }, [simcards, searchTerm, statusFilter, entityFilter]);

  // EXPORTAR A CSV (Con escape de comillas dobles)
  const handleExportCSV = () => {
    if (!filteredSimcards || filteredSimcards.length === 0) {
      alert('No hay registros para exportar con los filtros actuales.');
      return;
    }

    const headers = [
      'ID',
      'Número de Línea',
      'Tipo WhatsApp',
      'Link WhatsApp',
      'Entidad / Área',
      'Equipo / Sede',
      'Estado Actual',
      'Operador',
      'ICCID',
      'Modelo Dispositivo'
    ];

    const escapeCsvValue = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = filteredSimcards.map(sim => [
      escapeCsvValue(sim.id),
      escapeCsvValue(sim.phone_number),
      escapeCsvValue(sim.wa_type),
      escapeCsvValue(sim.wa_link),
      escapeCsvValue(sim.entity || sim.campaign),
      escapeCsvValue(sim.team),
      escapeCsvValue(sim.status),
      escapeCsvValue(sim.operator),
      escapeCsvValue(sim.iccid),
      escapeCsvValue(sim.device_model)
    ].join(';'));

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Informe_SIMCards_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleEntityFilterChange = (e) => {
    setEntityFilter(e.target.value);
    setCurrentPage(1);
  };

  const totalItems = filteredSimcards.length;
  const isAll = itemsPerPage === 'All';
  const totalPages = isAll ? 1 : Math.ceil(totalItems / itemsPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const indexOfLastItem = isAll ? totalItems : validCurrentPage * itemsPerPage;
  const indexOfFirstItem = isAll ? 0 : indexOfLastItem - itemsPerPage;
  const currentSimcards = isAll ? filteredSimcards : filteredSimcards.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    const val = e.target.value === 'All' ? 'All' : Number(e.target.value);
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: '24px' }}>Inventario de SIMCards</h1>

      {/* Tarjetas de Métricas */}
      <div className="card-grid" style={{ marginBottom: '25px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Smartphone color="#2563eb" size={20} />
            <h3>Total Líneas</h3>
          </div>
          <div className="number">{metrics.total}</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle color="#16a34a" size={20} />
            <h3>Activas</h3>
          </div>
          <div className="number" style={{ color: '#16a34a' }}>{metrics.activos}</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle color="#d97706" size={20} />
            <h3>Bloqueadas</h3>
          </div>
          <div className="number" style={{ color: '#d97706' }}>{metrics.bloqueados}</div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert color="#dc2626" size={20} />
            <h3>Quemadas</h3>
          </div>
          <div className="number" style={{ color: '#dc2626' }}>{metrics.quemados}</div>
        </div>
      </div>

      {/* Formulario Alta SIM */}
      <div className="table-container" style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Registrar Nueva SIMCard</h3>
        <form onSubmit={onSubmitSim} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-control"
            placeholder="11 3830 - 3333"
            value={newPhone}
            onChange={handlePhoneChange}
            style={{ flex: 1, minWidth: '200px' }}
            required
          />
          <input
            type="text"
            className="form-control"
            placeholder={`Entidad / Área (por defecto: ${user?.entity || user?.campaign || 'General'})`}
            value={newEntity}
            onChange={(e) => setNewEntity(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
          <button type="submit" className="btn" style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Agregar Chip
          </button>
        </form>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="table-container" style={{ marginBottom: '20px', padding: '15px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>

          {/* Campo de búsqueda libre */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por número, entidad / área, equipo o WhatsApp..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                paddingLeft: '38px',
                paddingRight: searchTerm ? '38px' : '12px',
                width: '100%',
                fontSize: '14px'
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#64748b'
                }}
                title="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <Filter size={18} color="#64748b" style={{ flexShrink: 0 }} />

          {/* Dropdown Filtro por Estado */}
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="form-control"
            style={{ width: 'auto', minWidth: '180px', fontSize: '14px' }}
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="En stock/Sin uso">En stock/Sin uso</option>
            <option value="Activo">Activo</option>
            <option value="WhatsApp Bloqueado">WhatsApp Bloqueado</option>
            <option value="WhatsApp Business Bloqueado">WhatsApp Business Bloqueado</option>
            <option value="Quemado">Quemado</option>
            <option value="Repuesto">Repuesto</option>
          </select>

          {/* Dropdown Filtro por Entidad / Área */}
          <select
            value={entityFilter}
            onChange={handleEntityFilterChange}
            className="form-control"
            style={{ width: 'auto', minWidth: '170px', fontSize: '14px' }}
          >
            <option value="TODOS">Todas las Entidades</option>
            {uniqueEntities.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>

          {/* Botón Limpiar Filtros */}
          {isFiltered && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              title="Restablecer todos los filtros"
            >
              <RotateCcw size={15} />
              Limpiar
            </button>
          )}

          {/* BOTÓN EXPORTAR CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#0284c7',
              backgroundColor: 'rgba(2, 132, 199, 0.1)',
              border: '1px solid #0284c7',
              borderRadius: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title="Exportar resultados a un archivo CSV"
          >
            <Download size={16} color="#0284c7" />
            Exportar CSV ({filteredSimcards.length})
          </button>

        </div>
      </div>

      {/* Tabla de SIMCards + Paginación */}
      <div className="table-container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          paddingBottom: '10px',
          borderBottom: '1px solid rgba(226, 232, 240, 0.1)',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <span>Mostrar</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="form-control"
              style={{ width: 'auto', padding: '4px 8px', fontSize: '13px' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value="All">Todas</option>
            </select>
            <span>por página</span>
          </div>

          {!isAll && totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', opacity: 0.8 }}>
                Página <strong>{validCurrentPage}</strong> de <strong>{totalPages}</strong>
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  className="btn-pagination"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={validCurrentPage === 1}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: validCurrentPage === 1 ? 0.4 : 1
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  className="btn-pagination"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={validCurrentPage === totalPages}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: validCurrentPage === totalPages ? 0.4 : 1
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <table>
          <thead>
            <tr>
              <th># ID</th>
              <th>Número de Línea</th>
              <th>WhatsApp</th>
              <th>Entidad / Área</th>
              {user?.role === 'admin' && <th>Equipo / Sede</th>}
              <th>Estado Actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentSimcards.length === 0 ? (
              <tr>
                <td colSpan={user?.role === 'admin' ? 7 : 6} style={{ textAlign: 'center', opacity: 0.7, padding: '20px' }}>
                  {isFiltered
                    ? 'No se encontraron líneas que coincidan con los filtros aplicados.'
                    : 'No hay SIMCards registradas aún.'}
                </td>
              </tr>
            ) : (
              currentSimcards.map((sim, index) => {
                const globalIndex = indexOfFirstItem + index + 1;
                return (
                  <tr key={sim.id}>
                    <td><strong>#{globalIndex}</strong></td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span>{sim.phone_number}</span>
                        {sim.device_id && (
                          <button
                            type="button"
                            onClick={() => navigateToDevice && navigateToDevice(sim.device_id)}
                            title={sim.device_model ? `Asociado a: ${sim.device_model}` : "Ver dispositivo asignado"}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              margin: 0,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              color: '#2563eb'
                            }}
                          >
                            <Smartphone size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      {sim.wa_type ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: sim.wa_type === 'WA Business' ? 'rgba(22, 163, 74, 0.15)' : 'rgba(3, 105, 161, 0.15)',
                            color: sim.wa_type === 'WA Business' ? '#22c55e' : '#38bdf8',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <MessageCircle size={12} />
                            {sim.wa_type}
                          </span>
                          {sim.wa_link && (
                            <a
                              href={sim.wa_link.startsWith('http') ? sim.wa_link : `https://${sim.wa_link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Abrir chat de WhatsApp"
                              style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center' }}
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', opacity: 0.5 }}>-</span>
                      )}
                    </td>
                    <td>{sim.entity || sim.campaign || 'N/A'}</td>
                    {user?.role === 'admin' && <td>{sim.team || 'Sin Equipo'}</td>}
                    <td>
                      <span className={`status-badge ${getBadgeClass(sim.status)}`}>
                        {sim.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Editar número */}
                        <button
                          type="button"
                          onClick={() => handleEditPhone(sim)}
                          title="Editar número"
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#3b82f6',
                            opacity: 0.9,
                            transition: 'opacity 0.2s'
                          }}
                        >
                          <SquarePen size={18} />
                        </button>

                        {/* Ver Historial */}
                        <button
                          type="button"
                          onClick={() => handleViewHistory(sim)}
                          title="Ver Historial"
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#38bdf8',
                            opacity: 0.9,
                            transition: 'opacity 0.2s'
                          }}
                        >
                          <ClipboardList size={18} />
                        </button>

                        {/* Eliminar número (Solo Admin) */}
                        {user?.role === 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSim(sim)}
                            title="Eliminar número"
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              color: '#f87171',
                              opacity: 0.9,
                              transition: 'opacity 0.2s'
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}

                        {/* Cambiar Estado */}
                        <select
                          value={sim.status}
                          onChange={(e) => handleStatusChange(sim.id, e.target.value)}
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: '13px', width: 'auto' }}
                          disabled={user?.role !== 'admin' && sim.status === 'Repuesto'}
                        >
                          <option value="En stock/Sin uso">En stock/Sin uso</option>
                          <option value="Activo">Activo</option>
                          <option value="WhatsApp Bloqueado">WhatsApp Bloqueado</option>
                          <option value="WhatsApp Business Bloqueado">WhatsApp Business Bloqueado</option>
                          <option value="Quemado">Quemado</option>
                          <option value="Repuesto">Repuesto</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!isAll && totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '15px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(226, 232, 240, 0.1)'
          }}>
            <span style={{ fontSize: '12px', opacity: 0.7 }}>
              Mostrando del {indexOfFirstItem + 1} al {Math.min(indexOfLastItem, totalItems)} de {totalItems} registros
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                className="btn-pagination"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={validCurrentPage === 1}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: validCurrentPage === 1 ? 0.4 : 1
                }}
              >
                Anterior
              </button>
              <button
                type="button"
                className="btn-pagination"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={validCurrentPage === totalPages}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: validCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: validCurrentPage === totalPages ? 0.4 : 1
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}