import { useEffect, useMemo, useReducer, useState } from 'react'
import ConfigPanel from './components/ConfigPanel'
import GuestEditorModal from './components/GuestEditorModal'
import GuestPanel from './components/GuestPanel'
import ImportGuestsModal from './components/ImportGuestsModal'
import ImportProjectModal from './components/ImportProjectModal'
import SelectionBar from './components/SelectionBar'
import TableGrid from './components/TableGrid'
import TopBar from './components/TopBar'
import { exportGuestsCsv, exportProjectJson } from './utils/exporters'
import {
buildAssignmentMap,
getSeatGuestId,
normalizeProject,
projectReducer
} from './utils/projectState'
import { loadProjectFromStorage, saveProjectToStorage } from './utils/storage'

function buildNotice(text, type = 'success') {
return {
id: ${Date.now()}-${Math.random()},
text,
type
}
}

export default function App() {
const [project, dispatch] = useReducer(
projectReducer,
undefined,
loadProjectFromStorage
)
const [selection, setSelection] = useState(null)
const [notice, setNotice] = useState(null)
const [guestEditor, setGuestEditor] = useState(null)
const [showImportGuests, setShowImportGuests] = useState(false)
const [showImportProject, setShowImportProject] = useState(false)

const guestsById = useMemo(() => {
return Object.fromEntries(project.guests.map((guest) => [guest.id, guest]))
}, [project.guests])

const assignmentMap = useMemo(() => {
return buildAssignmentMap(project.tables)
}, [project.tables])

const unassignedGuests = useMemo(() => {
return project.guests.filter((guest) => !assignmentMap[guest.id])
}, [assignmentMap, project.guests])

const assignedCount = project.guests.length - unassignedGuests.length
const capacity = project.settings.tableCount * project.settings.seatsPerTable
const printTimestamp = useMemo(
() => new Date().toLocaleString('es-PE'),
[]
)

const showNotice = (text, type = 'success') => {
setNotice(buildNotice(text, type))
}

useEffect(() => {
saveProjectToStorage(project)
}, [project])

useEffect(() => {
if (!notice) {
return undefined
}

const timeout = window.setTimeout(() => {
  setNotice(null)
}, 4200)

return () => window.clearTimeout(timeout)

}, [notice])

useEffect(() => {
if (!selection) {
return
}

if (selection.type === 'guest' && !guestsById[selection.guestId]) {
  setSelection(null)
  return
}

if (selection.type === 'seat') {
  const table = project.tables.find((item) => item.id === selection.tableId)

  if (!table || selection.seatIndex < 0 || selection.seatIndex >= table.seats.length) {
    setSelection(null)
  }
}

}, [guestsById, project.tables, selection])

const handleApplyLayout = ({ tableCount, seatsPerTable }) => {
dispatch({
type: 'APPLY_LAYOUT',
payload: {
tableCount,
seatsPerTable
}
})

showNotice('Layout actualizado.')

}

const handleOpenAddGuest = () => {
setGuestEditor({
mode: 'add',
guest: null
})
}

const handleOpenEditGuest = (guest) => {
setGuestEditor({
mode: 'edit',
guest
})
}

const handleGuestSubmit = ({ name, tags }) => {
if (guestEditor?.mode === 'edit' && guestEditor.guest) {
dispatch({
type: 'UPDATE_GUEST',
payload: {
guestId: guestEditor.guest.id,
name,
tags
}
})

  showNotice('Invitado actualizado.')
} else {
  dispatch({
    type: 'ADD_GUEST',
    payload: {
      name,
      tags
    }
  })

  showNotice('Invitado agregado.')
}

setGuestEditor(null)

}

const handleDeleteGuest = (guest) => {
const confirmed = window.confirm(
¿Eliminar a "${guest.name}"? Si estaba asignado, su asiento quedará vacío.
)

if (!confirmed) {
  return
}

dispatch({
  type: 'DELETE_GUEST',
  payload: {
    guestId: guest.id
  }
})

showNotice('Invitado eliminado.')

}

const handleGuestImport = (guests, mode, detectedFormat) => {
if (mode === 'replace' && project.guests.length > 0) {
const confirmed = window.confirm(
'Reemplazar la lista borrará los invitados actuales y limpiará todas las asignaciones. ¿Continuar?'
)

  if (!confirmed) {
    return false
  }
}

dispatch({
  type: 'IMPORT_GUESTS',
  payload: {
    guests,
    mode
  }
})

if (mode === 'replace') {
  setSelection(null)
}

showNotice(
  `${guests.length} invitados importados (${detectedFormat}).`
)

return true

}

const handleProjectImport = (rawProject) => {
const hasData =
project.guests.length > 0 ||
project.tables.some((table) => table.seats.some(Boolean))

if (hasData) {
  const confirmed = window.confirm(
    'Importar un proyecto JSON reemplazará el estado actual. ¿Continuar?'
  )

  if (!confirmed) {
    return false
  }
}

try {
  const normalizedProject = normalizeProject(rawProject)

  dispatch({
    type: 'SET_PROJECT',
    payload: normalizedProject
  })

  setSelection(null)
  showNotice('Proyecto importado correctamente.')

  return true
} catch (error) {
  showNotice(
    error?.message || 'No se pudo importar el proyecto JSON.',
    'error'
  )
  return false
}

}

const handleGuestActivate = (guestId) => {
const assignment = assignmentMap[guestId]

if (assignment) {
  setSelection({
    type: 'seat',
    tableId: assignment.tableId,
    seatIndex: assignment.seatIndex
  })
  return
}

if (!selection) {
  setSelection({
    type: 'guest',
    guestId
  })
  return
}

if (selection.type === 'guest') {
  if (selection.guestId === guestId) {
    setSelection(null)
  } else {
    setSelection({
      type: 'guest',
      guestId
    })
  }
  return
}

if (selection.type === 'seat') {
  dispatch({
    type: 'PLACE_GUEST_IN_SEAT',
    payload: {
      guestId,
      tableId: selection.tableId,
      seatIndex: selection.seatIndex
    }
  })

  setSelection(null)
  showNotice('Invitado asignado al asiento seleccionado.')
}

}

const handleSeatClick = (tableId, seatIndex) => {
const clickedSeatGuestId = getSeatGuestId(project.tables, tableId, seatIndex)

if (!selection) {
  setSelection({
    type: 'seat',
    tableId,
    seatIndex
  })
  return
}

if (selection.type === 'guest') {
  dispatch({
    type: 'PLACE_GUEST_IN_SEAT',
    payload: {
      guestId: selection.guestId,
      tableId,
      seatIndex
    }
  })

  setSelection(null)
  showNotice('Asignación actualizada.')
  return
}

const isSameSeat =
  selection.tableId === tableId && selection.seatIndex === seatIndex

if (isSameSeat) {
  setSelection(null)
  return
}

const selectedSeatGuestId = getSeatGuestId(
  project.tables,
  selection.tableId,
  selection.seatIndex
)

if (selectedSeatGuestId) {
  dispatch({
    type: 'MOVE_SEAT_GUEST',
    payload: {
      sourceTableId: selection.tableId,
      sourceSeatIndex: selection.seatIndex,
      targetTableId: tableId,
      targetSeatIndex: seatIndex
    }
  })

  setSelection(null)

  if (clickedSeatGuestId) {
    showNotice('Invitados intercambiados.')
  } else {
    showNotice('Invitado movido al asiento vacío.')
  }

  return
}

setSelection({
  type: 'seat',
  tableId,
  seatIndex
})

}

const handleUnassignSelectedSeat = () => {
if (!selection || selection.type !== 'seat') {
return
}

const guestId = getSeatGuestId(
  project.tables,
  selection.tableId,
  selection.seatIndex
)

if (!guestId) {
  setSelection(null)
  return
}

dispatch({
  type: 'UNASSIGN_SEAT',
  payload: {
    tableId: selection.tableId,
    seatIndex: selection.seatIndex
  }
})

setSelection(null)
showNotice('Invitado desasignado.')

}

const handleUpdateTableType = (tableId, tableType) => {
dispatch({
type: 'UPDATE_TABLE_TYPE',
payload: {
tableId,
tableType
}
})
}

const handleExportJson = () => {
exportProjectJson(project)
showNotice('Proyecto exportado en JSON.')
}

const handleExportCsv = () => {
exportGuestsCsv(project)
showNotice('CSV exportado.')
}

const handlePrint = () => {
window.print()
}

const handleClearAssignments = () => {
const hasAssignments = project.tables.some((table) => table.seats.some(Boolean))

if (!hasAssignments) {
  showNotice('No hay asignaciones para limpiar.', 'error')
  return
}

const confirmed = window.confirm(
  '¿Limpiar todas las asignaciones manteniendo la lista de invitados?'
)

if (!confirmed) {
  return
}

dispatch({ type: 'CLEAR_ASSIGNMENTS' })
setSelection(null)
showNotice('Todas las asignaciones fueron limpiadas.')

}

const handleResetProject = () => {
const confirmed = window.confirm(
'¿Reiniciar todo? Se perderán invitados, configuración y asignaciones guardadas.'
)

if (!confirmed) {
  return
}

dispatch({ type: 'RESET_PROJECT' })
setSelection(null)
showNotice('Proyecto reiniciado.')

}

return (
<div className="app-shell">
<TopBar
guestCount={project.guests.length}
assignedCount={assignedCount}
capacity={capacity}
onOpenImportProject={() => setShowImportProject(true)}
onExportJson={handleExportJson}
onExportCsv={handleExportCsv}
onPrint={handlePrint}
onClearAssignments={handleClearAssignments}
onResetProject={handleResetProject}
/>

  {notice ? (
    <div className={`notice notice--${notice.type} no-print`}>
      {notice.text}
    </div>
  ) : null}

  <div className="app-grid">
    <aside className="sidebar no-print">
      <ConfigPanel
        settings={project.settings}
        guestCount={project.guests.length}
        assignedCount={assignedCount}
        onApplyLayout={handleApplyLayout}
      />

      <GuestPanel
        guests={project.guests}
        unassignedGuests={unassignedGuests}
        assignmentMap={assignmentMap}
        selection={selection}
        onGuestActivate={handleGuestActivate}
        onOpenAddGuest={handleOpenAddGuest}
        onOpenImportGuests={() => setShowImportGuests(true)}
        onEditGuest={handleOpenEditGuest}
        onDeleteGuest={handleDeleteGuest}
      />
    </aside>

    <main className="workspace">
      <SelectionBar
        selection={selection}
        tables={project.tables}
        guestsById={guestsById}
        onClearSelection={() => setSelection(null)}
        onUnassignSeat={handleUnassignSelectedSeat}
      />

      <section className="print-only print-summary">
        <h1>Plan de mesas</h1>
        <p>
          {project.guests.length} invitados · {assignedCount} asignados ·{' '}
          {unassignedGuests.length} sin asignar · generado {printTimestamp}
        </p>
      </section>

      <TableGrid
        tables={project.tables}
        guestsById={guestsById}
        selection={selection}
        onSeatClick={handleSeatClick}
        onTableTypeChange={handleUpdateTableType}
      />

      {unassignedGuests.length ? (
        <section className="print-only print-unassigned">
          <h2>Invitados sin asignar</h2>
          <p>{unassignedGuests.map((guest) => guest.name).join(', ')}</p>
        </section>
      ) : null}
    </main>
  </div>

  {guestEditor ? (
    <GuestEditorModal
      mode={guestEditor.mode}
      guest={guestEditor.guest}
      onClose={() => setGuestEditor(null)}
      onSubmit={handleGuestSubmit}
    />
  ) : null}

  {showImportGuests ? (
    <ImportGuestsModal
      onClose={() => setShowImportGuests(false)}
      onImport={handleGuestImport}
    />
  ) : null}

  {showImportProject ? (
    <ImportProjectModal
      onClose={() => setShowImportProject(false)}
      onImport={handleProjectImport}
    />
  ) : null}
</div>

)
}
