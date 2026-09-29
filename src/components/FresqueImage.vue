<!-- Image d'une fresque, avec éventuellement des zones cliquables par-dessus -->
<script setup>
defineProps({
  fresque: { type: Object, required: true },
  interactive: { type: Boolean, default: false },
  selectedZone: { type: String, default: null },
})
defineEmits(['select'])
</script>

<template>
  <div
    class="fresque-image"
    :style="fresque.image ? null : { background: `linear-gradient(135deg, ${fresque.theme.primary}, ${fresque.theme.accent})` }"
  >
    <img v-if="fresque.image" :src="fresque.image" :alt="fresque.titre" />
    <span v-else class="placeholder">{{ fresque.titre }}</span>

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
