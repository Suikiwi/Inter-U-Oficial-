import React, { useEffect, useState } from "react";
import axios from "axios";

const HistorialChat: React.FC = () => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.get("http://127.0.0.1:8000/api/chats/mios/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(data);
    };
    fetch();
  }, []);

  return (
    <div className="space-y-4">
      {chats.map((chat: any) => (
        <div key={chat.id_chat} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h3 className="text-white font-semibold">{chat.publicacion?.titulo}</h3>
          <p className="text-slate-400 text-sm">
            Estado: {chat.estado_intercambio} — Participantes:{" "}
            {chat.participantes.map((p: any) => p.alias).join(", ")}
          </p>
          <p className="text-slate-300 text-sm italic">
            Último mensaje: {chat.mensajes?.[chat.mensajes.length - 1]?.contenido ?? "Sin mensajes"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default HistorialChat;
