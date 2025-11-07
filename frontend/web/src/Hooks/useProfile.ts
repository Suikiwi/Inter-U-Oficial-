import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export interface PerfilData {
  id_perfil: number;
  alias: string;
  nombre: string;
  apellido: string;
  carrera: string;
  area: string;
  biografia: string;
  foto: string;
  habilidades_ofrecidas: string[];
}

export interface UserData {
  email: string;
  acepta_politicas: boolean;
  is_estudiante: boolean;
  is_admin_interu: boolean;
}

export const useProfile = () => {
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No hay token de autenticación");
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const perfilRes = await axios.get(`${API_BASE_URL}/api/perfil/`, { headers });
      setPerfil(perfilRes.data);
      const userRes = await axios.get(`${API_BASE_URL}/api/auth/users/me/`, { headers });
      setUser(userRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<PerfilData>) => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const response = await axios.patch(`${API_BASE_URL}/api/perfil/`, data, { headers });
      setPerfil(response.data);
      return { success: true, data: response.data };
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || "Error al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (password: string) => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/api/perfil/eliminar/`, { headers, data: { password } });
      return { success: true };
    } catch (err: any) {
      throw new Error(err.response?.data?.password?.[0] || "Contraseña incorrecta");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { perfil, user, loading, error, updateProfile, deleteAccount, refetch: fetchProfile };
};
