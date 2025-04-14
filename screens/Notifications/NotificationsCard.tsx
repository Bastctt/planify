import React, { useContext } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ThemeContext } from '@/context/themeContext';

interface NotificationsCardProps {
  notificationId: string;
  title: string;
  description: string;
  changedElement?: string;
  deepLink?: string;
  isUnread?: boolean;
  onNotificationRead?: () => void;
}

export function NotificationsCard({
  notificationId,
  title,
  description,
  changedElement,
  deepLink,
  isUnread = true,
  onNotificationRead,
}: NotificationsCardProps) {
  const { theme } = useContext(ThemeContext);

  const handlePressDeepLink = async () => {
    try {
      if (onNotificationRead) onNotificationRead();
      if (deepLink) router.push(deepLink as any);
    } catch (error) {
      console.error('Erreur lors du traitement de la notification:', error);
    }
  };

  const dynamicCardStyle = {
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
    borderLeftColor: theme === 'dark' ? '#66afe9' : '#0079BF',
  };

  const dynamicTextColor = {
    title: { color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a' },
    description: { color: theme === 'dark' ? '#ccc' : '#333' },
    changed: { color: theme === 'dark' ? '#aaa' : '#555' },
    link: { color: theme === 'dark' ? '#66afe9' : '#0079BF' },
  };

  return (
    <View style={[styles.card, isUnread && styles.unreadCard, dynamicCardStyle]}>
      {isUnread && <View style={styles.unreadIndicator} />}

      <Text style={[styles.title, dynamicTextColor.title]}>{title}</Text>
      <Text style={[styles.description, dynamicTextColor.description]}>{description}</Text>
      {changedElement && <Text style={[styles.changedElement, dynamicTextColor.changed]}>{changedElement}</Text>}
      {deepLink && (
        <Pressable
          onPress={handlePressDeepLink}
          style={({ pressed }) => [
            styles.linkContainer,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.link, dynamicTextColor.link]}>Voir la modification</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  unreadCard: {
    borderLeftWidth: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0079BF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  changedElement: {
    fontSize: 12,
    marginBottom: 12,
  },
  linkContainer: {
    alignSelf: 'flex-start',
    marginTop: 8,
    padding: 4,
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: '#f0f0f0',
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NotificationsCard;
