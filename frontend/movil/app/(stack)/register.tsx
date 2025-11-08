import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, 
  ActivityIndicator, StyleSheet 
} from "react-native";
import { useRouter } from "expo-router";
import { registerUser } from "../api";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const router = useRouter();

  const showAlert = (type: "error" | "success", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!email.trim() || !password.trim() || !passwordConfirm.trim()) {
      errors.push("Debe completar todos los campos.");
    }
    if (email.trim() && !email.trim().endsWith("@inacapmail.cl")) {
      errors.push("Debe usar un correo institucional @inacapmail.cl");
    }
    if (password !== passwordConfirm) {
      errors.push("Las contraseñas no coinciden.");
    }
    if (!aceptaPoliticas) {
      errors.push("Debes aceptar las políticas de uso.");
    }
    return errors;
  };

  const handleRegister = async () => {
    setLoading(true);
    setAlert(null);

    const errors = validateForm();
    if (errors.length > 0) {
      showAlert("error", errors.join(" "));
      setLoading(false);
      return;
    }

    try {
      const response = await registerUser(email, password, aceptaPoliticas);
      if (response.status === 201) {
        showAlert("success", "Registro exitoso. Revisa tu email para activar tu cuenta.");
        router.replace("/(stack)/login");
      }
    } catch (err: any) {
      console.log("Error en registro:", err.response?.data || err.message);

      if (err.response?.data?.email) {
        showAlert("error", "La cuenta ya está registrada con ese correo.");
      } else if (err.response?.data?.acepta_politicas) {
        showAlert("error", "Debes aceptar las políticas de uso para registrarte.");
      } else if (err.response?.data?.password) {
        showAlert("error", "La contraseña no cumple los requisitos.");
      } else {
        showAlert("error", "Error en registro. Verifica los datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {alert && (
        <View style={[
          styles.alertBox,
          alert.type === "error" ? styles.alertError : styles.alertSuccess
        ]}>
          <Text style={styles.alertText}>{alert.message}</Text>
        </View>
      )}

      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.subtitle}>Únete a la comunidad académica</Text>

      <TextInput
        style={styles.input}
        placeholder="usuario@inacapmail.cl"
        placeholderTextColor="#bbb"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#bbb"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Repetir Contraseña"
        placeholderTextColor="#bbb"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        secureTextEntry
      />

      <TouchableOpacity 
        style={[styles.checkbox, aceptaPoliticas && styles.checkboxChecked]} 
        onPress={() => setAceptaPoliticas(!aceptaPoliticas)}
      >
        <Text style={styles.checkboxLabel}>
          {aceptaPoliticas ? "✓ " : ""}Acepto las políticas de uso
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.registerButton} 
        onPress={handleRegister} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.registerButtonText}>Crear Cuenta</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A0736", padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "white", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#ccc", textAlign: "center", marginBottom: 20 },
  input: {
    backgroundColor: "#2B1654",
    borderWidth: 1,
    borderColor: "#6542F4",
    padding: 14,
    marginBottom: 16,
    borderRadius: 10,
    color: "white",
    fontSize: 16,
  },
  checkbox: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#2B1654",
    borderWidth: 1,
    borderColor: "#6542F4",
    marginBottom: 20,
  },
  checkboxChecked: { backgroundColor: "#3B1E70" },
  checkboxLabel: { color: "white", fontSize: 14 },
  registerButton: { backgroundColor: "#6C63FF", paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  registerButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  alertBox: { padding: 10, borderRadius: 8, marginBottom: 15 },
  alertError: { backgroundColor: "#FFCDD2" },
  alertSuccess: { backgroundColor: "#C8E6C9" },
  alertText: { textAlign: "center", color: "#000" }
});
