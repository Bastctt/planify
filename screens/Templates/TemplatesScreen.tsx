import React, { useEffect, useContext } from "react";

// reat-native
import Toast from "react-native-toast-message";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";

// expo
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Store
import { useTemplatesStore, Template } from "@/stores/templatesStore";

// Utilitaires
import { formatDate } from "@/utils/dateUtils";

// Importation du ThemeContext
import { ThemeContext } from "../../context/themeContext";

export default function TemplatesScreen() {
  const { templates, loading, error, fetchTemplates, removeTemplate } = useTemplatesStore();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleRemoveTemplate = async (templateId: string, templateName: string) => {
    try {
      await removeTemplate(templateId);
      Toast.show({
        type: "success",
        text1: "Template supprimé",
        text2: `"${templateName}" a été supprimé de vos templates`,
        position: "bottom",
        visibilityTime: 3000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: "Impossible de supprimer ce template",
        position: "bottom",
        visibilityTime: 3000,
      });
    }
  };

  // Styles dynamiques en fonction du thème
  const dynamicContainer = {
    backgroundColor: theme === "dark" ? "#1a1a1a" : "#f5f5f5",
  };

  const dynamicHeader = {
    backgroundColor: theme === "dark" ? "#2a2a2a" : "white",
    borderBottomColor: theme === "dark" ? "#444" : "#e5e5e5",
  };

  const dynamicTitle = {
    color: theme === "dark" ? "#e0e0e0" : "#1a1a1a",
  };

  const dynamicBackIcon = {
    color: theme === "dark" ? "#66afe9" : "#0079BF",
  };

  const dynamicTemplateCard = {
    backgroundColor: theme === "dark" ? "#2a2a2a" : "white",
    borderLeftColor: theme === "dark" ? "#66afe9" : "#0079BF",
  };

  const dynamicTemplateName = {
    color: theme === "dark" ? "#e0e0e0" : "#333",
  };

  const dynamicTemplateDescription = {
    color: theme === "dark" ? "#ccc" : "#666",
  };

  const dynamicTemplateDate = {
    color: theme === "dark" ? "#aaa" : "#999",
  };

  const renderTemplateItem = ({ item }: { item: Template }) => (
    <View style={[styles.templateCard, dynamicTemplateCard]}>
      <View style={styles.templateInfo}>
        <Text style={[styles.templateName, dynamicTemplateName]}>{item.name}</Text>
        {item.description && (
          <Text style={[styles.templateDescription, dynamicTemplateDescription]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={[styles.templateDate, dynamicTemplateDate]}>
          Enregistré le {formatDate(new Date(item.createdAt))}
        </Text>
      </View>
      <Pressable style={styles.deleteButton} onPress={() => handleRemoveTemplate(item.id, item.name)}>
        <Ionicons name="trash-outline" size={18} color="#ff4d4d" />
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, dynamicContainer]}>
      <View style={[styles.header, dynamicHeader]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={dynamicBackIcon.color} />
        </Pressable>
        <Text style={[styles.title, dynamicTitle]}>Modèles de tableaux</Text>
        <View style={styles.placeholder} />
      </View>

      {templates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Vous n'avez pas encore de modèles enregistrés.
          </Text>
          <Text style={styles.emptySubtext}>
            Pour enregistrer un tableau comme modèle, appuyez sur l'icône de sauvegarde dans la carte du tableau.
          </Text>
        </View>
      ) : (
        <FlatList
          data={templates}
          renderItem={renderTemplateItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Couleur définie dynamiquement
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    backgroundColor: "white",
    borderBottomWidth: 1,
    // BorderBottomColor défini dynamiquement
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    // Couleur définie dynamiquement
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    maxWidth: "80%",
  },
  templateCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    // BorderLeftColor défini dynamiquement
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    // Couleur définie dynamiquement
  },
  templateDescription: {
    fontSize: 14,
    marginBottom: 8,
    // Couleur définie dynamiquement
  },
  templateDate: {
    fontSize: 12,
    // Couleur définie dynamiquement
  },
  deleteButton: {
    justifyContent: "center",
    padding: 8,
  },
});
