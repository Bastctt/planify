import React, { useEffect, useState, useContext } from "react";

// react-native
import {
	Modal,
	View,
	Text,
	TextInput,
	StyleSheet,
	Pressable,
	TouchableWithoutFeedback,
	Keyboard,
	ScrollView,
} from "react-native";

// expo
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// store
import { useTemplatesStore } from "@/stores/templatesStore";

// utils
import { GRADIENT_OPTIONS } from "@/utils/boardColors";

// context
import { ThemeContext } from "../../../context/themeContext";

// components
import { Dropdown } from "@/screens/Cards/components/Dropdown";
interface GradientOption {
	id: string;
	name: string;
	colors: [string, string];
	backgroundColor: string;
}

interface CreateBoardModalProps {
	visible: boolean;
	onClose: () => void;
	onSubmit: (
		name: string,
		description: string,
		workspaceId?: string,
		prefs?: any,
		templateOptions?: { templateId: string; keepCards: boolean }
	) => void;
}

export function CreateBoardModal({
	visible,
	onClose,
	onSubmit,
}: CreateBoardModalProps) {
	const { theme } = useContext(ThemeContext);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [selectedGradient, setSelectedGradient] =
		useState<GradientOption | null>(null);
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
		null
	);
	const [keepCards, setKeepCards] = useState(true);
	const { templates, fetchTemplates } = useTemplatesStore();

	const gradientOptions: GradientOption[] = Object.keys(GRADIENT_OPTIONS).map(
		(key) => ({
			id: key,
			name: key.charAt(0).toUpperCase() + key.slice(1),
			colors: GRADIENT_OPTIONS[key].colors,
			backgroundColor: GRADIENT_OPTIONS[key].backgroundColor,
		})
	);

	const handleSubmit = () => {
		if (name.trim()) {
			const prefs = selectedGradient
				? {
						background: selectedGradient.id,
						backgroundColor: selectedGradient.backgroundColor,
				  }
				: undefined;
			const templateOptions = selectedTemplateId
				? { templateId: selectedTemplateId, keepCards }
				: undefined;
			onSubmit(
				name.trim(),
				description.trim(),
				undefined,
				prefs,
				templateOptions
			);
			setName("");
			setDescription("");
			setSelectedGradient(null);
			setSelectedTemplateId(null);
			onClose();
		}
	};

	useEffect(() => {
		if (visible) {
			fetchTemplates();
		}
	}, [visible, fetchTemplates]);

	// Styles dynamiques selon le thème
	const dynamicModalView = {
		backgroundColor: theme === "dark" ? "#2a2a2a" : "white",
	};
	const dynamicTitle = {
		color: theme === "dark" ? "#e0e0e0" : "#000",
	};
	const dynamicInput = {
		backgroundColor: theme === "dark" ? "#3a3a3a" : "white",
		color: theme === "dark" ? "#e0e0e0" : "#000",
		borderColor: theme === "dark" ? "#555" : "#ddd",
	};
	const dynamicColorTitle = {
		color: theme === "dark" ? "#e0e0e0" : "#000",
	};
	const dynamicCancelButton = {
		backgroundColor: theme === "dark" ? "#555" : "#f5f5f5",
	};
	const dynamicCancelButtonText = {
		color: theme === "dark" ? "#e0e0e0" : "#666",
	};
	const dynamicSubmitButton = {
		backgroundColor: theme === "dark" ? "#66afe9" : "#0079BF",
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View style={styles.centeredView}>
					<TouchableWithoutFeedback onPress={() => {}}>
						<View style={[styles.modalView, dynamicModalView]}>
							<Text style={[styles.title, dynamicTitle]}>
								Nouveau tableau
							</Text>
							<TextInput
								style={[styles.input, dynamicInput]}
								placeholder="Nom du tableau"
								placeholderTextColor={theme === "dark" ? "#aaa" : "#666"}
								value={name}
								onChangeText={setName}
							/>
							<TextInput
								style={[styles.input, styles.textArea, dynamicInput]}
								placeholder="Description (optionnel)"
								placeholderTextColor={theme === "dark" ? "#aaa" : "#666"}
								value={description}
								onChangeText={setDescription}
								multiline
								numberOfLines={3}
							/>
							<Text style={[styles.colorTitle, dynamicColorTitle]}>
								Couleur du tableau
							</Text>
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.gradientContainer}
							>
								{gradientOptions.map((option) => (
									<Pressable
										key={option.id}
										onPress={() => setSelectedGradient(option)}
										style={styles.gradientOption}
									>
										<View
											style={[
												styles.gradientWrapper,
												selectedGradient?.id === option.id &&
													styles.selectedGradientWrapper,
											]}
										>
											<LinearGradient
												colors={option.colors}
												start={{ x: 0, y: 0 }}
												end={{ x: 1, y: 1 }}
												style={styles.gradientSwatch}
											/>
											{selectedGradient?.id === option.id && (
												<View style={styles.checkmarkContainer}>
													<Ionicons
														name="checkmark-circle"
														size={22}
														color="white"
													/>
												</View>
											)}
										</View>
									</Pressable>
								))}
							</ScrollView>
							<Text style={[styles.colorTitle, dynamicColorTitle]}>
								Modèle de tableau (optionnel)
							</Text>
							<Dropdown
								selectedValue={selectedTemplateId || ""}
								onValueChange={(value) =>
									setSelectedTemplateId(
										value === "" ? null : value
									)
								}
								options={[
									{ label: "Aucun", value: "" },
									...templates.map((template) => ({
										label: template.name,
										value: template.id,
									})),
								]}
							/>
							{selectedTemplateId && (
								<View style={styles.optionContainer}>
									<Text style={[styles.optionText, dynamicColorTitle]}>
										Conserver les cartes
									</Text>
									<Pressable
										style={[
											styles.checkbox,
											keepCards && styles.checkboxChecked,
										]}
										onPress={() => setKeepCards(!keepCards)}
									>
										{keepCards && (
											<Ionicons
												name="checkmark"
												size={16}
												color="white"
											/>
										)}
									</Pressable>
								</View>
							)}
							<View style={styles.buttonContainer}>
								<Pressable
									style={[styles.button, styles.cancelButton, dynamicCancelButton]}
									onPress={onClose}
								>
									<Text style={[styles.cancelButtonText, dynamicCancelButtonText]}>
										Annuler
									</Text>
								</Pressable>
								<Pressable
									style={[
										styles.button,
										styles.submitButton,
										dynamicSubmitButton,
										!name.trim() && styles.disabledButton,
									]}
									onPress={handleSubmit}
									disabled={!name.trim()}
								>
									<Text style={styles.submitButtonText}>
										Créer
									</Text>
								</Pressable>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalView: {
		borderRadius: 12,
		padding: 20,
		width: "90%",
		maxWidth: 400,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	title: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 20,
		textAlign: "center",
	},
	colorTitle: {
		fontSize: 14,
		fontWeight: "500",
		marginBottom: 10,
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
		fontSize: 14,
	},
	textArea: { height: 100, textAlignVertical: "top" },
	gradientContainer: {
		flexDirection: "row",
		marginBottom: 20,
		paddingBottom: 5,
	},
	gradientOption: { marginRight: 10, alignItems: "center", width: 60 },
	gradientWrapper: { padding: 2, borderRadius: 10, marginBottom: 5 },
	selectedGradientWrapper: { backgroundColor: "#0079BF", padding: 3 },
	gradientSwatch: {
		width: 50,
		height: 50,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ddd",
	},
	checkmarkContainer: {
		position: "absolute",
		bottom: -5,
		right: -5,
		backgroundColor: "transparent",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
	},
	button: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 5 },
	disabledButton: { backgroundColor: "#cccccc", opacity: 0.7 },
	cancelButton: {},
	submitButton: {},
	cancelButtonText: {
		textAlign: "center",
		fontSize: 14,
		fontWeight: "600",
	},
	submitButtonText: {
		color: "white",
		textAlign: "center",
		fontSize: 14,
		fontWeight: "600",
	},
	templateContainer: {
		flexDirection: "row",
		marginBottom: 16,
	},
	templateOption: {
		marginRight: 10,
		paddingHorizontal: 15,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: "#f0f0f0",
		borderWidth: 1,
		borderColor: "#ddd",
	},
	selectedTemplateOption: {
		backgroundColor: "#0079BF",
		borderColor: "#0079BF",
	},
	templateText: {
		fontSize: 14,
		color: "#333",
	},
	optionContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 16,
		paddingVertical: 5,
	},
	optionText: {
		fontSize: 14,
		color: "#333",
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: "#ccc",
		backgroundColor: "#f5f5f5",
		alignItems: "center",
		justifyContent: "center",
	},
	checkboxChecked: {
		backgroundColor: "#0079BF",
		borderColor: "#0079BF",
	},
});
