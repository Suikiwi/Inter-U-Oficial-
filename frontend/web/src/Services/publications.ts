import axios from "axios";
import type { Publication } from "../Components/Publications/Types";

const API = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const listarPublicaciones = async (filters: Record<string, any> = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    params.append(k, Array.isArray(v) ? v.join(",") : String(v));
  });

  const url = `${API}/publicaciones/${params.toString() ? `?${params.toString()}` : ""}`;
  const { data } = await axios.get(url);
  return data as Publication[];
};

export const obtenerPublicacion = async (id: number) => {
  const { data } = await axios.get(`${API}/publicaciones/${id}/`);
  return data as Publication;
};

export const crearPublicacion = async (payload: Partial<Publication>) => {
  const { data } = await axios.post(`${API}/publicaciones/`, payload, { headers: authHeaders() });
  return data as Publication;
};

export const editarPublicacion = async (id: number, payload: Partial<Publication>) => {
  const { data } = await axios.patch(`${API}/publicaciones/${id}/`, payload, { headers: authHeaders() });
  return data as Publication;
};

export const eliminarPublicacion = async (id: number) => {
  await axios.delete(`${API}/publicaciones/${id}/`, { headers: authHeaders() });
};
