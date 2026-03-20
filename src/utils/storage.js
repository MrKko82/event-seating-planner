import { createEmptyProject, normalizeProject } from './projectState'

const STORAGE_KEY = 'event-seating-planner-v1'

export function loadProjectFromStorage() {
try {
const rawValue = window.localStorage.getItem(STORAGE_KEY)

if (!rawValue) {
  return createEmptyProject()
}

return normalizeProject(JSON.parse(rawValue))

} catch {
return createEmptyProject()
}
}

export function saveProjectToStorage(project) {
try {
window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
return true
} catch {
return false
}
}
