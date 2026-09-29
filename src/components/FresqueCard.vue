<!-- Carte d'une fresque sur l'accueil : grisée et non cliquable tant qu'elle n'est pas scannée -->
<script setup>
import { computed } from 'vue'
import FresqueImage from './FresqueImage.vue'
import { isUnlocked } from '../store/progress'

const props = defineProps({ fresque: { type: Object, required: true } })
const unlocked = computed(() => isUnlocked(props.fresque.id))
</script>

<template>
  <router-link v-if="unlocked" :to="{ name: 'fresque', params: { id: fresque.id } }" class="card">
    <FresqueImage :fresque="fresque" />
    <p>{{ fresque.titre }}</p>
  </router-link>
  <div v-else class="card locked" aria-disabled="true">
    <FresqueImage :fresque="fresque" />
    <p>🔒 À scanner</p>
  </div>
</template>
