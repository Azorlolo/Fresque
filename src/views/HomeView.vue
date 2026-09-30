<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import FresqueCard from '../components/FresqueCard.vue'
import { fresques, conclusion } from '../data/fresques'
import { unlockedCount, allUnlocked, reset } from '../store/progress'

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
    <h2>{{ conclusion.titre }}</h2>
    <p v-if="allUnlocked">{{ conclusion.texte }}</p>
    <p v-else>🔒 Scannez toutes les fresques pour découvrir la fin de l'histoire.</p>
  </section>

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
