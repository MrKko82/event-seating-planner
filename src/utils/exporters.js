import { buildAssignmentMap } from './projectState'

function downloadFile(filename, content, mimeType) {
const blob = new Blob([content], { type: mimeType })
const url = URL.createObjectURL(blob)
const link = document.createElement('a')

link.href = url
link.download = filename
document.body.appendChild(link)
link.click()
document.body.removeChild(link)
URL.revokeObjectURL(url)
}

function escapeCsvValue(value) {
const stringValue = String(value ?? '')

if (/[",\n]/.test(stringValue)) {
return "${stringValue.replace(/"/g, '""')}"
}

return stringValue
}

export function exportProjectJson(project) {
const payload = {
app: 'Event Seating Planner',
version: 1,
exportedAt: new Date().toISOString(),
project
}

downloadFile(
'seating-project.json',
JSON.stringify(payload, null, 2),
'application/json;charset=utf-8'
)
}

export function exportGuestsCsv(project) {
const assignmentMap = buildAssignmentMap(project.tables)

const rows = [
['ID', 'Nombre', 'Etiquetas', 'Estado', 'Mesa', 'Asiento', 'Tipo de mesa']
]

project.guests.forEach((guest) => {
const assignment = assignmentMap[guest.id]

rows.push([
  guest.id,
  guest.name,
  guest.tags.join(', '),
  assignment ? 'Asignado' : 'Sin asignar',
  assignment?.tableName ?? '',
  assignment ? String(assignment.seatIndex + 1) : '',
  assignment
    ? assignment.tableType === 'rect'
      ? 'Rectangular'
      : 'Redonda'
    : ''
])

})

const csvContent = \uFEFF${rows .map((row) => row.map(escapeCsvValue).join(',')) .join('\n')}

downloadFile('seating-guests.csv', csvContent, 'text/csv;charset=utf-8')
}
