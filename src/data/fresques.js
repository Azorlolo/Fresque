// Contenus du site. Tout le texte et la configuration des fresques est ici.
//
// Chaque fresque :
//  - id        : identifiant utilisé dans l'URL (#/fresque/<id>)
//  - token     : jeton secret mis dans le QR code (#/fresque/<id>?k=<token>)
//                → empêche de débloquer une fresque en devinant son URL
//  - image     : chemin du fichier dans /public (optionnel, sinon dégradé aux couleurs du thème)
//                affichée dans son format d'origine, sans recadrage, pour que les zones restent alignées
//  - thumbnail : vignettes de l'accueil dans /public, { color, gray } (gray = fresque pas encore scannée)
//  - theme     : couleurs de la page de la fresque
//                  primary : titres, liens
//                  accent  : touches de couleur (bordures, zone sélectionnée)
//                  bg      : fond de page
//                  text    : couleur du texte
//  - histoire : fiche détail de la fresque (nomScientifique n'est plus affiché)
//  - zones     : éléments cliquables sur la fresque, positions en % de l'image
//  - charade   : énigme qui mène À CETTE fresque (affichée sur les autres fresques)
//  - position  : [latitude, longitude] de la fresque sur le campus (affichée sur la carte une fois scannée)
//  - poeme     : partie du poème révélée par cette fresque (une page du livre sur #/poeme)

export const fresques = [
  {
    id: 'tortue',
    titre: 'La Tortue',
    token: 't7k2p9',
    position: [-22.262295822667305, 166.4054343431178], // à ajuster sur place
    image: 'fresques/tortue.jpg',
    thumbnail: { color: 'thumbs/tortue.jpg', gray: 'thumbs/tortue-gris.jpg' },
    theme: { primary: '#0e5a78', accent: '#2ba3c4', bg: '#eef5f8', text: '#16323d' },
    nomScientifique: 'Chelonia mydas',
    histoire: "Il était une fois une tortue qui traversait l'océan...",
    zones: [
      { id: 'carapace', label: 'Carapace', x: 5, y: 10, w: 28, h: 42, info: 'La carapace est faite de kératine, une protéine.' },
      { id: 'molecule', label: 'Molécule de kératine', x: 86, y: 61, w: 14, h: 24, info: 'Molécule de kératine, protéine de la carapace.' },
    ],
    charade: 'Mon premier est un fruit sec... Mon tout nage lentement dans le lagon.',
    poeme: {
      numero: 'I',
      titre: 'La Mer',
      sousTitre: 'Le voyage de la tortue',
      vers: [
        'Dans le silence bleu des solitudes calmes,',
        'Glisse la sage écaille au rythme de ses palmes.',
        'Reine des fonds marins aux reflets de corail,',
        'Elle porte sur son dos un antique vitrail,',
        'L’écho des grands courants et des vagues profondes',
        'Où dort le souvenir des origines du monde.',
        'Pourtant, le cœur battant sous son plastron de sel,',
        'Elle monte parfois vers le jour immortel,',
        "Pour saluer la rive où s'éteint la marée,",
        'Attendant un mystère à la surface dorée.',
      ],
    },
  },
  {
    id: 'hibiscus',
    titre: "L'Hibiscus",
    token: 'h5w2q8',
    position: [-22.262880587048414, 166.4042242705398], // à ajuster sur place
    image: 'fresques/hibiscus.jpg',
    thumbnail: { color: 'thumbs/hibiscus.jpg', gray: 'thumbs/hibiscus-gris.jpg' },
    theme: { primary: '#a3222f', accent: '#e8708f', bg: '#fbf2f2', text: '#3a1f22' },
    nomScientifique: 'Hibiscus rosa-sinensis',
    histoire: 'Sur la terre, les fleurs rouges éclataient de couleur...',
    zones: [
      { id: 'fleur', label: 'Fleur rouge', x: 57, y: 46, w: 27, h: 54, info: 'Le rouge des pétales vient de la cyanidine.' },
      { id: 'molecule', label: 'Molécule de cyanidine', x: 83, y: 73, w: 16, h: 20, info: 'Molécule de cyanidine, pigment du pétale.' },
    ],
    charade: 'Je suis une fleur rouge que l’on glisse derrière l’oreille.',
    poeme: {
      numero: 'II',
      titre: 'La Terre',
      sousTitre: "L'offrande de l'hibiscus",
      vers: [
        'Sur le sable tiédi, un trésor est posé,',
        "Un éclat vermeil pur que nul n'a effacé.",
        "C'est un hibiscus d'or, de velours et de braise,",
        "Né des flancs généreux d'une terre à son aise.",
        'Il exhale en secret le parfum des jardins,',
        "La vigueur des racines, l'aurore du matin,",
        'Et porte en ses pétales aux teintes éclatantes',
        'La sève de la terre et ses sèves ardentes.',
        "Offert au bord de l'eau comme un baiser vivant,",
        'Il unit le rivage aux promesses du vent.',
      ],
    },
  },
  {
    id: 'perruche',
    titre: 'La Perruche',
    token: 'p3j7d4',
    position: [-22.263146189118988, 166.4045984387007], // à ajuster sur place
    image: 'fresques/perruche.jpg',
    thumbnail: { color: 'thumbs/perruche.jpg', gray: 'thumbs/perruche-gris.jpg' },
    theme: { primary: '#2f6b2a', accent: '#d9a91a', bg: '#f1f6ee', text: '#1f2e1c' },
    nomScientifique: 'Cyanoramphus saisseti', // à vérifier avec l'espèce peinte
    histoire: 'Dans la forêt, deux perruches observaient le monde...',
    zones: [
      { id: 'plumes', label: 'Plumage', x: 26, y: 1, w: 41, h: 57, info: 'Les couleurs des plumes viennent de la mélanine et des caroténoïdes.' },
      { id: 'molecule', label: 'Molécule de mélanine', x: 41, y: 74, w: 13, h: 25, info: 'Mélanine et caroténoïdes, pigments de plume.' },
    ],
    charade: 'Vert de la tête à la queue, je bavarde dans les arbres.',
    poeme: {
      numero: 'III',
      titre: 'Le Ciel',
      sousTitre: "L'envol et la perruche",
      vers: [
        "Ce présent fut porté par l'oiseau de lumière,",
        'Une perruche vive aux plumes printanières.',
        "Messagère d'azur, d'émeraude et d'argent,",
        "Elle a fendu les airs d'un battement changeant",
        "Pour livrer cette fleur au peuple de l'abîme.",
        'En la voyant planer au-dessus de la cime,',
        "La tortue s'émerveille et se prend à rêver :",
        "Elle veut déchirer l'écume et s'élever.",
        "Car pour elle désormais, le ciel n'est qu'une mer,",
        "Un infini d'azur où voler dans les airs.",
      ],
    },
  },
]

