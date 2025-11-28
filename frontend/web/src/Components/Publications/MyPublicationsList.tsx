import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

type Props = {
  idEdit: number | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditarPublicacionModal({ idEdit, onClose, onSaved }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [habilidadesBuscadas, setHabilidadesBuscadas] = useState("");
  const [habilidadesOfrecidas, setHabilidadesOfrecidas] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!idEdit) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken"); // o AsyncStorage en móvil
        const { data } = await axios.get(`http://127.0.0.1:8000/publicaciones/${idEdit}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTitulo(data.titulo || "");
        setDescripcion(data.descripcion || "");
        setHabilidadesBuscadas((data.habilidades_buscadas || []).join(", "));
        setHabilidadesOfrecidas((data.habilidades_ofrecidas || []).join(", "));
      } catch (err) {
        console.error("Error al cargar publicación:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idEdit]);

  const handleSave = async () => {
    if (!idEdit) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken"); // o AsyncStorage en móvil
      const payload = {
        titulo,
        descripcion,
        habilidades_buscadas: habilidadesBuscadas
          .split(",")
          .map((h) => h.trim())
          .filter((h) => h.length > 0),
        habilidades_ofrecidas: habilidadesOfrecidas
          .split(",")
          .map((h) => h.trim())
          .filter((h) => h.length > 0),
      };

      // PATCH para actualización parcial
      await axios.patch(`http://127.0.0.1:8000/publicaciones/${idEdit}/editar/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSaved();
    } catch (err) {
      console.error("Error al editar publicación:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!idEdit) return null;

  return (
    <Modal visible={!!idEdit} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>Editar publicación</Text>
          <ScrollView>
            <TextInput
              style={styles.input}
              placeholder="Título"
              placeholderTextColor="#bbb"
              value={titulo}
              onChangeText={setTitulo}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              placeholderTextColor="#bbb"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Habilidades buscadas (separadas por coma)"
              placeholderTextColor="#bbb"
              value={habilidadesBuscadas}
              onChangeText={setHabilidadesBuscadas}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Habilidades ofrecidas (separadas por coma)"
              placeholderTextColor="#bbb"
              value={habilidadesOfrecidas}
              onChangeText={setHabilidadesOfrecidas}
              multiline
            />
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.purpleButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.purpleButton} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#2E2E48",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    height: "85%",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 15 },
  input: {
    backgroundColor: "#1A1A2E",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  purpleButton: {
    backgroundColor: "#8A4FFF",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
