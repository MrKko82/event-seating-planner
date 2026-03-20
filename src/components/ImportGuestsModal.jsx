import { useState } from 'react'
import Modal from './Modal'
import { parseGuestInput } from '../utils/guestParsers'

export default function ImportGuestsModal({ onClose, onImport }) {
const [text, setText] = useState('')
const [mode, setMode] = useState('append')
const [formatHint, setFormatHint] = useState('auto')
const [error, setError] = useState('')
const [loadedFileName, setLoadedFileName] = useState('')

const handleFileChange = async (event) => {
const file = event.target.files?.[0]

if (!file) {
  return
}

const content = await file.text()
setText(content)
setLoadedFileName(file.name)
setError('')

}

const handleSubmit = (event) => {
event.preventDefault()

try {
  setError('')

  const result = parseGuestInput(text, formatHint)
  const importResult = onImport(result.guests, mode, result.format)

  if (importResult !== false) {
    onClose()
  }
} catch (submitError) {
  setError(
    submitError?.message ||
      'No se pudo importar la lista de invitados.'
  )
}

}

return (
<Modal title="Importar invitados" onClose={onClose} width="760px">
<form onSubmit={handleSubmit} className="form-stack">
<div className="field-grid field-grid--two">
<div className="field">
<label htmlFor="import-mode">Modo de importación</label>
<select
id="import-mode"
value={mode}
onChange={(event) => setMode(event.target.value)}
>
<option value="append">Agregar a la lista actual</option>
<option value="replace">
Reemplazar lista actual y limpiar asignaciones
</option>
</select>
</div>

      <div className="field">
        <label htmlFor="format-hint">Formato esperado</label>
        <select
          id="format-hint"
          value={formatHint}
          onChange={(event) => setFormatHint(event.target.value)}
        >
          <option value="auto">Auto detectar</option>
          <option value="lines">Líneas / texto plano</option>
          <option value="csv">CSV</option>
        </select>
      </div>
    </div>

    <div className="field">
      <label htmlFor="guest-text-import">Pega texto o CSV</label>
      <textarea
        id="guest-text-import"
        rows="12"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={`Andrea Pedraglio | familia, lima

Carlos López | trabajo
María Torres | amigos`}
/>
<p className="helper-text">
También puedes pegar CSV con columnas como <strong>nombre</strong> y{' '}
<strong>etiquetas</strong>.
</p>
</div>

    <div className="field">
      <label htmlFor="guest-file-import">O carga un archivo TXT / CSV</label>
      <input
        id="guest-file-import"
        type="file"
        accept=".txt,.csv,text/plain,text/csv"
        onChange={handleFileChange}
      />
      {loadedFileName ? (
        <p className="helper-text">
          Archivo cargado: <strong>{loadedFileName}</strong>
        </p>
      ) : null}
    </div>

    <div className="inline-help">
      <strong>Formatos soportados:</strong>
      <pre>{`Una línea por invitado

Andrea Pedraglio
Carlos López

Línea con etiquetas
Andrea Pedraglio | familia, lima

CSV
nombre,etiquetas
Andrea Pedraglio,"familia, lima"`}</pre>
</div>

    {error ? <div className="notice notice--error">{error}</div> : null}

    <div className="modal__actions">
      <button
        type="button"
        className="button button--secondary"
        onClick={onClose}
      >
        Cancelar
      </button>
      <button type="submit" className="button button--primary">
        Importar invitados
      </button>
    </div>
  </form>
</Modal>

)
}
