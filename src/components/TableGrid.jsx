import TableCard from './TableCard'

export default function TableGrid({
tables,
guestsById,
selection,
onSeatClick,
onTableTypeChange
}) {
if (!tables.length) {
return (
<div className="empty-state">
No hay mesas configuradas todavía.
</div>
)
}

return (
<div className="table-grid">
{tables.map((table) => (
<TableCard key={table.id} table={table} guestsById={guestsById} selection={selection} onSeatClick={onSeatClick} onTableTypeChange={onTableTypeChange} />
))}
</div>
)
}
