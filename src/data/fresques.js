// Contenus du site. Tout le texte et la configuration des fresques est ici.
//
// Chaque fresque :
//  - id        : identifiant utilisé dans l'URL (#/fresque/<id>)
//  - token     : jeton secret mis dans le QR code (#/fresque/<id>?k=<token>)
//                → empêche de débloquer une fresque en devinant son URL
//  - image     : nom du fichier dans /public (optionnel, sinon dégradé aux couleurs du thème)
//  - theme     : couleurs de la page de la fresque
//                  primary : titres, en-tête, liens
//                  accent  : touches de couleur (bordures, zone sélectionnée)
//                  bg      : fond de page
//                  text    : couleur du texte
//  - nomScientifique, histoire : fiche détail de la fresque
//  - zones     : éléments cliquables sur la fresque, positions en % de l'image
//  - charade   : énigme qui mène À CETTE fresque (affichée sur les autres fresques)
//  - position  : [latitude, longitude] de la fresque sur le campus (affichée sur la carte une fois scannée)

export const fresques = [
  {
    id: 'tortue',
    titre: 'La Tortue',
    token: 't7k2p9',
    position: [-22.262728281085298, 166.4049415341517], // à ajuster sur place
    image: null,
    theme: { primary: '#0e5a78', accent: '#2ba3c4', bg: '#eef5f8', text: '#16323d' },
    nomScientifique: 'Chelonia mydas',
    histoire: "Il était une fois une tortue qui traversait l'océan...",
    zones: [
      { id: 'carapace', label: 'Carapace', x: 20, y: 15, w: 35, h: 40, info: 'La carapace est faite de kératine, une protéine.' },
      { id: 'molecule', label: 'Molécule de kératine', x: 75, y: 50, w: 20, h: 45, info: 'Molécule de kératine, protéine de la carapace.' },
    ],
    charade: 'Mon premier est un fruit sec... Mon tout nage lentement dans le lagon.',
  },
  {
    id: 'hibiscus',
    titre: "L'Hibiscus",
    token: 'h5w2q8',
    position: [-22.262880587048414, 166.4042242705398], // à ajuster sur place
    image: null,
    theme: { primary: '#a3222f', accent: '#e8708f', bg: '#fbf2f2', text: '#3a1f22' },
    nomScientifique: 'Hibiscus rosa-sinensis',
    histoire: 'Sur la terre, les fleurs rouges éclataient de couleur...',
    zones: [
      { id: 'fleur', label: 'Fleur rouge', x: 40, y: 35, w: 25, h: 45, info: 'Le rouge des pétales vient de la cyanidine.' },
      { id: 'molecule', label: 'Molécule de cyanidine', x: 75, y: 50, w: 20, h: 45, info: 'Molécule de cyanidine, pigment du pétale.' },
    ],
    charade: 'Je suis une fleur rouge que l’on glisse derrière l’oreille.',
  },
  {
    id: 'perruche',
    titre: 'La Perruche',
    token: 'p3j7d4',
    position: [-22.263146189118988, 166.4045984387007], // à ajuster sur place
    image: null,
    theme: { primary: '#2f6b2a', accent: '#d9a91a', bg: '#f1f6ee', text: '#1f2e1c' },
    nomScientifique: 'Cyanoramphus saisseti', // à vérifier avec l'espèce peinte
    histoire: 'Dans la forêt, deux perruches observaient le monde...',
    zones: [
      { id: 'plumes', label: 'Plumage', x: 30, y: 25, w: 25, h: 45, info: 'Les couleurs des plumes viennent de la mélanine et des caroténoïdes.' },
      { id: 'molecule', label: 'Molécule de mélanine', x: 72, y: 65, w: 18, h: 30, info: 'Mélanine et caroténoïdes, pigments de plume.' },
    ],
    charade: 'Vert de la tête à la queue, je bavarde dans les arbres.',
  },
]

// Thème de l'accueil (neutre)
export const defaultTheme = { primary: '#2b2b2b', accent: '#7a7a7a', bg: '#f6f5f2', text: '#222222' }

// Carte : campus de Nouville de l'Université de la Nouvelle-Calédonie
export const campus = {
  nom: 'Université de la Nouvelle-Calédonie – Campus de Nouville',
  centre: [-22.2627, 166.4034],
  zoom: 17,
}

export const conclusion = {
  titre: 'Conclusion',
  texte: "Et c'est ainsi que tous les habitants du récif... (fin de l'histoire)",
}

export function getFresque(id) {
  return fresques.find((f) => f.id === id)
}
