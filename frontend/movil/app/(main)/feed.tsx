import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { obtenerPublicacionesGlobal } from "../api"; // 👈 función que trae todas las publicaciones
import { getPerfil } from "../api"; // 👈 para obtener el usuario actual
import type { Publication } from "../../src/types";

export default function FeedScreen() {
  const [publicaciones, setPublicaciones] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. obtener perfil del usuario
        const perfil = await getPerfil();
        setUserId(perfil.estudiante); // 👈 tu backend devuelve el id del usuario en perfil

        // 2. obtener publicaciones globales
        const data = await obtenerPublicacionesGlobal();

        // 3. filtrar solo las de otros usuarios
        const filtradas = data.filter((p: Publication) => p.estudiante !== perfil.estudiante);
        setPublicaciones(filtradas);
      } catch (err) {
        console.error("Error al cargar feed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feed de Publicaciones</Text>
      {loading ? (
        <ActivityIndicator color="#8A4FFF" />
      ) : (
        <FlatList
          data={publicaciones}
          keyExtractor={(item) => item.id_publicacion.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.descripcion}>{item.descripcion}</Text>
              <Text style={styles.habilidades}>
                Habilidades: {item.habilidades_buscadas.join(", ")}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#8A4FFF", marginBottom: 20 },
  card: { backgroundColor: "#2E2E48", padding: 15, borderRadius: 8, marginBottom: 10 },
  titulo: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  descripcion: { fontSize: 14, color: "#ccc", marginTop: 5 },
  habilidades: { fontSize: 12, color: "#aaa", marginTop: 5 },
});
