import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { getPublicacionById, editarPublicacion } from "../api";
import type { Publication } from "../../src/types";

interface Props {
  idEdit: number | null;   // 👈 ahora puede ser null
  onClose: () => void;
  onSaved: () => void;
}

export default function EditarPublicacionModal({ idEdit, onClose, onSaved }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [habilidadesText, setHabilidadesText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idEdit) return;
    const load = async () => {
      setLoading(true);
      try {
        const p: Publication = await getPublicacionById(idEdit);
        setTitulo(p.titulo);
        setDescripcion(p.descripcion);
        setHabilidadesText(p.habilidades_buscadas.join(", "));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idEdit]);

  const handleSave = async () => {
    if (!idEdit) return;
    const habilidades_buscadas = habilidadesText.split(",").map((s) => s.trim()).filter(Boolean);
    await editarPublicacion(idEdit, { titulo, descripcion, habilidades_buscadas });
    Alert.alert("✅", "Publicación actualizada correctamente");
    onSaved();
  };

  return (
    <Modal visible={!!idEdit} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Editar Publicación</Text>
        {loading ? (
          <ActivityIndicator color="#8A4FFF" />
        ) : (
          <>
            <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Título" />
            <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} placeholder="Descripción" multiline />
            <TextInput style={styles.input} value={habilidadesText} onChangeText={setHabilidadesText} placeholder="Habilidades (coma)" multiline />

            <View style={styles.actions}>
              <TouchableOpacity onPress={onClose} style={styles.cancel}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.save}>
                <Text style={styles.saveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#8A4FFF", marginBottom: 20 },
  input: { backgroundColor: "#2E2E48", color: "#fff", padding: 12, borderRadius: 8, marginBottom: 15 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  cancel: { backgroundColor: "#555", padding: 12, borderRadius: 8 },
  cancelText: { color: "#fff" },
  save: { backgroundColor: "#8A4FFF", padding: 12, borderRadius: 8 },
  saveText: { color: "#fff", fontWeight: "bold" },
});
