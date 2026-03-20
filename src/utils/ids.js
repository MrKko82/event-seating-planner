export function createId(prefix = 'id') {
const randomPart =
typeof crypto !== 'undefined' && crypto.randomUUID
? crypto.randomUUID()
: ${Date.now()}-${Math.random().toString(36).slice(2, 10)}

return ${prefix}-${randomPart}
}
