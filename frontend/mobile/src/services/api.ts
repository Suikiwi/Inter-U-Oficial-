// src/services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


const API_BASE_URL = 'http://192.168.100.98:8000/api';

console.log('🌐 URL Base configurada:', API_BASE_URL);

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para API_KEY
API.interceptors.request.use(async (config) => {
  try {
    const apiKey = await SecureStore.getItemAsync('api_key');
    if (apiKey) {
      config.headers['Authorization'] = `Api-Key ${apiKey}`;
    }
  } catch (error) {
    console.log('❌ Error getting API key:', error);
  }
  return config;
});

// Interceptor de respuesta para debug
API.interceptors.response.use(
  (response) => {
    console.log('✅ Response success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('❌ Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default API;