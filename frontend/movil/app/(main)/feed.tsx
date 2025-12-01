import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import {
  obtenerPublicacionesGlobal,
  getPerfil,
  iniciarChat,
  eliminarPublicacion,
} from "../api.js";
import ChatScreen from "../components/chat";
import EditarPublicacionModal from "../components/editarpublicacionmodal";
import CrearReporteModal from "../components/CrearReporteModal";
import PerfilModal from "../components/PerfilModal";

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

export default function FeedScreen() {
  const [publicaciones, setPublicaciones] = useState<Publication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);

  const [chatId, setChatId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [editPub, setEditPub] = useState<Publication | null>(null);
  const [reporteContext, setReporteContext] = useState<{ publicacionId?: number } | null>(null);
  const [perfilId, setPerfilId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const perfil = await getPerfil();
        const estudianteId =
          typeof perfil.estudiante === "number"
            ? perfil.estudiante
            : perfil.estudiante?.id ?? perfil.estudiante_id;
        setUserId(estudianteId ?? null);

        const data: Publication[] = await obtenerPublicacionesGlobal();
        setPublicaciones(data);
      } catch (err) {
        console.error("Error al cargar feed:", err);
        Alert.alert("Error", "No se pudo cargar el feed.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEliminar = async (id_publicacion: number) => {
    try {
      await eliminarPublicacion(id_publicacion);
      setPublicaciones((prev) => prev.filter((p) => p.id_publicacion !== id_publicacion));
      Alert.alert("Éxito", "Publicación eliminada.");
    } catch (error) {
      console.error("Error al eliminar publicación:", error);
      Alert.alert("Error", "No se pudo eliminar la publicación.");
    }
  };

  const handleIniciarChat = async (id_publicacion: number) => {
    try {
      const chat = await iniciarChat(id_publicacion);
      const cid = chat.id_chat ?? chat.id ?? null;
      if (!cid) {
        Alert.alert("Error", "No se pudo abrir el chat.");
        return;
      }
      setChatId(cid);
    } catch (err) {
      console.error("Error al iniciar chat:", err);
      Alert.alert("Error", "No se pudo iniciar el chat.");
    }
  };

  const handleEditarClick = (item: Publication) => {
    setEditPub(item);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditPub(null);
  };

  const handleEditUpdated = (updated?: Publication) => {
    if (updated && updated.id_publicacion) {
      setPublicaciones((prev) =>
        prev.map((p) => (p.id_publicacion === updated.id_publicacion ? { ...p, ...updated } : p))
      );
    }
    handleEditClose();
  };

  const renderItem = ({ item }: { item: Publication }) => {
    const esPropietario = userId === item.estudiante;
    const fecha = item.fecha_creacion ? new Date(item.fecha_creacion) : null;

    return (
      <View style={styles.card}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.meta}>
          Publicado por{" "}
          <TouchableOpacity onPress={() => setPerfilId(item.estudiante)}>
            <Text style={styles.alias}>{item.autor_alias || "—"}</Text>
          </TouchableOpacity>{" "}
          {fecha &&
            `el ${fecha.toLocaleDateString()} a las ${fecha.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`}
        </Text>

        <Text style={styles.descripcion}>{item.descripcion || "Sin descripción"}</Text>
        <Text style={styles.habilidades}>
          Habilidades buscadas: {item.habilidades_buscadas?.join(", ") || "—"}
        </Text>
        <Text style={styles.habilidades}>
          Habilidades ofrecidas: {item.habilidades_ofrecidas?.join(", ") || "—"}
        </Text>

        <View style={styles.buttonRow}>
          {esPropietario ? (
            <>
              <TouchableOpacity style={styles.purpleButton} onPress={() => handleEditarClick(item)}>
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.purpleButton}
                onPress={() => handleEliminar(item.id_publicacion)}
              >
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.purpleButton}
                onPress={() => handleIniciarChat(item.id_publicacion)}
              >
                <Text style={styles.buttonText}>Iniciar chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.purpleButton}
                onPress={() => setReporteContext({ publicacionId: Number(item.id_publicacion) })}
              >
                <Text style={styles.buttonText}>Reportar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feed de Publicaciones</Text>
      {loading ? (
        <ActivityIndicator color="#8A4FFF" />
      ) : (
        <FlatList<Publication>
          data={publicaciones}
          keyExtractor={(item) => String(item.id_publicacion)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Chat modal */}
      <Modal visible={chatId !== null} animationType="slide">
        {chatId && <ChatScreen id={chatId} onClose={() => setChatId(null)} />}
      </Modal>

      {/* Editar publicación */}
      {editPub && (
        <EditarPublicacionModal
          isOpen={editOpen}
          publicacion={editPub}
          onClose={handleEditClose}
          onUpdated={handleEditUpdated}
        />
      )}

      {/* Reporte modal */}
      <Modal visible={reporteContext !== null} animationType="slide">
        {reporteContext && (
          <CrearReporteModal
            context={reporteContext}
            onClose={() => setReporteContext(null)}
          />
        )}
      </Modal>

      {/* Perfil modal */}
      <Modal visible={perfilId !== null} animationType="fade" transparent>
        {perfilId && <PerfilModal id={perfilId} onClose={() => setPerfilId(null)} />}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8A4FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  card: { backgroundColor: "#2E2E48", padding: 15, borderRadius: 10, marginBottom: 15 },
  titulo: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  meta: { fontSize: 12, color: "#aaa", marginTop: 4 },
  alias: { color: "#C084FC", fontWeight: "600" },
  descripcion: { fontSize: 14, color: "#ccc", marginTop: 5 },
  habilidades: { fontSize: 12, color: "#aaa", marginTop: 4 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  purpleButton: {
    flex: 1,
    backgroundColor: "#8A4FFF",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
