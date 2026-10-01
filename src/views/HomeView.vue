<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import FresqueCard from '../components/FresqueCard.vue'
import { fresques, conclusion } from '../data/fresques'
import { unlockedCount, allUnlocked, reset } from '../store/progress'

const route = useRoute()
const lockedMessage = computed(() => route.query.locked !== undefined)

function confirmReset() {
  if (confirm('Effacer toute la progression ?')) reset()
}
</script>

<template>
  <p v-if="lockedMessage" class="notice">
    Cette fresque est verrouillée : scannez son QR code pour la débloquer.
  </p>

  <div>
    <h1>Les fresques</h1>
    <p class="progress">Fresques découvertes : {{ unlockedCount }} / {{ fresques.length }}</p>
  </div>

  <div class="grid">
    <FresqueCard v-for="f in fresques" :key="f.id" :fresque="f" />
  </div>

  <section class="conclusion">
    <h2>{{ conclusion.titre }}</h2>
    <p v-if="allUnlocked">{{ conclusion.texte }}</p>
    <p v-else>🔒 Scannez toutes les fresques pour découvrir la fin de l'histoire.</p>
  </section>

  <button class="reset" @click="confirmReset">Réinitialiser la progression</button>
</template>
