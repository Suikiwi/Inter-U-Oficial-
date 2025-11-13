import axios from "axios";
import { getUserIdFromAccessToken } from "./auth";

const API_BASE = "http://127.0.0.1:8000/api/publicaciones/";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("Token de acceso no disponible.");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const obtenerPublicacionesGlobal = async () => {
  const response = await axios.get(API_BASE);
  return response.data;
};

export const crearPublicacion = async (payload: {
  titulo: string;
  descripcion?: string;
  habilidades_buscadas: string[];
  estudiante?: number;
}) => {
  const headers = getAuthHeaders();
  const estudiante = getUserIdFromAccessToken();
  const response = await axios.post(API_BASE, { ...payload, estudiante }, { headers });
  return response.data;
};

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
  const response = await axios.put(`${API_BASE}${id}/editar/`, { ...payload, estudiante }, { headers });
  return response.data;
};

export const obtenerPublicacion = async (id: number) => {
  const response = await axios.get(`${API_BASE}${id}/`);
  return response.data;
};

export const eliminarPublicacion = async (id: number) => {
  const headers = getAuthHeaders();
  const response = await axios.delete(`${API_BASE}${id}/eliminar/`, { headers });
  return response.data;
};