// Thème de l'accueil (neutre)
export const defaultTheme = { primary: '#2b2b2b', accent: '#7a7a7a', bg: '#f6f5f2', text: '#222222' }

// Carte : campus de Nouville de l'Université de la Nouvelle-Calédonie
export const campus = {
  nom: 'Université de la Nouvelle-Calédonie – Bibliotheque unversitaire',
  centre: [-22.262686818338413, 166.40498567733079],
  zoom: 18,
}

// Thème de la page poème
export const poemeTheme = { primary: '#1d3a52', accent: '#b8893a', bg: '#e9e2d4', text: '#2b241d' }

// Conclusion du poème : dernière page du livre, débloquée quand toutes les fresques sont scannées
export const conclusion = {
  numero: 'IV',
  titre: "L'Horizon",
  sousTitre: "L'union des trois mondes",
  vers: [
    "Désormais, sur l'écume où le couchant flamboie,",
    'La tortue garde en elle une secrète joie.',
    'L’onde reste son havre et la fleur son trésor,',
    "Mais son regard s'élance aux grands rivages d'or.",
    'La mer, la terre et l’air ont mêlé leurs murmures :',
    "Il n'est plus de frontière à sa noble nature.",
    'En fendant les courants comme on fend les nuages,',
    "Elle nage vers l'aube en quittant les rivages ;",
    "Et dans le bleu miroir où s'efface le lieu,",
    'Son esprit a trouvé son plus vaste grand bleu.',
  ],
}

export function getFresque(id) {
  return fresques.find((f) => f.id === id)
}
