// Ambiances sonores et bruitages du site.
//
// Les sons sont synthétisés en direct avec la Web Audio API (bruit filtré, oscillateurs),
// sauf ceux qui viennent d'un fichier de public/sons/ (indiqués ci-dessous).
//
// Ambiances (en boucle, en fondu enchaîné d'une page à l'autre) :
//  - mer   : vagues et bulles (la Tortue)
//  - terre : jardin tropical, fichier public/sons/Tropical.mp3 en boucle (l'Hibiscus)
//  - ciel  : vent en altitude et piaillements de perruches (la Perruche)
//  - livre : feu de cheminée, fichier public/sons/Fireplace.mp3 en boucle (le Poème)
// Bruitages : page qui tourne, taches de peinture (premier scan), toucher d'un élément de la fresque.
// Le bruit de page vient du fichier public/sons/Page-Flip.mp3 (voir « Fichiers audio »).
//
// Les navigateurs interdisent le son avant une première interaction : le contexte audio démarre
// au premier toucher / clic / touche du clavier. Le choix « son coupé » est sauvegardé en localStorage.
import { ref } from 'vue'

const STORAGE_KEY = 'fresque-son'
const MASTER_VOLUME = 0.8
const FADE = 1.5 // s de fondu entre deux ambiances

function loadMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'off'
  } catch {
    return false
  }
}

export const muted = ref(loadMuted())

let ctx = null
let master = null
let desired = null // ambiance demandée par la page affichée
let current = null // ambiance en cours : { name, stop }
const noise = {}

const rand = (min, max) => min + Math.random() * (max - min)

// ---------- Contexte audio ----------
function ensureContext() {
  if (ctx) return ctx
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null
  ctx = new AudioContext()
  master = ctx.createGain()
  master.gain.value = muted.value ? 0 : MASTER_VOLUME
  master.connect(ctx.destination)
  loadFiles()
  return ctx
}

// ---------- Fichiers audio (dans public/sons/) ----------
// Absent ou illisible → son synthétisé à la place.
const PAGE_TURN_FILE = 'sons/Page-Flip.mp3' // bruit de page
// Ambiances en boucle, chargées seulement à l'ouverture de leur page
const FIREPLACE_FILE = 'sons/Fireplace.mp3' // le livre
const TROPICAL_FILE = 'sons/Tropical.mp3' // l'Hibiscus
let pageTurnFile = null
const files = {}

// Charge et décode un fichier une seule fois
function loadSound(path) {
  files[path] ??= fetch(path)
    .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(path))))
    .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
  return files[path]
}

// Joue un fichier en boucle dans une ambiance ; fallback (son synthétisé) s'il ne se charge pas
function loopFile(path, out, scope, fallback) {
  loadSound(path)
    .then((buffer) => {
      if (scope.stopped) return
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.loop = true
      src.connect(out)
      src.start()
      scope.nodes.push(src)
    })
    .catch(() => !scope.stopped && fallback(out, scope))
}

function loadFiles() {
  loadSound(PAGE_TURN_FILE)
    .then((buffer) => (pageTurnFile = buffer))
    .catch(() => {})
}

// Son autorisé et activé
function ready() {
  return ctx && ctx.state === 'running' && !muted.value
}

// Première interaction : on démarre le son
const GESTURES = ['pointerup', 'touchend', 'click', 'keydown']
function onFirstGesture() {
  if (!ensureContext()) return
  ctx.resume().then(() => {
    GESTURES.forEach((type) => window.removeEventListener(type, onFirstGesture, true))
    applyAmbiance()
  })
}
GESTURES.forEach((type) => window.addEventListener(type, onFirstGesture, true))

// Téléphone verrouillé, onglet en arrière-plan : on se tait
document.addEventListener('visibilitychange', () => {
  if (!ctx) return
  if (document.hidden) ctx.suspend()
  else if (!muted.value) ctx.resume()
})

export function toggleMuted() {
  muted.value = !muted.value
  try {
    localStorage.setItem(STORAGE_KEY, muted.value ? 'off' : 'on')
  } catch {
    // stockage indisponible : le choix vaut pour la visite en cours
  }
  if (!ensureContext()) return
  const t = ctx.currentTime
  master.gain.cancelScheduledValues(t)
  master.gain.setValueAtTime(master.gain.value, t)
  master.gain.linearRampToValueAtTime(muted.value ? 0 : MASTER_VOLUME, t + 0.3)
  if (muted.value) stopAmbiance()
  else ctx.resume().then(applyAmbiance)
}

