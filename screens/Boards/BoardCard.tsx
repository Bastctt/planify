import React, { useEffect, useState } from "react";

// expo
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// react-native
import { View, Text, StyleSheet, Pressable } from "react-native";
import Toast from "react-native-toast-message";

// hooks
import ConfirmModal from "@/hooks/ConfirmModal";

// components
import EditBoardModal from "./modals/EditBoardModal";

// store
import { useBoardsStore } from "@/stores/boardsStore";
import { useTemplatesStore } from "@/stores/templatesStore";

// utils
import { getBoardGradientColors } from "@/utils/boardColors";

export interface Board {
	id: string;
	name: string;
	desc: string;
	prefs: {
		background?: string;
		backgroundColor?: string;
		backgroundImage?: string | null;
	};
}

interface BoardCardProps {
	board: Board;
	onDelete: () => void;
}

export function BoardCard({ board, onDelete }: BoardCardProps) {
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [confirmModalVisible, setConfirmModalVisible] = useState(false);
	const updateBoard = useBoardsStore((state) => state.updateBoard);

	const { templates } = useTemplatesStore();
	const [isTemplate, setIsTemplate] = useState(false);

	const handleEditSubmit = async (
		name: string,
		description: string,
		prefs?: any
	) => {
		const updatedPrefs = prefs ? { ...board.prefs, ...prefs } : board.prefs;
		await updateBoard(board.id, {
			name,
			desc: description,
			prefs: updatedPrefs,
		});
		setEditModalVisible(false);
	};

	const handleDeleteConfirm = async () => {
		onDelete();
		setConfirmModalVisible(false);
	};

	const handleSaveAsTemplate = async () => {
		try {
			const result = await useTemplatesStore
				.getState()
				.addTemplate(board.id, board.name, board.desc);
			// Afficher une notification en fonction du résultat
			Toast.show({
				type: result.success ? "success" : "info",
				text1: result.success ? "Modèle enregistré" : "Information",
				text2: result.message,
				position: "bottom",
				visibilityTime: 3000,
			});
		} catch (error) {
			console.error(
				"Erreur lors de l'enregistrement du template :",
				error
			);
			Toast.show({
				type: "error",
				text1: "Erreur",
				text2: "Impossible d'enregistrer ce tableau comme modèle",
				position: "bottom",
				visibilityTime: 3000,
			});
		}
	};

	// Récupère les couleurs à partir des préférences du board
	const colors: [string, string] = getBoardGradientColors(board.prefs);

	useEffect(() => {
		setIsTemplate(templates.some((t) => t.id === board.id));
	}, [templates, board.id]);

	return (
		<>
			<Pressable
				disabled={confirmModalVisible || editModalVisible}
				style={({ pressed }) => [
					styles.pressable,
					pressed && styles.pressed,
				]}
				onPress={() => router.push(`/board/${board.id}`)}
			>
				<LinearGradient
					colors={colors}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.container}
				>
					<View style={styles.header}>
						<Text style={styles.title}>{board.name}</Text>
					</View>
					{board.desc ? (
						<Text style={styles.description}>{board.desc}</Text>
					) : (
						<Text style={styles.noDescription}>
							Aucune description
						</Text>
					)}
					<View style={styles.actionButtons}>
						<Pressable
							style={styles.iconButton}
							onPress={(e) => {
								e.stopPropagation();
								if (e.preventDefault) e.preventDefault();

								if (isTemplate) {
									// Si c'est déjà un template, on le supprime
									useTemplatesStore
										.getState()
										.removeTemplate(board.id);
									Toast.show({
										type: "success",
										text1: "Modèle supprimé",
										text2: `"${board.name}" n'est plus un modèle`,
										position: "bottom",
										visibilityTime: 3000,
									});
								} else {
									// Sinon on l'ajoute
									handleSaveAsTemplate();
								}
							}}
						>
							<MaterialCommunityIcons
								name={
									isTemplate
										? "content-save-check-outline"
										: "content-save-outline"
								}
								size={18}
								color="white"
							/>
						</Pressable>
						<Pressable
							style={styles.iconButton}
							onPress={(e) => {
								e.stopPropagation();
								if (e.preventDefault) e.preventDefault();
								setEditModalVisible(true);
							}}
						>
							<MaterialCommunityIcons
								name="circle-edit-outline"
								size={18}
								color="white"
							/>
						</Pressable>
						<Pressable
							style={styles.iconButton}
							onPress={(e) => {
								e.stopPropagation();
								if (e.preventDefault) e.preventDefault();
								setConfirmModalVisible(true);
							}}
						>
							<Ionicons
								name="trash-outline"
								size={18}
								color="white"
							/>
						</Pressable>
					</View>
				</LinearGradient>
			</Pressable>

			<EditBoardModal
				visible={editModalVisible}
				initialName={board.name}
				initialDescription={board.desc || ""}
				initialBackground={board.prefs?.background}
				onClose={() => setEditModalVisible(false)}
				onSubmit={handleEditSubmit}
			/>

			<ConfirmModal
				visible={confirmModalVisible}
				title="Confirmation"
				message="Êtes-vous sûr de vouloir supprimer ce tableau ?"
				onCancel={() => setConfirmModalVisible(false)}
				onConfirm={handleDeleteConfirm}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	pressable: { marginBottom: 16 },
	container: {
		borderRadius: 16,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 5,
	},
	pressed: { opacity: 0.9 },
	header: { marginBottom: 8 },
	title: { fontSize: 16, fontWeight: "700", color: "#fff" },
	description: { fontSize: 14, color: "#f0f0f0", marginBottom: 12 },
	noDescription: {
		fontSize: 14,
		color: "#f0f0f0",
		fontStyle: "italic",
		marginBottom: 12,
	},
	actionButtons: {
		flexDirection: "row",
		justifyContent: "flex-end",
		marginTop: 8,
	},
	iconButton: {
		marginLeft: 12,
		backgroundColor: "rgba(255,255,255,0.3)",
		padding: 8,
		borderRadius: 8,
	},
});
