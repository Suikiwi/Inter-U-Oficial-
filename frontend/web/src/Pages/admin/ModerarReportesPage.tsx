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
  } | null;
}

const ModerarReportesPage: React.FC = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [procesando, setProcesando] = useState<number | null>(null);

  const fetchReportes = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${API_BASE_URL}/reportes/listar/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportes(res.data);
    } catch {
      setError("Error al cargar reportes.");
    } finally {
      setLoading(false);
    }
  };

  const moderar = async (
    id: number,
    accion: "aprobar" | "rechazar",
    titulo?: string
  ) => {
    const confirmar = window.confirm(
      accion === "aprobar"
        ? `¿Confirmas aprobar el reporte y eliminar la publicación${titulo ? ` “${titulo}”` : ""}?`
        : `¿Confirmas rechazar el reporte${titulo ? ` de “${titulo}”` : ""}?`
    );
    if (!confirmar) return;

    try {
      setProcesando(id);
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `${API_BASE_URL}/reportes/${id}/moderar/`,
        { accion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchReportes();
    } catch {
      setError("No se pudo procesar la moderación. Intenta nuevamente.");
    } finally {
      setProcesando(null);
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-purple-100">Panel de Moderación de Reportes</h2>
        <button
          onClick={fetchReportes}
          className="px-3 py-1 text-xs bg-slate-700 text-slate-200 rounded hover:bg-slate-600"
        >
          Refrescar
        </button>
      </div>

      {error && <p className="text-amber-300 text-sm mb-3">{error}</p>}
      {loading ? (
        <p className="text-slate-400">Cargando reportes...</p>
      ) : reportes.length === 0 ? (
        <p className="text-slate-400">No hay reportes pendientes.</p>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <ul className="space-y-4">
            {reportes.map((r) => {
              const titulo = r.publicacion?.titulo ?? "—";
              const procesandoEste = procesando === r.id_reporte;

              return (
                <li
                  key={r.id_reporte}
                  className="p-4 bg-slate-800/60 border border-slate-700 rounded-lg"
                >
                  <p className="text-slate-300 text-sm mb-1">
                    <strong>Motivo:</strong> {r.motivo}
                  </p>
                  <p className="text-slate-400 text-xs mb-2">
                    <strong>Publicación:</strong> {titulo} |{" "}
                    <strong>Fecha:</strong> {new Date(r.fecha).toLocaleString()} |{" "}
                    <strong>Estado:</strong> {estadoTexto(r.estado)}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => moderar(r.id_reporte, "aprobar", titulo)}
                      disabled={procesandoEste}
                      className={`px-3 py-1 rounded text-sm ${
                        procesandoEste
                          ? "bg-green-800 text-green-200 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      Aprobar (elimina publicación)
                    </button>

                    <button
                      onClick={() => moderar(r.id_reporte, "rechazar", titulo)}
                      disabled={procesandoEste}
                      className={`px-3 py-1 rounded text-sm ${
                        procesandoEste
                          ? "bg-yellow-800 text-yellow-200 cursor-not-allowed"
                          : "bg-yellow-600 text-white hover:bg-yellow-700"
                      }`}
                    >
                      Rechazar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ModerarReportesPage;
