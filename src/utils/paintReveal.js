// Animation de mise en couleur d'une fresque : la couleur apparaît par taches de peinture
// à des endroits aléatoires, par-dessus l'image affichée en noir et blanc.
//
// Principe : on peint des taches opaques dans un masque (canvas hors écran), puis on dessine
// l'image en couleur uniquement là où le masque est peint (composition 'source-in').

// ms en noir et blanc avant le premier coup de pinceau : le temps de secouer la bombe de peinture
// (son Shake-Spray, voir playReveal dans src/audio/sound.js)
const START_DELAY = 1300
const SPREAD = 2200 // ms pendant lesquelles les taches apparaissent
const SPLAT_DURATION = [700, 1100] // ms pour qu'une tache s'étale
const FINAL_FADE = 500 // ms de fondu final pour combler les derniers trous
const COLS = 4
const ROWS = 3

const rand = (min, max) => min + Math.random() * (max - min)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

// Contour irrégulier d'une tache : rayon modulé par quelques sinusoïdes de phases aléatoires
function blobShape(points = 28) {
  const waves = [2, 3, 5, 7].map((freq) => ({ freq, phase: rand(0, Math.PI * 2), amp: rand(0.04, 0.12) }))
  return Array.from({ length: points }, (_, i) => {
    const angle = (i / points) * Math.PI * 2
    const r = 1 + waves.reduce((sum, w) => sum + w.amp * Math.sin(w.freq * angle + w.phase), 0)
    return { angle, r }
  })
}

function createSplat(x, y, radius, start) {
  return {
    x,
    y,
    radius,
    start,
    duration: rand(...SPLAT_DURATION),
    shape: blobShape(),
    // Gouttelettes projetées autour de la tache
    drops: Array.from({ length: Math.round(rand(5, 11)) }, () => ({
      angle: rand(0, Math.PI * 2),
      dist: rand(1.05, 1.6),
      size: rand(0.03, 0.09),
    })),
    // Coups de pinceau qui partent du centre
    strokes: Array.from({ length: Math.round(rand(1, 3)) }, () => ({
      angle: rand(0, Math.PI * 2),
      length: rand(1.1, 1.5),
      width: rand(0.2, 0.35),
      bend: rand(-0.4, 0.4),
    })),
  }
}

function drawSplat(ctx, s, t) {
  const p = Math.min(1, Math.max(0, (t - s.start) / s.duration))
  if (p === 0) return
  const k = easeOut(p)
  const r = s.radius * k

  // Tache principale
  ctx.beginPath()
  s.shape.forEach(({ angle, r: f }, i) => {
    const px = s.x + Math.cos(angle) * r * f
    const py = s.y + Math.sin(angle) * r * f
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
  })
  ctx.closePath()
  ctx.fill()

  // Coups de pinceau
  ctx.lineCap = 'round'
  for (const st of s.strokes) {
    const len = s.radius * st.length * k
    const ex = s.x + Math.cos(st.angle) * len
    const ey = s.y + Math.sin(st.angle) * len
    const cx = s.x + Math.cos(st.angle + st.bend) * len * 0.5
    const cy = s.y + Math.sin(st.angle + st.bend) * len * 0.5
    ctx.lineWidth = s.radius * st.width * (1 - 0.3 * k)
    ctx.beginPath()
    ctx.moveTo(s.x, s.y)
    ctx.quadraticCurveTo(cx, cy, ex, ey)
    ctx.stroke()
  }

  // Gouttelettes, projetées un peu après l'impact
  const dropP = easeOut(Math.min(1, Math.max(0, (p - 0.2) / 0.8)))
  if (dropP > 0) {
    for (const d of s.drops) {
      ctx.beginPath()
      ctx.arc(
        s.x + Math.cos(d.angle) * s.radius * d.dist * k,
        s.y + Math.sin(d.angle) * s.radius * d.dist * k,
        s.radius * d.size * dropP,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }
  }
}

/**
 * Lance l'animation sur `canvas` (superposé à `img`, qui doit être affichée en noir et blanc).
 * Appelle `onDone` une fois l'image entièrement en couleur. Renvoie une fonction d'arrêt.
 */
export function paintReveal(canvas, img, onDone) {
  const dpr = window.devicePixelRatio || 1
  const { width, height } = img.getBoundingClientRect()
  const w = (canvas.width = Math.round(width * dpr))
  const h = (canvas.height = Math.round(height * dpr))
  const ctx = canvas.getContext('2d')

  const mask = document.createElement('canvas')
  mask.width = w
  mask.height = h
  const mctx = mask.getContext('2d')
  mctx.fillStyle = mctx.strokeStyle = '#000'

  // Une tache par case d'une grille, position aléatoire dans la case et ordre aléatoire :
  // c'est imprévisible mais toute la fresque finit couverte.
  const cellW = w / COLS
  const cellH = h / ROWS
  const radius = Math.hypot(cellW, cellH) * 0.55
  const cells = shuffle(Array.from({ length: COLS * ROWS }, (_, i) => i))
  const splats = cells.map((cell, i) => {
    const x = (cell % COLS + rand(0.15, 0.85)) * cellW
    const y = (Math.floor(cell / COLS) + rand(0.15, 0.85)) * cellH
    const start = START_DELAY + (i / cells.length) * SPREAD + rand(-120, 120)
    return createSplat(x, y, radius * rand(0.9, 1.25), start)
  })
  const paintEnd = Math.max(...splats.map((s) => s.start + s.duration))

  let frame
  let t0 = null

  function render(now) {
    t0 ??= now
    const t = now - t0

    mctx.clearRect(0, 0, w, h)
    for (const s of splats) drawSplat(mctx, s, t)

    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(mask, 0, 0)
    ctx.globalCompositeOperation = 'source-in'
    ctx.drawImage(img, 0, 0, w, h)

    // Fondu final : la couleur recouvre les derniers espaces gris
    const fade = (t - (paintEnd - FINAL_FADE * 0.4)) / FINAL_FADE
    if (fade > 0) {
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = Math.min(1, fade)
      ctx.drawImage(img, 0, 0, w, h)
      ctx.globalAlpha = 1
    }

    if (fade >= 1) onDone()
    else frame = requestAnimationFrame(render)
  }

  frame = requestAnimationFrame(render)
  return () => cancelAnimationFrame(frame)
}
