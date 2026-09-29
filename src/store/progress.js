// Progression de l'utilisateur : liste des fresques scannées, sauvegardée en localStorage.
import { reactive, computed, watch } from 'vue'
import { fresques } from '../data/fresques'

const STORAGE_KEY = 'fresque-progress'

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

const state = reactive({ scanned: load() })

watch(
  () => [...state.scanned],
  (scanned) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scanned))
    } catch {
      // stockage indisponible (navigation privée...) : la progression reste en mémoire
    }
  },
)

export function isUnlocked(id) {
  return state.scanned.includes(id)
}

export function unlock(id) {
  if (!isUnlocked(id)) state.scanned.push(id)
}

export function reset() {
  state.scanned.splice(0)
}

export const unlockedCount = computed(() => state.scanned.length)
export const allUnlocked = computed(() => fresques.every((f) => state.scanned.includes(f.id)))

// Fresque non scannée choisie au hasard (pour la charade), ou null si tout est débloqué
export function randomLockedFresque() {
  const locked = fresques.filter((f) => !isUnlocked(f.id))
  return locked.length ? locked[Math.floor(Math.random() * locked.length)] : null
}
