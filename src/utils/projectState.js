import { normalizeTags } from './guestParsers'
import { createId } from './ids'

export const DEFAULT_TABLE_COUNT = 8
export const DEFAULT_SEATS_PER_TABLE = 8

function toPositiveInt(value, fallback) {
const parsed = Number.parseInt(value, 10)

if (Number.isFinite(parsed) && parsed > 0) {
return parsed
}

return fallback
}

function createSeatArray(length, existingSeats = []) {
return Array.from({ length }, (_, index) => existingSeats[index] ?? null)
}

function normalizeGuest(rawGuest) {
if (!rawGuest || typeof rawGuest !== 'object') {
return null
}

const cleanName =
typeof rawGuest.name === 'string' ? rawGuest.name.trim() : ''

if (!cleanName) {
return null
}

return {
id:
typeof rawGuest.id === 'string' && rawGuest.id.trim()
? rawGuest.id.trim()
: createId('guest'),
name: cleanName,
tags: normalizeTags(rawGuest.tags)
}
}

function ensureUniqueGuestIds(guests, reservedIds = new Set()) {
const usedIds = new Set(reservedIds)

return guests.map((guest) => {
let candidateId = guest.id
  while (usedIds.has(candidateId)) {
  candidateId = createId('guest')
}

usedIds.add(candidateId)

return {
  ...guest,
  id: candidateId
}
  })
}

function clearAssignmentsInTables(tables) {
return tables.map((table) => ({
...table,
seats: table.seats.map(() => null)
}))
}

function cloneTables(tables) {
return tables.map((table) => ({
...table,
seats: [...table.seats]
}))
}

export function buildTable(index, seatsPerTable, existingTable = {}) {
return {
id:
typeof existingTable.id === 'string' && existingTable.id.trim()
? existingTable.id.trim()
: createId('table'),
name:
typeof existingTable.name === 'string' && existingTable.name.trim()
? existingTable.name.trim()
: Mesa ${index + 1},
type: existingTable.type === 'rect' ? 'rect' : 'round',
seats: createSeatArray(
seatsPerTable,
Array.isArray(existingTable.seats) ? existingTable.seats : []
)
}
}

export function createEmptyProject(config = {}) {
const tableCount = toPositiveInt(config.tableCount, DEFAULT_TABLE_COUNT)
const seatsPerTable = toPositiveInt(
config.seatsPerTable,
DEFAULT_SEATS_PER_TABLE
)

return {
settings: {
tableCount,
seatsPerTable
},
guests: [],
tables: Array.from({ length: tableCount }, (_, index) =>
buildTable(index, seatsPerTable)
)
}
}

export function findSeatByGuestId(tables, guestId) {
for (const table of tables) {
for (let seatIndex = 0; seatIndex < table.seats.length; seatIndex += 1) {
if (table.seats[seatIndex] === guestId) {
return {
tableId: table.id,
tableName: table.name,
seatIndex,
tableType: table.type
}
}
}
}

return null
}

export function getSeatGuestId(tables, tableId, seatIndex) {
const table = tables.find((item) => item.id === tableId)

if (!table) {
return null
}

return table.seats[seatIndex] ?? null
}

export function buildAssignmentMap(tables) {
const map = {}

tables.forEach((table) => {
table.seats.forEach((guestId, seatIndex) => {
if (!guestId) {
return
}

  map[guestId] = {
    tableId: table.id,
    tableName: table.name,
    seatIndex,
    tableType: table.type
  }
})

})

return map
}

export function normalizeProject(rawProject) {
const payload =
rawProject && typeof rawProject === 'object' && rawProject.project
? rawProject.project
: rawProject

if (!payload || typeof payload !== 'object') {
throw new Error('El JSON importado no tiene una estructura válida.')
}

const rawGuests = Array.isArray(payload.guests) ? payload.guests : []
const normalizedGuests = rawGuests.map(normalizeGuest).filter(Boolean)
const guests = ensureUniqueGuestIds(normalizedGuests)
const validGuestIds = new Set(guests.map((guest) => guest.id))

const tablesSource = Array.isArray(payload.tables) ? payload.tables : []
const inferredTableCount = tablesSource.length || DEFAULT_TABLE_COUNT
const inferredSeatsPerTable = Math.max(
...tablesSource.map((table) =>
Array.isArray(table.seats) ? table.seats.length : 0
),
DEFAULT_SEATS_PER_TABLE
)

const tableCount = toPositiveInt(
payload.settings?.tableCount,
inferredTableCount
)
const seatsPerTable = toPositiveInt(
payload.settings?.seatsPerTable,
inferredSeatsPerTable
)

const seenSeatGuestIds = new Set()

const tables = Array.from({ length: tableCount }, (_, index) => {
const table = buildTable(index, seatsPerTable, tablesSource[index] ?? {})

return {
  ...table,
  seats: table.seats.map((guestId) => {
    if (!validGuestIds.has(guestId)) {
      return null
    }

    if (seenSeatGuestIds.has(guestId)) {
      return null
    }

    seenSeatGuestIds.add(guestId)
    return guestId
  })
}

})

return {
settings: {
tableCount,
seatsPerTable
},
guests,
tables
}
}

