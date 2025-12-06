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
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getChatById,
  enviarMensaje,
  calificarChat,
  completarIntercambio,
} from "../api.js";

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

function RatingStars({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity key={s} onPress={() => onChange(s)}>
          <Text style={[styles.star, value && s <= value ? styles.starActive : styles.starInactive]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ChatScreen({ id, onClose }: ChatScreenProps) {
  const [loading, setLoading] = useState(true);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [estado, setEstado] = useState<"pendiente" | "realizado" | "calificado">("pendiente");

  // Calificación
  const [puntaje, setPuntaje] = useState<number | null>(null);
  const [comentario, setComentario] = useState<string>("");
  const [showCalificacion, setShowCalificacion] = useState(false);

  // WebSocket
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const listRef = useRef<FlatList<Mensaje>>(null);

  // Cargar chat inicial y estado
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const data = await getChatById(Number(id));
        setChatInfo(data);
        setMensajes(Array.isArray(data?.mensajes) ? data.mensajes : []);

        const uid = await AsyncStorage.getItem("userId");
        if (uid) setUserId(Number(uid));

        const current = data?.estado_intercambio ? "realizado" : "pendiente";
        setEstado(current);
        setShowCalificacion(current === "realizado");
      } catch {
        Alert.alert("Error", "No se pudo cargar el chat.");
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [id]);

  // Scroll al final al recibir nuevos mensajes
  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [mensajes.length]);

  // WebSocket en tiempo real
  useEffect(() => {
    const ws = new WebSocket(`ws://192.168.1.7:8000/ws/chat/${id}/`);

    ws.onopen = () => {
      console.log("Conectado al WebSocket móvil");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== "message") return;

      // Evita duplicados
      if (mensajes.some((m) => m.id === data.id_mensaje)) return;

      const nuevo: Mensaje = {
        id: data.id_mensaje,
        texto: data.texto,
        autor_alias: data.autor_alias || "Anónimo",
        fecha_creacion: data.fecha,
        estudiante: data.estudiante,
      };
      setMensajes((prev) => [...prev, nuevo]);
    };

    ws.onclose = (ev) => {
      console.log("WebSocket cerrado", ev.code, ev.reason);
    };

    setSocket(ws);
    return () => ws.close();
  }, [id, mensajes]);

  // Enviar mensaje
  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;
    try {
      const msg = await enviarMensaje(Number(id), nuevoMensaje);
      setMensajes((prev) => [...prev, msg]);
      setNuevoMensaje("");
      // No envíes nada por WS manualmente; el backend lo hace
    } catch {
      Alert.alert("Error", "No se pudo enviar el mensaje.");
    }
  };

  // Finalizar intercambio
  const marcarComoRealizado = async () => {
    try {
      const updated = await completarIntercambio(Number(id));
      setChatInfo((prev) => (prev ? { ...prev, ...updated } : updated));
      setEstado("realizado");
      setShowCalificacion(true);
    } catch {
      Alert.alert("Error", "No tienes permiso para completar este intercambio.");
    }
  };

  // Enviar calificación
  const enviarCalificacion = async () => {
    if (!puntaje || puntaje < 1 || puntaje > 5) {
      Alert.alert("Selecciona un puntaje entre 1 y 5");
      return;
    }
    try {
      await calificarChat(Number(id), puntaje, comentario);
      setEstado("calificado");
      setShowCalificacion(false);
      Alert.alert("Calificación registrada");
      onClose();
    } catch {
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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.title}>{chatInfo?.titulo || `Chat #${id}`}</Text>
            {chatInfo?.autor_alias && <Text style={styles.alias}>Con {chatInfo.autor_alias}</Text>}
            <Text style={styles.estado}>
              Estado: {estado === "pendiente" ? "En curso" : estado === "realizado" ? "Finalizado" : "Calificado"}
            </Text>
          </View>
        </View>

        {/* Mensajes */}
        <FlatList
          ref={listRef}
          data={mensajes}
          keyExtractor={(m, index) => (m.id ? String(m.id) : `msg-${index}`)}
          renderItem={({ item }) => {
            const esMio = userId === item.estudiante;
            return (
              <View style={[styles.msgRow, esMio ? styles.msgRight : styles.msgLeft]}>
                <View style={[styles.msgBubble, esMio ? styles.msgMine : styles.msgOther]}>
                  <Text style={styles.msgAuthor}>{esMio ? "Yo" : item.autor_alias || "Anónimo"}</Text>
                  <Text style={styles.msgText}>{item.texto}</Text>
                  {item.fecha_creacion && (
                    <Text style={styles.msgTime}>
                      {new Date(item.fecha_creacion).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            <View style={{ paddingVertical: 24 }}>
              <Text style={{ color: "#bbb", textAlign: "center" }}>Aún no hay mensajes en este chat.</Text>
            </View>
          }
        />

        {/* Input + enviar (solo en curso) */}
        {estado === "pendiente" && (
          <>
            <View style={styles.inputBar}>
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

            <View style={styles.footerBar}>
              <TouchableOpacity style={styles.primaryButton} onPress={marcarComoRealizado}>
                <Text style={styles.primaryButtonText}>Finalizar intercambio</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Modal de calificación */}
        <Modal
          visible={showCalificacion}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCalificacion(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Califica este intercambio</Text>

              <RatingStars value={puntaje} onChange={(v) => setPuntaje(v)} />
              <Text style={styles.modalHint}>Selecciona de 1 a 5 estrellas y comenta si quieres.</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Comentario (opcional)"
                placeholderTextColor="#888"
                value={comentario}
                onChangeText={setComentario}
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.primaryButton, styles.modalAction]} onPress={enviarCalificacion}>
                  <Text style={styles.primaryButtonText}>Guardar calificación</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryButton, styles.modalAction]}
                  onPress={() => setShowCalificacion(false)}
                >
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", padding: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#2E2E48", borderRadius: 8 },
  backText: { color: "#fff", fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "bold", color: "#8A4FFF" },
  alias: { fontSize: 14, color: "#C084FC", marginTop: 4 },
  estado: { fontSize: 12, color: "#aaa", marginTop: 2 },
  msgRow: { flexDirection: "row", marginBottom: 10 },
  msgLeft: { justifyContent: "flex-start" },
  msgRight: { justifyContent: "flex-end" },
  msgBubble: { padding: 10, borderRadius: 10, maxWidth: "70%" },
  msgMine: { backgroundColor: "#8A4FFF" },
  msgOther: { backgroundColor: "#2E2E48" },
  msgAuthor: { fontWeight: "bold", color: "#fff" },
  msgText: { color: "#fff", marginTop: 2 },
  msgTime: { color: "#ddd", fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E2E48",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
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
  footerBar: { marginTop: 8 },
  primaryButton: {
    backgroundColor: "#8A4FFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "bold" },
  secondaryButton: {
    backgroundColor: "#444",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#fff", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#2E2E48",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  modalHint: { color: "#bbb", fontSize: 12, textAlign: "center" },
  modalInput: {
    backgroundColor: "#1F1F33",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#fff",
    minHeight: 40,
  },
  modalActions: { flexDirection: "row", gap: 8, marginTop: 8 },
  modalAction: { flex: 1 },
  starsRow: { flexDirection: "row", justifyContent: "center", marginVertical: 8 },
  star: { fontSize: 28 },
  starActive: { color: "#8A4FFF" },
  starInactive: { color: "#666" },
});