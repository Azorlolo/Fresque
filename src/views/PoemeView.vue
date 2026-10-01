<!-- Livre du poème : une page par fresque + la conclusion. Les pages se tournent au doigt, au clic ou au clavier. -->
<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { fresques, conclusion } from '../data/fresques'
import { isUnlocked, allUnlocked, unlockedCount } from '../store/progress'

const route = useRoute()

// La couverture, une page par fresque (débloquée par son scan), puis la conclusion (débloquée quand tout est scanné)
const pages = computed(() => [
  { key: 'couverture', cover: true, numero: '✦', titre: 'Couverture', unlocked: true },
  ...fresques.map((f) => ({
    ...f.poeme,
    key: f.id,
    color: f.theme.primary,
    unlocked: isUnlocked(f.id),
    images: [isUnlocked(f.id) ? f.thumbnail.color : f.thumbnail.gray],
  })),
  {
    ...conclusion,
    key: 'conclusion',
    color: '#9a7330',
    unlocked: allUnlocked.value,
    images: fresques.map((f) => (isUnlocked(f.id) ? f.thumbnail.color : f.thumbnail.gray)),
  },
])
const last = computed(() => pages.value.length - 1)

// Page affichée (0 = couverture, 1 = première partie). Lien direct possible : #/poeme?page=2
const startPage = Math.min(Math.max(parseInt(route.query.page, 10) || 0, 0), fresques.length + 1)
const current = ref(startPage)

// Pages déjà ouvertes : leurs vers s'écrivent à l'encre la première fois qu'on y arrive
const seen = reactive(new Set([startPage]))

const TURN_MS = 700
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Feuille en train de tourner : passe au-dessus des autres jusqu'à la fin de l'animation
const active = ref(null)
let releaseTimer = null
function holdActive(i) {
  active.value = i
  clearTimeout(releaseTimer)
  releaseTimer = setTimeout(() => (active.value = null), TURN_MS + 50)
}

function show(i) {
  current.value = i
  seen.add(i)
}

function next() {
  if (current.value >= last.value) return
  holdActive(current.value)
  show(current.value + 1)
}

function prev() {
  if (current.value <= 0) return
  holdActive(current.value - 1)
  show(current.value - 1)
}

// Saut vers une page : les feuilles tournent l'une après l'autre
let jumpTimer = null
function goTo(target) {
  clearInterval(jumpTimer)
  const step = () => {
    if (current.value === target) return clearInterval(jumpTimer)
    target > current.value ? next() : prev()
  }
  step()
  jumpTimer = setInterval(step, reducedMotion ? 0 : 140)
}

// ---------- Glisser pour tourner ----------
const book = ref(null)
const dragLeaf = ref(null)
const dragAngle = ref(0)
let drag = null

function onPointerDown(e) {
  if (e.button !== 0 || e.target.closest('a, button')) return
  drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), dir: 0, progress: 0 }
}

function onPointerMove(e) {
  if (!drag || e.pointerId !== drag.id) return
  // Bouton de souris relâché hors du livre avant le début du glissé
  if (!drag.dir && e.pointerType === 'mouse' && !e.buttons) return (drag = null)
  const dx = e.clientX - drag.x0
  const dy = e.clientY - drag.y0

  if (!drag.dir) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
    // Geste vertical : on laisse la page défiler
    if (Math.abs(dy) > Math.abs(dx)) return (drag = null)
    const dir = dx < 0 ? 1 : -1
    if ((dir > 0 && current.value >= last.value) || (dir < 0 && current.value <= 0)) return (drag = null)
    drag.dir = dir
    dragLeaf.value = dir > 0 ? current.value : current.value - 1
    active.value = dragLeaf.value
    clearTimeout(releaseTimer)
    book.value.setPointerCapture(e.pointerId)
  }

  // Glisser sur toute la largeur d'une page = demi-tour complet de la feuille
  const width = book.value.offsetWidth
  drag.progress = Math.min(Math.max((-drag.dir * dx) / width, 0), 1)
  dragAngle.value = drag.dir > 0 ? -180 * drag.progress : -180 + 180 * drag.progress
}

