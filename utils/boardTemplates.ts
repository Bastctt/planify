export const boardTemplates = [
  {
    id: 'default',
    name: 'Tableau par défaut',
    desc: 'Template de base pour démarrer.',
    prefs: { background: {}, backgroundColor: 'red', backgroundImage: null },
    isTemplate: true,
    cards: [
      {
        listName: 'A faire',
        name: 'A faire',
        desc: 'Tâches à réaliser',
      },
      {
        listName: 'En cours',
        name: 'En cours',
        desc: 'Tâches en cours',
      },
      {
        listName: 'Terminé',
        name: 'Terminé',
        desc: 'Tâches terminées',
      },
    ],
  },
  {
    id: 'agile',
    name: 'Tableau Agile',
    desc: 'Template pour la gestion agile des projets.',
    prefs: { background: {}, backgroundColor: '#28a745', backgroundImage: null },
    isTemplate: true,
  },
];
