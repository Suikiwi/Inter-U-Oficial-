import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

interface Reporte {
  id_reporte: number;
  motivo: string;
  estado: number;
  fecha: string;
  publicacion: {
    id_publicacion: number;
    titulo: string;
  };
}

const ModerarReportesPage: React.FC = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchReportes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API_BASE_URL}/reportes/listar/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportes(res.data);
    } catch (err) {
      setError("Error al cargar reportes.");
    }
  };

  const moderar = async (id: number, accion: "aprobar" | "rechazar" | "eliminar") => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `${API_BASE_URL}/reportes/${id}/moderar/`,
        { accion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchReportes(); // refrescar lista
    } catch (err) {
      console.error("Error al moderar reporte:", err);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  const estadoTexto = (estado: number) => {
    switch (estado) {
      case 0: return "Pendiente";
      case 1: return "Aceptado";
      case 2: return "Rechazado";
      default: return "Desconocido";
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-purple-100 mb-4">Panel de Moderación de Reportes</h2>
      {error && <p className="text-red-400">{error}</p>}
      {reportes.length === 0 ? (
        <p className="text-slate-400">No hay reportes pendientes.</p>
      ) : (
        <ul className="space-y-4">
          {reportes.map((r) => (
            <li key={r.id_reporte} className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
              <p className="text-slate-300 text-sm mb-1">
                <strong>Motivo:</strong> {r.motivo}
              </p>
              <p className="text-slate-400 text-xs mb-2">
                <strong>Publicación:</strong> {r.publicacion?.titulo || "—"} |{" "}
                <strong>Fecha:</strong> {new Date(r.fecha).toLocaleString()} |{" "}
                <strong>Estado:</strong> {estadoTexto(r.estado)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => moderar(r.id_reporte, "aprobar")}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => moderar(r.id_reporte, "rechazar")}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => moderar(r.id_reporte, "eliminar")}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  Eliminar publicación
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModerarReportesPage;
