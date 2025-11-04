import API from './api';
import * as SecureStore from 'expo-secure-store';

// Función de prueba de conexión
export const testConnection = async () => {
  try {
    console.log('🧪 TEST: Probando conexión con Django...');
    console.log('🔗 URL base:', API.defaults.baseURL);
    
    const response = await API.get('/test/'); // Asegúrate de tener este endpoint
    console.log('✅ TEST EXITOSO:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.log('❌ TEST FALLIDO:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    return { success: false, error: error.message };
  }
};

export const authService = {
  // 🔍 FUNCIÓN DE PRUEBA DE CONEXIÓN
  testConnection: async () => {
    return await testConnection();
  },

  // 🔐 LOGIN CON DEBUG DETALLADO
  login: async (email: string, password: string) => {
    try {
      console.log('🚀 INICIANDO LOGIN...');
      console.log('📤 Enviando a:', API.defaults.baseURL + '/login/');
      console.log('📝 Datos:', { email, password: '***' }); // No mostrar password real
      
      const response = await API.post('/login/', {
        email,
        password
      });

      console.log('✅ LOGIN EXITOSO - Respuesta:', response.data);

      if (response.data && response.data.api_key) {
        const { api_key, id_estudiante, email, es_admin } = response.data;
        
        console.log('💾 Guardando datos en SecureStore...');
        await SecureStore.setItemAsync('api_key', api_key);
        await SecureStore.setItemAsync('user_id', id_estudiante.toString());
        await SecureStore.setItemAsync('user_email', email);
        
        console.log('📱 Datos guardados correctamente');
        
        return {
          success: true,
          user: { id: id_estudiante, email, es_admin, api_key }
        };
      }
      
      console.log('⚠️ Login sin api_key en respuesta');
      return { success: false, error: 'Credenciales incorrectas' };
      
    } catch (error: any) {
      console.log('❌ ERROR EN LOGIN - Detalles completos:', {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.config?.headers
      });
      
      // Manejo específico de errores
      let errorMessage = 'Error de conexión';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'No se puede conectar al servidor. Verifica que Django esté corriendo.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Endpoint no encontrado. Verifica la URL.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  logout: async () => {
    console.log('🚪 Cerrando sesión...');
    await SecureStore.deleteItemAsync('api_key');
    await SecureStore.deleteItemAsync('user_id');
    await SecureStore.deleteItemAsync('user_email');
    console.log('✅ Sesión cerrada');
  },

  checkAuth: async () => {
    console.log('🔍 Verificando autenticación...');
    const apiKey = await SecureStore.getItemAsync('api_key');
    const userId = await SecureStore.getItemAsync('user_id');
    
    console.log('📋 Datos almacenados:', { apiKey: !!apiKey, userId: !!userId });
    
    if (apiKey && userId) {
      const userEmail = await SecureStore.getItemAsync('user_email') || '';
      console.log('✅ Usuario autenticado:', { userId, userEmail });
      
      return {
        isAuthenticated: true,
        user: {
          id: parseInt(userId),
          email: userEmail,
          api_key: apiKey,
          es_admin: false
        }
      };
    }
    
    console.log('❌ No autenticado');
    return { isAuthenticated: false };
  },

  register: async (email: string, password: string) => {
    try {
      console.log('📝 INICIANDO REGISTRO...');
      console.log('📤 Enviando a:', API.defaults.baseURL + '/register/');
      
      const response = await API.post('/register/', {
        email,
        contraseña: password,
        aceptar_politicas: true
      });

      console.log('✅ REGISTRO EXITOSO:', response.data);

      if (response.data && response.data.id_estudiante) {
        return {
          success: true,
          message: 'Usuario registrado. Revisa tu email para activar.'
        };
      }
      
      return { success: false, error: 'Error en registro' };
      
    } catch (error: any) {
      console.log('❌ ERROR EN REGISTRO:', error.response?.data);
      
      return { 
        success: false, 
        error: error.response?.data?.email?.[0] || 
               error.response?.data?.contraseña?.[0] || 
               error.response?.data?.non_field_errors?.[0] ||
               'Error de conexión en registro' 
      };
    }
  }
};