import React, { useContext } from 'react';

// expo
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// react-native
import Toast from 'react-native-toast-message';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// services
import { authService } from '../../services/authService';

// context
import { ThemeContext } from '../../context/themeContext';

// logos
import LogoDark from '../../assets/svg/dark.svg';
import LogoLight from '../../assets/svg/light.svg';

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { theme, themeMode, setThemeMode } = useContext(ThemeContext);

  const handleLogout = async (): Promise<void> => {
    try {
      await authService.logout();
      Toast.show({
        type: 'success',
        text1: 'Déconnexion réussie',
        text2: 'Vous avez été déconnecté avec succès',
        position: 'bottom',
        visibilityTime: 3000,
      });
      router.replace('/');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'La déconnexion a échoué, veuillez réessayer',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  const toggleTheme = (): void => {
    if (themeMode === 'system') {
      setThemeMode('light');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('system');
    }
  };

  const getThemeIconName = (): 'moon' | 'sunny' | 'settings-outline' => {
    if (themeMode === 'dark') return 'moon';
    if (themeMode === 'light') return 'sunny';
    return 'settings-outline';
  };

  const darkBackground = '#1a1a1a';
  const darkTextColor = '#e0e0e0';

  const dynamicThemeButtonStyle = {
    backgroundColor: theme === 'dark' ? '#444' : '#ccc',
    borderWidth: theme === 'dark' ? 1 : 0,
    borderColor: theme === 'dark' ? '#666' : undefined,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? darkBackground : '#f5f5f5' }]}> 
      {theme === 'dark' ? (
        <LogoDark width={200} height={200} />
      ) : (
        <LogoLight width={200} height={200} />
      )}
      <TouchableOpacity style={[styles.themeButton, dynamicThemeButtonStyle]} onPress={toggleTheme}>
        <Ionicons
          name={getThemeIconName()}
          size={24}
          color={theme === 'dark' ? darkTextColor : '#000'}
        />
        <Text style={[styles.themeButtonText, { color: theme === 'dark' ? darkTextColor : '#000' }]}> 
          Mode {themeMode}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Ionicons
          name="log-out-outline"
          size={24}
          color="#fff"
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  themeButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  themeButtonText: {
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#ff4d4d',
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
});