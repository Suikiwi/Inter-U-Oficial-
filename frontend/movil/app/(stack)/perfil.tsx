import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView 
} from "react-native";
import { useRouter } from "expo-router";
import { getUserInfo, logoutUser } from "../api";
import EditProfileModal from "../components/editarperfil"; // 👈 importa tu modal

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false); // 👈 estado para abrir/cerrar modal
  
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserInfo();
        setUser(data);
      } catch (err: any) {
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/login");
  };

  const handleUpdateProfile = async (data: Partial<any>) => {
    // Aquí llamas a tu API para actualizar perfil
    console.log("Datos actualizados:", data);
    // Opcional: refrescar perfil
    setUser({ ...user, ...data });
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
      <View style={styles.header}>
        <Text style={styles.title}>Inter-U</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

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
        <Text style={styles.email}>{user?.email}</Text>

        {/* Botón para abrir modal */}
        <TouchableOpacity 
          onPress={() => setShowEditModal(true)} 
          style={styles.editButton}
        >
          <Text style={styles.editText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Información completa</Text>
        <Text style={styles.info}>📧 Email: {user?.email}</Text>
        <Text style={styles.info}>🎓 Carrera: {user?.carrera}</Text>
        <Text style={styles.info}>📚 Área: {user?.area}</Text>
        <Text style={styles.info}>
          ✅ Tipo de usuario: {user?.is_admin_interu ? "Administrador" : "Estudiante"}
        </Text>
      </View>

      {/* Modal de edición */}
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
  errorText: { color: "red", fontSize: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#8A4FFF" },
  logoutButton: { backgroundColor: "#FF5252", padding: 10, borderRadius: 8 },
  logoutText: { color: "#fff", fontWeight: "bold" },
  profileCard: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#333", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  avatarText: { fontSize: 40, color: "#fff" },
  name: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  carrera: { fontSize: 16, color: "#ccc", marginBottom: 5 },
  email: { fontSize: 14, color: "#aaa" },
  infoCard: { backgroundColor: "#2E2E48", padding: 15, borderRadius: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  info: { fontSize: 14, color: "#ccc", marginBottom: 5 },
  editButton: { backgroundColor: "#8A4FFF", padding: 12, borderRadius: 8, marginTop: 10 },
  editText: { color: "#fff", fontWeight: "bold" }
});