export function projectReducer(state, action) {
switch (action.type) {
case 'SET_PROJECT': {
return action.payload
}

case 'APPLY_LAYOUT': {
  const tableCount = toPositiveInt(
    action.payload?.tableCount,
    state.settings.tableCount
  )
  const seatsPerTable = toPositiveInt(
    action.payload?.seatsPerTable,
    state.settings.seatsPerTable
  )

  const tables = Array.from({ length: tableCount }, (_, index) =>
    buildTable(index, seatsPerTable, state.tables[index] ?? {})
  )

  return {
    ...state,
    settings: {
      tableCount,
      seatsPerTable
    },
    tables
  }
}

case 'UPDATE_TABLE_TYPE': {
  const { tableId, tableType } = action.payload

  return {
    ...state,
    tables: state.tables.map((table) =>
      table.id === tableId
        ? {
            ...table,
            type: tableType === 'rect' ? 'rect' : 'round'
          }
        : table
    )
  }
}

case 'ADD_GUEST': {
  const guest = normalizeGuest(action.payload)

  if (!guest) {
    return state
  }

  const [uniqueGuest] = ensureUniqueGuestIds([guest], new Set(state.guests.map((item) => item.id)))

  return {
    ...state,
    guests: [...state.guests, uniqueGuest]
  }
}

case 'UPDATE_GUEST': {
  const { guestId, name, tags } = action.payload
  const updatedGuest = normalizeGuest({
    id: guestId,
    name,
    tags
  })

  if (!updatedGuest) {
    return state
  }

  return {
    ...state,
    guests: state.guests.map((guest) =>
      guest.id === guestId ? updatedGuest : guest
    )
  }
}

case 'DELETE_GUEST': {
  const guestId = action.payload?.guestId

  return {
    ...state,
    guests: state.guests.filter((guest) => guest.id !== guestId),
    tables: state.tables.map((table) => ({
      ...table,
      seats: table.seats.map((seatGuestId) =>
        seatGuestId === guestId ? null : seatGuestId
      )
    }))
  }
}

case 'IMPORT_GUESTS': {
  const mode = action.payload?.mode === 'replace' ? 'replace' : 'append'
  const importedGuestsRaw = Array.isArray(action.payload?.guests)
    ? action.payload.guests
    : []
  const importedGuests = importedGuestsRaw.map(normalizeGuest).filter(Boolean)

  if (!importedGuests.length) {
    return state
  }

  if (mode === 'replace') {
    return {
      ...state,
      guests: ensureUniqueGuestIds(importedGuests),
      tables: clearAssignmentsInTables(state.tables)
    }
  }

  const uniqueGuests = ensureUniqueGuestIds(
    importedGuests,
    new Set(state.guests.map((guest) => guest.id))
  )

  return {
    ...state,
    guests: [...state.guests, ...uniqueGuests]
  }
}

case 'PLACE_GUEST_IN_SEAT': {
  const { guestId, tableId, seatIndex } = action.payload
  const guestExists = state.guests.some((guest) => guest.id === guestId)

  if (!guestExists) {
    return state
  }

  const tables = cloneTables(state.tables)
  const targetTable = tables.find((table) => table.id === tableId)

  if (!targetTable || seatIndex < 0 || seatIndex >= targetTable.seats.length) {
    return state
  }

  const targetGuestId = targetTable.seats[seatIndex]

  if (targetGuestId === guestId) {
    return state
  }

  const currentSeat = findSeatByGuestId(tables, guestId)

  if (currentSeat) {
    const sourceTable = tables.find((table) => table.id === currentSeat.tableId)

    if (
      currentSeat.tableId === tableId &&
      currentSeat.seatIndex === seatIndex
    ) {
      return state
    }

    sourceTable.seats[currentSeat.seatIndex] = targetGuestId ?? null
  }

  targetTable.seats[seatIndex] = guestId

  return {
    ...state,
    tables
  }
}

case 'MOVE_SEAT_GUEST': {
  const {
    sourceTableId,
    sourceSeatIndex,
    targetTableId,
    targetSeatIndex
  } = action.payload

  if (
    sourceTableId === targetTableId &&
    sourceSeatIndex === targetSeatIndex
  ) {
    return state
  }

  const tables = cloneTables(state.tables)
  const sourceTable = tables.find((table) => table.id === sourceTableId)
  const targetTable = tables.find((table) => table.id === targetTableId)

  if (!sourceTable || !targetTable) {
    return state
  }

  if (
    sourceSeatIndex < 0 ||
    sourceSeatIndex >= sourceTable.seats.length ||
    targetSeatIndex < 0 ||
    targetSeatIndex >= targetTable.seats.length
  ) {
    return state
  }

  const sourceGuestId = sourceTable.seats[sourceSeatIndex]

  if (!sourceGuestId) {
    return state
  }

  const targetGuestId = targetTable.seats[targetSeatIndex]

  sourceTable.seats[sourceSeatIndex] = targetGuestId ?? null
  targetTable.seats[targetSeatIndex] = sourceGuestId

  return {
    ...state,
    tables
  }
}

case 'UNASSIGN_SEAT': {
  const { tableId, seatIndex } = action.payload

  return {
    ...state,
    tables: state.tables.map((table) =>
      table.id === tableId
        ? {
            ...table,
            seats: table.seats.map((guestId, currentIndex) =>
              currentIndex === seatIndex ? null : guestId
            )
          }
        : table
    )
  }
}

case 'CLEAR_ASSIGNMENTS': {
  return {
    ...state,
    tables: clearAssignmentsInTables(state.tables)
  }
}

case 'RESET_PROJECT': {
  return createEmptyProject()
}

default: {
  return state
}

}
}