// ---------- Briques de base ----------
// Tampons de bruit de 4 s, joués en boucle à partir d'un point au hasard
function noiseBuffer(color) {
  if (noise[color]) return noise[color]
  const length = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  let b0 = 0, b1 = 0, b2 = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    if (color === 'brown') {
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    } else if (color === 'pink') {
      b0 = 0.99765 * b0 + white * 0.099046
      b1 = 0.963 * b1 + white * 0.2965164
      b2 = 0.57 * b2 + white * 1.0526913
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.2
    } else {
      data[i] = white
    }
  }
  return (noise[color] = buffer)
}

function noiseSource(color, loop = true) {
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(color)
  src.loop = loop
  return src
}

function gain(value) {
  const g = ctx.createGain()
  g.gain.value = value
  return g
}

function filter(type, frequency, Q = 1) {
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = frequency
  f.Q.value = Q
  return f
}

// Oscillateur lent qui fait varier un paramètre (houle, rafales...)
function lfo(param, frequency, depth) {
  const osc = ctx.createOscillator()
  osc.frequency.value = frequency
  const amount = gain(depth)
  osc.connect(amount).connect(param)
  osc.start()
  return osc
}

// Enchaîne les appels de fn à intervalles aléatoires, jusqu'à l'arrêt de l'ambiance
function every(min, max, fn, scope) {
  const tick = () => {
    if (scope.stopped) return
    if (ready()) fn()
    scope.timers.push(setTimeout(tick, rand(min, max)))
  }
  scope.timers.push(setTimeout(tick, rand(min, max)))
}

// Enveloppe de volume : attaque puis décroissance
function envelope(param, t, peak, attack, decay) {
  param.setValueAtTime(0.0001, t)
  param.exponentialRampToValueAtTime(peak, t + attack)
  param.exponentialRampToValueAtTime(0.0001, t + attack + decay)
}

// ---------- Ambiances ----------
const ambiances = {
  // Vagues : bruit grave dont le volume et le timbre suivent une houle lente, plus des bulles
  mer(out, scope) {
    const houle = noiseSource('brown')
    const houleFilter = filter('lowpass', 300)
    const houleGain = gain(0.2)
    houle.connect(houleFilter).connect(houleGain).connect(out)
    scope.nodes.push(lfo(houleGain.gain, 0.09, 0.14), lfo(houleFilter.frequency, 0.09, 120))

    const ecume = noiseSource('pink')
    const ecumeFilter = filter('bandpass', 1400, 0.6)
    const ecumeGain = gain(0.02)
    ecume.connect(ecumeFilter).connect(ecumeGain).connect(out)
    scope.nodes.push(lfo(ecumeGain.gain, 0.13, 0.018))

    houle.start(0, rand(0, 4))
    ecume.start(0, rand(0, 4))
    scope.nodes.push(houle, ecume)

    every(2000, 6000, () => {
      const count = Math.round(rand(1, 4))
      for (let i = 0; i < count; i++) bubble(out, ctx.currentTime + i * rand(0.08, 0.2))
    }, scope)
  },

  // Jardin tropical : l'enregistrement en boucle, sinon brise, grillons et oiseau synthétisés
  terre(out, scope) {
    loopFile(TROPICAL_FILE, out, scope, ambiances.terreSynthetisee)
  },

  // Brise dans le feuillage, grillons et un oiseau au loin
  terreSynthetisee(out, scope) {
    const brise = noiseSource('pink')
    const briseFilter = filter('bandpass', 700, 0.5)
    const briseGain = gain(0.12)
    brise.connect(briseFilter).connect(briseGain).connect(out)
    brise.start(0, rand(0, 4))
    scope.nodes.push(brise, lfo(briseGain.gain, 0.07, 0.09), lfo(briseFilter.frequency, 0.05, 300))

    every(1200, 3500, () => cricket(out, ctx.currentTime, rand(4200, 4800)), scope)
    every(7000, 15000, () => distantBird(out, ctx.currentTime), scope)
  },

  // Vent en altitude et perruches qui bavardent
  ciel(out, scope) {
    const vent = noiseSource('pink')
    const ventFilter = filter('bandpass', 1100, 1.2)
    const ventGain = gain(0.04)
    vent.connect(ventFilter).connect(ventGain).connect(out)
    vent.start(0, rand(0, 4))
    scope.nodes.push(vent, lfo(ventGain.gain, 0.08, 0.025), lfo(ventFilter.frequency, 0.04, 600))

    every(1500, 5000, () => {
      const count = Math.round(rand(2, 6))
      let t = ctx.currentTime
      for (let i = 0; i < count; i++) {
        parakeet(out, t)
        t += rand(0.1, 0.25)
      }
    }, scope)
  },

  // Feu de cheminée : l'enregistrement en boucle, sinon grondement sourd et crépitements synthétisés
  livre(out, scope) {
    loopFile(FIREPLACE_FILE, out, scope, ambiances.feuSynthetise)
  },

  feuSynthetise(out, scope) {
    const feu = noiseSource('brown')
    const feuFilter = filter('lowpass', 250)
    const feuGain = gain(0.12)
    feu.connect(feuFilter).connect(feuGain).connect(out)
    feu.start(0, rand(0, 4))
    scope.nodes.push(feu, lfo(feuGain.gain, 0.3, 0.04))

    every(60, 700, () => crackle(out, ctx.currentTime), scope)
  },
}

