import { useEffect, useMemo, useState } from 'react'

export default function ConfigPanel({
settings,
guestCount,
assignedCount,
onApplyLayout
}) {
const [tableCount, setTableCount] = useState(String(settings.tableCount))
const [seatsPerTable, setSeatsPerTable] = useState(
String(settings.seatsPerTable)
)

useEffect(() => {
setTableCount(String(settings.tableCount))
setSeatsPerTable(String(settings.seatsPerTable))
}, [settings.tableCount, settings.seatsPerTable])

const parsedTableCount = Number.parseInt(tableCount, 10)
const parsedSeatsPerTable = Number.parseInt(seatsPerTable, 10)

const currentCapacity = settings.tableCount * settings.seatsPerTable
const draftCapacity =
(Number.isFinite(parsedTableCount) ? parsedTableCount : 0) *
(Number.isFinite(parsedSeatsPerTable) ? parsedSeatsPerTable : 0)

const unchanged =
parsedTableCount === settings.tableCount &&
parsedSeatsPerTable === settings.seatsPerTable

const unassignedCount = guestCount - assignedCount

const capacityWarning = useMemo(() => {
if (!draftCapacity || guestCount <= draftCapacity) {
return ''
}

return `Con esta configuración faltan ${
  guestCount - draftCapacity
} asientos para ubicar a todos los invitados.`

}, [draftCapacity, guestCount])

const handleSubmit = (event) => {
event.preventDefault()

if (!Number.isFinite(parsedTableCount) || parsedTableCount < 1) {
  return
}

if (!Number.isFinite(parsedSeatsPerTable) || parsedSeatsPerTable < 1) {
  return
}

onApplyLayout({
  tableCount: parsedTableCount,
  seatsPerTable: parsedSeatsPerTable
})

}

return (
<section className="card">
<div className="card__header">
<div>
<h2 className="card__title">Configuración</h2>
<p className="card__subtitle">
Ajusta la estructura base del salón.
</p>
</div>
</div>

  <form onSubmit={handleSubmit} className="form-stack">
    <div className="field-grid field-grid--two">
      <div className="field">
        <label htmlFor="table-count">Cantidad de mesas</label>
        <input
          id="table-count"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={tableCount}
          onChange={(event) => setTableCount(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="seats-per-table">Asientos por mesa</label>
        <input
          id="seats-per-table"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={seatsPerTable}
          onChange={(event) => setSeatsPerTable(event.target.value)}
        />
      </div>
    </div>

    <div className="status-grid">
      <div className="status-box">
        <span className="status-box__label">Capacidad actual</span>
        <strong>{currentCapacity}</strong>
      </div>
      <div className="status-box">
        <span className="status-box__label">Invitados</span>
        <strong>{guestCount}</strong>
      </div>
      <div className="status-box">
        <span className="status-box__label">Asignados</span>
        <strong>{assignedCount}</strong>
      </div>
      <div className="status-box">
        <span className="status-box__label">Sin asignar</span>
        <strong>{unassignedCount}</strong>
      </div>
    </div>

    <p className="helper-text">
      Las mesas nuevas nacen como <strong>redondas</strong>. El tipo visual
      puede cambiarse mesa por mesa dentro de cada tarjeta.
    </p>

    {capacityWarning ? (
      <div className="warning-box">{capacityWarning}</div>
    ) : null}

    <div className="modal__actions">
      <span className="helper-text">
        Capacidad propuesta: <strong>{draftCapacity || 0}</strong>
      </span>
      <button
        type="submit"
        className="button button--primary"
        disabled={unchanged}
      >
        Aplicar layout
      </button>
    </div>
  </form>
</section>

)
}
