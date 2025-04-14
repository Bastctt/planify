import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = process.env.EXPO_PUBLIC_TRELLO_API_KEY;
const BASE_URL = 'https://api.trello.com/1';
const NOTIF_KEY = process.env.EXPO_PUBLIC_NOTIF_TRELLO_API_KEY;
const NOTIF_TOKEN = process.env.EXPO_PUBLIC_NOTIF_TRELLO_TOKEN;

const getTrelloApiClient = async () => {
    const token = await AsyncStorage.getItem('trello_token');
    const api = axios.create({
        baseURL: BASE_URL,
        params: {
            key: API_KEY,
            token: token,
        },
    });
    return api;
};
export interface NotificationData {
    text?: string;
    card?: {
        id: string;
        name: string;
    };
    board?: {
        id: string;
        name: string;
        shortLink?: string;
    };
    workspace?: {
        id: string;
        name: string;
        shortLink?: string;
    };
    organization?: {
        id: string;
        name: string;
        shortLink?: string;
    };
    listBefore?: {
        id: string;
        name: string;
    };
    listAfter?: {
        id: string;
        name: string;
    };
}

export interface Notification {
    id: string;
    type: string;
    date: string;
    dateRead: string | null;
    data: NotificationData;
    unread: boolean;
}

export interface NotificationDisplay {
    title: string;
    description: string;
    changedElement: string;
    deepLink: string;
}

export const notificationsService = {
    /**
      Récupère les notifications non lues pour le membre spécifié.
     */
    getUnreadNotifications: async (memberId: string = 'me', p0?: number) => {
        const api = await getTrelloApiClient();
        try {
            const response = await api.get<Notification[]>(`/members/${memberId}/notifications`, {
                params: {
                    read_filter: 'unread',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            return [];
        }
    },

    /**
      Récupère toutes les notifications pour le membre spécifié.
     */
    getAllNotifications: async (memberId: string = 'me', limit: number = 6) => {
        const api = await getTrelloApiClient();
        try {
            const response = await api.get<Notification[]>(`/members/${memberId}/notifications`, {
                params: {
                    read_filter: 'all',
                    limit: limit
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching all notifications:', error);
            return [];
        }
    },

    /**
      Retourne le nombre de notifications non lues pour un membre.
     */
    getUnreadNotificationCount: async (memberId: string = 'me', limit: number = 99) => {
        const api = await getTrelloApiClient();
        try {
            const response = await api.get<Notification[]>(`/members/${memberId}/notifications`, {
                params: {
                    read_filter: 'unread',
                    limit: limit
                },
            });
            const count = response.data.length;
            return count;
        } catch (error) {
            console.error('Error getting unread notification count:', error);
            return 0;
        }
    },

    markAsRead: async (notificationId: string, unread: boolean = false, memberId: string = 'me') => {
        try {
            const fullUrl = `${BASE_URL}/notifications/${notificationId}?unread=${unread}&key=${NOTIF_KEY}&token=${NOTIF_TOKEN}`;

            const response = await axios.put(fullUrl);

            const newCount = await notificationsService.getUnreadNotificationCount(memberId);

            return {
                notification: response.data,
                unreadCount: newCount
            };
        } catch (error) {
            console.error(`Error marking notification ${notificationId} as ${unread ? 'unread' : 'read'}:`, error);

            return {
                notification: null,
                unreadCount: await notificationsService.getUnreadNotificationCount(memberId)
            };
        }
    },

    /**
     Transforme une notification Trello en un résumé affichable.
    */
    parseForDisplay: (notification: Notification): NotificationDisplay => {
        let deepLink = '';

        if (notification.data.board?.id) {
            deepLink = `/board/${notification.data.board.id}`;
        }
        else if (notification.data.workspace?.id) {
            deepLink = `/workspace/${notification.data.workspace.id}`;
        }
        else if (notification.data.organization?.id) {
            deepLink = `/workspace/${notification.data.organization.id}`;
        }
        if (notification.type === 'changeCard') {
            const cardName = notification.data.card?.name || 'une carte';
            const boardName = notification.data.board?.name || 'un board';
            if (notification.data.listBefore && notification.data.listAfter) {
                return {
                    title: 'Modification de carte',
                    description: `La carte "${cardName}" a été déplacée.`,
                    changedElement: `La carte "${cardName}" du board "${boardName}" a été déplacée de la liste "${notification.data.listBefore.name}" vers la liste "${notification.data.listAfter.name}".`,
                    deepLink
                };
            }
            return {
                title: 'Modification de carte',
                description: `La carte "${cardName}" a été modifiée.`,
                changedElement: `La carte "${cardName}" du board "${boardName}" a subi une modification.`,
                deepLink
            };
        } else if (notification.type === 'addedToCard') {
            const cardName = notification.data.card?.name || 'une carte';
            const boardName = notification.data.board?.name || 'un board';
            return {
                title: 'Ajout à une carte',
                description: `Vous avez été ajouté à la carte "${cardName}".`,
                changedElement: `Vous avez été ajouté comme membre à la carte "${cardName}" du board "${boardName}".`,
                deepLink
            };
        } else if (notification.type === 'removedFromCard') {
            const cardName = notification.data.card?.name || 'une carte';
            const boardName = notification.data.board?.name || 'un board';
            return {
                title: 'Retrait d\'une carte',
                description: `Vous avez été retiré de la carte "${cardName}".`,
                changedElement: `Vous avez été retiré de la carte "${cardName}" du board "${boardName}".`,
                deepLink
            };
        } else if (notification.type === 'addedToOrganization' || notification.type === 'removedFromOrganization') {
            const action = notification.type === 'addedToOrganization' ? 'ajouté à' : 'retiré de';
            const orgId = notification.data.organization?.id || notification.data.workspace?.id;
            const orgName = notification.data.organization?.name || notification.data.workspace?.name || 'un workspace';
            const workspaceDeepLink = orgId
                ? `/workspace/${orgId}`
                : '/(tabs)/home';


            return {
                title: `Membership Workspace`,
                description: `Vous avez été ${action} un workspace.`,
                changedElement: `Vous avez été ${action} le workspace "${orgName}".`,
                deepLink: workspaceDeepLink
            };
        }
        return {
            title: `Notification (${notification.type})`,
            description: notification.data?.text || 'Aucune description disponible',
            changedElement: "L'élément a subi une modification.",
            deepLink: deepLink || '/(tabs)/home'
        };
    }
}

export const getAllUnreadNotifications = notificationsService.getUnreadNotifications;
export const getAllNotifications = notificationsService.getAllNotifications;
export const getUnreadNotificationCount = notificationsService.getUnreadNotificationCount;
export const markNotificationAsRead = notificationsService.markAsRead;
export const parseNotificationForDisplay = notificationsService.parseForDisplay;