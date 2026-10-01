<script setup>
import CampusMap from '../components/CampusMap.vue'
import { fresques, campus } from '../data/fresques'
import { unlockedFresques, revealedCharades, isUnlocked } from '../store/progress'
</script>

<template>
  <div>
    <h1>Carte du campus</h1>
    <p class="progress">{{ campus.nom }}</p>
  </div>

  <CampusMap :fresques="unlockedFresques" />
  <p class="hint">
    {{ unlockedFresques.length }} / {{ fresques.length }} fresques placées sur la carte.
    Scannez un QR code pour faire apparaître sa fresque.
  </p>

  <section class="charade">
    <h2>Charades débloquées</h2>
    <p v-if="!revealedCharades.length">
      Aucune charade pour l'instant : scannez une fresque pour obtenir votre première énigme.
    </p>
    <ul v-else class="charade-list">
      <li v-for="f in revealedCharades" :key="f.id" :class="{ solved: isUnlocked(f.id) }">
        <p>{{ f.charade }}</p>
        <router-link v-if="isUnlocked(f.id)" :to="{ name: 'fresque', params: { id: f.id } }" class="answer">
          ✓ {{ f.titre }}
        </router-link>
        <span v-else class="answer">À trouver…</span>
      </li>
    </ul>
  </section>

  <router-link to="/" class="back">← Retour aux fresques</router-link>
</template>
