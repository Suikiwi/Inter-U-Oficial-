import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import api, { getPerfil, updatePerfil, logoutUser } from "../api";

import EditProfileModal from "../components/editarperfil";
import MisPublicaciones from "../components/mispublicaciones";

interface Calificacion {
  id_calificacion: number;
  puntaje: number;
  comentario: string;
  fecha: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchProfileAndRatings = async () => {
      try {
        const data = await getPerfil(); // PerfilCompletoSerializer
        setUser(data);

        if (data?.id_perfil) {
          const res = await api.get<Calificacion[]>(`/perfil/${data.id_perfil}/calificaciones/`);
          setCalificaciones(res.data);
        }
      } catch (err: any) {
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndRatings();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/login");
  };

  const handleUpdateProfile = async (data: Partial<any>) => {
    try {
      const updatedUser = await updatePerfil(data);
      setUser(updatedUser);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8A4FFF" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <TouchableOpacity style={styles.purpleButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Tarjeta de perfil */}
      <View style={styles.profileCard}>
        {user?.foto ? (
          <Image source={{ uri: user.foto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        )}

        <Text style={styles.name}>
          {user?.alias || `${user?.nombre || ""} ${user?.apellido || ""}`.trim() || "Estudiante"}
        </Text>
        <Text style={styles.carrera}>{user?.carrera || "Carrera no especificada"}</Text>

        <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.purpleButton}>
          <Text style={styles.buttonText}>Editar perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Información completa */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Información completa</Text>
        <Text style={styles.info}>Carrera: {user?.carrera}</Text>
        <Text style={styles.info}>Área: {user?.area}</Text>
        <Text style={styles.info}>Biografía: {user?.biografia}</Text>

        {/* Habilidades ofrecidas */}
        {user?.habilidades_ofrecidas?.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.sectionTitle}>Habilidades ofrecidas</Text>
            {user.habilidades_ofrecidas.map((h: string, index: number) => (
              <Text key={index} style={styles.info}>• {h}</Text>
            ))}
          </View>
        )}
      </View>

      {/* Calificaciones recibidas */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Calificaciones recibidas</Text>
        {calificaciones.length === 0 ? (
          <Text style={styles.info}>Aún no has recibido calificaciones.</Text>
        ) : (
          calificaciones.map((c) => (
            <View key={c.id_calificacion} style={styles.calificacionItem}>
              <Text style={styles.info}>
                {"⭐".repeat(c.puntaje)} ({new Date(c.fecha).toLocaleDateString()})
              </Text>
              {c.comentario && <Text style={styles.info}>{c.comentario}</Text>}
            </View>
          ))
        )}
      </View>

      {/* Publicaciones del usuario */}
      <MisPublicaciones />

      {/* Modal de edición de perfil */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        perfil={user}
        onSave={handleUpdateProfile}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1A1A2E" },
  loadingText: { color: "#fff", marginTop: 10 },
  errorText: { color: "#F87171", fontSize: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#8A4FFF" },
  profileCard: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#333", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  avatarText: { fontSize: 40, color: "#fff" },
  name: { fontSize: 20, fontWeight: "bold", color: "#fff", textAlign: "center" },
  carrera: { fontSize: 16, color: "#ccc", marginBottom: 5, textAlign: "center" },
  infoCard: { backgroundColor: "#2E2E48", padding: 15, borderRadius: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  info: { fontSize: 14, color: "#ccc", marginBottom: 5 },
  purpleButton: {
    backgroundColor: "#8A4FFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  calificacionItem: { marginBottom: 10 },
});
