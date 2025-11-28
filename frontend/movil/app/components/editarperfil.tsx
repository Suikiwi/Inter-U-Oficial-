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
import { Picker } from "@react-native-picker/picker";

type PerfilData = {
  nombre?: string;
  apellido?: string;
  alias?: string;
  carrera?: string;
  area?: string;
  biografia?: string;
  foto?: string;
  habilidades_ofrecidas?: string[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  perfil: PerfilData | null;
  onSave: (data: Partial<PerfilData>) => Promise<void>;
};

const CARRERAS = [
  "Ingeniería en Informática",
  "Ingeniería en Conectividad y Redes",
  "Ingeniería en Automatización",
  "Ingeniería Civil Industrial",
  "Ingeniería Comercial",
  "Ingeniería Mecánica",
  "Ingeniería Eléctrica",
  "Ingeniería en Construcción",
  "Ingeniería en Prevención de Riesgos",
];

const AREAS = [
  "Desarrollo de Software",
  "Redes y Telecomunicaciones",
  "Automatización Industrial",
  "Gestión de Proyectos",
  "Ciberseguridad",
  "Inteligencia Artificial",
  "Bases de Datos",
  "UX/UI",
  "Cloud Computing",
];

export default function EditProfileModal({ isOpen, onClose, perfil, onSave }: Props) {
  const [formData, setFormData] = useState<Partial<PerfilData>>({});
  const [habilidadesText, setHabilidadesText] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (perfil) {
      setFormData({
        nombre: perfil.nombre || "",
        apellido: perfil.apellido || "",
        alias: perfil.alias || "",
        carrera: perfil.carrera || "",
        area: perfil.area || "",
        biografia: perfil.biografia || "",
        foto: perfil.foto || "",
        habilidades_ofrecidas: perfil.habilidades_ofrecidas || [],
      });
      setHabilidadesText((perfil.habilidades_ofrecidas || []).join(", "));
    }
  }, [perfil]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const habilidadesArray = habilidadesText
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h.length > 0);
      await onSave({ ...formData, habilidades_ofrecidas: habilidadesArray });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>Editar Perfil</Text>
          <ScrollView style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor="#bbb"
              value={formData.nombre}
              onChangeText={(text) => setFormData({ ...formData, nombre: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              placeholderTextColor="#bbb"
              value={formData.apellido}
              onChangeText={(text) => setFormData({ ...formData, apellido: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Alias (público)"
              placeholderTextColor="#bbb"
              value={formData.alias}
              onChangeText={(text) => setFormData({ ...formData, alias: text })}
            />

            {/* Picker de Carrera */}
            <Text style={styles.label}>Carrera</Text>
            <Picker
              selectedValue={formData.carrera}
              onValueChange={(itemValue) => setFormData({ ...formData, carrera: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona tu carrera" value="" />
              {CARRERAS.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>

            {/* Picker de Área */}
            <Text style={styles.label}>Área</Text>
            <Picker
              selectedValue={formData.area}
              onValueChange={(itemValue) => setFormData({ ...formData, area: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona tu área" value="" />
              {AREAS.map((a) => (
                <Picker.Item key={a} label={a} value={a} />
              ))}
            </Picker>

            <TextInput
              style={styles.input}
              placeholder="Biografía"
              placeholderTextColor="#bbb"
              value={formData.biografia}
              onChangeText={(text) => setFormData({ ...formData, biografia: text })}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="URL de foto"
              placeholderTextColor="#bbb"
              value={formData.foto}
              onChangeText={(text) => setFormData({ ...formData, foto: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Habilidades (separadas por coma)"
              placeholderTextColor="#bbb"
              value={habilidadesText}
              onChangeText={setHabilidadesText}
              multiline
            />
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.purpleButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.purpleButton} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar</Text>}
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
  label: { color: "#fff", fontWeight: "bold", marginBottom: 5 },
  picker: {
    backgroundColor: "#1A1A2E",
    color: "#fff",
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
