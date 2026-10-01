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
    <header>
      <router-link to="/" class="brand">Fresque Interactive</router-link>
      <nav>
        <router-link to="/" exact-active-class="active">Fresques</router-link>
        <router-link to="/poeme" active-class="active">Poème</router-link>
        <router-link to="/carte" active-class="active">Carte</router-link>
      </nav>
    </header>
    <main :class="{ wide: route.name === 'poeme' }">
      <router-view :key="$route.fullPath" />
    </main>
  </div>
</template>
