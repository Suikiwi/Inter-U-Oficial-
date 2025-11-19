import axios from "axios";
import { getUserIdFromAccessToken } from "../Services/auth";
import type { FiltersPublication } from "../Components/Publications/Types";

const API_BASE_URL = "http://127.0.0.1:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Token de acceso no disponible.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Listar publicaciones con filtros
export async function listarPublicaciones(filters: FiltersPublication) {
  const params = new URLSearchParams(filters as any).toString();
  const res = await axios.get(`${API_BASE_URL}/publicaciones/?${params}`);
  return res.data;
}

// Obtener publicaciones globales
export const obtenerPublicacionesGlobal = async () => {
  const response = await axios.get(`${API_BASE_URL}/publicaciones/`);
  return response.data;
};

// Obtener mis publicaciones
export const obtenerMisPublicaciones = async () => {
  const headers = getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/publicaciones/mias/`, { headers });
  return response.data;
};

// Crear publicación
export const crearPublicacion = async (payload: {
  titulo: string;
  descripcion?: string;
  habilidades_buscadas: string[];
  estudiante?: number;
}) => {
  const headers = getAuthHeaders();
  const estudiante = getUserIdFromAccessToken();
  const response = await axios.post(
    `${API_BASE_URL}/publicaciones/`,
    { ...payload, estudiante },
    { headers }
  );
  return response.data;
};

// Editar publicación
export const editarPublicacion = async (
  id: number,
  payload: {
    titulo: string;
    descripcion?: string;
    habilidades_buscadas: string[];
    estudiante?: number;
  }
) => {
  const headers = getAuthHeaders();
  const estudiante = getUserIdFromAccessToken();
  const response = await axios.put(
    `${API_BASE_URL}/publicaciones/${id}/editar/`,
    { ...payload, estudiante },
    { headers }
  );
  return response.data;
};

// Obtener una publicación por ID
export const obtenerPublicacion = async (id: number) => {
  const response = await axios.get(`${API_BASE_URL}/publicaciones/${id}/`);
  return response.data;
};

// Eliminar publicación
export const eliminarPublicacion = async (id: number) => {
  const headers = getAuthHeaders();
  const response = await axios.delete(
    `${API_BASE_URL}/publicaciones/${id}/eliminar/`,
    { headers }
  );
  return response.data;
};
