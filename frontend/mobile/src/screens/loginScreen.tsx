import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView
} from 'react-native';
import { authService } from '../services/authService';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  // 🔍 TEST DE CONEXIÓN AUTOMÁTICO AL CARGAR
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setTesting(true);
    console.log('🧪 Ejecutando test de conexión...');
    const result = await authService.testConnection();
    setTesting(false);
    
    if (!result.success) {
      Alert.alert(
        '❌ Problema de Conexión', 
        `No se puede conectar con el servidor:\n${result.error}\n\nVerifica:\n• Django esté corriendo\n• La IP sea correcta\n• Misma red WiFi`,
        [{ text: 'Entendido' }]
      );
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    if (!email.endsWith('@inacap.cl')) {
      Alert.alert('Error', 'Debes usar tu correo @inacap.cl');
      return;
    }

    setLoading(true);
    console.log('🎯 Intentando login...');
    const result = await authService.login(email, password);
    setLoading(false);

    if (result.success) {
      Alert.alert('✅ Éxito', 'Login exitoso!');
      navigation.replace('Home');
    } else {
      Alert.alert('❌ Error', result.error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Intercambio INACAP</Text>
      
      {/* BOTÓN DE TEST */}
      <TouchableOpacity 
        style={[styles.button, styles.testButton]}
        onPress={testConnection}
        disabled={testing}
      >
        {testing ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>🧪 Probar Conexión</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="tu.email@inacap.cl"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.button, styles.loginButton]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Ingresar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate aquí</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333'
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  },
  testButton: {
    backgroundColor: '#FF9500',
    marginBottom: 20
  },
  loginButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16
  }
});