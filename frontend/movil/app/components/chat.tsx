import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getChatById,
  enviarMensaje,
  calificarChat,
  completarIntercambio,
} from "../api";

type Mensaje = {
  id: number;
  texto: string;
  autor_alias?: string;
  fecha_creacion?: string;
  estudiante?: number;
};

type ChatInfo = {
  id_chat: number;
  estado_intercambio: boolean;
  titulo?: string;
  autor_alias?: string;
  mensajes?: Mensaje[];
};

type ChatScreenProps = {
  id: number;
  onClose: () => void;
};

export default function ChatScreen({ id, onClose }: ChatScreenProps) {
  const [loading, setLoading] = useState(true);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [estado, setEstado] = useState<"pendiente" | "realizado" | "calificado">("pendiente");
  const [puntaje, setPuntaje] = useState<number | null>(null);
  const listRef = useRef<FlatList<Mensaje>>(null);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const data = await getChatById(Number(id));
        setChatInfo(data);
        setMensajes(Array.isArray(data?.mensajes) ? data.mensajes : []);
        const uid = await AsyncStorage.getItem("userId");
        if (uid) setUserId(Number(uid));
        setEstado(data?.estado_intercambio ? "realizado" : "pendiente");
      } catch (e) {
        console.error("Error cargando chat:", e);
        Alert.alert("Error", "No se pudo cargar el chat.");
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [id]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [mensajes.length]);

  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !id) return;
    try {
      const msg = await enviarMensaje(Number(id), nuevoMensaje);
      setMensajes((prev) => [...prev, msg]);
      setNuevoMensaje("");
    } catch (e) {
      console.error("Error enviando mensaje:", e);
      Alert.alert("Error", "No se pudo enviar el mensaje.");
    }
  };

  const marcarComoRealizado = async () => {
    try {
      await completarIntercambio(Number(id));
      setEstado("realizado");
      Alert.alert("Intercambio marcado como realizado");
    } catch (e) {
      console.error("Error al marcar como realizado:", e);
      Alert.alert("Error", "No tienes permiso para completar este intercambio.");
    }
  };

  const enviarCalificacion = async (p: number) => {
    try {
      await calificarChat(Number(id), p, "");
      setPuntaje(p);
      setEstado("calificado");
      Alert.alert("Calificación registrada");
    } catch (e) {
      console.error("Error al calificar:", e);
      Alert.alert("Error", "Ya has calificado este chat o no tienes permiso.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#8A4FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.title}>{chatInfo?.titulo || `Chat #${id}`}</Text>
          {chatInfo?.autor_alias && <Text style={styles.alias}>Con {chatInfo.autor_alias}</Text>}
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={mensajes}
        keyExtractor={(m, index) => (m.id ? String(m.id) : `msg-${index}`)}
        renderItem={({ item }) => {
          const esMio = userId === item.estudiante;
          return (
            <View style={[styles.msgRow, esMio ? styles.msgRight : styles.msgLeft]}>
              <View style={[styles.msgBubble, esMio ? styles.msgMine : styles.msgOther]}>
                <Text style={styles.msgAuthor}>
                  {esMio ? "Yo" : item.autor_alias || `User ${item.estudiante}`}
                </Text>
                <Text style={styles.msgText}>{item.texto}</Text>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 180 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={nuevoMensaje}
          onChangeText={setNuevoMensaje}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#888"
          onSubmitEditing={handleEnviarMensaje}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleEnviarMensaje}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#2E2E48", borderRadius: 8 },
  backText: { color: "#fff", fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "bold", color: "#8A4FFF" },
  alias: { fontSize: 14, color: "#C084FC", marginTop: 4 },
  msgRow: { flexDirection: "row", marginBottom: 10 },
  msgLeft: { justifyContent: "flex-start" },
  msgRight: { justifyContent: "flex-end" },
  msgBubble: { padding: 10, borderRadius: 10, maxWidth: "70%" },
  msgMine: { backgroundColor: "#8A4FFF" },
  msgOther: { backgroundColor: "#2E2E48" },
  msgAuthor: { fontWeight: "bold", color: "#fff" },
  msgText: { color: "#fff", marginTop: 2 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E2E48",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  input: { flex: 1, color: "#fff", paddingVertical: 6 },
  sendButton: {
    backgroundColor: "#8A4FFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
});
