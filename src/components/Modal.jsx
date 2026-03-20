import { useEffect } from 'react'

export default function Modal({ title, children, onClose, width = '680px' }) {
useEffect(() => {
const handleKeyDown = (event) => {
if (event.key === 'Escape') {
onClose()
}
}

document.body.classList.add('modal-open')
window.addEventListener('keydown', handleKeyDown)

return () => {
  document.body.classList.remove('modal-open')
  window.removeEventListener('keydown', handleKeyDown)
}

}, [onClose])

return (
<div
className="modal-backdrop no-print"
onMouseDown={(event) => {
if (event.target === event.currentTarget) {
onClose()
}
}}
>
<div
className="modal"
style={{ maxWidth: width }}
role="dialog"
aria-modal="true"
aria-labelledby="modal-title"
>
<div className="modal__header">
<h2 id="modal-title" className="modal__title">
{title}
</h2>
<button type="button" className="button button--ghost button--small" onClick={onClose} >
Cerrar
</button>
</div>
<div className="modal__body">{children}</div>
</div>
</div>
)
}
