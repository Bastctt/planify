import React, { useState, useContext } from 'react';

// react-native
import { View, Text, StyleSheet, Pressable } from 'react-native';

// expo
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// store & service
import { useWorkspacesStore } from '../../stores/workspacesStore';
import { Workspace } from '../../services/workspacesService';

// hooks
import ConfirmModal from '../../hooks/ConfirmModal';

// components
import EditWorkspaceModal from './modals/EditWorkspaceModal';

// context
import { ThemeContext } from '../../context/themeContext';

interface WorkspaceCardProps {
  workspace: Workspace;
  onPress: () => void;
  onDelete: () => void;
}

export function WorkspaceCard({ workspace, onPress, onDelete }: WorkspaceCardProps) {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const updateWorkspace = useWorkspacesStore((state) => state.updateWorkspace);
  const { theme } = useContext(ThemeContext);

  const handleEditSubmit = async (name: string, description: string) => {
    await updateWorkspace(workspace.id, { displayName: name, desc: description });
    setEditModalVisible(false);
  };

  const handleDeleteConfirm = async () => {
    onDelete();
    setConfirmModalVisible(false);
  };

  const dynamicContainerStyle = {
    backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
    borderLeftColor: theme === 'dark' ? '#66afe9' : '#0079BF',
  };

  const dynamicTitleStyle = {
    color: theme === 'dark' ? '#e0e0e0' : '#333',
  };

  const dynamicDescriptionStyle = {
    color: theme === 'dark' ? '#cccccc' : '#666',
  };

  const dynamicNoDescriptionStyle = {
    color: theme === 'dark' ? '#aaaaaa' : '#aaa',
  };

  // Styles dynamiques pour les boutons d'action
  const dynamicIconButtonStyle = {
    backgroundColor: theme === 'dark' ? '#444' : '#f2f2f2',
  };

  const dynamicIconColor = theme === 'dark' ? '#66afe9' : '#0079BF';

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          dynamicContainerStyle,
          pressed && styles.pressed,
        ]}
        onPress={onPress}>
        <View style={styles.content}>
          <Text style={[styles.title, dynamicTitleStyle]}>
            {workspace.displayName || workspace.name}
          </Text>
          {workspace.desc ? (
            <Text style={[styles.description, dynamicDescriptionStyle]}>
              {workspace.desc}
            </Text>
          ) : (
            <Text style={[styles.noDescription, dynamicNoDescriptionStyle]}>
              Aucune description
            </Text>
          )}
        </View>
        <View style={styles.actionButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              dynamicIconButtonStyle,
              pressed && styles.pressed,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              setEditModalVisible(true);
            }}>
            <MaterialCommunityIcons
              name="circle-edit-outline"
              size={18}
              color={dynamicIconColor}
            />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              dynamicIconButtonStyle,
              pressed && styles.pressed,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              setConfirmModalVisible(true);
            }}>
            <Ionicons
              name="trash-outline"
              size={18}
              color="#ff4d4d"
            />
          </Pressable>
        </View>
      </Pressable>

      <EditWorkspaceModal
        visible={editModalVisible}
        initialName={workspace.displayName || workspace.name}
        initialDescription={workspace.desc || ''}
        onClose={() => setEditModalVisible(false)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmModal
        visible={confirmModalVisible}
        title="Confirmation"
        message="Êtes-vous sûr de vouloir supprimer cet espace de travail ?"
        onCancel={() => setConfirmModalVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  noDescription: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
  },
});
