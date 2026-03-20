export default function TopBar({
guestCount,
assignedCount,
capacity,
onOpenImportProject,
onExportJson,
onExportCsv,
onPrint,
onClearAssignments,
onResetProject
}) {
const unassignedCount = guestCount - assignedCount

return (
<header className="topbar card no-print">
<div className="topbar__content">
<div>
<p className="topbar__eyebrow">Event Seating Planner</p>
<h1 className="topbar__title">Distribución de invitados</h1>
<p className="topbar__subtitle">
Herramienta manual para probar seating arrangements con buena
experiencia en desktop, tablet y móvil.
</p>
</div>

    <div className="topbar__stats">
      <div className="stat-chip">
        <span className="stat-chip__label">Invitados</span>
        <strong>{guestCount}</strong>
      </div>
      <div className="stat-chip">
        <span className="stat-chip__label">Asignados</span>
        <strong>{assignedCount}</strong>
      </div>
      <div className="stat-chip">
        <span className="stat-chip__label">Sin asignar</span>
        <strong>{unassignedCount}</strong>
      </div>
      <div className="stat-chip">
        <span className="stat-chip__label">Capacidad</span>
        <strong>{capacity}</strong>
      </div>
    </div>
  </div>

  <div className="topbar__actions">
    <button
      type="button"
      className="button button--secondary"
      onClick={onOpenImportProject}
    >
      Importar JSON
    </button>
    <button
      type="button"
      className="button button--secondary"
      onClick={onExportJson}
    >
      Exportar JSON
    </button>
    <button
      type="button"
      className="button button--secondary"
      onClick={onExportCsv}
    >
      Exportar CSV
    </button>
    <button
      type="button"
      className="button button--secondary"
      onClick={onPrint}
    >
      Imprimir
    </button>
    <button
      type="button"
      className="button button--danger"
      onClick={onClearAssignments}
    >
      Limpiar asignaciones
    </button>
    <button
      type="button"
      className="button button--danger"
      onClick={onResetProject}
    >
      Reiniciar todo
    </button>
  </div>
</header>

)
}
