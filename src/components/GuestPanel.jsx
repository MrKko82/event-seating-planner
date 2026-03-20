import { useMemo, useState } from 'react'

function normalizeSearch(value) {
return String(value ?? '')
.normalize('NFD')
.replace(/[\u0300-\u036f]/g, '')
.toLowerCase()
}

function getGuestStatus(assignment) {
if (!assignment) {
return 'Sin asignar'
}

return ${assignment.tableName} · Asiento ${assignment.seatIndex + 1}
}

export default function GuestPanel({
guests,
unassignedGuests,
assignmentMap,
selection,
onGuestActivate,
onOpenAddGuest,
onOpenImportGuests,
onEditGuest,
onDeleteGuest
}) {
const [activeTab, setActiveTab] = useState('unassigned')
const [query, setQuery] = useState('')

const visibleGuests = activeTab === 'all' ? guests : unassignedGuests
const normalizedQuery = normalizeSearch(query)

const filteredGuests = useMemo(() => {
return visibleGuests.filter((guest) => {
if (!normalizedQuery) {
return true
}

  const assignment = assignmentMap[guest.id]
  const searchableText = normalizeSearch(
    [
      guest.name,
      guest.tags.join(' '),
      assignment?.tableName ?? '',
      assignment ? `asiento ${assignment.seatIndex + 1}` : 'sin asignar'
    ].join(' ')
  )

  return searchableText.includes(normalizedQuery)
})

}, [assignmentMap, normalizedQuery, visibleGuests])

return (
<section className="card guest-panel">
<div className="card__header">
<div>
<h2 className="card__title">Invitados</h2>
<p className="card__subtitle">
Gestiona nombres, etiquetas y estados.
</p>
</div>
<div className="card__actions">
<button type="button" className="button button--secondary button--small" onClick={onOpenAddGuest} >
Agregar
</button>
<button type="button" className="button button--secondary button--small" onClick={onOpenImportGuests} >
Importar
</button>
</div>
</div>

  <div className="tab-bar" role="tablist" aria-label="Filtro de invitados">
    <button
      type="button"
      className={`tab ${activeTab === 'unassigned' ? 'tab--active' : ''}`}
      onClick={() => setActiveTab('unassigned')}
    >
      No asignados ({unassignedGuests.length})
    </button>
    <button
      type="button"
      className={`tab ${activeTab === 'all' ? 'tab--active' : ''}`}
      onClick={() => setActiveTab('all')}
    >
      Todos ({guests.length})
    </button>
  </div>

  <div className="field">
    <label htmlFor="guest-search">Buscar</label>
    <input
      id="guest-search"
      type="search"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Nombre, etiqueta, mesa..."
    />
  </div>

  <div className="guest-list" aria-live="polite">
    {!filteredGuests.length ? (
      <div className="empty-state">
        {query.trim()
          ? 'No hay resultados para tu búsqueda.'
          : activeTab === 'unassigned'
            ? 'Todos los invitados ya tienen asiento.'
            : 'Todavía no hay invitados cargados.'}
      </div>
    ) : (
      filteredGuests.map((guest) => {
        const assignment = assignmentMap[guest.id]
        const isSelected =
          (selection?.type === 'guest' &&
            selection.guestId === guest.id) ||
          (selection?.type === 'seat' &&
            assignment &&
            selection.tableId === assignment.tableId &&
            selection.seatIndex === assignment.seatIndex)

        return (
          <div
            key={guest.id}
            className={`guest-row ${isSelected ? 'guest-row--selected' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => onGuestActivate(guest.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onGuestActivate(guest.id)
              }
            }}
          >
            <div className="guest-row__body">
              <div className="guest-row__name">{guest.name}</div>

              {guest.tags.length ? (
                <div className="tag-list">
                  {guest.tags.slice(0, 3).map((tag) => (
                    <span key={`${guest.id}-${tag}`} className="tag">
                      {tag}
                    </span>
                  ))}
                  {guest.tags.length > 3 ? (
                    <span className="tag">+{guest.tags.length - 3}</span>
                  ) : null}
                </div>
              ) : null}

              <div className="guest-row__status">
                {getGuestStatus(assignment)}
              </div>
            </div>

            <div className="guest-row__actions">
              <button
                type="button"
                className="button button--ghost button--small"
                onClick={(event) => {
                  event.stopPropagation()
                  onEditGuest(guest)
                }}
              >
                Editar
              </button>
              <button
                type="button"
                className="button button--ghost button--small"
                onClick={(event) => {
                  event.stopPropagation()
                  onDeleteGuest(guest)
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        )
      })
    )}
  </div>

  <p className="helper-text">
    Tip: si tocas un invitado ya asignado desde la pestaña <strong>Todos</strong>,
    la app selecciona su asiento para ayudarte a ubicarlo rápido.
  </p>
</section>

)
}
