<!-- Carte du campus avec un repère par fresque scannée -->
<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { campus } from '../data/fresques'

const props = defineProps({ fresques: { type: Array, required: true } })

const container = ref(null)
let map = null
let markers = null

function marker(fresque) {
  // Repère HTML aux couleurs de la fresque (évite les images par défaut de Leaflet)
  const icon = L.divIcon({
    className: 'map-pin',
    html: `<span style="--pin-color: ${fresque.theme.primary}"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -26],
  })
  const popup = document.createElement('div')
  popup.className = 'map-popup'
  const titre = document.createElement('strong')
  titre.textContent = fresque.titre
  const lien = document.createElement('a')
  lien.href = `#/fresque/${fresque.id}`
  lien.textContent = 'Voir la fresque →'
  popup.append(titre, lien)

  return L.marker(fresque.position, { icon, title: fresque.titre }).bindPopup(popup)
}

function drawMarkers() {
  markers.clearLayers()
  props.fresques.filter((f) => f.position).forEach((f) => markers.addLayer(marker(f)))
}

onMounted(() => {
  map = L.map(container.value, {
    scrollWheelZoom: false,
    // Sur mobile, glisser un doigt fait défiler la page (la carte se déplace en pinçant à deux doigts)
    dragging: !L.Browser.mobile,
  }).setView(campus.centre, campus.zoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)
  markers = L.layerGroup().addTo(map)
  drawMarkers()
})

watch(() => props.fresques, drawMarkers)

onBeforeUnmount(() => map?.remove())
</script>

<template>
  <div ref="container" class="campus-map" :aria-label="`Carte : ${campus.nom}`"></div>
</template>
