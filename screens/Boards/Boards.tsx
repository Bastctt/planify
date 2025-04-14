import React, { useEffect, useState, useContext } from "react";

// react-native
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";

// expo
import { router, useGlobalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// components
import { BoardCard } from "./BoardCard";
import { CreateBoardModal } from "./modals/CreateBoardModal";

// store
import { useBoardsStore } from "@/stores/boardsStore";
import { useWorkspacesStore } from "@/stores/workspacesStore";

// context
import { ThemeContext } from "../../context/themeContext";

export default function BoardsScreen() {
  const { theme } = useContext(ThemeContext);
  const params = useGlobalSearchParams();
  const workspaceId = params.workspaceId as string;
  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    boards,
    loading,
    error,
    fetchBoards,
    createBoard,
    deleteBoard,
    setCurrentWorkspace,
    hasFetched
  } = useBoardsStore();
  const { workspaces } = useWorkspacesStore();
  const currentWorkspace = workspaces.find((ws) => ws.id === workspaceId);

  useEffect(() => {
    if (workspaceId) {
      setCurrentWorkspace(workspaceId);
      if (!hasFetched) {
        fetchBoards(workspaceId);
      }
    }
  }, [workspaceId, hasFetched]);

  const handleCreateBoard = async (
    name: string,
    description: string,
    workspaceId?: string,
    prefs?: any,
    templateOptions?: { templateId: string; keepCards: boolean }
  ) => {
    await createBoard(name, description, undefined, prefs, templateOptions);
    setIsModalVisible(false);
  };

  const handleDeleteBoard = async (boardId: string) => {
    await deleteBoard(boardId);
  };

  if (loading && boards.length === 0) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: theme === "dark" ? "#1a1a1a" : "#f5f5f5" },
        ]}
      >
        <ActivityIndicator size="large" color="#0079BF" />
      </View>
    );
  }

  if (error && boards.length === 0) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: theme === "dark" ? "#1a1a1a" : "#f5f5f5" },
        ]}
      >
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => fetchBoards(workspaceId)}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  // Styles dynamiques en fonction du thème
  const dynamicContainerStyle = {
    backgroundColor: theme === "dark" ? "#1a1a1a" : "#f5f5f5",
  };
  const dynamicHeaderStyle = {
    backgroundColor: theme === "dark" ? "#2a2a2a" : "white",
    borderBottomColor: theme === "dark" ? "#444" : "#e5e5e5",
  };
  const dynamicTitleStyle = {
    color: theme === "dark" ? "#e0e0e0" : "#1a1a1a",
  };

  return (
    <View style={[styles.container, dynamicContainerStyle]}>
      <View style={[styles.header, dynamicHeaderStyle]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme === "dark" ? "#66afe9" : "#0079BF"}
          />
        </Pressable>
        <Text style={[styles.title, dynamicTitleStyle]}>
          {currentWorkspace ? currentWorkspace.displayName : "Tableaux"}
        </Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={styles.templateButton}
            onPress={() => router.push("/templates")}
          >
            <MaterialCommunityIcons
              name="content-save-outline"
              size={20}
              color={theme === "dark" ? "#66afe9" : "#0079BF"}
            />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              pressed && styles.pressed,
              { backgroundColor: theme === "dark" ? "#66afe9" : "#0079BF" },
            ]}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {boards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucun tableau disponible. Créez-en un pour commencer.
            </Text>
          </View>
        ) : (
          boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onDelete={() => handleDeleteBoard(board.id)}
            />
          ))
        )}
      </ScrollView>

      <CreateBoardModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleCreateBoard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  backButton: { padding: 8 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    flex: 1,
    textAlign: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  templateButton: {
    marginRight: 12,
    padding: 6,
  },
  createButton: {
    backgroundColor: "#0079BF",
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: { opacity: 0.7 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorText: { color: "#ff4444", fontSize: 16, marginBottom: 16 },
  retryButton: {
    backgroundColor: "#0079BF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  emptyContainer: { padding: 20, alignItems: "center" },
  emptyText: { color: "#666", fontSize: 16, textAlign: "center" },
});
