import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView 
} from "react-native";
import { useRouter } from "expo-router";
import { crearPublicacion } from "../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NuevaPublicacionScreen() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [habilidadesText, setHabilidadesText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const estudiante = await AsyncStorage.getItem("userId");
      if (!estudiante) {
        alert("No se pudo obtener tu ID de usuario. Intenta iniciar sesión nuevamente.");
        setSaving(false);
        return;
      }

      const habilidades_buscadas = habilidadesText
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);

      const payload = { titulo, descripcion, habilidades_buscadas, estudiante };

      const nueva = await crearPublicacion(payload); // backend devuelve la publicación creada

      alert(" Publicación creada correctamente");

      // Navegar de vuelta y pasar la nueva publicación
      router.push({
        pathname: "/feed", // o "/perfil" si quieres refrescar tus publicaciones
        params: { nuevaPublicacion: JSON.stringify(nueva) }
      });
    } catch (error) {
      console.error("Error al crear publicación:", error);
      alert("No se pudo crear la publicación");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nueva Publicación</Text>

      <TextInput
        style={styles.input}
        placeholder="Título *"
        placeholderTextColor="#888"
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Descripción"
        placeholderTextColor="#888"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Habilidades buscadas (separadas por coma) *"
        placeholderTextColor="#888"
        value={habilidadesText}
        onChangeText={setHabilidadesText}
        multiline
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit} 
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Crear Publicación</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#8A4FFF", marginBottom: 20 },
  input: {
    backgroundColor: "#2E2E48",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#8A4FFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
