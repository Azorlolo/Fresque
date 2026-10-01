// Progression de l'utilisateur, sauvegardée en localStorage :
//  - scanned  : fresques scannées
//  - charades : fresques dont la charade a été révélée à l'utilisateur
import { reactive, computed, watch } from 'vue'
import { fresques } from '../data/fresques'

const STORAGE_KEY = 'fresque-progress'

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY))
    // Ancien format : simple liste des fresques scannées
    if (Array.isArray(data)) return { scanned: data, charades: [] }
    return {
      scanned: Array.isArray(data?.scanned) ? data.scanned : [],
      charades: Array.isArray(data?.charades) ? data.charades : [],
    }
  } catch {
    return { scanned: [], charades: [] }
  }
}

const state = reactive(load())

watch(
  () => ({ scanned: [...state.scanned], charades: [...state.charades] }),
  (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // stockage indisponible (navigation privée...) : la progression reste en mémoire
    }
  },
)

export function isUnlocked(id) {
  return state.scanned.includes(id)
}

// Fresque qui vient d'être débloquée pour la première fois : sa page joue l'animation de mise en couleur.
// Gardé en mémoire uniquement, pour que l'animation ne rejoue pas au rechargement.
let pendingReveal = null

export function unlock(id) {
  if (!isUnlocked(id)) {
    state.scanned.push(id)
    pendingReveal = id
  }
}

// true une seule fois après le premier scan de la fresque
export function consumeReveal(id) {
  if (pendingReveal !== id) return false
  pendingReveal = null
  return true
}

export function reset() {
  state.scanned.splice(0)
  state.charades.splice(0)
}

export const unlockedCount = computed(() => state.scanned.length)
export const allUnlocked = computed(() => fresques.every((f) => state.scanned.includes(f.id)))

// Fresques scannées, dans l'ordre des données (pour la carte)
export const unlockedFresques = computed(() => fresques.filter((f) => isUnlocked(f.id)))

// Charades révélées, dans l'ordre où l'utilisateur les a obtenues
export const revealedCharades = computed(() =>
  state.charades.map((id) => fresques.find((f) => f.id === id)).filter(Boolean),
)

// Charade à afficher sous une fresque : on reprend une charade déjà révélée et pas encore
// résolue, sinon on en révèle une nouvelle vers une fresque non scannée au hasard.
// Renvoie null si tout est débloqué.
export function nextCharade() {
  const pending = revealedCharades.value.find((f) => !isUnlocked(f.id))
  if (pending) return pending

  const locked = fresques.filter((f) => !isUnlocked(f.id))
  if (!locked.length) return null
  const fresque = locked[Math.floor(Math.random() * locked.length)]
  state.charades.push(fresque.id)
  return fresque
}