function onPointerUp(e) {
  if (!drag || e.pointerId !== drag.id) return
  const { dir, progress } = drag

  if (!dir) {
    // Simple toucher : la couverture s'ouvre, puis bord droit = page suivante, bord gauche = page précédente
    const rect = book.value.getBoundingClientRect()
    current.value === 0 || e.clientX > rect.left + rect.width / 2 ? next() : prev()
  } else {
    const speed = Math.abs(e.clientX - drag.x0) / (performance.now() - drag.t0) // px/ms
    const done = progress > 0.35 || (speed > 0.5 && progress > 0.05)
    const leaf = dragLeaf.value
    dragLeaf.value = null
    holdActive(leaf)
    if (done) show(current.value + dir)
  }
  drag = null
}

function onPointerCancel() {
  if (drag?.dir) holdActive(dragLeaf.value)
  dragLeaf.value = null
  drag = null
}

// ---------- Rendu des feuilles ----------
// Ouverture du livre (0 = fermé, 1 = ouvert) : suit la couverture pendant qu'on la glisse,
// pour que le livre se recentre en même temps qu'elle se referme
const opening = computed(() => (dragLeaf.value === 0 ? Math.abs(dragAngle.value) / 180 : current.value > 0 ? 1 : 0))
// La couverture bouge : aucune page ne doit apparaître à sa gauche
const coverMoving = computed(() => dragLeaf.value === 0 || active.value === 0)

function leafStyle(i) {
  const n = pages.value.length
  const turned = i < current.value
  const angle = dragLeaf.value === i ? dragAngle.value : turned ? -180 : 0
  return {
    transform: `rotateY(${angle}deg)`,
    '--turn': Math.abs(angle) / 180,
    // Pile de droite : la première page dessus. Pile de gauche : la dernière tournée dessus.
    zIndex: active.value === i ? 2 * n + 1 : turned ? n + 1 + i : n - i,
  }
}

function onKey(e) {
  if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  clearTimeout(releaseTimer)
  clearInterval(jumpTimer)
})
</script>

