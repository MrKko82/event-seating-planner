import { useEffect, useState } from 'react'
import Modal from './Modal'
import { normalizeTags } from '../utils/guestParsers'

export default function GuestEditorModal({
mode,
guest,
onClose,
onSubmit
}) {
const [name, setName] = useState(guest?.name ?? '')
const [tagsText, setTagsText] = useState((guest?.tags ?? []).join(', '))
const [error, setError] = useState('')

useEffect(() => {
setName(guest?.name ?? '')
setTagsText((guest?.tags ?? []).join(', '))
setError('')
}, [guest, mode])

const handleSubmit = (event) => {
event.preventDefault()

const cleanName = name.trim()

if (!cleanName) {
  setError('El nombre es obligatorio.')
  return
}

onSubmit({
  name: cleanName,
  tags: normalizeTags(tagsText)
})

}

return (
<Modal
title={mode === 'edit' ? 'Editar invitado' : 'Agregar invitado'}
onClose={onClose}
width="540px"
>
<form onSubmit={handleSubmit} className="form-stack">
<div className="field">
<label htmlFor="guest-name">Nombre</label>
<input
id="guest-name"
type="text"
value={name}
onChange={(event) => setName(event.target.value)}
placeholder="Ej. Andrea Pedraglio"
autoFocus
/>
</div>

    <div className="field">
      <label htmlFor="guest-tags">Etiquetas opcionales</label>
      <input
        id="guest-tags"
        type="text"
        value={tagsText}
        onChange={(event) => setTagsText(event.target.value)}
        placeholder="Ej. familia, lima"
      />
      <p className="helper-text">
        Separa las etiquetas con comas.
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
        {mode === 'edit' ? 'Guardar cambios' : 'Agregar invitado'}
      </button>
    </div>
  </form>
</Modal>

)
}
