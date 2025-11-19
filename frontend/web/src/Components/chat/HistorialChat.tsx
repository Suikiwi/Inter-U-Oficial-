import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface ChatResumen {
  id_chat: number;
  titulo: string;
  estado_intercambio: boolean;
}

const API_BASE_URL = "http://127.0.0.1:8000";

const HistorialChat: React.FC = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatResumen[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No hay token de acceso");

      const response = await axios.get(`${API_BASE_URL}/chats/mios/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChats(response.data);
    } catch (error: any) {
      console.error("Error al cargar chats:", error);

      if (error.response?.status === 401) {
        const refresh = localStorage.getItem("refreshToken");
        if (refresh) {
          try {
            const refreshResponse = await axios.post(
              `${API_BASE_URL}/auth/jwt/refresh/`,
              { refresh }
            );
            const newAccess = refreshResponse.data.access;
            localStorage.setItem("accessToken", newAccess);

            const retryResponse = await axios.get(`${API_BASE_URL}/chats/mios/`, {
              headers: { Authorization: `Bearer ${newAccess}` },
            });
            setChats(retryResponse.data);
          } catch (refreshError) {
            console.error("Error al refrescar token:", refreshError);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchChats();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <h3 className="text-purple-200 font-bold mb-3">Historial de chats</h3>

      {loading ? (
        <div className="text-slate-400 text-sm">Cargando chats...</div>
      ) : chats.length === 0 ? (
        <div className="text-slate-400 text-sm">No hay chats disponibles.</div>
      ) : (
        <ul className="space-y-2">
          {chats.map((c) => (
            <li
              key={c.id_chat}
              className="flex items-center justify-between text-slate-300"
            >
              <div>
                <div className="font-medium">{c.titulo}</div>
                <div className="text-xs text-slate-400 italic">
                  {c.estado_intercambio
                    ? `✅ Finalizado — ${c.titulo}`
                    : `⏳ En curso — ${c.titulo}`}
                </div>
              </div>
              <button
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
                onClick={() => navigate(`/chat/${c.id_chat}`)}
              >
                Abrir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistorialChat;