<template>
  <div class="poeme-intro">
    <h1>Le Poème</h1>
    <p>Chaque fresque découverte révèle un chant. Réunissez-les pour lire la fin du voyage.</p>
  </div>

  <div
    class="book-stage"
    :class="{ closed: current === 0, 'cover-moving': coverMoving }"
    :style="{ '--opening': opening }"
  >
    <div
      ref="book"
      class="book"
      :class="{ dragging: dragLeaf !== null }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
    >
      <div
        v-for="(page, i) in pages"
        :key="page.key"
        class="leaf"
        :class="{ dragging: dragLeaf === i, current: i === current, 'cover-leaf': page.cover }"
        :style="leafStyle(i)"
        :aria-hidden="i !== current"
      >
        <template v-if="page.cover">
          <!-- Couverture de cuir, titre doré -->
          <div class="face face-front cover">
            <div class="cover-frame">
              <svg v-for="c in ['tl', 'tr', 'bl', 'br']" :key="c" :class="['cover-corner', c]" viewBox="0 0 40 40" aria-hidden="true">
                <path d="M3 37V12Q3 3 12 3h25" />
                <path d="M9 37V16q0-7 7-7h21" />
                <path d="M16 16q7-9 14-3-6 2-8 8-3-4-6-5z" />
              </svg>
              <svg class="cover-ornament" viewBox="0 0 120 12" aria-hidden="true">
                <path d="M0 6h48M72 6h48" />
                <path d="M60 1l5 5-5 5-5-5z" />
              </svg>
              <h2 class="cover-title">Les trois mondes</h2>
              <svg class="cover-emblems" viewBox="0 0 120 24" aria-hidden="true">
                <!-- Mer, Terre, Ciel -->
                <path d="M6 15q4-6 8 0t8 0" />
                <path d="M6 19q4-6 8 0t8 0" />
                <circle cx="60" cy="12" r="2.2" />
                <path d="M60 9.8q-5-7 0-8 5 1 0 8M62.1 11.3q5-6 8-1-1 5-8 1M61.3 14q4 7-1 8.5-4-2 0-8.5M58.7 14q-4 7 1 8.5M57.9 11.3q-5-6-8-1 1 5 8 1" />
                <path d="M96 14q4-6 8-1 4-5 8 1" />
                <path d="M102 9q2-2 4 0" />
              </svg>
              <p class="cover-sub">Mer · Terre · Ciel</p>
              <svg class="cover-ornament" viewBox="0 0 120 12" aria-hidden="true">
                <path d="M0 6h48M72 6h48" />
                <path d="M60 1l5 5-5 5-5-5z" />
              </svg>
            </div>
            <div class="shade"></div>
          </div>
          <!-- Contre-plat : papier de garde -->
          <div class="face face-back endpaper" aria-hidden="true">
            <div class="ex-libris">
              <span>Ex libris</span>
              <strong>Fresque Interactive</strong>
            </div>
            <div class="shade"></div>
          </div>
        </template>

        <template v-else>
          <!-- Recto : la partie du poème -->
          <article class="face face-front" :style="{ '--ink': page.color }">
            <div class="page" :class="{ final: i === last, locked: !page.unlocked }">
              <div class="page-head">
                <span class="page-num">{{ page.numero }}</span>
                <h2 class="page-title">{{ page.titre }}</h2>
                <p v-if="page.unlocked" class="page-sub">{{ page.sousTitre }}</p>
                <svg class="ornament" viewBox="0 0 120 12" aria-hidden="true">
                  <path d="M0 6h48M72 6h48" />
                  <path d="M60 1l5 5-5 5-5-5z" />
                </svg>
              </div>
  
              <div v-if="page.unlocked" class="verses" :class="{ ink: seen.has(i) }">
                <p v-for="(vers, n) in page.vers" :key="n" class="verse" :style="{ '--n': n }">{{ vers }}</p>
              </div>
  
              <div v-else class="sealed">
                <svg class="seal" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <p v-if="i === last">
                  La fin du poème se révèle quand toutes les fresques sont découvertes.
                  <strong>{{ unlockedCount }} / {{ fresques.length }}</strong>
                </p>
                <p v-else>Scannez le QR code de la fresque pour révéler ce chant.</p>
                <div class="ghost-lines" aria-hidden="true">
                  <span v-for="n in 8" :key="n"></span>
                </div>
                <router-link to="/" class="sealed-link">Voir les fresques</router-link>
              </div>
  
              <span class="page-foot">{{ i }}</span>
            </div>
            <div class="shade"></div>
          </article>
  
          <!-- Verso : illustration de la page suivante (visible en double page sur grand écran) -->
          <div class="face face-back" aria-hidden="true">
            <div v-if="pages[i + 1]" class="verso">
              <div class="medallions">
                <img
                  v-for="src in pages[i + 1].images"
                  :key="src"
                  :src="src"
                  alt=""
                  draggable="false"
                />
              </div>
              <span class="verso-num">{{ pages[i + 1].numero }}</span>
            </div>
            <div class="shade"></div>
          </div>
        </template>
      </div>
    </div>
  </div>

  <div class="book-controls">
    <button class="book-btn" :disabled="current === 0" aria-label="Page précédente" @click="prev">‹</button>
    <div class="book-dots">
      <button
        v-for="(page, i) in pages"
        :key="page.key"
        class="book-dot"
        :class="{ active: i === current, locked: !page.unlocked }"
        :aria-label="page.cover ? 'Couverture' : `Partie ${page.numero} : ${page.titre}`"
        :aria-current="i === current ? 'page' : undefined"
        @click="goTo(i)"
      >
        {{ page.numero }}
      </button>
    </div>
    <button class="book-btn" :disabled="current === last" aria-label="Page suivante" @click="next">›</button>
  </div>
  <p class="book-hint">
    {{ current === 0 ? "Touchez la couverture pour ouvrir le livre." : "Glissez la page du doigt ou touchez son bord pour la tourner." }}
  </p>
</template>
