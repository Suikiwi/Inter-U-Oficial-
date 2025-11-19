import React, { useState } from "react";
import axios from "axios";

interface EstadoIntercambioProps {
  chatId: number;
  estadoInicial: boolean;
}

const API_BASE_URL = "http://127.0.0.1:8000";

const EstadoIntercambio: React.FC<EstadoIntercambioProps> = ({
  chatId,
  estadoInicial,
}) => {
  const [estado, setEstado] = useState<"pendiente" | "realizado" | "calificado">(
    estadoInicial ? "realizado" : "pendiente"
  );
  const [puntaje, setPuntaje] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const marcarComoRealizado = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(`${API_BASE_URL}/chats/${chatId}/completar/`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEstado("realizado");
      setError(null);
    } catch (err: any) {
      console.error("Error al marcar como realizado:", err);
      setError("No tienes permiso para completar este intercambio.");
    }
  };

  const enviarCalificacion = async (puntaje: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${API_BASE_URL}/calificaciones-chat/`,
        {
          chat: chatId,
          puntaje,
          comentario: "", // puedes agregar un textarea si quieres comentarios
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPuntaje(puntaje);
      setEstado("calificado");
      setError(null);
    } catch (err: any) {
      console.error("Error al calificar:", err);
      setError("Ya has calificado este chat o no tienes permiso.");
    }
  };

  return (
    <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl mt-4">
      <h3 className="text-purple-200 font-bold mb-3">Estado del intercambio</h3>

      {estado === "pendiente" && (
        <button
          onClick={marcarComoRealizado}
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          Marcar como realizado
        </button>
      )}

      {estado === "realizado" && (
        <div className="space-y-3">
          <p className="text-slate-300 text-sm">Califica este intercambio:</p>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => enviarCalificacion(n)}
                className={`px-3 py-1 rounded text-sm ${
                  puntaje === n
                    ? "bg-blue-700 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {Array.from({ length: n }).map(() => "⭐")}
              </button>
            ))}
          </div>
        </div>
      )}

      {estado === "calificado" && (
        <div className="text-green-400 text-sm">
           Intercambio calificado con {puntaje} estrellas
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm mt-2">
           {error}
        </div>
      )}
    </div>
  );
};

export default EstadoIntercambio;
