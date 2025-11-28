// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.12:8000/'; // Reemplaza con tu IP local o dominio

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

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

// -------- PERFIL --------
//
export const getPerfil = async () => {
  const { data } = await api.get("/perfil/");
  return data;
};

export const updatePerfil = async (payload) => {
  const { data } = await api.put("/perfil/", payload);
  return data;
};


//
// -------- PUBLICACIONES --------
//
export const getMisPublicaciones = async () => {
  const { data } = await api.get("/publicaciones/mias/");
  return data;
};

export const getPublicacionById = async (id) => {
  const { data } = await api.get(`/publicaciones/${id}/`);
  return data;
};

export const crearPublicacion = async (payload) => {
  const { data } = await api.post("/publicaciones/", payload);
  return data;
};

export const editarPublicacion = async (id, payload) => {
  const { data } = await api.put(`/publicaciones/${id}/editar/`, payload);
  return data;
};

export const eliminarPublicacion = async (id) => {
  await api.delete(`/publicaciones/${id}/eliminar/`);
};
export const obtenerPublicacionesGlobal = async () => {
  const { data } = await api.get("/publicaciones/");
  return data;
};

//
// -------- CHATS --------
//
export const iniciarChat = async (publicacionId) => {
  const { data } = await api.post("/chats/", { publicacion: publicacionId });
  return data;
};

export const getChatById = async (id) => {
  const { data } = await api.get(`/chats/${id}/`);
  return data;
};

export const completarIntercambio = async (id) => {
  const { data } = await api.patch(`/chats/${id}/completar/`);
  return data;
};

//
// -------- MENSAJES --------
//
export const enviarMensaje = async (chatId, texto) => {
  const { data } = await api.post("/mensajes/", { chat: chatId, texto });
  return data;
};

//
// -------- CALIFICACIONES --------
//
export const calificarChat = async (chatId, puntaje, comentario = "") => {
  const { data } = await api.post("/calificaciones-chat/", {
    chat: chatId,
    puntaje,
    comentario,
  });
  return data;
};

//
// -------- NOTIFICACIONES --------
//
export const getNotificaciones = async () => {
  const { data } = await api.get("/notificaciones/");
  return data;
};

export const marcarNotificacionLeida = async (id) => {
  const { data } = await api.patch(`/notificaciones/${id}/marcar-leida/`);
  return data;
};

export const marcarTodasNotificacionesLeidas = async () => {
  const { data } = await api.post("/notificaciones/marcar-todas-leidas/");
  return data;
};

export default api;
