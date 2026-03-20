function getLinePositions(total, start, end) {
if (total <= 0) {
return []
}

if (total === 1) {
return [(start + end) / 2]
}

return Array.from(
{ length: total },
(_, index) => start + ((end - start) * index) / (total - 1)
)
}

function getRectSeatPositions(count) {
const base = Math.floor(count / 4)
const remainder = count % 4
const sides = [base, base, base, base]

for (let index = 0; index < remainder; index += 1) {
sides[index] += 1
}

const positions = []

getLinePositions(sides[0], 30, 70).forEach((x) => positions.push({ x, y: 12 }))
getLinePositions(sides[1], 30, 70).forEach((y) => positions.push({ x: 88, y }))
getLinePositions(sides[2], 70, 30).forEach((x) => positions.push({ x, y: 88 }))
getLinePositions(sides[3], 70, 30).forEach((y) => positions.push({ x: 12, y }))

return positions.slice(0, count)
}

function getRoundSeatPositions(count) {
const radius = 36

return Array.from({ length: count }, (_, index) => {
const angle = -Math.PI / 2 + (2 * Math.PI * index) / count

return {
  x: 50 + Math.cos(angle) * radius,
  y: 50 + Math.sin(angle) * radius
}

})
}

export default function TableCard({
table,
guestsById,
selection,
onSeatClick,
onTableTypeChange
}) {
const occupiedCount = table.seats.filter(Boolean).length
const positions =
table.type === 'rect'
? getRectSeatPositions(table.seats.length)
: getRoundSeatPositions(table.seats.length)

return (
<section className="table-card">
<div className="table-card__header">
<div>
<h3 className="table-card__title">{table.name}</h3>
<p className="table-card__meta">
{occupiedCount}/{table.seats.length} ocupados
</p>
</div>

    <div className="field field--compact">
      <label htmlFor={`table-type-${table.id}`}>Tipo</label>
      <select
        id={`table-type-${table.id}`}
        className="table-type-select"
        value={table.type}
        onChange={(event) =>
          onTableTypeChange(table.id, event.target.value)
        }
      >
        <option value="round">Redonda</option>
        <option value="rect">Rectangular</option>
      </select>
    </div>
  </div>

  <div className="table-stage">
    <div
      className={`table-surface ${
        table.type === 'rect'
          ? 'table-surface--rect'
          : 'table-surface--round'
      }`}
    >
      <span className="table-surface__name">{table.name}</span>
      <span className="table-surface__meta">
        {table.type === 'rect' ? 'Rectangular' : 'Redonda'}
      </span>
    </div>

    {table.seats.map((guestId, seatIndex) => {
      const guest = guestId ? guestsById[guestId] : null
      const position = positions[seatIndex] ?? { x: 50, y: 50 }
      const isSelected =
        selection?.type === 'seat' &&
        selection.tableId === table.id &&
        selection.seatIndex === seatIndex

      return (
        <button
          key={`${table.id}-${seatIndex}`}
          type="button"
          className={[
            'seat-button',
            guest ? 'seat-button--occupied' : 'seat-button--empty',
            isSelected ? 'seat-button--selected' : ''
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`
          }}
          onClick={() => onSeatClick(table.id, seatIndex)}
          title={`${table.name} · Asiento ${seatIndex + 1}`}
        >
          <span className="seat-button__number">
            {seatIndex + 1}
          </span>
          <span className="seat-button__name">
            {guest ? guest.name : 'Vacío'}
          </span>
          {guest?.tags?.length ? (
            <span className="seat-button__tags">
              {guest.tags.slice(0, 2).join(' · ')}
            </span>
          ) : null}
        </button>
      )
    })}
  </div>
</section>

)
}