function bubble(out, t) {
  const osc = ctx.createOscillator()
  const g = gain(0)
  const f0 = rand(250, 500)
  osc.frequency.setValueAtTime(f0, t)
  osc.frequency.exponentialRampToValueAtTime(f0 * rand(2, 3), t + 0.07)
  envelope(g.gain, t, 0.05, 0.005, 0.08)
  osc.connect(g).connect(out)
  osc.start(t)
  osc.stop(t + 0.1)
}

// Chant de grillon : quelques impulsions rapides sur une note aiguë
function cricket(out, t, frequency) {
  const osc = ctx.createOscillator()
  osc.frequency.value = frequency
  const g = gain(0)
  const pulses = Math.round(rand(3, 6))
  for (let i = 0; i < pulses; i++) envelope(g.gain, t + i * 0.06, 0.02, 0.008, 0.03)
  osc.connect(g).connect(out)
  osc.start(t)
  osc.stop(t + pulses * 0.06 + 0.05)
}

// Sifflement en deux notes, adouci comme s'il venait de loin
function distantBird(out, t) {
  const lowpass = filter('lowpass', 2500)
  lowpass.connect(out)
  const base = rand(1800, 2400)
  ;[[0, base, base * 1.25], [0.3, base * 1.2, base * 0.9]].forEach(([delay, from, to]) => {
    const osc = ctx.createOscillator()
    const g = gain(0)
    osc.frequency.setValueAtTime(from, t + delay)
    osc.frequency.exponentialRampToValueAtTime(to, t + delay + 0.2)
    envelope(g.gain, t + delay, 0.025, 0.03, 0.2)
    osc.connect(g).connect(lowpass)
    osc.start(t + delay)
    osc.stop(t + delay + 0.3)
  })
}

// Cri de perruche : note aiguë qui glisse, rendue rauque par une modulation rapide
function parakeet(out, t) {
  const dur = rand(0.06, 0.14)
  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  const f0 = rand(2600, 3800)
  osc.frequency.setValueAtTime(f0, t)
  osc.frequency.exponentialRampToValueAtTime(f0 * rand(0.7, 1.3), t + dur)

  const mod = ctx.createOscillator()
  mod.frequency.value = rand(40, 90)
  const modDepth = gain(rand(200, 500))
  mod.connect(modDepth).connect(osc.frequency)

  const g = gain(0)
  envelope(g.gain, t, 0.04, 0.01, dur)
  osc.connect(g).connect(out)
  osc.start(t)
  mod.start(t)
  osc.stop(t + dur + 0.05)
  mod.stop(t + dur + 0.05)
}

// Crépitement : un éclat de bruit très bref
function crackle(out, t) {
  const src = noiseSource('white', false)
  const hp = filter('highpass', rand(1500, 4000))
  const g = gain(0)
  envelope(g.gain, t, rand(0.02, 0.1), 0.001, rand(0.005, 0.03))
  src.connect(hp).connect(g).connect(out)
  src.start(t, rand(0, 3.9))
  src.stop(t + 0.05)
}

function startAmbiance(name) {
  const out = gain(0)
  out.connect(master)
  out.gain.linearRampToValueAtTime(1, ctx.currentTime + FADE)
  const scope = { nodes: [], timers: [], stopped: false }
  ambiances[name](out, scope)

  return {
    name,
    stop() {
      scope.stopped = true
      scope.timers.forEach(clearTimeout)
      const t = ctx.currentTime
      out.gain.cancelScheduledValues(t)
      out.gain.setValueAtTime(out.gain.value, t)
      out.gain.linearRampToValueAtTime(0, t + FADE)
      setTimeout(() => {
        scope.nodes.forEach((node) => node.stop())
        out.disconnect()
      }, FADE * 1000 + 100)
    },
  }
}

function stopAmbiance() {
  current?.stop()
  current = null
}

function applyAmbiance() {
  if (!ready() || current?.name === desired) return
  stopAmbiance()
  if (desired && ambiances[desired]) current = startAmbiance(desired)
}

// Appelée à chaque changement de page (null = silence)
export function setAmbiance(name) {
  desired = name ?? null
  applyAmbiance()
}

