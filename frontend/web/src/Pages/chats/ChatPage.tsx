import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import EstadoIntercambio from "../../Components/chat/EstadoIntercambio";

interface Mensaje {
  id?: number;
  user: string;
  message: string;
  fecha?: string;
}

interface ChatInfo {
  id_chat: number;
  estado_intercambio: boolean;
}

const API_BASE_URL = "http://127.0.0.1:8000";

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);

  useEffect(() => {
    // Obtener info del chat (estado_intercambio)
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
    const ws = new WebSocket(`ws://127.0.0.1:8001/ws/chat/${id}/`);

    ws.onopen = () => {
      console.log("Conectado al WebSocket");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMensajes((prev) => [...prev, data]);
    };

    ws.onclose = () => {
      console.log("WebSocket cerrado");
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [id]);

  const enviarMensaje = () => {
    if (nuevoMensaje.trim() !== "" && socket) {
      const msg = { user: "Yo", message: nuevoMensaje };
      socket.send(JSON.stringify(msg));
      setMensajes((prev) => [...prev, msg]);
      setNuevoMensaje("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold text-purple-100">Chat #{id}</h1>

      {/* Lista de mensajes */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 h-[60vh] overflow-y-auto space-y-3">
        {mensajes.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.user === "Yo" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-3 py-2 rounded-lg text-sm ${
                m.user === "Yo"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 text-slate-200"
              }`}
            >
              <span className="block font-semibold">{m.user}</span>
              <span>{m.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input para enviar mensaje */}
      <div className="flex gap-2">
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          placeholder="Escribe un mensaje..."
        />
        <button
          onClick={enviarMensaje}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Enviar
        </button>
      </div>

      {/* Estado del intercambio */}
      {chatInfo && (
        <EstadoIntercambio
          chatId={chatInfo.id_chat}
          estadoInicial={chatInfo.estado_intercambio}
        />
      )}
    </div>
  );
};

export default ChatPage;
