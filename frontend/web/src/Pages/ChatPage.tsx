import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Mensaje {
  id?: number;
  user: string;
  message: string;
  fecha?: string;
}

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  useEffect(() => {
    if (!id) return;

    //  Conexión al WebSocket
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/chat_${id}/`);
    setSocket(ws);

    ws.onopen = () => {
      console.log(" Conectado al chat", id);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMensajes((prev) => [...prev, { user: data.user, message: data.message }]);
    };

    ws.onerror = (err) => {
      console.error(" Error en WebSocket:", err);
    };

    ws.onclose = () => {
      console.log("🔌 Conexión cerrada");
    };

    return () => {
      ws.close();
    };
  }, [id]);

  const enviarMensaje = () => {
    if (socket && nuevoMensaje.trim() !== "") {
      socket.send(
        JSON.stringify({
          message: nuevoMensaje,
          user: "Yo", // puedes reemplazar con alias del perfil
        })
      );
      setNuevoMensaje("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-purple-100 mb-6">Chat #{id}</h1>

      {/* Lista de mensajes */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 h-[60vh] overflow-y-auto space-y-3">
        {mensajes.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.user === "Yo" ? "justify-end" : "justify-start"
            }`}
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
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:border-purple-500 focus:outline-none"
          placeholder="Escribe un mensaje..."
        />
        <button
          onClick={enviarMensaje}
          className="px-4 py-2 bg-linear-to-r from-purple-600 to-primary text-white rounded-lg font-medium hover:from-primary hover:to-purple-600 transition-all"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
