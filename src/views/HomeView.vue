<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import FresqueCard from '../components/FresqueCard.vue'
import CampusMap from '../components/CampusMap.vue'
import { fresques, conclusion, campus } from '../data/fresques'
import { unlockedCount, allUnlocked, unlockedFresques, revealedCharades, reset } from '../store/progress'

const route = useRoute()
const lockedMessage = computed(() => route.query.locked !== undefined)
const percent = computed(() => Math.round((unlockedCount.value / fresques.length) * 100))

// Fenêtre de confirmation native (<dialog>) : fond assombri, Échap pour annuler
const resetDialog = ref(null)

function confirmReset() {
  reset()
  resetDialog.value.close()
}
</script>

<template>
  <p v-if="lockedMessage" class="notice">
    Cette fresque est verrouillée : scannez son QR code pour la débloquer.
  </p>

  <div class="progress">
    <div class="progress-label">
      <span>Fresques découvertes</span>
      <strong>{{ unlockedCount }} / {{ fresques.length }}</strong>
    </div>
    <div
      class="progress-track"
      role="progressbar"
      aria-label="Fresques découvertes"
      :aria-valuenow="unlockedCount"
      aria-valuemin="0"
      :aria-valuemax="fresques.length"
    >
      <div class="progress-fill" :style="{ width: percent + '%' }"></div>
    </div>
  </div>

  <div class="grid">
    <FresqueCard v-for="f in fresques" :key="f.id" :fresque="f" />
  </div>

  <section class="conclusion">
    <h2>Le Poème</h2>
    <p v-if="allUnlocked">
      Toutes les fresques sont découvertes : la conclusion du poème, « {{ conclusion.titre }} », est révélée.
    </p>
    <p v-else>Chaque fresque révèle un chant du poème.</p>
    <router-link
      :to="allUnlocked ? { name: 'poeme', query: { page: fresques.length + 1 } } : { name: 'poeme' }"
      class="btn-book"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" />
        <path d="M12 6.5v13" />
      </svg>
      Ouvrir le livre
    </router-link>
  </section>

  <h2 id="carte">Carte du campus</h2>
  <p class="hint">{{ campus.nom }}</p>

  <CampusMap :fresques="unlockedFresques" />
  <p class="hint">
    {{ unlockedFresques.length }} / {{ fresques.length }} fresques placées sur la carte.<br />
    Scannez un QR code pour faire apparaître sa fresque.
  </p>

  <section class="charade">
    <h2>Charade</h2>
    <p v-if="allUnlocked">Vous avez découvert toutes les fresques !</p>
    <p v-else-if="!revealedCharades.length">
      Aucune charade pour l'instant : scannez une fresque pour obtenir votre première énigme.
    </p>
    <ul v-else class="charade-list">
      <li v-for="f in revealedCharades" :key="f.id">
        <p>{{ f.charade }}</p>
        <span class="answer">À trouver…</span>
      </li>
    </ul>
  </section>

  <hr class="divider" />

  <button class="btn-danger reset" @click="resetDialog.showModal()">Réinitialiser la progression</button>

  <!-- Un clic sur le fond (hors de .dialog-body) ferme la fenêtre -->
  <dialog ref="resetDialog" class="dialog" @click.self="resetDialog.close()">
    <div class="dialog-body">
      <h2>Réinitialiser la progression ?</h2>
      <p>Toutes les fresques découvertes seront de nouveau verrouillées. Cette action est irréversible.</p>
      <div class="dialog-actions">
        <button class="btn-secondary" autofocus @click="resetDialog.close()">Annuler</button>
        <button class="btn-danger" @click="confirmReset">Réinitialiser</button>
      </div>
    </div>
  </dialog>
</template>
