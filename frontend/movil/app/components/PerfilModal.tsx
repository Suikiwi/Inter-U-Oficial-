
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  id: number; // ID del usuario (estudiante) del autor
  onClose: () => void;
};

const API_BASE_URL = "http://192.168.1.12:8000";

export default function PerfilModal({ id, onClose }: Props) {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchPerfil = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const { data } = await axios.get(
          `${API_BASE_URL}/perfiles/usuario/${id}/`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
        );
        if (!mounted) return;
        setPerfil(data);
      } catch (err) {
        console.error("Error al cargar perfil:", err);
        if (!mounted) return;
        setPerfil(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPerfil();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {loading ? (
          <ActivityIndicator color="#8A4FFF" />
        ) : !perfil ? (
          <Text style={styles.error}>No se pudo cargar el perfil.</Text>
        ) : (
          <ScrollView>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.alias}>
              {perfil.alias || `${perfil.nombre} ${perfil.apellido}`}
            </Text>

            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>
              {perfil.nombre} {perfil.apellido}
            </Text>

            <Text style={styles.label}>Carrera:</Text>
            <Text style={styles.value}>{perfil.carrera}</Text>

            <Text style={styles.label}>Área:</Text>
            <Text style={styles.value}>{perfil.area}</Text>

            <Text style={styles.label}>Biografía:</Text>
            <Text style={styles.value}>{perfil.biografia || "—"}</Text>

            <Text style={styles.label}>Habilidades ofrecidas:</Text>
            <Text style={styles.value}>
              {perfil.habilidades_ofrecidas?.join(", ") || "—"}
            </Text>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#2E2E48",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "85%",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 12,
    zIndex: 10,
  },
  closeText: {
    fontSize: 20,
    color: "#C084FC",
    fontWeight: "bold",
  },
  alias: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 10,
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
    color: "#fff",
    marginTop: 2,
  },
  error: {
    color: "#f87171",
    fontSize: 14,
    textAlign: "center",
  },
});
