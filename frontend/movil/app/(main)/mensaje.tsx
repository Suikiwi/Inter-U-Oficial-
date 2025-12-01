import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatScreen from "../components/chat"; // Chat como componente (no ruta)

type ChatResumen = {
  id_chat: number;
  titulo: string;
  estado_intercambio: boolean;
  autor_alias?: string;
  ultimo_mensaje?: string;
  actualizado_en?: string;
};

const API_BASE_URL = "http://192.168.1.12:8000";

export default function MensajesScreen() {
  const [chats, setChats] = useState<ChatResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  const fetchChats = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("No hay token de acceso");

      const response = await axios.get<ChatResumen[]>(`${API_BASE_URL}/chats/mios/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data ?? [];
      const ordered = [...data].sort((a, b) => {
        if (a.actualizado_en && b.actualizado_en) {
          return new Date(b.actualizado_en).getTime() - new Date(a.actualizado_en).getTime();
        }
        return 0;
      });

      setChats(ordered);
    } catch (error: any) {
      console.error("Error al cargar chats:", error);
      setErrorMsg("No se pudieron cargar tus chats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const renderItem = ({ item }: { item: ChatResumen }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.titulo} numberOfLines={1}>
          {item.autor_alias ? `${item.autor_alias} — ${item.titulo}` : item.titulo}
        </Text>
        <Text style={styles.estado}>
          {item.estado_intercambio ? " Finalizado" : " En curso"}
        </Text>
        {item.ultimo_mensaje && (
          <Text style={styles.ultimo} numberOfLines={1}>
            Último: {item.ultimo_mensaje}
          </Text>
        )}
      </View>
      <TouchableOpacity style={styles.boton} onPress={() => setSelectedChatId(item.id_chat)}>
        <Text style={styles.botonTexto}>Abrir</Text>
      </TouchableOpacity>
    </View>
  );

  // Si hay un chat seleccionado, renderiza ChatScreen directamente (opción 2)
  if (selectedChatId) {
    return <ChatScreen id={selectedChatId} onClose={() => setSelectedChatId(null)} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTexto}>Historial de chats</Text>
        <TouchableOpacity style={styles.refresh} onPress={fetchChats}>
          <Text style={styles.refreshTexto}>Refrescar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#8A4FFF" />
      ) : errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : chats.length === 0 ? (
        <Text style={styles.vacio}>No hay chats disponibles.</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item, index) =>
            item.id_chat ? String(item.id_chat) : `chat-${index}`
          }
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  headerTexto: { fontSize: 20, fontWeight: "bold", color: "#8A4FFF" },
  refresh: {
    backgroundColor: "#2E2E48",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshTexto: { color: "#fff", fontSize: 12 },
  error: { color: "#FBBF24", fontSize: 13 },
  vacio: { color: "#94A3B8", fontSize: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E2E48",
    padding: 12,
    borderRadius: 10,
  },
  titulo: { fontSize: 16, fontWeight: "600", color: "#fff" },
  estado: { fontSize: 12, color: "#aaa", marginTop: 2 },
  ultimo: { fontSize: 12, color: "#94A3B8", marginTop: 4 },
  boton: {
    backgroundColor: "#8A4FFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  botonTexto: { color: "#fff", fontWeight: "bold", fontSize: 12 },
});
