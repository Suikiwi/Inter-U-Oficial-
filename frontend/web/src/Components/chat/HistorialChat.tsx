import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface ChatResumen {
  id_chat: number;
  titulo: string;
  estado_intercambio: boolean;
  autor_alias?: string; // alias del otro participante (si el backend lo incluye)
  ultimo_mensaje?: string; // opcional si el backend lo incluye
  actualizado_en?: string; // opcional para orden por reciente
}

const API_BASE_URL = "http://127.0.0.1:8000";

const HistorialChat: React.FC = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchChats = async () => {
    setErrorMsg(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("No hay token de acceso");

      const response = await axios.get(`${API_BASE_URL}/chats/mios/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Opcional: ordenar por actualizado_en si el backend lo envía
      const data: ChatResumen[] = response.data;
      const ordered = [...data].sort((a, b) => {
        if (a.actualizado_en && b.actualizado_en) {
          return new Date(b.actualizado_en).getTime() - new Date(a.actualizado_en).getTime();
        }
        return 0;
      });

      setChats(ordered);
    } catch (error: any) {
      console.error("Error al cargar chats:", error);
      setErrorMsg("No se pudieron cargar tus chats.");
      if (error.response?.status === 401) {
        const refresh = localStorage.getItem("refreshToken");
        if (refresh) {
          try {
            const refreshResponse = await axios.post(`${API_BASE_URL}/auth/jwt/refresh/`, { refresh });
            const newAccess = refreshResponse.data.access;
            localStorage.setItem("accessToken", newAccess);

            const retryResponse = await axios.get(`${API_BASE_URL}/chats/mios/`, {
              headers: { Authorization: `Bearer ${newAccess}` },
            });

            const data: ChatResumen[] = retryResponse.data;
            setChats(data);
            setErrorMsg(null);
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
    fetchChats();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-purple-200 font-bold">Historial de chats</h3>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 text-xs bg-slate-700 text-slate-200 rounded hover:bg-slate-600"
            onClick={fetchChats}
            aria-label="Refrescar historial"
          >
            Refrescar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Cargando chats...</div>
      ) : errorMsg ? (
        <div className="text-amber-300 text-xs">{errorMsg}</div>
      ) : chats.length === 0 ? (
        <div className="text-slate-400 text-sm">No hay chats disponibles.</div>
      ) : (
        // Contenedor con altura y scroll internos para modal
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <ul className="space-y-2">
            {chats.map((c) => (
              <li
                key={c.id_chat}
                className="flex items-center justify-between gap-3 p-2 bg-slate-800/40 border border-slate-700 rounded"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {c.autor_alias ? `${c.autor_alias} — ${c.titulo}` : c.titulo}
                  </div>
                  <div className="text-xs text-slate-400 italic truncate">
                    {c.estado_intercambio ? `✅ Finalizado — ${c.titulo}` : `⏳ En curso — ${c.titulo}`}
                  </div>
                  {c.ultimo_mensaje && (
                    <div className="text-xs text-slate-500 truncate mt-1">
                      Último: {c.ultimo_mensaje}
                    </div>
                  )}
                </div>
                <button
                  className="shrink-0 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs"
                  onClick={() => navigate(`/chat/${c.id_chat}`)}
                >
                  Abrir
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HistorialChat;
