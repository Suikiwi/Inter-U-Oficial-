// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.191.173.235:8000/api'; // Reemplaza con tu IP local o dominio

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token automáticamente en cada request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Registro de usuario
export const registerUser = async (email, password, aceptaPoliticas) => {
  return await api.post('/auth/users/', {
    email,
    password,
    acepta_politicas: aceptaPoliticas,
  });
};

// Login de usuario
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/jwt/create/", { email, password });
  const { access, refresh } = response.data;

  await AsyncStorage.setItem("accessToken", access);
  await AsyncStorage.setItem("refreshToken", refresh);

  return { access, refresh };
};

// Obtener info del usuario autenticado
export const getUserInfo = async () => {
  const response = await api.get('/auth/users/me/');
  return response.data;
};
export const updateUserInfo = async (data) => {
  const response = await api.patch("/auth/users/me/", data);
  return response.data;
};


// Refrescar token
export const refreshToken = async () => {
  const refresh = await AsyncStorage.getItem('refreshToken');
  const response = await api.post('/auth/jwt/refresh/', { refresh });
  const { access } = response.data;

  await AsyncStorage.setItem('accessToken', access);
  return access;
};

// Logout
export const logoutUser = async () => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
};

export default api;
