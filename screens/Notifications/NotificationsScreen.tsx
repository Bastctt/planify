import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import NotificationsCard from './NotificationsCard';
import { notificationsService, Notification } from '../../services/notificationsService';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { ThemeContext } from '@/context/themeContext';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { fetchCount } = useNotificationsStore();
  const { theme } = useContext(ThemeContext);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getUnreadNotifications('me', 99);
      setNotifications(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    fetchCount();
    setRefreshing(false);
  }, [fetchCount]);

  const handleNotificationRead = useCallback(async (notificationId: string) => {
    const result = await notificationsService.markAsRead(notificationId);
    if (result.notification) {
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
      fetchCount();
    }
  }, [fetchCount]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const dynamicStyles = {
    container: {
      ...styles.container,
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
    },
    header: {
      ...styles.header,
      color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a',
    },
    emptyText: {
      ...styles.emptyText,
      color: theme === 'dark' ? '#aaa' : '#777',
    },
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: dynamicStyles.container.backgroundColor }]}>
        <ActivityIndicator size="large" color="#0055FF" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Notification }) => {
    const displayInfo = notificationsService.parseForDisplay(item);
    return (
      <NotificationsCard
        notificationId={item.id}
        title={displayInfo.title}
        description={displayInfo.description}
        changedElement={displayInfo.changedElement}
        deepLink={displayInfo.deepLink}
        isUnread={item.unread}
        onNotificationRead={() => handleNotificationRead(item.id)}
      />
    );
  };

  return (
    <View style={dynamicStyles.container}>
      <View style={styles.headerContainer}>
        <Text style={dynamicStyles.header}>Notifications</Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={dynamicStyles.emptyText}>Aucune notification non lue</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0055FF"]}
            />
          }
        />
      )}
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginTop: 48,
    marginBottom: 16,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});
