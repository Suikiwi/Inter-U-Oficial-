import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { getMisPublicaciones, eliminarPublicacion } from "../api";
import type { Publication } from "../../src/types";
import EditarPublicacionModal from "./editarpublicacionmodal";

export default function MisPublicaciones() {
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);

  const fetchMisPublicaciones = async () => {
    try {
      setLoading(true);
      const data = await getMisPublicaciones();
      setItems(data);
    } catch (err) {
      console.error("Error al cargar publicaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisPublicaciones();
  }, []);

  const handleDelete = async (id: number) => {
    Alert.alert("Eliminar publicación", "¿Seguro que deseas eliminar esta publicación?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await eliminarPublicacion(id);
            setItems((prev) => prev.filter((p) => p.id_publicacion !== id));
            Alert.alert( "Publicación eliminada correctamente");
          } catch (e) {
            Alert.alert("Error", "No se pudo eliminar la publicación.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Mis publicaciones</Text>

      {loading && <ActivityIndicator color="#8A4FFF" />}

      {!loading && items.length === 0 && (
        <Text style={styles.empty}>No tienes publicaciones aún.</Text>
      )}

      {!loading &&
        items.map((item) => (
          <View key={item.id_publicacion} style={styles.card}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.descripcion}>{item.descripcion}</Text>
            <Text style={styles.habilidades}>
              Habilidades buscadas: {item.habilidades_buscadas?.join(", ") || "—"}
            </Text>
            <Text style={styles.habilidades}>
              Habilidades ofrecidas: {item.habilidades_ofrecidas?.join(", ") || "—"}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setSelectedPub(item)}>
                <Text style={styles.actionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id_publicacion)}>
                <Text style={styles.actionText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

      {selectedPub && (
        <EditarPublicacionModal
          publicacion={selectedPub}
          onClose={() => setSelectedPub(null)}
          onUpdated={async () => {
            setSelectedPub(null);
            await fetchMisPublicaciones();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#8A4FFF", marginBottom: 10 },
  empty: { color: "#ccc", textAlign: "center", marginTop: 10 },
  card: { backgroundColor: "#2E2E48", padding: 15, borderRadius: 8, marginBottom: 10 },
  titulo: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  descripcion: { fontSize: 14, color: "#ccc", marginTop: 5 },
  habilidades: { fontSize: 12, color: "#aaa", marginTop: 5 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  actionText: { color: "#8A4FFF", fontWeight: "bold" },
});
