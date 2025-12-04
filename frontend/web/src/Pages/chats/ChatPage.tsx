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

  //  Estados para calificación
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState("");

  // Scroll automático
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Cargar mensajes
  useEffect(() => {
    const fetchMensajes = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${API_BASE_URL}/mensajes/?chat=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMensajes(res.data);
      } catch (error) {
        console.error("Error al cargar mensajes:", error);
      }
    };
    fetchMensajes();
  }, [id]);

  // Cargar info del chat
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

  // WebSocket
  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${id}/`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== "message") return;

      setMensajes((prev) => {
        if (prev.some((m) => m.id_mensaje === data.id_mensaje)) return prev;
        return [
          ...prev,
          {
            id_mensaje: data.id_mensaje,
            estudiante: data.estudiante,
            texto: data.texto,
            fecha: data.fecha,
            autor_alias: data.autor_alias,
          },
        ];
      });
    };

    ws.onopen = () => console.log("WS conectado");
    ws.onclose = () => console.log("WS cerrado");

    return () => ws.close();
  }, [id]);

  //  Enviar mensaje
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
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  //  Enviar calificación
  const enviarCalificacion = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const payload = {
        chat: parseInt(id!),
        puntaje: rating,
        comentario: comentario,
      };

      console.log("Enviando calificación:", payload);

      await axios.post(`${API_BASE_URL}/calificaciones-chat/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowRating(false);
      setRating(0);
      setComentario("");
    } catch (error: any) {
      console.error("Error al enviar calificación:", error.response?.data || error.message);
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

      {/* Lista de mensajes */}
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
                {m.estudiante === userId ? "Yo" : m.autor_alias}
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

      {/*  Input + botón para enviar mensajes */}
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm"
        />
        <button
          onClick={enviarMensaje}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
        >
          Enviar
        </button>
      </div>

      {/* Botón para finalizar intercambio */}
      {!chatInfo?.estado_intercambio && (
        <button
          onClick={() => setShowRating(true)}
          className="w-full py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800"
        >
          Finalizar intercambio
        </button>
      )}

      {/* Modal de calificación */}
      {showRating && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded-xl w-96 border border-slate-600">
            <h2 className="text-xl font-bold text-white mb-4">Califica tu intercambio</h2>

            <div className="flex justify-center mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  onClick={() => setRating(n)}
                  className={`text-3xl cursor-pointer ${
                    rating >= n ? "text-yellow-400" : "text-slate-500"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe un comentario (opcional)"
              className="w-full bg-slate-700 text-white p-3 rounded-lg mb-4"
              rows={4}
            />

            <button
              onClick={enviarCalificacion}
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mb-2"
            >
              Enviar calificación
            </button>

            <button
              onClick={() => setShowRating(false)}
              className="w-full py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Estado del intercambio */}
      {chatInfo && (
        <EstadoIntercambio chatId={chatInfo.id_chat} estadoInicial={chatInfo.estado_intercambio} />
      )}
    </div>
  );
};

export default ChatPage;
