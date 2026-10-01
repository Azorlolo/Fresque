<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getFresque, defaultTheme, poemeTheme } from './data/fresques'

const route = useRoute()

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
  </div>
</template>
