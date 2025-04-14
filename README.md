# Planify - Documentation Technique

Planify est une application mobile développée avec React Native et Expo, permettant d'interagir avec l'API Trello pour gérer tableaux, cartes et espaces de travail depuis votre appareil mobile.

## Table des matières

- [Installation et configuration](#installation-et-configuration)
- [Architecture du projet](#architecture-du-projet)
- [Système d'authentification](#système-dauthentification)
- [Navigation](#navigation)
- [Services](#services)
- [Gestion d'état avec Zustand](#gestion-détat-avec-zustand)
- [Composants](#composants)
- [Workflow de développement](#workflow-de-développement)
- [Dépannage](#dépannage)

## Installation et configuration

### Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Cloner le dépôt

```bash
git clone [URL_DU_REPO]
cd planify
```

2. Installer les dépendances

```bash
npm install
```

3. Lancer l'application

```bash
# Utiliser l'une des commandes suivantes :
npx expo start --tunnel  # Pour exposer l'application via un tunnel
npm run start            # Démarrage standard
```

> **Note**: Vous pouvez également utiliser les commandes définies dans le Makefile:
> - `make run` - Démarrer Expo avec tunnel
> - `make run-reset` - Démarrer Expo avec réinitialisation du cache
> - `make run-ios` - Démarrer Expo pour iOS
> - `make run-android` - Démarrer Expo pour Android

### Configuration de l'environnement

Le fichier `.env` à la racine du projet contient les variables d'environnement nécessaires:

```
EXPO_PUBLIC_URL=exp://gpug6ug-anonymous-8081.exp.direct
EXPO_PUBLIC_TRELLO_API_KEY=e025096b4900679c7798636430f88c49
```

Pour le développement local, assurez-vous de mettre à jour `EXPO_PUBLIC_URL` avec l'URL de votre environnement Expo.

## Architecture du projet

### Structure des dossiers

```
planify/
├── app/                       # Dossier des routes (expo-router)
│   ├── (auth)/                # Routes d'authentification
│   ├── (tabs)/                # Routes principales (post-authentification)
│   ├── board/                 # Routes spécifiques aux tableaux
│   ├── workspace/             # Routes spécifiques aux workspaces
│   └── _layout.tsx            # Configuration de la navigation principale
├── config/                    # Configuration globale de l'application
├── hooks/                     # Hooks personnalisés et composants réutilisables
├── screens/                   # Écrans de l'application
│   ├── Auth/                  # Écrans d'authentification
│   ├── Boards/                # Écrans de gestion des tableaux
│   ├── Cards/                 # Écrans de gestion des cartes
│   ├── Notifications/         # Écran des notifications
│   └── Workspaces/            # Écrans de gestion des workspaces
├── services/                  # Services pour l'API et la logique métier
├── stores/                    # Stores Zustand pour la gestion d'état
```

### Principes d'architecture

Planify suit une architecture en couches:

1. **UI (screens/)**: Composants React Native pour l'affichage
2. **State Management (stores/)**: Gestion centralisée de l'état avec Zustand
3. **Services (services/)**: Communication avec l'API Trello
4. **Navigation (app/)**: Gestion des routes avec Expo Router
5. **Configuration (config/)**: Configuration globale de l'application

## Système d'authentification

Le système d'authentification de Planify utilise OAuth 1.0a pour se connecter à Trello.

### Flux d'authentification

1. **Initialisation**: Vérification du token dans AsyncStorage
2. **Authentification**: Redirection vers la page d'authentification Trello
3. **Callback**: Récupération du token depuis l'URL de redirection
4. **Stockage**: Sauvegarde du token et redirection vers l'écran principal

### Service d'authentification (`authService.ts`)

Ce service gère tout le processus d'authentification et expose les méthodes suivantes:

- `initialize()`: Charge le token existant et configure l'écoute des URLs
- `authenticate()`: Lance le processus d'authentification
- `isAuthenticated()`: Vérifie si un token valide est présent
- `logout()`: Déconnecte l'utilisateur
- `request<T>(method, path, data)`: Méthode générique pour les appels API authentifiés
- `get<T>`, `post<T>`, `put<T>`, `delete<T>`: Méthodes spécifiques pour les types de requêtes

## Navigation

Planify utilise Expo Router pour la navigation, basé sur un système de fichiers:

- `app/index.tsx`: Point d'entrée, redirecte vers le login
- `app/(auth)/login.tsx`: Écran de connexion
- `app/(tabs)/_layout.tsx`: Configuration de la barre d'onglets principale
- `app/(tabs)/home.tsx`: Liste des workspaces
- `app/(tabs)/notifications.tsx`: Notifications (à implémenter)
- `app/(tabs)/settings.tsx`: Paramètres et déconnexion
- `app/workspace/[workspaceId].tsx`: Détails d'un workspace (ses tableaux)
- `app/board/[boardId].tsx`: Détails d'un tableau (ses cartes)

## Services

### Services disponibles

| Service | Fichier | Description |
|---------|---------|-------------|
| `authService` | `services/authService.ts` | Gestion de l'authentification et requêtes API |
| `boardsService` | `services/boardsService.ts` | Opérations CRUD pour les tableaux |
| `cardsService` | `services/cardsService.ts` | Opérations CRUD pour les cartes |
| `listsService` | `services/listsService.ts` | Récupération des listes d'un tableau |
| `memberService` | `services/memberService.ts` | Informations sur les membres et utilisateurs |
| `workspaceService` | `services/workspacesService.ts` | Opérations CRUD pour les workspaces |

### Exemple d'utilisation des services

```typescript
// Récupérer les workspaces
const workspaces = await workspaceService.getWorkspaces();

// Créer un tableau
const newBoard = await boardsService.createBoard('Nouveau tableau', 'Description', workspaceId);

// Récupérer les cartes d'un tableau
const cards = await cardsService.getCards(boardId);
```

## Gestion d'état avec Zustand

Planify utilise Zustand pour la gestion d'état. Chaque entité dispose de son propre store:

### Stores disponibles

| Store | Fichier | Description |
|-------|---------|-------------|
| `useBoardsStore` | `stores/boardsStore.ts` | État et opérations des tableaux |
| `useCardsStore` | `stores/cardsStore.ts` | État et opérations des cartes |
| `useMembersStore` | `stores/membersStore.ts` | État et opérations des membres |
| `useWorkspacesStore` | `stores/workspacesStore.ts` | État et opérations des workspaces |

### Structure standard des stores

Chaque store suit généralement cette structure:
- État (`boards`, `cards`, `workspaces`, etc.)
- Indicateurs de chargement (`loading`)
- Indicateurs d'erreur (`error`)
- Méthodes de récupération (`fetchBoards`, `fetchCards`, etc.)
- Méthodes de mutation (`createBoard`, `updateCard`, etc.)

### Exemple d'utilisation d'un store

```typescript
import { useWorkspacesStore } from '../stores/workspacesStore';

function WorkspacesScreen() {
  const { 
    workspaces, 
    loading, 
    error, 
    fetchWorkspaces, 
    createWorkspace 
  } = useWorkspacesStore();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateWorkspace = () => {
    createWorkspace('Nouveau workspace', 'Description');
  };

  // ...
}
```

## Composants

### Composants principaux

#### Écrans

| Écran | Fichier | Description |
|-------|---------|-------------|
| `LoginScreen` | `screens/Auth/LoginScreen.tsx` | Écran de connexion |
| `LogoutScreen` | `screens/Auth/LogoutScreen.tsx` | Écran de déconnexion |
| `WorkspacesScreen` | `screens/Workspaces/Workspaces.tsx` | Liste des workspaces |
| `BoardsScreen` | `screens/Boards/Boards.tsx` | Liste des tableaux d'un workspace |
| `CardsScreen` | `screens/Cards/Cards.tsx` | Liste des cartes d'un tableau |
| `NotificationsScreen` | `screens/Notifications/NotificationsScreen.tsx` | Notifications (à développer) |

#### Cartes et items

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `WorkspaceCard` | `screens/Workspaces/WorkspaceCard.tsx` | Carte d'un workspace |
| `BoardCard` | `screens/Boards/BoardCard.tsx` | Carte d'un tableau |

#### Modales

| Modale | Fichier | Description |
|--------|---------|-------------|
| `CreateWorkspaceModal` | `screens/Workspaces/modals/CreateWorkspaceModal.tsx` | Création d'un workspace |
| `EditWorkspaceModal` | `screens/Workspaces/modals/EditWorkspaceModal.tsx` | Édition d'un workspace |
| `CreateBoardModal` | `screens/Boards/modals/CreateBoardModal.tsx` | Création d'un tableau |
| `EditBoardModal` | `screens/Boards/modals/EditBoardModal.tsx` | Édition d'un tableau |
| `CreateCardModal` | `screens/Cards/modals/CreateCardModal.tsx` | Création d'une carte |
| `UpdateCardModal` | `screens/Cards/modals/UpdateCardModal.tsx` | Mise à jour d'une carte |
| `ConfirmModal` | `hooks/ConfirmModal.tsx` | Confirmation générique (suppression, etc.) |

### Hooks et composants réutilisables

- `ConfirmModal`: Modal de confirmation générique, réutilisable dans toute l'application.

## Workflow de développement

### Ajouter une nouvelle fonctionnalité

1. **Créer ou modifier un service** dans `/services` si nécessaire
2. **Mettre à jour ou créer un store** dans `/stores` pour gérer l'état
3. **Créer les composants UI** dans `/screens`
4. **Ajouter des routes** dans `/app` si nécessaire

### Exemple: Ajouter la fonctionnalité de commentaires

1. Créer `services/commentsService.ts` pour les appels API
2. Créer `stores/commentsStore.ts` pour la gestion d'état
3. Créer `screens/Comments/Comments.tsx` et `screens/Comments/CommentItem.tsx`
4. Intégrer les commentaires dans l'écran de carte existant

## Fonctionnalités clés

### Gestion des workspaces

- Affichage de la liste des workspaces
- Création d'un nouveau workspace
- Modification d'un workspace existant
- Suppression d'un workspace

### Gestion des tableaux

- Affichage des tableaux d'un workspace
- Création d'un nouveau tableau
- Modification d'un tableau existant
- Suppression d'un tableau

### Gestion des cartes

- Affichage des cartes par liste
- Création d'une nouvelle carte
- Mise à jour d'une carte (titre, description, membres, étiquettes)
- Suppression d'une carte
- Affichage des étiquettes et membres assignés

### Fonctionnalités d'authentification

- Connexion via OAuth Trello
- Persistance de session
- Déconnexion

## Dépannage

### Problèmes d'authentification

- **Token non récupéré**: Vérifier la configuration de l'URL Expo dans `.env`
- **Redirection ne fonctionne pas**: Vérifier les listeners dans `authService.initialize()`
- **Erreur après obtention du token**: Vérifier le stockage avec AsyncStorage

### Problèmes d'API

- **Erreurs 401**: Token expiré ou invalide, essayer de se reconnecter
- **Erreurs 400**: Vérifier la structure des données envoyées
- **Erreurs 404**: Vérifier les IDs utilisés dans les requêtes

### Logs de débogage

Les erreurs et messages de débogage sont préfixés pour faciliter l'identification:
- `[LoginScreen]`: Messages de l'écran de connexion
- `[AuthService]`: Messages du service d'authentification
- `[BoardsService]`: Messages du service de tableaux
- etc.

## Ressources

### Documentation externe

- [API Trello](https://developer.atlassian.com/cloud/trello/rest/api-group-actions/)
- [Expo](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/docs/getting-started)
- [Zustand](https://github.com/pmndrs/zustand)
- [Expo Router](https://docs.expo.dev/router/introduction/)

### Glossaire

- **Workspace**: Équivalent d'une organisation Trello (anciennement appelé "Team" ou "Organization")
- **Board**: Tableau Trello contenant des listes et des cartes
- **List**: Colonne dans un tableau Trello
- **Card**: Élément individuel dans une liste
- **Label**: Étiquette colorée attachée à une carte
