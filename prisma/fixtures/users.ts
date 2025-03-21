import { User, UserBalance } from '@prisma/client'

const users: (Omit<User, 'id' | 'userBalanceId'> & {
  userBalance: Omit<UserBalance, 'id' | 'userId'>
})[] = [
  {
    email: 'louane.morel@example.com',
    firstname: 'Louane',
    lastname: 'Morel',
    oauthProvider: 'google',
    createdAt: new Date('2012-06-21T17:08:59.929Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: 'Lorem ipsum dolor sit amet.',
    jobTitle: 'Software Engineer',
    isCertified: true,
    certifiedDate: new Date('2020-05-10T12:00:00.000Z'),
    image: 'https://randomuser.me/api/portraits/women/66.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'sandro.garcia@example.com',
    firstname: 'Sandro',
    lastname: 'Garcia',
    oauthProvider: 'linkedin',
    createdAt: new Date('2003-09-29T07:09:56.482Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: 'Développeur expérimenté en React.js.',
    jobTitle: 'Fullstack Developer',
    isCertified: false,
    certifiedDate: null,
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    country: 'Spain',
    roles: ['USER']
  },
  {
    email: 'sara.colin@example.com',
    firstname: 'Sara',
    lastname: 'Colin',
    oauthProvider: 'google',
    createdAt: new Date('2004-11-16T03:46:56.329Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: "Passionnée par l'UX/UI et le design web.",
    jobTitle: 'UX/UI Designer',
    isCertified: true,
    certifiedDate: new Date('2021-08-15T10:30:00.000Z'),
    image: 'https://randomuser.me/api/portraits/women/66.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'alois.hubert@example.com',
    firstname: 'Aloïs',
    lastname: 'Hubert',
    oauthProvider: 'linkedin',
    createdAt: new Date('2003-02-24T10:04:44.124Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: 'Développeur backend passionné par les API et les bases de données.',
    jobTitle: 'Backend Engineer',
    isCertified: true,
    certifiedDate: new Date('2020-10-05T14:20:00.000Z'),
    image: 'https://randomuser.me/api/portraits/men/96.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'gaetan.leroy@example.com',
    firstname: 'Gaëtan',
    lastname: 'Leroy',
    oauthProvider: 'google',
    createdAt: new Date('2020-05-28T00:42:25.335Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: "Expert DevOps, il automatise tout ce qu'il touche.",
    jobTitle: 'DevOps Engineer',
    isCertified: false,
    certifiedDate: null,
    image: 'https://randomuser.me/api/portraits/men/20.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'amaury.fernandez@example.com',
    firstname: 'Amaury',
    lastname: 'Fernandez',
    oauthProvider: 'linkedin',
    createdAt: new Date('2006-02-25T17:57:39.452Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: "Freelance en cybersécurité, spécialiste en audits et tests d'intrusion.",
    jobTitle: 'Cybersecurity Consultant',
    isCertified: true,
    certifiedDate: new Date('2021-12-12T09:30:00.000Z'),
    image: 'https://randomuser.me/api/portraits/men/95.jpg',
    country: 'Spain',
    roles: ['USER']
  },
  {
    email: 'ugo.duval@example.com',
    firstname: 'Ugo',
    lastname: 'Duval',
    oauthProvider: 'google',
    createdAt: new Date('2016-05-01T01:04:27.722Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: 'Monteur vidéo indépendant, passionné par le storytelling visuel.',
    jobTitle: 'Video Editor',
    isCertified: true,
    certifiedDate: new Date('2022-07-15T10:00:00.000Z'),
    image: 'https://randomuser.me/api/portraits/men/92.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'lino.marchand@example.com',
    firstname: 'Lino',
    lastname: 'Marchand',
    oauthProvider: 'linkedin',
    createdAt: new Date('2006-01-27T14:02:59.094Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: 'Chef cuisinier étoilé, créatif et toujours en quête de nouvelles saveurs.',
    jobTitle: 'Chef Cuisinier',
    isCertified: true,
    certifiedDate: new Date('2019-03-22T15:45:00.000Z'),
    image: 'https://randomuser.me/api/portraits/men/62.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'berenice.francois@example.com',
    firstname: 'Bérénice',
    lastname: 'François',
    oauthProvider: 'google',
    createdAt: new Date('2010-08-09T09:10:04.797Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description:
      'Consultante RH spécialisée dans la gestion des talents et le bien-être au travail.',
    jobTitle: 'Consultante RH',
    isCertified: false,
    certifiedDate: null,
    image: 'https://randomuser.me/api/portraits/women/81.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'eleonore.berger@example.com',
    firstname: 'Éléonore',
    lastname: 'Berger',
    oauthProvider: 'linkedin',
    createdAt: new Date('2004-09-29T15:36:26.293Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description:
      'Fleuriste passionnée, elle crée des compositions florales uniques pour toutes occasions.',
    jobTitle: 'Fleuriste',
    isCertified: true,
    certifiedDate: new Date('2021-05-10T08:30:00.000Z'),
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'adele.schmitt@example.com',
    firstname: 'Adèle',
    lastname: 'Schmitt',
    oauthProvider: 'google',
    createdAt: new Date('2012-03-31T01:19:01.146Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: 'Jardinière paysagiste, spécialiste des jardins écologiques et durables.',
    jobTitle: 'Paysagiste',
    isCertified: true,
    certifiedDate: new Date('2020-06-18T12:00:00.000Z'),
    image: 'https://randomuser.me/api/portraits/women/6.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'meline.fontai@example.com',
    firstname: 'Méline',
    lastname: 'Fontai',
    oauthProvider: 'linkedin',
    createdAt: new Date('2002-04-15T19:52:02.121Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: 'Coach sportif spécialisée en fitness et nutrition.',
    jobTitle: 'Coach Sportif',
    isCertified: false,
    certifiedDate: null,
    image: 'https://randomuser.me/api/portraits/women/20.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'leandro.laurent@example.com',
    firstname: 'Léandro',
    lastname: 'Laurent',
    oauthProvider: 'google',
    createdAt: new Date('2008-07-13T11:24:39.049Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: 'Photographe spécialisé dans les mariages et événements.',
    jobTitle: 'Photographe',
    isCertified: true,
    certifiedDate: new Date('2021-09-12T14:00:00.000Z'),
    image: 'https://randomuser.me/api/portraits/men/78.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'naomi.vincent@example.com',
    firstname: 'Naomi',
    lastname: 'Vincent',
    oauthProvider: 'linkedin',
    createdAt: new Date('2002-12-12T11:39:09.718Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: 'Professeure de yoga, adepte du bien-être et de la méditation.',
    jobTitle: 'Professeure de Yoga',
    isCertified: false,
    certifiedDate: null,
    image: 'https://randomuser.me/api/portraits/women/15.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'ines.dumas@example.com',
    firstname: 'Inès',
    lastname: 'Dumas',
    oauthProvider: 'google',
    createdAt: new Date('2005-09-09T03:09:47.378Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: "Éducatrice spécialisée, engagée pour l'accompagnement des jeunes en difficulté.",
    jobTitle: 'Éducatrice Spécialisée',
    isCertified: true,
    certifiedDate: new Date('2022-11-08T10:15:00.000Z'),
    image: 'https://randomuser.me/api/portraits/women/51.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'sasha.boyer@example.com',
    firstname: 'Sasha',
    lastname: 'Boyer',
    oauthProvider: 'linkedin',
    createdAt: new Date('2017-09-15T12:52:53.792Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: 'Musicien indépendant, compositeur et interprète.',
    jobTitle: 'Musicien',
    isCertified: false,
    certifiedDate: null,
    image: 'https://randomuser.me/api/portraits/men/23.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'elio.chevalier@example.com',
    firstname: 'Elio',
    lastname: 'Chevalier',
    oauthProvider: 'google',
    createdAt: new Date('2004-06-29T04:37:59.753Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: 'Boulanger artisan, maître dans la fabrication de pains et viennoiseries.',
    jobTitle: 'Boulanger',
    isCertified: true,
    certifiedDate: new Date('2020-04-20T06:00:00.000Z'),
    image: 'https://randomuser.me/api/portraits/men/28.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'martin.bertrand@example.com',
    firstname: 'Martin',
    lastname: 'Bertrand',
    oauthProvider: 'linkedin',
    createdAt: new Date('2019-07-30T05:39:27.631Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: 'Guide touristique passionné, spécialiste des visites culturelles.',
    jobTitle: 'Guide Touristique',
    isCertified: true,
    certifiedDate: new Date('2023-02-15T09:30:00.000Z'),
    image: 'https://randomuser.me/api/portraits/men/5.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'laura.dasilva@example.com',
    firstname: 'Laura',
    lastname: 'Da Silva',
    oauthProvider: 'google',
    createdAt: new Date('2003-03-06T02:29:59.166Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: "Maîtresse d'école passionnée par l'éducation et l'éveil des enfants.",
    jobTitle: 'Professeure des écoles',
    isCertified: true,
    certifiedDate: new Date('2018-09-01T08:00:00.000Z'),
    image: 'https://randomuser.me/api/portraits/women/16.jpg',
    country: 'France',
    roles: ['USER']
  },
  {
    email: 'erwan.leroux@example.com',
    firstname: 'Erwan',
    lastname: 'Leroux',
    oauthProvider: 'linkedin',
    createdAt: new Date('2015-07-19T15:47:11.467Z'),
    userBalance: {
      createdAt: new Date(),
      balance: 0,
      updatedAt: new Date()
    },
    description: 'Mécanicien auto spécialisé en voitures anciennes et de collection.',
    jobTitle: 'Mécanicien',
    isCertified: false,
    certifiedDate: null,
    image: 'https://randomuser.me/api/portraits/men/90.jpg',
    country: 'France',
    roles: ['USER']
  }
]

export default users
