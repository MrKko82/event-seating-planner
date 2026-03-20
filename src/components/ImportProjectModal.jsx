import { useState } from 'react'
import Modal from './Modal'

export default function ImportProjectModal({ onClose, onImport }) {
const [text, setText] = useState('')
const [error, setError] = useState('')
const [loadedFileName, setLoadedFileName] = useState('')

const handleFileChange = async (event) => {
const file = event.target.files?.[0]

if (!file) {
  return
}

const content = await file.text()
setText(content.replace(/^\uFEFF/, ''))
setLoadedFileName(file.name)
setError('')

}

const handleSubmit = (event) => {
event.preventDefault()

try {
  setError('')

  if (!text.trim()) {
    throw new Error('Pega el JSON o carga un archivo antes de importar.')
  }

  const parsed = JSON.parse(text)
  const importResult = onImport(parsed)

  if (importResult !== false) {
    onClose()
  }
} catch (submitError) {
  setError(
    submitError?.message ||
      'No se pudo importar el proyecto JSON.'
  )
}

}

return (
<Modal title="Importar proyecto JSON" onClose={onClose} width="760px">
<form onSubmit={handleSubmit} className="form-stack">
<div className="field">
<label htmlFor="project-json">Pega el JSON del proyecto</label>
<textarea
id="project-json"
rows="14"
value={text}
onChange={(event) => setText(event.target.value)}
placeholder='{"project": {"guests": [], "tables": [], "settings": {}}}'
/>
</div>

    <div className="field">
      <label htmlFor="project-file-import">O carga un archivo JSON</label>
      <input
        id="project-file-import"
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
      />
      {loadedFileName ? (
        <p className="helper-text">
          Archivo cargado: <strong>{loadedFileName}</strong>
        </p>
      ) : null}
    </div>

    <div className="inline-help">
      <p>
        Esta acción reemplaza completamente el proyecto actual:
        invitados, mesas, tipos de mesa y asignaciones.
      </p>
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
        Importar proyecto
      </button>
    </div>
  </form>
</Modal>

)
}
