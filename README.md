# Fresque Interactive – Découverte par QR Codes

## 📖 Description

Site web **responsive** présentant plusieures fresque dans des pages différentes. Chaque fresque est associée à un QR code physique que l'utilisateur doit scanner pour la débloquer.

Tant qu'une fresque n'a pas été scannée, elle apparaît **grisée** sur le site. Une fois le QR code correspondant scanné, la partie est **dégrisée** et devient cliquable.

En cliquant sur la fresque dégrisée, l'utilisateur accède à :
- Le **nom scientifique** associé à cette fresque (exemple de tortue)
- Une **partie de l'histoire** liée à la fresque

La **conclusion de l'histoire** reste verrouillée tant que l'utilisateur n'a pas scanné l'ensemble des QR codes.


Notre site est accessible via des QRCodes placée sous des fresques.
Chaque QRCodes mènent à une page qui répertorie la fresque scannée.

Les autres fresques ne sont pas accessible via le site (lien bloquée tant que la fresque n'est pas scannée) 
Chaque fresque numérique est décomposer et l'utilisateur peut cliquer sur un élément de cette fresque pour obtenir des informations

Une petite charade est en dessous de chaque fresque pour diriger l'utilisateur vers une fresque aléatoire qu'il n'as pas scannée

## ✨ Fonctionnalités

- [x] Affichage responsive des différentes fresque
- [x] État visuel grisé / dégrisé selon les QR codes scannés
- [x] Scan de QR code (caméra native du téléphone → URL avec jeton)
- [x] Fiche détail par fresque : nom scientifique + extrait d'histoire
- [x] Zones cliquables sur chaque fresque
- [x] Charade vers une fresque non scannée aléatoire
- [x] Déverrouillage de la conclusion une fois toutes les fresques scannées
- [x] Sauvegarde de la progression de l'utilisateur (localStorage)

## 🛠️ Stack technique

- **Vue 3** + **Vite** (100 % front, pas de back)
- **Vue Router** en mode hash (`#/...`) → fonctionne sur tout hébergement statique
- **localStorage** pour la progression

## 🚀 Installation

```bash
git clone <url-du-repo>
cd <nom-du-projet>
npm install
```

## ▶️ Utilisation

```bash
npm run dev      # serveur de dev (accessible sur le réseau local pour tester sur téléphone)
npm run build    # génère le site statique dans dist/
npm run preview  # prévisualise le build
```

## 🔳 QR codes

Chaque QR code doit contenir l'URL suivante :

```
https://<site>/#/fresque/<id>?k=<token>
```

`id` et `token` sont définis dans [src/data/fresques.js](src/data/fresques.js). Exemple :
`https://<site>/#/fresque/tortue?k=t7k2p9`

Le jeton empêche de débloquer une fresque en devinant son URL, puis il est retiré de la barre d'adresse.

## 📁 Structure du projet

```
.
├── index.html
├── vite.config.js
├── public/                     → images des fresques (ex: public/tortue.jpg → image: 'tortue.jpg')
└── src/
    ├── main.js
    ├── App.vue
    ├── style.css
    ├── data/fresques.js        → TOUS les contenus (fresques, zones, histoire, charades, conclusion)
    ├── store/progress.js       → progression (état réactif + localStorage)
    ├── router/index.js         → routes + déblocage via jeton
    ├── views/HomeView.vue      → liste des fresques + conclusion
    ├── views/FresqueView.vue   → fresque, zones cliquables, détail, charade
    └── components/
        ├── FresqueCard.vue     → carte grisée / dégrisée
        └── FresqueImage.vue    → image + zones cliquables
```

## 📌 Roadmap

- [x] Choix de la stack technique
- [x] Choix du mode de persistance de la progression (localStorage)
- [x] Scan QR code (via la caméra native)
- [ ] Design de la fresque et découpage en parties
- [ ] Intégration des contenus (noms scientifiques, histoire, conclusion)
- [ ] Génération des QR codes
- [ ] Hébergement

## 📄 Licence

*À définir.*
