// Contenus du site. Tout le texte et la configuration des fresques est ici.
//
// Chaque fresque :
//  - id        : identifiant utilisé dans l'URL (#/fresque/<id>)
//  - token     : jeton secret mis dans le QR code (#/fresque/<id>?k=<token>)
//                → empêche de débloquer une fresque en devinant son URL
//  - image     : chemin vers l'image dans /public (optionnel, sinon placeholder coloré)
//  - couleur   : couleur du placeholder si pas d'image
//  - nomScientifique, histoire : fiche détail de la fresque
//  - zones     : éléments cliquables sur la fresque, positions en % de l'image
//  - charade   : énigme qui mène À CETTE fresque (affichée sur les autres fresques)

export const fresques = [
  {
    id: 'tortue',
    titre: 'La Tortue',
    token: 't7k2p9',
    image: null,
    couleur: '#3b8f6e',
    nomScientifique: 'Chelonia mydas',
    histoire: "Il était une fois une tortue qui traversait l'océan...",
    zones: [
      { id: 'carapace', label: 'Carapace', x: 30, y: 30, w: 40, h: 30, info: 'La carapace protège la tortue.' },
      { id: 'tete', label: 'Tête', x: 70, y: 40, w: 15, h: 15, info: 'Elle peut rentrer sa tête.' },
    ],
    charade: 'Mon premier est un fruit sec... Mon tout nage lentement dans le lagon.',
  },
  {
    id: 'requin',
    titre: 'Le Requin',
    token: 'r4m8x1',
    image: null,
    couleur: '#3a6ea5',
    nomScientifique: 'Carcharhinus melanopterus',
    histoire: 'Plus loin, un requin veillait sur le récif...',
    zones: [
      { id: 'aileron', label: 'Aileron', x: 45, y: 15, w: 15, h: 20, info: "L'aileron a une pointe noire." },
    ],
    charade: 'Mon premier est une note de musique... Mon tout a des nageoires pointe noire.',
  },
  {
    id: 'corail',
    titre: 'Le Corail',
    token: 'c9v3n6',
    image: null,
    couleur: '#c0604a',
    nomScientifique: 'Acropora cervicornis',
    histoire: 'Au fond, le corail abritait toute la vie du récif...',
    zones: [
      { id: 'branches', label: 'Branches', x: 20, y: 40, w: 60, h: 40, info: 'Ses branches ressemblent à des bois de cerf.' },
    ],
    charade: 'Je ne suis ni plante ni pierre, mais un animal qui construit des récifs.',
  },
]

export const conclusion = {
  titre: 'Conclusion',
  texte: "Et c'est ainsi que tous les habitants du récif... (fin de l'histoire)",
}

export function getFresque(id) {
  return fresques.find((f) => f.id === id)
}
