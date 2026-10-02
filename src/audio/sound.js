// Ambiances sonores et bruitages du site.
//
// Les sons sont synthétisés en direct avec la Web Audio API (bruit filtré, oscillateurs),
// sauf ceux qui viennent d'un fichier de public/sons/ (indiqués ci-dessous).
//
// Ambiances (en boucle, en fondu enchaîné d'une page à l'autre) :
//  - mer   : vagues et bulles (la Tortue)
//  - terre : jardin tropical, fichier public/sons/Tropical.mp3 en boucle (l'Hibiscus)
//  - ciel  : vent en altitude et piaillements de loriquets (le Loriquet)
//  - livre : feu de cheminée, fichier public/sons/Fireplace.mp3 en boucle (le Poème)
// Bruitages : page qui tourne, bombe de peinture aérosol (premier scan), toucher d'un élément de la fresque.
// Le bruit de page vient du fichier public/sons/Page-Flip.mp3, la bombe de peinture de Shake-Spray.mp3
// et Spray1/2/3.mp3 (voir « Fichiers audio »).
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
// Absent ou illisible → son synthétisé à la place (sauf le bruit de page : silence).
const PAGE_TURN_FILE = 'sons/Page-Flip.mp3' // bruit de page
const SHAKE_FILE = 'sons/Shake-Spray.mp3' // bombe de peinture qu'on secoue (premier scan)
const SPRAY_FILES = ['sons/Spray1.mp3', 'sons/Spray2.mp3', 'sons/Spray3.mp3'] // jets d'aérosol, tirés au hasard
// Ambiances en boucle, chargées seulement à l'ouverture de leur page
const FIREPLACE_FILE = 'sons/Fireplace.mp3' // le livre
const TROPICAL_FILE = 'sons/Tropical.mp3' // l'Hibiscus
let pageTurnFile = null
let shakeFile = null
const sprayFiles = []
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
  loadSound(SHAKE_FILE)
    .then((buffer) => (shakeFile = buffer))
    .catch(() => {})
  SPRAY_FILES.forEach((path) =>
    loadSound(path)
      .then((buffer) => sprayFiles.push(buffer))
      .catch(() => {}),
  )
}

// Joue un fichier une fois, à l'instant t ; pan : position gauche (-1) / droite (1)
function playFile(buffer, t, { rate = 1, pan = 0 } = {}) {
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.playbackRate.value = rate
  let out = master
  if (pan && ctx.createStereoPanner) {
    out = ctx.createStereoPanner()
    out.pan.value = pan
    out.connect(master)
  }
  src.connect(out)
  src.start(t)
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

  // Vent en altitude et loriquets qui bavardent
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

// Cri de loriquet : note aiguë qui glisse, rendue rauque par une modulation rapide
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

// Page qui tourne : fichier public/sons/Page-Flip.mp3 (silence s'il ne se charge pas).
// heavy : la couverture, jouée plus lentement donc plus grave et plus sourde.
export function playPageTurn({ heavy = false } = {}) {
  if (!ready() || !pageTurnFile) return
  playFile(pageTurnFile, ctx.currentTime, { rate: heavy ? 0.8 : rand(0.95, 1.05) })
}

// Mise en couleur d'une fresque (premier scan) : on secoue la bombe de peinture pendant que l'image
// est en noir et blanc, puis des jets d'aérosol accompagnent les taches, et un scintillement final.
// Les temps suivent l'animation de src/utils/paintReveal.js (premier coup de pinceau à 1,3 s,
// taches pendant 2,2 s). Fichiers de public/sons/ s'ils sont chargés, sinon sons synthétisés.
const FIRST_SPRAY = 1.3 // s, = START_DELAY de paintReveal.js
const LAST_SPRAY = 3.3 // s, dernier jet possible

export function playReveal() {
  if (!ready()) return
  const t = ctx.currentTime

  // Bombe secouée : le cliquetis du fichier dure ~1,2 s
  if (shakeFile) playFile(shakeFile, t)
  else shakeCan(t + 0.8)

  // Jets successifs pendant l'apparition des taches, sans rejouer deux fois de suite le même fichier
  let s = t + FIRST_SPRAY
  let last = -1
  while (s < t + LAST_SPRAY) {
    if (sprayFiles.length) {
      let i = Math.floor(rand(0, sprayFiles.length))
      if (i === last && sprayFiles.length > 1) i = (i + 1) % sprayFiles.length
      last = i
      const rate = rand(0.92, 1.08) // chaque jet un peu différent
      playFile(sprayFiles[i], s, { rate, pan: rand(-0.5, 0.5) })
      s += sprayFiles[i].duration / rate + rand(0.03, 0.15)
    } else {
      const dur = rand(0.25, 0.55)
      spray(s, dur)
      s += dur + rand(0.05, 0.2)
    }
  }
  shimmer(t + FIRST_SPRAY + 2.9)
}

// Bombe qu'on secoue (synthétisée, si Shake-Spray.mp3 manque) : la bille cogne contre la paroi
function shakeCan(t) {
  ;[0, 0.07, 0.19, 0.26, 0.38].forEach((delay) => {
    const at = t + delay
    // Choc : éclat de bruit bref et résonant
    const src = noiseSource('white', false)
    const bp = filter('bandpass', rand(2600, 3400), 4)
    const g = gain(0)
    envelope(g.gain, at, rand(0.25, 0.4), 0.001, 0.04)
    src.connect(bp).connect(g).connect(master)
    src.start(at, rand(0, 3.9))
    src.stop(at + 0.08)

    // Tintement métallique de la bille
    const osc = ctx.createOscillator()
    osc.frequency.value = rand(1700, 2100)
    const og = gain(0)
    envelope(og.gain, at, 0.03, 0.001, 0.05)
    osc.connect(og).connect(master)
    osc.start(at)
    osc.stop(at + 0.08)
  })
}

// Jet d'aérosol synthétisé (si SprayN.mp3 manquent) : « pschhh », souffle aigu qui démarre net, tient puis se coupe au relâchement de la valve
function spray(t, dur) {
  const out = ctx.createStereoPanner ? ctx.createStereoPanner() : gain(1)
  if (out.pan) out.pan.value = rand(-0.5, 0.5) // le bras qui bouge devant le mur
  out.connect(master)

  // Clic de la valve
  const click = noiseSource('white', false)
  const clickFilter = filter('highpass', 1500)
  const cg = gain(0)
  envelope(cg.gain, t, 0.15, 0.001, 0.012)
  click.connect(clickFilter).connect(cg).connect(out)
  click.start(t, rand(0, 3.9))
  click.stop(t + 0.03)

  // Souffle : bruit blanc limité aux aigus, légèrement instable
  const hiss = noiseSource('white', false)
  const hp = filter('highpass', 2500, 0.7)
  const lp = filter('lowpass', 10000, 0.7)
  lp.frequency.setValueAtTime(rand(7000, 9000), t)
  lp.frequency.linearRampToValueAtTime(rand(9000, 11000), t + dur)
  const g = gain(0)
  const peak = rand(0.07, 0.1)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.02)
  g.gain.linearRampToValueAtTime(peak * rand(0.75, 0.9), t + dur)
  g.gain.linearRampToValueAtTime(0, t + dur + 0.06)
  hiss.connect(hp).connect(lp).connect(g).connect(out)
  hiss.start(t, rand(0, 3))
  hiss.stop(t + dur + 0.1)
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
