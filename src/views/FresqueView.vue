<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import FresqueImage from '../components/FresqueImage.vue'
import { fresques, getFresque } from '../data/fresques'
import { nextCharade, consumeReveal } from '../store/progress'

const route = useRoute()
const fresque = getFresque(route.params.id)

const selectedZoneId = ref(null)
const selectedZone = computed(() => fresque.zones.find((z) => z.id === selectedZoneId.value))

// Toucher de nouveau l'élément sélectionné le désélectionne (retour à l'histoire)
function selectZone(id) {
  selectedZoneId.value = selectedZoneId.value === id ? null : id
}

// Premier scan : la fresque passe du noir et blanc à la couleur
const reveal = consumeReveal(fresque.id)

// Révélée à l'ouverture de la page, affichée ici et sous la carte de l'accueil
const prochaine = nextCharade()
</script>

<template>
  <h1>{{ fresque.titre }}</h1>

  <FresqueImage
    :fresque="fresque"
    interactive
    :reveal="reveal"
    :selected-zone="selectedZoneId"
    @select="selectZone"
  />
  <p class="hint">Touchez un élément de la fresque pour en savoir plus.</p>

  <!-- Histoire de la fresque par défaut, remplacée par le détail de l'élément touché -->
  <section class="zone-info">
    <template v-if="selectedZone">
      <h3>{{ selectedZone.label }}</h3>
      <p>{{ selectedZone.info }}</p>
      <button class="zone-back" @click="selectedZoneId = null">← Revenir à l'histoire</button>
    </template>
    <p v-else>{{ fresque.histoire }}</p>
  </section>

  <section class="next-step">
    <h2>Prochaine étape</h2>
    <template v-if="prochaine">
      <p class="next-step-charade">« {{ prochaine.charade }} »</p>
      <p><router-link :to="{ name: 'home', hash: '#carte' }">La découvrir sous la carte du campus →</router-link></p>
    </template>
    <p v-else>
      Vous avez découvert toutes les fresques !
      <router-link :to="{ name: 'poeme', query: { page: fresques.length + 1 } }">La conclusion du poème vous attend.</router-link>
    </p>
  </section>

  <router-link to="/" class="back">← Retour aux fresques</router-link>
</template>
