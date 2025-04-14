import React, { useEffect, useState, useContext } from 'react';

// react-native
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';

// expo
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// components
import { WorkspaceCard } from './WorkspaceCard';
import { CreateWorkspaceModal } from './modals/CreateWorkspaceModal';

// services
import { Workspace } from '@/services/workspacesService';
import { useWorkspacesStore } from '../../stores/workspacesStore';

// context
import { ThemeContext } from '../../context/themeContext';

export default function WorkspacesScreen() {
  const {
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace,
    deleteWorkspace,
  } = useWorkspacesStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreateWorkspace = async (name: string, description: string) => {
    await createWorkspace(name, description);
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    await deleteWorkspace(workspaceId);
  };

  if (loading && workspaces.length === 0) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5' },
        ]}>
        <ActivityIndicator size="large" color="#0079BF" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5' },
        ]}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchWorkspaces}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5' }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme === 'dark' ? '#2a2a2a' : 'white',
            borderBottomColor: theme === 'dark' ? '#333' : '#e5e5e5',
          },
        ]}>
        <Text style={[styles.title, { color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a' }]}>
          Vos espaces de travail
        </Text>
        <Pressable
           style={({ pressed }) => [
            styles.createButton,
            pressed && styles.pressed,
            { backgroundColor: theme === "dark" ? "#66afe9" : "#0079BF" },
          ]}
          onPress={() => setIsModalVisible(true)}>
          <Ionicons name="add" size={20} color="white" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {workspaces.map((workspace: Workspace) => (
          <WorkspaceCard
            key={workspace.id}
            workspace={workspace}
            onPress={() => router.push(`/workspace/${workspace.id}` as any)}
            onDelete={() => handleDeleteWorkspace(workspace.id)}
          />
        ))}
      </ScrollView>

      <CreateWorkspaceModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateWorkspace}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pressed: {
    opacity: 0.7,
  },
  createButton: {
    backgroundColor: '#0079BF',
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0079BF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
