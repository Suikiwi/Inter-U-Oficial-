import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, 
  ActivityIndicator, StyleSheet 
} from "react-native";
import { useRouter } from "expo-router";
import { loginUser } from "../api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const router = useRouter();

  const showAlert = (type: "error" | "success", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!email.trim() || !password.trim()) errors.push("Debe completar todos los campos.");
    if (email.trim() && !email.trim().endsWith("@inacapmail.cl")) {
      errors.push("Debe usar un correo institucional @inacapmail.cl");
    }
    return errors;
  };

  const handleLogin = async () => {
    setLoading(true);
    setAlert(null);

    const errors = validateForm();
    if (errors.length > 0) {
      showAlert("error", errors.join(" "));
      setLoading(false);
      return;
    }
    try {
      const tokens = await loginUser(email, password);
      if (tokens?.access && tokens?.refresh) {
        showAlert("success", "Login exitoso! Redirigiendo...");
        setTimeout(() => router.replace("/perfil"), 2000);
      } else {
        showAlert("error", "Error inesperado: tokens no recibidos.");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        showAlert("error", "Credenciales inválidas o cuenta no activada.");
      } else {
        showAlert("error", "Error de conexión con el backend.");
      }
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

      <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
      <Text style={styles.subtitle}>Accede a tu universo académico</Text>

      <TextInput
        style={styles.input}
        placeholder="usuario@inacapmail.cl"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.link}>¿No tienes una cuenta? Regístrate aquí</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#1A1A2E" },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#ccc", textAlign: "center", marginBottom: 20 },
  input: { backgroundColor: "#2E2E48", color: "#fff", marginBottom: 15, padding: 12, borderRadius: 8 },
  button: { backgroundColor: "#8A4FFF", padding: 15, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold" },
  link: { color: "#8A4FFF", textAlign: "center", marginTop: 10 },
  alertBox: { padding: 10, borderRadius: 8, marginBottom: 15 },
  alertError: { backgroundColor: "#FFCDD2" },
  alertSuccess: { backgroundColor: "#C8E6C9" },
  alertText: { textAlign: "center", color: "#000" }
});