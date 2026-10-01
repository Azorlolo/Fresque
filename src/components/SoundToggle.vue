<!-- Bouton flottant pour couper / remettre l'ambiance sonore -->
<script setup>
import { muted, toggleMuted } from '../audio/sound'
</script>

<template>
  <button
    class="sound-toggle"
    :aria-pressed="!muted"
    :aria-label="muted ? 'Activer le son' : 'Couper le son'"
    :title="muted ? 'Activer le son' : 'Couper le son'"
    @click="toggleMuted"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" />
      <template v-if="muted">
        <path d="M17 9l5 6M22 9l-5 6" />
      </template>
      <template v-else>
        <path d="M16.5 8.5a5 5 0 0 1 0 7" />
        <path d="M19 6a8.5 8.5 0 0 1 0 12" />
      </template>
    </svg>
  </button>
</template>
