import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { router } from 'expo-router';
import { authService } from '../../services/authService';
import { appConfig } from '../../config/appConfig';

// On simule appConfig pour s'assurer qu'il dispose d'un expoUrl
jest.mock('../../config/appConfig', () => ({
    appConfig: {
        expoUrl: 'test_url',
    },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Mock de Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
    openURL: jest.fn(),
    getInitialURL: jest.fn().mockResolvedValue(null),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock qui simule le module expo-router
jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn(),
    },
}));

// Avant chaque test, on réinitialise l'état interne du service et on vide les mocks
beforeEach(() => {
    // @ts-ignore: ignpore les erreurs spé de  typescript 
    authService.token = null;
    jest.clearAllMocks();
});

describe('AuthService', () => {
    describe('initialize', () => {
        it('devrait charger le token depuis AsyncStorage s\'il existe', async () => {
            // Simule token dans AsyncStorage
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue('stored_token');

            await authService.initialize();
            expect(AsyncStorage.getItem).toHaveBeenCalledWith('trello_token');
            expect(authService.isAuthenticated()).toBe(true); // doit être true
        });

        it('devrait ne pas définir de token si aucun token n\'est stocké', async () => {
            // Quand pas de token dans AsyncStorage
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            await authService.initialize();

            expect(AsyncStorage.getItem).toHaveBeenCalledWith('trello_token');
            expect(authService.isAuthenticated()).toBe(false);
        });
    });

    describe('authenticate', () => {
        it('devrait ouvrir l’URL d’authentification et retourner true quand expoUrl est défini', async () => {
            // Bon appel à Linking.openURL
            (Linking.openURL as jest.Mock).mockResolvedValue(undefined);

            const result = await authService.authenticate();

            expect(Linking.openURL).toHaveBeenCalled();
            const calledUrl = (Linking.openURL as jest.Mock).mock.calls[0][0];
            expect(calledUrl).toContain('return_url=' + encodeURIComponent(appConfig.expoUrl));
            expect(result).toBe(true);
        });

        it('devrait retourner false si expoUrl n\'est pas défini', async () => {
            const originalExpoUrl = appConfig.expoUrl;
            (appConfig as any).expoUrl = '';

            const result = await authService.authenticate();

            expect(result).toBe(false);

            // Remet la valeur originale pour continuer les tests
            (appConfig as any).expoUrl = originalExpoUrl;
        });
    });

    describe('isAuthenticated', () => {
        it('devrait retourner false si aucun token n\'est défini', () => {
            expect(authService.isAuthenticated()).toBe(false);
        });

        it('devrait retourner true si un token est défini', async () => {
            await authService.handleAuthToken('my_token');
            expect(authService.isAuthenticated()).toBe(true);
        });
    });

    describe('logout', () => {
        it('devrait supprimer le token d\'AsyncStorage et rediriger vers la page de login', async () => {

            await authService.handleAuthToken('my_token');


            (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(null);

            await authService.logout();


            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('trello_token');

            expect(router.replace).toHaveBeenCalledWith('/(auth)/login');

            expect(authService.isAuthenticated()).toBe(false);
        });
    });
});
