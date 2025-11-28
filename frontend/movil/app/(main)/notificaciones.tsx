import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  getNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from "../api";

type Notificacion = {
  id_notificacion: number;
  mensaje: string;
  tipo: string;
  fecha: string;
  leida: boolean;
};

export default function NotificacionesScreen() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const fetchNotificaciones = async () => {
    try {
      const data: Notificacion[] = await getNotificaciones();
      setNotificaciones(data);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
      setError("Error al cargar notificaciones.");
    } finally {
      setCargando(false);
    }
  };

  const marcarLeida = async (id: number) => {
    try {
      await marcarNotificacionLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id_notificacion === id ? { ...n, leida: true } : n))
      );
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  const marcarTodas = async () => {
    try {
      await marcarTodasNotificacionesLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (err) {
      console.error("Error al marcar todas como leídas:", err);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  if (cargando) return <ActivityIndicator color="#8A4FFF" style={{ marginTop: 20 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificaciones</Text>

      {notificaciones.length === 0 ? (
        <Text style={styles.empty}>No tienes notificaciones.</Text>
      ) : (
        <>
          <TouchableOpacity onPress={marcarTodas} style={styles.markAll}>
            <Text style={styles.markAllText}>Marcar todas como leídas</Text>
          </TouchableOpacity>

          <FlatList
            data={notificaciones}
            keyExtractor={(item) => String(item.id_notificacion)}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.card,
                  item.leida ? styles.cardLeida : styles.cardNoLeida,
                ]}
              >
                <Text style={styles.mensaje}>{item.mensaje}</Text>
                <Text style={styles.fecha}>{new Date(item.fecha).toLocaleString()}</Text>
                {!item.leida && (
                  <TouchableOpacity
                    onPress={() => marcarLeida(item.id_notificacion)}
                    style={styles.markOne}
                  >
                    <Text style={styles.markOneText}>Marcar como leída</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#8A4FFF", marginBottom: 20 },
  empty: { color: "#aaa", textAlign: "center", marginTop: 20 },
  error: { color: "#F87171", textAlign: "center", marginTop: 20 },
  markAll: { backgroundColor: "#8A4FFF", padding: 10, borderRadius: 8, marginBottom: 15 },
  markAllText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  card: { padding: 15, borderRadius: 8, marginBottom: 10 },
  cardLeida: { backgroundColor: "#2E2E48" },
  cardNoLeida: { backgroundColor: "#3B2C59" },
  mensaje: { color: "#fff", fontSize: 14 },
  fecha: { color: "#aaa", fontSize: 12, marginTop: 4 },
  markOne: { backgroundColor: "#8A4FFF", padding: 8, borderRadius: 6, marginTop: 8 },
  markOneText: { color: "#fff", fontSize: 12, textAlign: "center" },
});
