import React, { useEffect, useState, useContext } from 'react';

// expo 
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// service
import { authService } from '../../services/authService';

// react-native
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

// context
import { ThemeContext } from '../../context/themeContext';

// logos
import LogoDark  from '../../assets/svg/dark.svg';
import LogoLight from '../../assets/svg/light.svg';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      try {
        await authService.initialize();
        if (authService.isAuthenticated()) {
          router.replace('/(tabs)/home');
          Toast.show({
            type: 'success',
            text1: 'Connexion réussie',
            text2: 'Bienvenue sur Planify !',
            position: 'bottom',
            visibilityTime: 3000,
          });
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[LoginScreen] Initialization error:', error);
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: "Erreur d'initialisation",
          text2: "Impossible d'initialiser l'application",
          position: 'bottom',
          visibilityTime: 3000,
        });
      }
    };
    initializeApp();
    return () => {
      authService.cleanup();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await authService.authenticate();
      Toast.show({
        type: 'success',
        text1: 'Connexion réussie',
        text2: 'Vous êtes maintenant connecté à Trello',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('[LoginScreen] Authentication error:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur de connexion',
        text2: 'Impossible de se connecter à Trello',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  const dynamicContainer = {
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
  };
  
  const dynamicLoadingText = {
    color: theme === 'dark' ? '#aaa' : '#666',
  };

  if (isLoading) {
    return (
      <View style={[styles.container, dynamicContainer]}>
        <ActivityIndicator size="large" color="#4d8aff" />
        <Text style={[styles.loadingText, dynamicLoadingText]}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicContainer]}>
      {theme === 'dark' ? (
        <LogoDark width={300} height={300} />
      ) : (
        <LogoLight width={300} height={300} />
      )}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Ionicons name="log-in-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Se connecter avec Trello</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#4d8aff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
  },
});
