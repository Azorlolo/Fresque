// Génère un QR code par fresque (URL avec jeton) dans qrcodes/ : PNG (affichage) + SVG (impression).
//
//   npm run qrcodes -- https://mon-site.fr/       → QR codes pour le site hébergé
//   npm run qrcodes                               → QR codes pour le serveur de dev (IP locale:5173)
//
// Les ids et jetons sont lus dans src/data/fresques.js.

import { mkdir, writeFile } from 'node:fs/promises'
import { networkInterfaces } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'
import { fresques } from '../src/data/fresques.js'

const OUT_DIR = fileURLToPath(new URL('../qrcodes/', import.meta.url))

function localIp() {
  for (const ifaces of Object.values(networkInterfaces())) {
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address
    }
  }
  return 'localhost'
}

let base = process.argv[2]
if (!base) {
  base = `http://${localIp()}:5173/`
  console.warn(`Aucune URL donnée, utilisation du serveur de dev : ${base}\n`)
}
if (!base.endsWith('/')) base += '/'

// Niveau de correction H : le QR reste lisible même abîmé ou partiellement masqué (affichage en extérieur)
const options = { errorCorrectionLevel: 'H', margin: 2 }

await mkdir(OUT_DIR, { recursive: true })

for (const f of fresques) {
  const url = `${base}#/fresque/${f.id}?k=${f.token}`
  await QRCode.toFile(join(OUT_DIR, `${f.id}.png`), url, { ...options, width: 1024 })
  await writeFile(join(OUT_DIR, `${f.id}.svg`), await QRCode.toString(url, { ...options, type: 'svg' }))
  console.log(`${f.titre.padEnd(14)} ${url}`)
}

console.log(`\nQR codes générés dans qrcodes/`)
