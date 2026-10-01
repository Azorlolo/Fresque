<!-- Image d'une fresque, avec éventuellement des zones cliquables par-dessus -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { paintReveal } from '../utils/paintReveal'

const props = defineProps({
  fresque: { type: Object, required: true },
  interactive: { type: Boolean, default: false },
  selectedZone: { type: String, default: null },
  // Premier scan : la fresque apparaît en noir et blanc puis se colore par taches de peinture
  reveal: { type: Boolean, default: false },
})
defineEmits(['select'])

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const revealing = ref(props.reveal && !!props.fresque.image && !reducedMotion)
const img = ref(null)
const canvas = ref(null)
let stopReveal = null

onMounted(() => {
  if (!revealing.value) return
  const start = () => {
    stopReveal = paintReveal(canvas.value, img.value, () => (revealing.value = false))
  }
  if (img.value.complete && img.value.naturalWidth) start()
  else img.value.addEventListener('load', start, { once: true })
})

onBeforeUnmount(() => stopReveal?.())
</script>

<template>
  <div
    class="fresque-image"
    :class="{ 'has-image': fresque.image, revealing }"
    :style="fresque.image ? null : { background: `linear-gradient(135deg, ${fresque.theme.primary}, ${fresque.theme.accent})` }"
  >
    <img v-if="fresque.image" ref="img" :src="fresque.image" :alt="fresque.titre" />
    <span v-else class="placeholder">{{ fresque.titre }}</span>

    <canvas v-if="revealing" ref="canvas" class="paint-layer" aria-hidden="true"></canvas>

    <template v-if="interactive">
      <button
        v-for="zone in fresque.zones"
        :key="zone.id"
        class="zone"
        :class="{ selected: zone.id === selectedZone }"
        :style="{ left: zone.x + '%', top: zone.y + '%', width: zone.w + '%', height: zone.h + '%' }"
        :title="zone.label"
        :aria-label="zone.label"
        @click="$emit('select', zone.id)"
      ></button>
    </template>
  </div>
</template>
