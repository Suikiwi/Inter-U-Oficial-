import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "../api";

export default function ActivateScreen() {
  const { uid, token } = useLocalSearchParams(); // expo-router captura parámetros
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleActivate = async () => {
    setLoading(true);
    try {
      await api.post("/auth/users/activation/", { uid, token });
      setMessage("Cuenta activada correctamente. Ya puedes iniciar sesión.");
    } catch (err: any) {
      setMessage("Error al activar la cuenta. El enlace puede haber expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activar Cuenta</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleActivate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Activar</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1A0736" },
  title: { fontSize: 24, color: "white", marginBottom: 20 },
  message: { color: "white", marginBottom: 20 },
  button: { backgroundColor: "#6C63FF", padding: 14, borderRadius: 8 },
  buttonText: { color: "white", fontWeight: "bold" }
});
