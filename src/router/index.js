import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FresqueView from '../views/FresqueView.vue'
import MapView from '../views/MapView.vue'
import { getFresque } from '../data/fresques'
import { isUnlocked, unlock } from '../store/progress'

const router = createRouter({
  // Mode hash : les URLs des QR codes fonctionnent sur n'importe quel hébergement statique
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/carte', name: 'carte', component: MapView },
    {
      path: '/fresque/:id',
      name: 'fresque',
      component: FresqueView,
      beforeEnter: (to) => {
        const fresque = getFresque(to.params.id)
        if (!fresque) return { name: 'home' }

        // Arrivée depuis un QR code : ?k=<token>
        if (to.query.k !== undefined) {
          if (to.query.k === fresque.token) unlock(fresque.id)
          // On retire le jeton de l'URL pour ne pas qu'il soit partagé par copier-coller
          return { name: 'fresque', params: to.params }
        }

        if (!isUnlocked(fresque.id)) return { name: 'home', query: { locked: fresque.id } }
      },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
