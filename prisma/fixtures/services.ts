import { Service } from '@prisma/client'

const services: (Omit<Service, 'id' | 'userId'> & { index: number })[] = [
  {
    index: 0, // Louane Morel - UI/UX Designer
    title: 'Création de maquettes UX/UI modernes',
    descriptionShort: 'Des interfaces élégantes et ergonomiques adaptées à votre marque.',
    description:
      'Je conçois des maquettes UX/UI sur Figma ou Adobe XD, adaptées à vos besoins. Optimisation de l’expérience utilisateur garantie !',
    createdAt: new Date(),
    langs: ['FR', 'EN'],
    type: 'digital',
    localisation: 'Remote',
    renewable: false,
    category: 'GraphiqueAndDesign',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 1, // Sandro Garcia - Fullstack Developer
    title: "Développement d'application web en React.js et Node.js",
    descriptionShort: 'Une app performante et évolutive développée sur mesure.',
    description:
      'Je réalise des applications web modernes avec React, Next.js et Node.js. Code propre, sécurisé et scalable.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'digital',
    localisation: 'Remote',
    renewable: false,
    category: 'ProgrammingAndTech',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 2, // Sara Colin - Frontend Developer
    title: 'Animations CSS et JavaScript pour sites web',
    descriptionShort: 'Rendez votre site web plus attractif avec des animations modernes.',
    description:
      'Je crée des animations interactives et fluides pour dynamiser vos pages web avec CSS, GSAP et Three.js.',
    createdAt: new Date(),
    langs: ['FR', 'EN'],
    type: 'digital',
    localisation: 'Remote',
    renewable: false,
    category: 'ProgrammingAndTech',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 3, // Aloïs Hubert - Backend Engineer
    title: "Développement d'API REST et GraphQL",
    descriptionShort: 'Des APIs robustes et sécurisées pour vos applications.',
    description:
      'Je conçois des API performantes en Node.js, Express et GraphQL, documentées et optimisées pour la scalabilité.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'digital',
    localisation: 'Remote',
    renewable: false,
    category: 'ProgrammingAndTech',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 4, // Gaëtan Leroy - DevOps Engineer
    title: 'Automatisation et déploiement CI/CD',
    descriptionShort: 'Optimisez votre workflow avec des pipelines CI/CD automatisés.',
    description:
      'Mise en place de GitHub Actions, Docker, Kubernetes et Terraform pour un déploiement rapide et fiable.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'digital',
    localisation: 'Remote',
    renewable: true,
    category: 'AIConsulting',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 5, // Amaury Fernandez - Consultant en cybersécurité
    title: "Audit et tests d'intrusion de votre site web",
    descriptionShort: "Sécurisez votre site avec un audit complet et des tests d'intrusion.",
    description:
      'Je détecte les failles de sécurité et propose des solutions pour protéger votre plateforme contre les attaques.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'digital',
    localisation: 'Remote',
    renewable: false,
    category: 'LegalAdvice',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 6, // Ugo Duval - Monteur vidéo
    title: 'Montage et post-production de vidéos',
    descriptionShort: 'Un montage dynamique et professionnel pour vos vidéos.',
    description:
      'Je réalise des montages de qualité pour YouTube, réseaux sociaux et films institutionnels. Effets spéciaux et animations inclus.',
    createdAt: new Date(),
    langs: ['FR', 'EN'],
    type: 'digital',
    localisation: 'Remote',
    renewable: true,
    category: 'VideoAndAnimation',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 7, // Lino Marchand - Chef cuisinier
    title: 'Cours de cuisine gastronomique à domicile',
    descriptionShort: 'Apprenez à cuisiner comme un chef avec des recettes uniques.',
    description:
      'Cours interactifs pour apprendre des techniques professionnelles et préparer des plats raffinés.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'physical',
    localisation: 'Paris, Lyon',
    renewable: true,
    category: 'Leisure',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 8, // Bérénice François - Consultante RH
    title: 'Accompagnement RH et recrutement',
    descriptionShort: 'Optimisez vos recrutements et la gestion de vos talents.',
    description:
      "Je vous accompagne dans la mise en place de stratégies RH efficaces, du sourcing à l'onboarding.",
    createdAt: new Date(),
    langs: ['FR'],
    type: 'digital',
    localisation: 'Remote',
    renewable: true,
    category: 'HRConsulting',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 9, // Éléonore Berger - Fleuriste
    title: 'Création de bouquets et compositions florales',
    descriptionShort: 'Des créations florales uniques pour toutes occasions.',
    description:
      'Je réalise des arrangements floraux personnalisés pour mariages, événements et cadeaux.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'physical',
    localisation: 'Lille, Marseille',
    renewable: false,
    category: 'Events',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 10, // Adèle Schmitt - Paysagiste
    title: 'Aménagement de jardins et espaces verts',
    descriptionShort: 'Créez un jardin sur mesure avec des solutions écologiques.',
    description:
      'Je conçois et entretiens des espaces verts en mettant en avant des techniques durables.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'physical',
    localisation: 'Bordeaux, Nantes',
    renewable: true,
    category: 'Gardening',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 11, // Méline Fontai - Coach sportif
    title: 'Coaching sportif et programme nutritionnel',
    descriptionShort: 'Atteignez vos objectifs grâce à un accompagnement sur mesure.',
    description:
      'Je vous aide à améliorer votre condition physique avec un plan personnalisé et un suivi régulier.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'physical',
    localisation: 'Lyon, Toulouse',
    renewable: true,
    category: 'Coaching',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 12, // Léandro Laurent - Photographe
    title: 'Shooting photo pour événements et portraits',
    descriptionShort: 'Capturez vos moments importants avec un photographe professionnel.',
    description: 'Je réalise des séances photos pour mariages, portraits et événements.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'physical',
    localisation: 'Marseille, Lille',
    renewable: false,
    category: 'Photography',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 13, // Naomi Vincent - Professeure de yoga
    title: 'Cours de yoga en ligne et en studio',
    descriptionShort: 'Relaxez-vous et améliorez votre bien-être avec le yoga.',
    description: 'Séances adaptées à tous niveaux, en ligne ou en présentiel.',
    createdAt: new Date(),
    langs: ['FR', 'EN'],
    type: 'digital',
    localisation: 'Remote, Bordeaux',
    renewable: true,
    category: 'Leisure',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 14, // Inès Dumas - Éducatrice spécialisée
    title: 'Soutien éducatif et accompagnement personnalisé',
    descriptionShort: 'Aide aux devoirs et accompagnement scolaire pour enfants en difficulté.',
    description:
      'Je propose un soutien scolaire et un accompagnement éducatif adapté aux besoins spécifiques de chaque enfant.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'physical',
    localisation: 'Paris, Lille',
    renewable: true,
    category: 'Assistance',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 15, // Sasha Boyer - Musicien
    title: 'Composition musicale et enregistrement',
    descriptionShort: 'Créez une musique originale pour votre projet.',
    description:
      'Je compose et enregistre des morceaux sur mesure pour films, pubs, jeux vidéo et artistes.',
    createdAt: new Date(),
    langs: ['FR', 'EN'],
    type: 'digital',
    localisation: 'Remote',
    renewable: false,
    category: 'MusicAndAudio',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 16, // Elio Chevalier - Boulanger
    title: 'Atelier de fabrication de pain artisanal',
    descriptionShort: 'Apprenez à faire du pain maison avec des techniques artisanales.',
    description:
      'Je vous enseigne les bases du levain et de la panification pour réaliser des pains savoureux chez vous.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'physical',
    localisation: 'Lyon, Bordeaux',
    renewable: false,
    category: 'Leisure',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 17, // Martin Bertrand - Guide touristique
    title: 'Visites guidées et découvertes culturelles',
    descriptionShort: 'Découvrez l’histoire et les secrets des villes françaises.',
    description:
      'Je propose des visites guidées immersives dans plusieurs grandes villes pour vous faire découvrir leur histoire et culture.',
    createdAt: new Date(),
    langs: ['FR', 'EN'],
    type: 'physical',
    localisation: 'Paris, Marseille, Strasbourg',
    renewable: false,
    category: 'Events',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 18, // Laura Da Silva - Professeure des écoles
    title: 'Cours particuliers pour enfants et adolescents',
    descriptionShort: 'Un accompagnement scolaire personnalisé et bienveillant.',
    description:
      'Aide aux devoirs, révisions et préparation aux examens pour les élèves du primaire et secondaire.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'physical',
    localisation: 'Remote, Toulouse',
    renewable: true,
    category: 'OnlineCourse',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 19, // Erwan Leroux - Mécanicien
    title: 'Réparation et entretien de voitures anciennes',
    descriptionShort: 'Donnez une seconde vie à votre voiture de collection.',
    description:
      'Je restaure et entretiens des véhicules classiques avec des pièces d’origine et un savoir-faire artisanal.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'physical',
    localisation: 'Nantes, Rennes',
    renewable: false,
    category: 'DIY',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 5, // Amaury Fernandez - Consultant en cybersécurité
    title: 'Formation en cybersécurité pour entreprises',
    descriptionShort: 'Apprenez à protéger vos systèmes contre les cyberattaques.',
    description:
      'Formation complète sur la cybersécurité : bonnes pratiques, gestion des risques et sensibilisation des employés.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'digital',
    localisation: 'Remote',
    renewable: true,
    category: 'OnlineCourse',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 8, // Bérénice François - Consultante RH
    title: 'Accompagnement dans la gestion des conflits en entreprise',
    descriptionShort: "Des solutions pour améliorer la communication et la cohésion d'équipe.",
    description:
      'J’interviens dans la gestion des conflits et l’amélioration du climat social en entreprise.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'digital',
    localisation: 'Remote',
    renewable: true,
    category: 'HRConsulting',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 9, // Éléonore Berger - Fleuriste
    title: "Atelier d'art floral",
    descriptionShort: 'Apprenez à créer de magnifiques compositions florales.',
    description:
      'Cours pratiques pour apprendre à composer des bouquets et décors floraux, adaptés à tous niveaux.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'physical',
    localisation: 'Marseille, Lyon',
    renewable: false,
    category: 'Leisure',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 11, // Méline Fontai - Coach sportif
    title: 'Programme de remise en forme personnalisé',
    descriptionShort: "Un plan d'entraînement sur mesure pour atteindre vos objectifs.",
    description:
      'Je crée des programmes adaptés à votre condition physique et à vos objectifs (perte de poids, tonification, endurance).',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'digital',
    localisation: 'Remote',
    renewable: true,
    category: 'Coaching',
    images: ['https://picsum.photos/1000/625']
  },
  {
    index: 19, // Erwan Leroux - Mécanicien
    title: 'Entretien et réparation de motos',
    descriptionShort: 'Gardez votre moto en parfait état grâce à un entretien régulier.',
    description:
      'Je réalise des entretiens complets et des réparations sur tous types de motos, avec un diagnostic précis.',
    createdAt: new Date(),
    langs: ['FR'],
    type: 'physical',
    localisation: 'Nantes, Rennes',
    renewable: true,
    category: 'DIY',
    images: ['https://picsum.photos/1000/625']
  }
]

export default services
