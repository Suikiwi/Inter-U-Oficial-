import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { obtenerPublicacionesGlobal, getPerfil, eliminarPublicacion } from "../api";
import CrearReporteModal from "../components/CrearReporteModal";
import EditarPublicacionModal from "../components/editarpublicacionmodal";
import ChatScreen from "../components/chat";

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

export default function BuscadorScreen() {
  const [publicaciones, setPublicaciones] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // filtros
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroHabilidad, setFiltroHabilidad] = useState("");

  // modales
  const [chatId, setChatId] = useState<number | null>(null);
  const [editPub, setEditPub] = useState<Publication | null>(null);
  const [reporteContext, setReporteContext] = useState<{ publicacionId?: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const perfil = await getPerfil();
        setUserId(perfil.estudiante);

        const data: Publication[] = await obtenerPublicacionesGlobal();
        setPublicaciones(data);
      } catch (err) {
        console.error("Error al cargar publicaciones:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // lógica de filtrado
  const publicacionesFiltradas = publicaciones.filter((p) => {
    const textoMatch =
      filtroTexto === "" ||
      p.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(filtroTexto.toLowerCase());

    const habilidadMatch =
      filtroHabilidad === "" ||
      p.habilidades_buscadas?.some((h) =>
        h.toLowerCase().includes(filtroHabilidad.toLowerCase())
      );

    return textoMatch && habilidadMatch;
  });

  const handleEliminar = async (id: number) => {
    try {
      await eliminarPublicacion(id);
      setPublicaciones((prev) => prev.filter((p) => p.id_publicacion !== id));
    } catch (error) {
      console.error("Error al eliminar publicación:", error);
    }
  };

  const renderItem = ({ item }: { item: Publication }) => {
    const esPropietario =
      userId !== null &&
      item.estudiante !== null &&
      String(userId).trim() === String(item.estudiante).trim();

    const fecha = item.fecha_creacion ? new Date(item.fecha_creacion) : null;

    return (
      <View style={styles.card}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <Text style={styles.meta}>
          Publicado por <Text style={styles.alias}>{item.autor_alias || "—"}</Text>{" "}
          {fecha && `el ${fecha.toLocaleDateString()} a las ${fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
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
              <TouchableOpacity style={styles.purpleButton} onPress={() => setEditPub(item)}>
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.purpleButton} onPress={() => handleEliminar(item.id_publicacion)}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.purpleButton} onPress={() => setChatId(item.id_publicacion)}>
                <Text style={styles.buttonText}>Iniciar chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.purpleButton}
                onPress={() => setReporteContext({ publicacionId: item.id_publicacion })}
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
      <Text style={styles.title}>Buscador de Publicaciones</Text>

      {/* Inputs de filtro */}
      <TextInput
        style={styles.input}
        placeholder="Buscar por título o descripción..."
        placeholderTextColor="#888"
        value={filtroTexto}
        onChangeText={setFiltroTexto}
      />
      <TextInput
        style={styles.input}
        placeholder="Filtrar por habilidad..."
        placeholderTextColor="#888"
        value={filtroHabilidad}
        onChangeText={setFiltroHabilidad}
      />

      {loading ? (
        <ActivityIndicator color="#8A4FFF" />
      ) : (
        <FlatList
          data={publicacionesFiltradas}
          keyExtractor={(item) => String(item.id_publicacion)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.empty}>No hay publicaciones aún.</Text>}
        />
      )}

      {/* Modales */}
      <Modal visible={chatId !== null} animationType="slide">
        {chatId && <ChatScreen id={chatId} onClose={() => setChatId(null)} />}
      </Modal>

      <Modal visible={editPub !== null} animationType="slide">
        {editPub && (
          <EditarPublicacionModal
            publicacion={editPub}
            onClose={() => setEditPub(null)}
            onUpdated={() => setEditPub(null)}
          />
        )}
      </Modal>

      <Modal visible={reporteContext !== null} animationType="slide">
        {reporteContext && (
          <CrearReporteModal
            context={reporteContext}
            onClose={() => setReporteContext(null)}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#8A4FFF", marginBottom: 20, textAlign: "center" },
  input: {
    backgroundColor: "#2E2E48",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
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
  empty: { color: "#aaa", textAlign: "center", marginTop: 20 },
});
