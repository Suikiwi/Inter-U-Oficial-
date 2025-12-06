import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

interface CrearReporteProps {
  context?: {
    chatId?: number;
    publicacionId?: number;
  };
  onClose: () => void;
}

const API_BASE_URL = "http://192.168.1.7:8000";

export default function CrearReporteModal({ context, onClose }: CrearReporteProps) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const crear = async () => {
    if (!motivo.trim()) return;
    try {
      const token = await AsyncStorage.getItem("accessToken");

      const publicacionId = context?.publicacionId ? Number(context.publicacionId) : undefined;
      const chatId = context?.chatId ? Number(context.chatId) : undefined;

      if (!publicacionId) {
        setError("No se pudo determinar la publicación a reportar.");
        return;
      }

      await axios.post(
        `${API_BASE_URL}/reportes/`,
        {
          motivo,
          chat: chatId,
          publicacion: publicacionId, // 👈 ahora sí se envía correctamente
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(true);
      setMotivo("");
      setError(null);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error("Error al crear reporte:", err);
      setError("No se pudo enviar el reporte.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo reporte</Text>
      {!success ? (
        <>
          <TextInput
            style={styles.input}
            value={motivo}
            onChangeText={setMotivo}
            placeholder="Describe el motivo del reporte..."
            placeholderTextColor="#888"
            multiline
          />
          <View style={styles.actions}>
            <TouchableOpacity onPress={crear} style={styles.purpleButton}>
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.purpleButton}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          {error && <Text style={styles.error}>{error}</Text>}
        </>
      ) : (
        <Text style={styles.success}>Reporte enviado correctamente</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", color: "#8A4FFF", marginBottom: 20, textAlign: "center" },
  input: {
    backgroundColor: "#2E2E48",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  purpleButton: {
    backgroundColor: "#8A4FFF",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  error: { color: "#F87171", marginTop: 10, textAlign: "center" },
  success: { color: "#34D399", marginTop: 10, textAlign: "center" },
});
