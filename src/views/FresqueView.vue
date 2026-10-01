<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import FresqueImage from '../components/FresqueImage.vue'
import { getFresque } from '../data/fresques'
import { nextCharade, consumeReveal } from '../store/progress'

const route = useRoute()
const fresque = getFresque(route.params.id)

const selectedZoneId = ref(null)
const selectedZone = computed(() => fresque.zones.find((z) => z.id === selectedZoneId.value))

// Premier scan : la fresque passe du noir et blanc à la couleur
const reveal = consumeReveal(fresque.id)

// Choisie une fois à l'ouverture de la page (et ajoutée aux charades débloquées)
const prochaine = nextCharade()
</script>

<template>
  <h1>{{ fresque.titre }}</h1>

  <FresqueImage
    :fresque="fresque"
    interactive
    :reveal="reveal"
    :selected-zone="selectedZoneId"
    @select="selectedZoneId = $event"
  />
  <p class="hint">Touchez un élément de la fresque pour en savoir plus.</p>

  <section v-if="selectedZone" class="zone-info">
    <h3>{{ selectedZone.label }}</h3>
    <p>{{ selectedZone.info }}</p>
  </section>

  <section class="panel">
    <h2 class="scientific">{{ fresque.nomScientifique }}</h2>
    <p>{{ fresque.histoire }}</p>
  </section>

  <section class="charade">
    <h2>Charade</h2>
    <p v-if="prochaine">{{ prochaine.charade }}</p>
    <p v-else>Vous avez découvert toutes les fresques ! La conclusion vous attend sur l'accueil.</p>
  </section>

  <router-link to="/" class="back">← Retour aux fresques</router-link>
</template>
