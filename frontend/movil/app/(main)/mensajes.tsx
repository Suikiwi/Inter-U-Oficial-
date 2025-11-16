import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";

interface Chat {
  id: string;
  titulo: string;
  ultimo: string;
}

interface Mensaje {
  id: number;
  texto: string;
  remitente: "yo" | "otro";
}

export default function MensajesScreen() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const chats: Chat[] = [
    { id: "1", titulo: "Chat con María", ultimo: "Hola, ¿cómo estás?" },
    { id: "2", titulo: "Chat con Pedro", ultimo: "Nos vemos mañana" },
    { id: "3", titulo: "Chat con Ana", ultimo: "Gracias por tu ayuda!" },
  ];

  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { id: 1, texto: "Hola, ¿cómo estás?", remitente: "otro" },
    { id: 2, texto: "Muy bien, ¿y tú?", remitente: "yo" },
  ]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  // 🔹 Estado para modal de calificación
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState<number>(0);

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim()) return;
    const nuevo: Mensaje = {
      id: Date.now(),
      texto: nuevoMensaje,
      remitente: "yo",
    };
    setMensajes((prev) => [...prev, nuevo]);
    setNuevoMensaje("");
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => setSelectedChat(item)}
    >
      <Text style={styles.chatTitle}>{item.titulo}</Text>
      <Text style={styles.chatPreview}>{item.ultimo}</Text>
    </TouchableOpacity>
  );

  const renderMensajeItem = ({ item }: { item: Mensaje }) => (
    <View style={item.remitente === "yo" ? styles.myBubble : styles.otherBubble}>
      <Text style={styles.text}>{item.texto}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        {!selectedChat ? (
          <>
            <Text style={styles.sectionTitle}>Mis Conversaciones</Text>
            <FlatList
              data={chats}
              keyExtractor={(item) => item.id}
              renderItem={renderChatItem}
            />
          </>
        ) : (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setSelectedChat(null)}>
                <Text style={styles.backButton}>← Volver</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{selectedChat.titulo}</Text>
            </View>

            <FlatList
              data={mensajes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMensajeItem}
              contentContainerStyle={{ padding: 10 }}
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={nuevoMensaje}
                onChangeText={setNuevoMensaje}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#888"
              />
              <TouchableOpacity onPress={enviarMensaje} style={styles.sendButton}>
                <Text style={styles.sendText}>Enviar</Text>
              </TouchableOpacity>
            </View>

            {/* 🔹 Botón Finalizar intercambio */}
            <TouchableOpacity
              style={styles.finishButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.finishText}>Finalizar intercambio</Text>
            </TouchableOpacity>

            {/* 🔹 Modal de calificación */}
            <Modal
              visible={modalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Califica el intercambio</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                      >
                        <Text
                          style={[
                            styles.star,
                            rating >= star ? styles.starSelected : null,
                          ]}
                        >
                          ★
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                      setModalVisible(false);
                      setSelectedChat(null); // 👈 cerrar chat y volver a lista
                    }}
                  >
                    <Text style={styles.closeText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E" },
  sectionTitle: { fontSize: 22, fontWeight: "bold", color: "#8A4FFF", margin: 20 },
  chatCard: { backgroundColor: "#2E2E48", padding: 15, borderRadius: 8, marginBottom: 10, marginHorizontal: 20 },
  chatTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  chatPreview: { fontSize: 14, color: "#ccc", marginTop: 5 },
  header: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#2E2E48" },
  backButton: { color: "#8A4FFF", fontSize: 16, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  myBubble: { alignSelf: "flex-end", backgroundColor: "#8A4FFF", padding: 10, borderRadius: 8, marginVertical: 5, maxWidth: "70%" },
  otherBubble: { alignSelf: "flex-start", backgroundColor: "#2E2E48", padding: 10, borderRadius: 8, marginVertical: 5, maxWidth: "70%" },
  text: { color: "#fff" },
  inputContainer: { flexDirection: "row", padding: 10, backgroundColor: "#2E2E48" },
  input: { flex: 1, backgroundColor: "#333", color: "#fff", padding: 10, borderRadius: 8 },
  sendButton: { marginLeft: 10, backgroundColor: "#8A4FFF", padding: 10, borderRadius: 8 },
  sendText: { color: "#fff", fontWeight: "bold" },
  finishButton: { margin: 15, backgroundColor: "#FF4F81", padding: 12, borderRadius: 8, alignItems: "center" },
  finishText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#2E2E48", padding: 20, borderRadius: 10, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 15 },
  starsRow: { flexDirection: "row", marginBottom: 20 },
  star: { fontSize: 30, color: "#888", marginHorizontal: 5 },
  starSelected: { color: "#FFD700" },
  closeButton: { backgroundColor: "#8A4FFF", padding: 10, borderRadius: 8 },
  closeText: { color: "#fff", fontWeight: "bold" },
});
