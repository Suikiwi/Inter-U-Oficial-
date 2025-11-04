// src/navigation/AppNavigator.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native'; // ✅ AÑADIR ESTOS IMPORTS
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authService } from '../services/authService';
import LoginScreen from '../screens/loginScreen';
import RegisterScreen from '../screens/registerScreen';


// PANTALLA HOME TEMPORAL COMPLETA
function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>¡Bienvenido!</Text>
      <Text style={{ fontSize: 16, marginTop: 10 }}>Login exitoso 🎉</Text>
    </View>
  );
}

// PANTALLA DE CARGA COMPLETA
function SplashScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18 }}>Cargando...</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const auth = await authService.checkAuth();
    setIsAuthenticated(auth.isAuthenticated);
  };

  if (isAuthenticated === null) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
  {!isAuthenticated ? (
    <>
        <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
        />
        <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ title: 'Registro' }}
        />
        </>
    ) : (
        <Stack.Screen name="Home" component={HomeScreen} />
    )}
    </Stack.Navigator>

    </NavigationContainer>
  );
}