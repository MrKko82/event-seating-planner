export default function SelectionBar({
selection,
tables,
guestsById,
onClearSelection,
onUnassignSeat
}) {
if (!selection) {
return (
<section className="card selection-bar no-print">
<p className="selection-bar__kicker">Modo manual</p>
<p className="selection-bar__text">
Toca un invitado sin asignar o cualquier asiento para seleccionarlo.
Luego toca el destino para asignar, mover o intercambiar.
</p>
</section>
)
}

if (selection.type === 'guest') {
const guest = guestsById[selection.guestId]

if (!guest) {
  return null
}

return (
  <section className="card selection-bar no-print">
    <p className="selection-bar__kicker">Invitado seleccionado</p>
    <p className="selection-bar__text">
      <strong>{guest.name}</strong>{' '}
      {guest.tags.length ? `· ${guest.tags.join(', ')}` : ''}
    </p>
    <p className="helper-text">
      Toca un asiento vacío u ocupado para asignarlo. Si el asiento ya tiene
      alguien, la app reemplaza a esa persona y la deja sin asignar.
    </p>
    <div className="selection-bar__actions">
      <button
        type="button"
        className="button button--secondary"
        onClick={onClearSelection}
      >
        Cancelar selección
      </button>
    </div>
  </section>
)

}

const table = tables.find((item) => item.id === selection.tableId)

if (!table) {
return null
}

const guestId = table.seats[selection.seatIndex]
const guest = guestId ? guestsById[guestId] : null

return (
<section className="card selection-bar no-print">
<p className="selection-bar__kicker">Asiento seleccionado</p>
<p className="selection-bar__text">
<strong>{table.name}</strong> · Asiento {selection.seatIndex + 1}
{guest ? · ${guest.name} : ' · Vacío'}
</p>
<p className="helper-text">
{guest
? 'Toca otro asiento para mover o intercambiar. También puedes tocar un invitado no asignado para reemplazar este asiento.'
: 'Toca un invitado no asignado para asignarlo a este lugar. Si luego tocas otro asiento, solo cambiará la selección.'}
</p>
<div className="selection-bar__actions">
{guest ? (
<button type="button" className="button button--danger" onClick={onUnassignSeat} >
Desasignar invitado
</button>
) : null}
<button type="button" className="button button--secondary" onClick={onClearSelection} >
Cancelar selección
</button>
</div>
</section>
)
}
