// src/Components/publications/PublicationsFeed.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Publication } from "../../Components/publications/Types";
import PublicationFormModal from "./PublicationFormModal";
import { useNavigate } from "react-router-dom";
import { getUserIdFromAccessToken } from "../../services/auth";
import { CrearReporteVisual } from "../reportes/CrearReporteVisual";

const API_BASE_URL = "http://127.0.0.1:8000"; // sin /api
const PUBLICACIONES_ENDPOINT = `${API_BASE_URL}/publicaciones/`;

const PublicationsFeed: React.FC = () => {
  const [publicaciones, setPublicaciones] = useState<Publication[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | undefined>(undefined);
  const navigate = useNavigate();
  const userId = getUserIdFromAccessToken();

  const fetchPublicaciones = async () => {
    try {
      const response = await axios.get(PUBLICACIONES_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
      });
      setPublicaciones(response.data);
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
    }
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  const iniciarChat = (idPublicacion: number) => {
    navigate(`/chat/${idPublicacion}`);
  };

  const handleDelete = async (id: number) => {
    try {
      // Si tienes DELETE en backend, descomenta:
      // await axios.delete(`${PUBLICACIONES_ENDPOINT}${id}/`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
      // });
      setPublicaciones((prev) => prev.filter((p) => p.id_publicacion !== id));
    } catch (error) {
      console.error("Error al eliminar publicación:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
      {publicaciones.length === 0 ? (
        <p className="text-slate-400">No hay publicaciones aún.</p>
      ) : (
        publicaciones.map((p) => {
          const isOwner = userId === p.estudiante;

          return (
            <div
              key={p.id_publicacion}
              className="bg-slate-800 p-4 rounded-lg border border-slate-700 w-full max-w-md mx-auto"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-purple-100 font-semibold text-lg">{p.titulo}</h4>
              </div>

              <p className="text-slate-300 text-sm">{p.descripcion}</p>
              <p className="text-slate-400 text-xs mt-2">
                Habilidades buscadas: {p.habilidades_buscadas?.join(", ") || "—"}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {/* Un usuario NO puede iniciar chat ni crear reporte sobre su propia publicación */}
                {!isOwner && (
                  <>
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      onClick={() => iniciarChat(p.id_publicacion)}
                      title="Iniciar chat con el autor"
                    >
                      Iniciar chat
                    </button>

                    <CrearReporteVisual context={{ publicacionId: p.id_publicacion }} />
                  </>
                )}

                {/* El autor SÍ puede editar o eliminar su propia publicación */}
                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        setEditId(p.id_publicacion);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      title="Editar mi publicación"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id_publicacion)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      title="Eliminar mi publicación"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}

      {showModal && (
        <PublicationFormModal
          idEdit={editId}
          onClose={() => setShowModal(false)}
          onSaved={async () => {
            setShowModal(false);
            await fetchPublicaciones(); // refrescar después de guardar
          }}
        />
      )}
    </div>
  );
};

export default PublicationsFeed;
