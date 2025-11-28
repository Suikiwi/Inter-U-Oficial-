import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { editarPublicacion } from "../api";

type Publication = {
  id_publicacion: number;
  estudiante: number;
  titulo: string;
  descripcion?: string;
  habilidades_buscadas?: string[];
  habilidades_ofrecidas?: string[];
  autor_alias?: string;
  fecha_creacion?: string;
};

interface Props {
  publicacion: Publication;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditarPublicacionModal({
  publicacion,
  onClose,
  onUpdated,
}: Props) {
  const [titulo, setTitulo] = useState(publicacion.titulo);
  const [descripcion, setDescripcion] = useState(publicacion.descripcion || "");
  const [habilidadesText, setHabilidadesText] = useState(
    publicacion.habilidades_buscadas?.join(", ") || ""
  );

  const handleSave = async () => {
    try {
      const habilidades_buscadas = habilidadesText
        .split(",")
        .map((s: string) => s.trim()) 
        .filter((s: string) => s.length > 0);

      await editarPublicacion(publicacion.id_publicacion, {
        titulo,
        descripcion,
        habilidades_buscadas,
      });

      Alert.alert( "Publicación actualizada correctamente");
      onUpdated();
    } catch (error) {
      console.error("Error al editar publicación:", error);
      Alert.alert("Error", "No se pudo editar la publicación.");
    }
  };

  return (
    <Modal visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Editar Publicación</Text>

        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Título"
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Descripción"
          placeholderTextColor="#888"
          multiline
        />
        <TextInput
          style={styles.input}
          value={habilidadesText}
          onChangeText={setHabilidadesText}
          placeholder="Habilidades (coma)"
          placeholderTextColor="#888"
          multiline
        />

        <View style={styles.actions}>
          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.save}>
            <Text style={styles.saveText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#8A4FFF", marginBottom: 20 },
  input: {
    backgroundColor: "#2E2E48",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  cancel: { backgroundColor: "#555", padding: 12, borderRadius: 8 },
  cancelText: { color: "#fff" },
  save: { backgroundColor: "#8A4FFF", padding: 12, borderRadius: 8 },
  saveText: { color: "#fff", fontWeight: "bold" },
});
