<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import SoundToggle from './components/SoundToggle.vue'
import { getFresque, defaultTheme, poemeTheme } from './data/fresques'
import { setAmbiance } from './audio/sound'

const route = useRoute()

// L'ambiance sonore suit la page : celle de la fresque, le feu de cheminée pour le livre, silence sur l'accueil
watchEffect(() => {
  setAmbiance(route.name === 'poeme' ? 'livre' : (getFresque(route.params.id)?.ambiance ?? null))
})

// Les couleurs de la page suivent la fresque affichée (thème neutre sur l'accueil)
const themeVars = computed(() => {
  const theme = route.name === 'poeme' ? poemeTheme : (getFresque(route.params.id)?.theme ?? defaultTheme)
  return {
    '--primary': theme.primary,
    '--accent': theme.accent,
    '--bg': theme.bg,
    '--text': theme.text,
  }
})
</script>

<template>
  <div class="app" :style="themeVars">
    <main :class="{ wide: route.name === 'poeme' }">
      <router-view :key="$route.fullPath" />
    </main>
    <SoundToggle />
  </div>
</template>
