<!-- Carte d'une fresque sur l'accueil : vignette grise et non cliquable tant qu'elle n'est pas scannée -->
<script setup>
import { computed } from 'vue'
import { isUnlocked } from '../store/progress'

const props = defineProps({ fresque: { type: Object, required: true } })
const unlocked = computed(() => isUnlocked(props.fresque.id))
</script>

<template>
  <router-link
    v-if="unlocked"
    :to="{ name: 'fresque', params: { id: fresque.id } }"
    class="card"
    :style="{ '--card-color': fresque.theme.primary }"
  >
    <img class="card-thumb" :src="fresque.thumbnail.color" :alt="fresque.titre" />
    <p class="card-title">{{ fresque.titre }}</p>
  </router-link>
  <div v-else class="card locked" aria-disabled="true">
    <img class="card-thumb" :src="fresque.thumbnail.gray" alt="Fresque non découverte" />
    <p class="card-title">🔒 À scanner</p>
  </div>
</template>
