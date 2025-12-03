import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import EstadoIntercambio from "../../Components/chat/EstadoIntercambio";
import { getUserIdFromAccessToken } from "../../Services/auth";

interface Mensaje {
  id_mensaje: number;
  estudiante: number;
  texto: string;
  fecha: string;
  autor_alias?: string;
}

interface ChatInfo {
  id_chat: number;
  estado_intercambio: boolean;
  titulo?: string;
}

const API_BASE_URL = "http://127.0.0.1:8000";

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const userId = getUserIdFromAccessToken()!;
  const listRef = useRef<HTMLDivElement | null>(null);
  const vistosRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [mensajes]);

  useEffect(() => {
    const fetchMensajes = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${API_BASE_URL}/mensajes/?chat=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMensajes(res.data);
        vistosRef.current = new Set<number>(res.data.map((m: Mensaje) => m.id_mensaje));
      } catch (error) {
        console.error("Error al cargar mensajes:", error);
      }
    };
    fetchMensajes();
  }, [id]);

  useEffect(() => {
    const fetchChatInfo = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${API_BASE_URL}/chats/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatInfo(response.data);
      } catch (error) {
        console.error("Error al cargar info del chat:", error);
      }
    };
    fetchChatInfo();
  }, [id]);

  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${id}/`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== "message") return;

      const idReal = data.id_mensaje;
      if (typeof idReal !== "number") return;

      // ✅ Ajuste: en vez de descartar siempre, verificamos en el array actual
      setMensajes((prev) => {
        if (prev.some((m) => m.id_mensaje === idReal)) {
          return prev; // ya existe, no duplicar
        }
        return [...prev, {
          id_mensaje: idReal,
          estudiante: data.estudiante,
          texto: data.texto,
          fecha: data.fecha,
          autor_alias: data.user,
        }];
      });
    };

    ws.onopen = () => console.log("WS conectado");
    ws.onclose = () => console.log("WS cerrado");

    return () => ws.close();
  }, [id]);

  const enviarMensaje = async () => {
    if (nuevoMensaje.trim() === "") return;

    const token = localStorage.getItem("accessToken");
    const payload = { chat: parseInt(id!), texto: nuevoMensaje };

    try {
      await axios.post(`${API_BASE_URL}/mensajes/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setNuevoMensaje("");
      // No hacemos eco local: el backend emite el mensaje y llega por WS
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-purple-100">
          {chatInfo?.titulo ? chatInfo.titulo : `Chat #${id}`}
        </h1>
        {chatInfo && (
          <span
            className={`text-xs px-2 py-1 rounded ${
              chatInfo.estado_intercambio
                ? "bg-emerald-600/20 text-emerald-300"
                : "bg-amber-600/20 text-amber-300"
            }`}
          >
            {chatInfo.estado_intercambio ? "Finalizado" : "En curso"}
          </span>
        )}
      </div>

      <div
        ref={listRef}
        className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 h-[60vh] overflow-y-auto space-y-3"
      >
        {mensajes.map((m) => (
          <div
            key={m.id_mensaje}
            className={`flex ${m.estudiante === userId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-lg text-sm max-w-[70%] ${
                m.estudiante === userId
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 text-slate-200"
              }`}
            >
              <span className="block font-semibold">
                {m.estudiante === userId ? "Yo" : m.autor_alias || `User ${m.estudiante}`}
              </span>
              <span>{m.texto}</span>
              <span className="block text-xs text-slate-400 mt-1">
                {new Date(m.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
        {mensajes.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-8">
            Aún no hay mensajes en este chat.
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          placeholder="Escribe un mensaje..."
          onKeyDown={(e) => {
            if (e.key === "Enter") enviarMensaje();
          }}
        />
        <button
          onClick={enviarMensaje}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Enviar
        </button>
      </div>

      {chatInfo && (
        <EstadoIntercambio chatId={chatInfo.id_chat} estadoInicial={chatInfo.estado_intercambio} />
      )}
    </div>
  );
};

export default ChatPage;
