import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

interface Notificacion {
  id_notificacion: number;
  mensaje: string;
  tipo: string;
  fecha: string;
  leida: boolean;
}

const Notificaciones: React.FC = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const fetchNotificaciones = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API_BASE_URL}/notificaciones/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificaciones(res.data);
    } catch (err) {
      setError("Error al cargar notificaciones.");
    } finally {
      setCargando(false);
    }
  };

  const marcarLeida = async (id: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(`${API_BASE_URL}/notificaciones/${id}/marcar-leida/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificaciones((prev) =>
        prev.map((n) => (n.id_notificacion === id ? { ...n, leida: true } : n))
      );
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  const marcarTodas = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(`${API_BASE_URL}/notificaciones/marcar-todas-leidas/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch (err) {
      console.error("Error al marcar todas como leídas:", err);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
      <h2 className="text-2xl font-bold text-purple-100 mb-4">Notificaciones</h2>

      {cargando ? (
        <p className="text-slate-400">Cargando...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : notificaciones.length === 0 ? (
        <p className="text-slate-400">No tienes notificaciones.</p>
      ) : (
        <>
          <button
            onClick={marcarTodas}
            className="mb-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
          >
            Marcar todas como leídas
          </button>

          <ul className="space-y-3">
            {notificaciones.map((n) => (
              <li
                key={n.id_notificacion}
                className={`p-4 border rounded-lg ${
                  n.leida ? "bg-slate-900/30 border-slate-700" : "bg-slate-900/50 border-purple-600"
                }`}
              >
                <div className="text-slate-300">{n.mensaje}</div>
                <div className="text-slate-500 text-xs mt-1">
                  {new Date(n.fecha).toLocaleString()}
                </div>
                {!n.leida && (
                  <button
                    onClick={() => marcarLeida(n.id_notificacion)}
                    className="mt-2 px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                  >
                    Marcar como leída
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Notificaciones;