// ---------- Bruitages ----------

// Page qui tourne : froissement de papier qui monte, puis le claquement de la feuille qui retombe.
// heavy : la couverture, plus grave et plus sourde.
export function playPageTurn({ heavy = false } = {}) {
  if (!ready()) return
  // Fichier fourni dans public/sons/ : on le joue (plus lent et plus grave pour la couverture)
  if (pageTurnFile) {
    const src = ctx.createBufferSource()
    src.buffer = pageTurnFile
    src.playbackRate.value = heavy ? 0.8 : rand(0.95, 1.05)
    src.connect(master)
    src.start()
    return
  }
  const t = ctx.currentTime
  const dur = heavy ? 0.55 : 0.42

  // Glissement du papier
  const swish = noiseSource('white', false)
  const bp = filter('bandpass', heavy ? 500 : 1200, 0.8)
  bp.frequency.setValueAtTime(heavy ? 500 : 1200, t)
  bp.frequency.exponentialRampToValueAtTime(heavy ? 1600 : 4200, t + dur * 0.6)
  bp.frequency.exponentialRampToValueAtTime(heavy ? 700 : 1500, t + dur)
  const g = gain(0)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.25, t + 0.04)
  g.gain.exponentialRampToValueAtTime(0.12, t + dur * 0.4)
  g.gain.exponentialRampToValueAtTime(0.4, t + dur * 0.75)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  swish.connect(bp).connect(g).connect(master)
  swish.start(t, rand(0, 3))
  swish.stop(t + dur + 0.05)

  // Grain du papier : petits craquements irréguliers
  const grain = noiseSource('white', false)
  const hp = filter('highpass', 3500)
  const gg = gain(0)
  for (let s = 0; s < dur * 0.8; s += 0.018) gg.gain.setValueAtTime(Math.random() < 0.4 ? rand(0.02, 0.07) : 0, t + s)
  gg.gain.setValueAtTime(0, t + dur)
  grain.connect(hp).connect(gg).connect(master)
  grain.start(t, rand(0, 3))
  grain.stop(t + dur + 0.05)

  // La feuille retombe
  const flap = noiseSource('brown', false)
  const lp = filter('lowpass', heavy ? 250 : 500)
  const fg = gain(0)
  envelope(fg.gain, t + dur * 0.78, heavy ? 0.9 : 0.4, 0.008, heavy ? 0.18 : 0.09)
  flap.connect(lp).connect(fg).connect(master)
  flap.start(t, rand(0, 3))
  flap.stop(t + dur + 0.3)
}

// Mise en couleur d'une fresque (premier scan) : taches de peinture puis un scintillement final.
// Les temps suivent l'animation de src/utils/paintReveal.js.
export function playReveal() {
  if (!ready()) return
  const t = ctx.currentTime
  for (let i = 0; i < 12; i++) splat(t + 0.5 + rand(0, 2.2))
  shimmer(t + 3.4)
}

function splat(t) {
  // Éclaboussure : bruit étouffé dont le timbre retombe
  const src = noiseSource('pink', false)
  const lp = filter('lowpass', 1800, 2)
  lp.frequency.setValueAtTime(rand(1500, 2500), t)
  lp.frequency.exponentialRampToValueAtTime(200, t + 0.2)
  const g = gain(0)
  envelope(g.gain, t, rand(0.15, 0.3), 0.005, 0.2)
  src.connect(lp).connect(g).connect(master)
  src.start(t, rand(0, 3))
  src.stop(t + 0.3)

  // « Plop » de la goutte
  const osc = ctx.createOscillator()
  osc.frequency.setValueAtTime(rand(180, 260), t)
  osc.frequency.exponentialRampToValueAtTime(60, t + 0.12)
  const og = gain(0)
  envelope(og.gain, t, 0.12, 0.004, 0.12)
  osc.connect(og).connect(master)
  osc.start(t)
  osc.stop(t + 0.2)
}

// Arpège doux en gamme pentatonique
function shimmer(t) {
  ;[523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
    const osc = ctx.createOscillator()
    osc.frequency.value = f
    const g = gain(0)
    envelope(g.gain, t + i * 0.09, 0.05, 0.02, 1.4)
    osc.connect(g).connect(master)
    osc.start(t + i * 0.09)
    osc.stop(t + i * 0.09 + 1.6)
  })
}

// Toucher d'un élément de la fresque : petite goutte qui monte
export function playTap() {
  if (!ready()) return
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  osc.frequency.setValueAtTime(520, t)
  osc.frequency.exponentialRampToValueAtTime(880, t + 0.08)
  const g = gain(0)
  envelope(g.gain, t, 0.12, 0.008, 0.15)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + 0.2)
}
