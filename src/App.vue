<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getFresque, defaultTheme } from './data/fresques'

const route = useRoute()

// Les couleurs de la page suivent la fresque affichée (thème neutre sur l'accueil)
const themeVars = computed(() => {
  const theme = getFresque(route.params.id)?.theme ?? defaultTheme
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
    <header>
      <router-link to="/">Fresque Interactive</router-link>
      <router-link to="/carte">Carte</router-link>
    </header>
    <main>
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>
