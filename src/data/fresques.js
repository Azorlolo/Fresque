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
//                  sousTitre : précision sous le titre de la zone, ex. l'espèce (optionnel)
//                  info  : phrase d'introduction affichée quand on touche la zone
//                  faits : faits scientifiques détaillés, affichés en liste sous l'introduction
//                          (texte simple, ou { titre, texte } pour un début de phrase en gras)
//                  liens : pages « Pour aller plus loin », { label, url } (Wikipédia en français uniquement)
//  - charade   : énigme qui mène À CETTE fresque (affichée sur les autres fresques)
//  - position  : [latitude, longitude] de la fresque sur le campus (affichée sur la carte une fois scannée)
//  - poeme     : partie du poème révélée par cette fresque (une page du livre sur #/poeme)
//  - ambiance  : ambiance sonore de la page : 'mer', 'terre' ou 'ciel' (voir src/audio/sound.js)

export const fresques = [
  {
    id: 'tortue',
    titre: 'La Tortue',
    token: 't7k2p9',
    position: [-22.262295822667305, 166.4054343431178], // à ajuster sur place
    image: 'fresques/tortue.jpg',
    ambiance: 'mer',
    thumbnail: { color: 'thumbs/tortue.jpg', gray: 'thumbs/tortue-gris.jpg' },
    theme: { primary: '#0e5a78', accent: '#2ba3c4', bg: '#eef5f8', text: '#16323d' },
    nomScientifique: 'Chelonia mydas',
    histoire: "Il était une fois une tortue qui traversait l'océan...",
    zones: [
      // Références vérifiées : Rhee et al. 2009 (Mater. Sci. Eng. C) ; Pei et al. 2022 (Biomimetics) ;
      // Lezcano, Wyneken & Porter 2025 (J. Exp. Biol.) ; Dalla Valle et al. 2009 ; Alibardi 2014 et 2016 ;
      // Wang et al. 2016 (Prog. Mater. Sci.) ; Wikipédia « Carapace de tortue », « Tortue verte » ; FAO
      {
        id: 'carapace',
        label: 'Carapace',
        x: 5, y: 10, w: 28, h: 42,
        info: "La carapace est un bouclier vivant : des os soudés, recouverts de grandes écailles cornées faites de kératine et de protéines proches, la même famille de matériaux que nos ongles.",
        faits: [
          { titre: "Dessous, c'est du squelette.", texte: "Sur le dessus (la dossière), les côtes et la colonne vertébrale s'élargissent et fusionnent avec des plaques osseuses de la peau. Une tortue ne peut donc jamais sortir de sa carapace." },
          { titre: 'Un os en « sandwich ».', texte: "L'os de la carapace est fait de deux couches denses autour d'un cœur spongieux et léger. Résultat : c'est solide sans être trop lourd. Chez les tortues marines, cet os est même moins rigide que chez les tortues d'eau douce ou terrestres (Lezcano et al., 2025)." },
          { titre: 'Des écailles décalées.', texte: "Les écailles cornées ne sont pas alignées sur les plaques osseuses : les jointures des os tombent au milieu des écailles du dessus. Leurs bords sont donc décalés, comme les briques d'un mur, ce qui évite les points faibles." },
          { titre: 'Une matière en deux ingrédients.', texte: "Chez les tortues à carapace dure, les écailles contiennent surtout des protéines cornées bêta (anciennement appelées « kératine β »), mêlées à de la kératine α. C'est ce mélange qui les rend dures (Dalla Valle et al., 2009)." },
          { titre: 'Des écailles qui grandissent.', texte: "Les écailles grandissent avec la tortue. Les tortues terrestres ajoutent des couches à la base de chaque écaille, alors que les tortues aquatiques perdent et renouvellent les leurs." },
          { titre: 'La tortue verte.', texte: "La tortue verte (Chelonia mydas) ne doit pas son nom à sa carapace, plutôt olive à brune. Elle le doit à sa graisse verdâtre, liée à son régime d'herbiers marins et d'algues." },
        ],
        liens: [
          { label: 'Carapace de tortue', url: 'https://fr.wikipedia.org/wiki/Carapace_de_tortue' },
          { label: 'Tortue verte', url: 'https://fr.wikipedia.org/wiki/Tortue_verte' },
          { label: 'Os spongieux', url: 'https://fr.wikipedia.org/wiki/Os_spongieux' },
        ],
      },
      {
        id: 'molecule',
        label: 'Molécule de kératine',
        x: 86, y: 61, w: 14, h: 24,
        info: "La kératine est une protéine : une très longue chaîne d'acides aminés, accrochés les uns aux autres comme les perles d'un collier.",
        faits: [
          { titre: 'Deux formes.', texte: "On distingue souvent la kératine α, enroulée en hélice (cheveux, ongles, laine), et la kératine dite « β », repliée en feuillets plats (écailles des reptiles, becs et plumes des oiseaux). En réalité, la « kératine β » n'est pas une vraie kératine : les scientifiques l'appellent aujourd'hui protéine cornée bêta. Elle travaille en équipe avec la kératine α, que les reptiles et les oiseaux possèdent aussi (Alibardi, 2016)." },
          { titre: 'Un empilement à plusieurs échelles.', texte: "Les chaînes s'assemblent en filaments, puis en fibres, puis en tissus. C'est cet empilement qui rend les écailles si résistantes (Wang et al., 2016)." },
          { titre: 'Des ponts soufrés.', texte: "Les kératines sont riches en soufre : des ponts disulfure relient les chaînes entre elles et les rigidifient. C'est ce soufre qui donne leur odeur aux cheveux et aux plumes brûlés." },
          { titre: "Insoluble dans l'eau.", texte: "La kératine est insoluble dans l'eau : idéal pour une armure qui reste souvent au contact de l'eau. Petite exception : la tortue luth, une tortue marine, n'a pas d'écailles cornées. Sa carapace est couverte d'une peau épaisse." },
        ],
        liens: [
          { label: 'Kératine', url: 'https://fr.wikipedia.org/wiki/K%C3%A9ratine' },
          { label: 'Pont disulfure', url: 'https://fr.wikipedia.org/wiki/Pont_disulfure' },
          { label: 'Tortue luth', url: 'https://fr.wikipedia.org/wiki/Tortue_luth' },
        ],
      },
    ],
    charade: "Au-dessus de ma tête, deux cent cinquante élèves écoutent un seul maître. À côté de moi, des machines donnent forme aux idées. Une nageuse des mers m'y attend, patiente et lente.",
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
    ambiance: 'terre',
    thumbnail: { color: 'thumbs/hibiscus.jpg', gray: 'thumbs/hibiscus-gris.jpg' },
    theme: { primary: '#a3222f', accent: '#e8708f', bg: '#fbf2f2', text: '#3a1f22' },
    nomScientifique: 'Hibiscus rosa-sinensis',
    histoire: 'Sur la terre, les fleurs rouges éclataient de couleur...',
    zones: [
      // Références vérifiées : Mejía et al. 2023 (Molecules, cultivars d'H. rosa-sinensis) ;
      // Wikipédia « Hibiscus rosa-sinensis », « Cyanidine » (E163a) ; manuel NCERT (indicateur « China rose »)
      {
        id: 'fleur',
        label: 'Fleur rouge',
        x: 57, y: 46, w: 27, h: 54,
        info: "Le rouge éclatant de l'hibiscus vient d'un pigment dissous dans les cellules des pétales : la cyanidine, de la famille des anthocyanes.",
        faits: [
          { titre: 'Un pigment presque unique.', texte: "Chez l'hibiscus, la cyanidine est accrochée à deux sucres : on l'appelle cyanidine-3-sophoroside. C'est le principal pigment rouge de la fleur, d'où sa couleur si régulière (Mejía et al., 2023)." },
          { titre: 'Du blanc au rouge.', texte: "On le trouve dans les fleurs lilas, roses, orange et rouges, mais pas dans les hibiscus blancs ou jaunes. C'est sa quantité qui fait passer la fleur du rose pâle au rouge vif." },
          { titre: 'Une fleur antioxydante.', texte: "Plus une fleur est rouge, plus elle est antioxydante : les chercheurs ont mesuré une activité environ deux fois et demie plus forte chez un hibiscus rouge que chez un blanc." },
          { titre: 'La plante à cirer les chaussures.', texte: "En Inde, au Sri Lanka, en Malaisie ou en Polynésie, ses pétales écrasés donnent un jus noir qui servait de cirage. En anglais, on la surnomme d'ailleurs « shoeblackplant »." },
        ],
        liens: [
          { label: 'Hibiscus rosa-sinensis', url: 'https://fr.wikipedia.org/wiki/Hibiscus_rosa-sinensis' },
          { label: 'Anthocyane', url: 'https://fr.wikipedia.org/wiki/Anthocyane' },
        ],
      },
      {
        id: 'molecule',
        label: 'Molécule de cyanidine',
        x: 83, y: 73, w: 16, h: 20,
        info: "La cyanidine est faite de trois anneaux d'atomes, surtout de carbone, décorés de groupes « OH ». Le petit « + » sur l'oxygène, visible sur la fresque, est la clé de sa couleur.",
        faits: [
          { titre: 'Une molécule chargée.', texte: "En milieu acide, comme dans les pétales, la cyanidine porte une charge positive : on l'appelle alors cation flavylium. Sous cette forme, elle absorbe surtout la lumière verte, et notre œil perçoit le rouge." },
          { titre: 'Un indicateur de pH naturel.', texte: "Quand le pH change, la molécule se transforme et change de couleur : rose à rouge en milieu acide, violette vers la neutralité, puis bleue et verte en milieu basique. Un extrait de pétales d'hibiscus vire au rose foncé avec du citron et au vert avec une base : c'est une expérience classique de cours de chimie." },
          { titre: 'Une molécule très répandue.', texte: "On retrouve la cyanidine dans le chou rouge, les mûres, les cerises ou les framboises." },
          { titre: 'Un colorant alimentaire.', texte: "Les anthocyanes servent de colorant alimentaire naturel : sur les emballages, elles portent le code E163." },
        ],
        liens: [
          { label: 'Cyanidine', url: 'https://fr.wikipedia.org/wiki/Cyanidine' },
          { label: 'Indicateur de pH', url: 'https://fr.wikipedia.org/wiki/Indicateur_de_pH' },
        ],
      },
    ],
    charade: "Là où des sœurs, dans la langue de Shakespeare, nourrissent les affamés, tout près de la maison des livres, une colonne a revêtu ses couleurs. Non loin d'elle, une fleur rouge s'est ouverte.",
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
    ambiance: 'ciel',
    thumbnail: { color: 'thumbs/perruche.jpg', gray: 'thumbs/perruche-gris.jpg' },
    theme: { primary: '#2f6b2a', accent: '#d9a91a', bg: '#f1f6ee', text: '#1f2e1c' },
    nomScientifique: 'Trichoglossus haematodus deplanchii', // loriquet à tête bleue de Nouvelle-Calédonie
    histoire: 'Dans la forêt, deux perruches observaient le monde...',
    zones: [
      // Références vérifiées : ChemistryViews 2024 et Arbore et al. 2024 (Science, enzyme ALDH3A2) ;
      // Prum et al. 1999 (Proc. R. Soc. B) ; Shawkey et al. 2006 (J. R. Soc. Interface, couche basale de mélanine) ;
      // Shawkey & Hill 2006 (J. Exp. Biol., geai sans mélanine) ; Bonser 1995 (The Condor, dureté des plumes)
      {
        id: 'plumes',
        label: 'Plumage',
        sousTitre: 'Loriquet à tête bleue de Nouvelle-Calédonie (Trichoglossus haematodus deplanchii)',
        x: 26, y: 1, w: 41, h: 57,
        info: "Le plumage du loriquet combine deux sources de couleur : des pigments, qui absorbent une partie de la lumière, et des structures microscopiques, qui la renvoient.",
        faits: [
          { titre: "Des pigments maison.", texte: "Le rouge de sa poitrine et le jaune de son collier viennent des psittacofulvines, des pigments qu'on ne trouve que chez les perroquets. Ils ressemblent chimiquement aux caroténoïdes (une longue chaîne d'atomes de carbone). Mais contrairement aux caroténoïdes des autres oiseaux, comme le flamant ou le canari, ils ne viennent pas de la nourriture : l'oiseau les fabrique lui-même (ChemistryViews, 2024)." },
          { titre: "La mélanine, pigment sombre.", texte: "La mélanine colore les zones sombres du plumage. Sous les plumes bleues, elle forme aussi un fond noir qui absorbe la lumière non renvoyée et rend le bleu plus vif (Shawkey et al., 2006)." },
          { titre: "Un bleu fait de lumière.", texte: "Le bleu de sa tête n'est pas un pigment : c'est une couleur structurelle. À l'intérieur de la plume, une « éponge » de kératine et de minuscules bulles d'air renvoie surtout la lumière bleue (Prum et al., 1999)." },
          { titre: "Pas de pigment vert.", texte: "Son dos, ses ailes et son ventre sont verts, et pourtant aucun pigment vert n'existe dans ses plumes ! Le vert est un mélange : du bleu structurel filtré par un pigment jaune." },
          { titre: "Une enzyme pour passer du rouge au jaune.", texte: "En 2024, des chercheurs ont découvert chez les perroquets qu'une enzyme, ALDH3A2, transforme les psittacofulvines rouges en psittacofulvines jaunes. Plus la plume en contient, plus elle tire vers le jaune, ou vers le vert quand ce jaune se mélange au bleu structurel (Arbore et al., 2024)." },
        ],
        liens: [
          { label: 'Loriquet à tête bleue', url: 'https://fr.wikipedia.org/wiki/Loriquet_%C3%A0_t%C3%AAte_bleue' },
          { label: 'Psittacofulvine', url: 'https://fr.wikipedia.org/wiki/Psittacofulvine' },
          { label: 'Couleur structurelle', url: 'https://fr.wikipedia.org/wiki/Couleur_structurelle' },
          { label: 'Mélanine', url: 'https://fr.wikipedia.org/wiki/M%C3%A9lanine' },
          { label: 'Plume', url: 'https://fr.wikipedia.org/wiki/Plume' },
        ],
      },
      {
        id: 'molecule',
        label: 'Molécule de mélanine',
        x: 41, y: 74, w: 13, h: 25,
        info: "La mélanine est le pigment sombre du vivant : c'est elle qui colore aussi notre peau, nos cheveux et nos yeux. Elle est fabriquée par des cellules spécialisées à partir d'un acide aminé, la tyrosine.",
        faits: [
          { titre: "Des briques en anneaux.", texte: "Il existe deux grandes formes de mélanine : l'eumélanine, noire ou brune, et la phéomélanine, jaune à rouge. Celle de la fresque est l'eumélanine. Elle est faite de petites briques en forme d'anneaux (des indoles) reliées en chaînes. Ces chaînes absorbent presque toutes les couleurs de la lumière : d'où le noir et le brun." },
          { titre: "Un fond noir sous le bleu.", texte: "Dans une plume bleue ou verte, une rangée de grains de mélanine tapisse le fond de l'« éponge » de kératine qui crée la couleur structurelle (Shawkey et al., 2006). Elle absorbe la lumière blanche que l'éponge ne renvoie pas, ce qui rend le bleu plus pur et plus éclatant." },
          { titre: "Comme le tableau derrière la craie.", texte: "Sans cette couche sombre, le bleu ressort mal. Chez les oiseaux qui ne fabriquent pas de mélanine, les plumes normalement bleues paraissent pâles et délavées (Shawkey et Hill, 2006)." },
          { titre: "Des plumes plus dures.", texte: "Les plumes riches en mélanine sont plus dures, ce qui les aiderait à mieux résister à l'usure (Bonser, 1995)." },
        ],
        liens: [
          { label: 'Mélanine', url: 'https://fr.wikipedia.org/wiki/M%C3%A9lanine' },
          { label: 'Couleur structurelle', url: 'https://fr.wikipedia.org/wiki/Couleur_structurelle' },
          { label: 'Plumage', url: 'https://fr.wikipedia.org/wiki/Plumage' },
        ],
      },
    ],
    charade: "Fais le tour de la maison des livres et passe dans son dos. Là où l'on vient souffler, à l'abri des regards, un oiseau aux mille couleurs se repose à l'écart.",
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
