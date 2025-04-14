import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { appConfig } from '../config/appConfig';
import { router } from 'expo-router';

export interface TrelloConfig {
  apiKey: string;
  apiUrl: string;
  authUrl: string;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

class AuthService {
  private config: TrelloConfig;
  private token: string | null = null;
  private linkingSubscription: any = null;

  constructor(config: TrelloConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      const savedToken = await AsyncStorage.getItem('trello_token');
      if (savedToken) {
        this.token = savedToken;
      }
      
      this.setupUrlHandler();
    } catch (error) {
      console.error('[TrelloService] Error loading token:', error);
    }
  }
  
  private setupUrlHandler() {
    // Écouter les événements d'URL entrants
    this.linkingSubscription = Linking.addEventListener('url', (event) => {
      this.handleUrl(event.url);
    });
    
    // Vérifier aussi l'URL initiale au démarrage
    Linking.getInitialURL().then(url => {
      if (url) {
        this.handleUrl(url);
      }
    });
  }

  private async handleUrl(url: string) {    
    // Pour le format de Trello, le token est généralement dans le hash
    const hashMatch = url.match(/#token=([^&]+)/);
    if (hashMatch && hashMatch[1]) {
      const token = hashMatch[1];
      await this.handleAuthToken(token);
      
      // Navigation vers l'écran home après authentification
      router.replace('/(tabs)/home');
    }
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  async authenticate(): Promise<boolean> {
    try {
      const redirectUri = appConfig.expoUrl;
      
      if (!redirectUri) {
        // console.error('[TrelloService] Expo URL not available');
        return false;
      }

      const authUrl = `${this.config.authUrl}/authorize?` + new URLSearchParams({
        expiration: 'never',
        name: 'Planify',
        scope: 'read,write',
        response_type: 'token',
        key: this.config.apiKey,
        return_url: redirectUri
      }).toString();

      await Linking.openURL(authUrl);
      return true;
    } catch (error) {
      console.error('[TrelloService] Authentication error:', error);
      return false;
    }
  }

  async handleAuthToken(token: string): Promise<void> {
    this.token = token;
    await AsyncStorage.setItem('trello_token', token);
  }

  async logout(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem('trello_token');
    
    router.replace('/(auth)/login');
  }

  // Méthodes pour les appels API
  async request<T>(
    method: HttpMethod, 
    path: string, 
    data: Record<string, any> = {}
  ): Promise<T> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const cleanPath = path.replace(/^\/+/, '');
    const url = `${this.config.apiUrl}/${cleanPath}`;
    const queryParams = `key=${this.config.apiKey}&token=${this.token}`;
    let finalUrl = `${url}${url.includes('?') ? '&' : '?'}${queryParams}`;

    const options: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (method === 'GET' || method === 'DELETE') {
      const params = new URLSearchParams(data).toString();
      if (params) {
        finalUrl += `&${params}`;
      }
    } else {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(finalUrl, options);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('[TrelloService] Request error:', error);
      throw error;
    }
  }

  async get<T>(path: string, params: Record<string, any> = {}): Promise<T> {
    return this.request('GET', path, params);
  }

  async post<T>(path: string, data: Record<string, any> = {}): Promise<T> {
    return this.request('POST', path, data);
  }

  async put<T>(path: string, data: Record<string, any> = {}): Promise<T> {
    return this.request('PUT', path, data);
  }

  async delete<T>(path: string, params: Record<string, any> = {}): Promise<T> {
    return this.request('DELETE', path, params);
  }
  
  cleanup() {
    if (this.linkingSubscription) {
      this.linkingSubscription.remove();
    }
  }
}

const defaultConfig: TrelloConfig = {
  apiKey: 'e025096b4900679c7798636430f88c49',
  apiUrl: 'https://api.trello.com/1',
  authUrl: 'https://trello.com/1',
};

export const authService = new AuthService(defaultConfig);