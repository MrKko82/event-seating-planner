import { createId } from './ids'

function stripBom(value) {
return String(value ?? '').replace(/^\uFEFF/, '')
}

function normalizeText(value) {
return stripBom(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

function normalizeHeader(value) {
return String(value ?? '')
.normalize('NFD')
.replace(/[\u0300-\u036f]/g, '')
.trim()
.toLowerCase()
}

export function normalizeTags(rawTags) {
if (Array.isArray(rawTags)) {
return rawTags
.map((tag) => String(tag ?? '').trim())
.filter(Boolean)
}

return String(rawTags ?? '')
.split(',')
.map((tag) => tag.trim())
.filter(Boolean)
}

function buildGuest(name, rawTags = '') {
const cleanName = String(name ?? '').trim()

if (!cleanName) {
return null
}

return {
id: createId('guest'),
name: cleanName,
tags: normalizeTags(rawTags)
}
}

function parseCsvMatrix(text) {
const rows = []
let row = []
let value = ''
let inQuotes = false

const normalized = normalizeText(text)

for (let index = 0; index < normalized.length; index += 1) {
const char = normalized[index]
  if (inQuotes) {
  if (char === '"') {
    if (normalized[index + 1] === '"') {
      value += '"'
      index += 1
    } else {
      inQuotes = false
    }
  } else {
    value += char
  }

  continue
}

if (char === '"') {
  inQuotes = true
  continue
}

if (char === ',') {
  row.push(value.trim())
  value = ''
  continue
}

if (char === '\n') {
  row.push(value.trim())

  if (row.some((cell) => cell !== '')) {
    rows.push(row)
  }

  row = []
  value = ''
  continue
}

value += char
}
row.push(value.trim())

if (row.some((cell) => cell !== '')) {
rows.push(row)
}

if (inQuotes) {
throw new Error('CSV inválido: hay comillas sin cerrar.')
}

return rows
}

function parseLineGuests(text) {
const lines = normalizeText(text)
.split('\n')
.map((line) => line.trim())
.filter(Boolean)

const guests = lines
.map((line) => {
const pipeIndex = line.indexOf('|')
    if (pipeIndex === -1) {
    return buildGuest(line)
  }

  const name = line.slice(0, pipeIndex)
  const rawTags = line.slice(pipeIndex + 1)

  return buildGuest(name, rawTags)
})
.filter(Boolean)
  if (!guests.length) {
throw new Error('No se encontraron invitados válidos en el texto ingresado.')
}

return guests
}

function parseCsvGuests(text) {
const rows = parseCsvMatrix(text)

if (!rows.length) {
throw new Error('El CSV está vacío.')
}

const firstRowHeaders = rows[0].map(normalizeHeader)
const nameHeaderIndex = firstRowHeaders.findIndex((header) =>
['nombre', 'name', 'invitado', 'guest'].includes(header)
)
const tagsHeaderIndex = firstRowHeaders.findIndex((header) =>
['etiquetas', 'tags', 'labels', 'tag'].includes(header)
)

const hasHeaders = nameHeaderIndex !== -1 || tagsHeaderIndex !== -1
const dataRows = hasHeaders ? rows.slice(1) : rows
const nameIndex = hasHeaders ? nameHeaderIndex : 0
const tagsIndex = hasHeaders ? tagsHeaderIndex : rows[0].length > 1 ? 1 : -1

if (nameIndex === -1) {
throw new Error(
'No se encontró una columna de nombre válida en el CSV. Usa "nombre" o "name".'
)
}

const guests = dataRows
.map((row) => {
const name = row[nameIndex] ?? ''
const rawTags = tagsIndex >= 0 ? row[tagsIndex] ?? '' : ''
    return buildGuest(name, rawTags)
})
.filter(Boolean)
  if (!guests.length) {
throw new Error('No se encontraron invitados válidos en el CSV.')
}

return guests
}

function looksLikeCsv(lines) {
const firstLine = lines[0] ?? ''
const normalizedFirst = normalizeHeader(firstLine)

if (
['nombre', 'name', 'etiquetas', 'tags', 'invitado', 'guest'].some((token) =>
normalizedFirst.includes(token)
)
) {
return true
}

return lines
.slice(0, 5)
.some((line) => (line.match(/,/g) || []).length >= 2)
}

export function parseGuestInput(text, formatHint = 'auto') {
const normalized = normalizeText(text).trim()

if (!normalized) {
throw new Error('Pega texto o carga un archivo antes de importar.')
}

const lines = normalized
.split('\n')
.map((line) => line.trim())
.filter(Boolean)

if (!lines.length) {
throw new Error('No hay contenido válido para importar.')
}

if (formatHint === 'lines') {
return {
guests: parseLineGuests(normalized),
format: 'líneas'
}
}

if (formatHint === 'csv') {
return {
guests: parseCsvGuests(normalized),
format: 'csv'
}
}

if (lines[0].includes('|')) {
return {
guests: parseLineGuests(normalized),
format: 'líneas'
}
}

if (looksLikeCsv(lines)) {
return {
guests: parseCsvGuests(normalized),
format: 'csv'
}
}

return {
guests: parseLineGuests(normalized),
format: 'líneas'
}
}
