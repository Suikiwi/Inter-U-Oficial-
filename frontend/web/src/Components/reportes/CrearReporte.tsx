import React, { useState } from "react";
import axios from "axios";

interface CrearReporteProps {
  context?: {
    chatId?: number;
    publicacionId?: number;
  };
}

const API_BASE_URL = "http://127.0.0.1:8000";

const CrearReporte: React.FC<CrearReporteProps> = ({ context }) => {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const crear = async () => {
    if (!motivo.trim()) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${API_BASE_URL}/reportes/`,
        {
          motivo,
          chat: context?.chatId ?? null,
          publicacion: context?.publicacionId ?? null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(true);
      setMotivo("");
      setError(null);

      // Cerrar el modal después de mostrar confirmación por 2 segundos
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Error al crear reporte:", err);
      setError("No se pudo enviar el reporte.");
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
        disabled={success}
      >
        Crear reporte
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-slate-800/80 border border-slate-700 rounded-xl p-5">
            <h3 className="text-purple-200 font-bold mb-3">Nuevo reporte</h3>

            {!success ? (
              <>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded text-white text-sm"
                  rows={4}
                  placeholder="Describe el motivo del reporte..."
                />
                <div className="mt-4 flex gap-2">
                  <button onClick={crear} className="px-3 py-2 bg-yellow-600 text-white rounded text-sm">
                    Enviar
                  </button>
                  <button onClick={() => setOpen(false)} className="px-3 py-2 border border-slate-600 rounded text-slate-300 text-sm">
                    Cancelar
                  </button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              </>
            ) : (
              <p className="text-green-400 text-sm mt-2 text-center">Reporte enviado correctamente</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearReporte;
