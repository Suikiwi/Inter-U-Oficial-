import axios from "axios";
import type { Publication } from "../Components/Publications/Types";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

const buildParams = (filters: Record<string, any> = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    params.append(k, Array.isArray(v) ? v.join(",") : String(v));
  });
  return params.toString() ? `?${params.toString()}` : "";
};

// Público
export const listarPublicaciones = async (filters: Record<string, any> = {}) => {
  const url = `${API}/publicaciones/${buildParams(filters)}`;
  const { data } = await axios.get(url);
  return data as Publication[];
};

export const obtenerPublicacion = async (id: number) => {
  const { data } = await axios.get(`${API}/publicaciones/${id}/`);
  return data as Publication;
};

// Protegidos
export const obtenerMisPublicaciones = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No autenticado");
  const { data } = await axios.get(`${API}/publicaciones/mias/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data as Publication[];
};

export const crearPublicacion = async (payload: Partial<Publication>) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No autenticado");
  const { data } = await axios.post(`${API}/publicaciones/`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data as Publication;
};

export const editarPublicacion = async (id: number, payload: Partial<Publication>) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No autenticado");
  const { data } = await axios.put(`${API}/publicaciones/${id}/editar/`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data as Publication;
};

export const eliminarPublicacion = async (id: number) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No autenticado");
  await axios.delete(`${API}/publicaciones/${id}/eliminar/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
