import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Publication } from "../../Components/Publications/Types";
import PublicationFormModal from "./PublicationFormModal";
import { useNavigate } from "react-router-dom";
import { getUserIdFromAccessToken } from "../../Services/auth";
import CrearReporte from "../reportes/CrearReporte";
import PerfilVista from "../profile/PerfilVista"; 

const API_BASE_URL = "http://127.0.0.1:8000";
const PUBLICACIONES_ENDPOINT = `${API_BASE_URL}/publicaciones/`;

const PublicationsFeed: React.FC = () => {
  const [publicaciones, setPublicaciones] = useState<Publication[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | undefined>(undefined);
  const [perfilModalId, setPerfilModalId] = useState<number | null>(null);

  const navigate = useNavigate();
  const userId = getUserIdFromAccessToken();

  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroHabilidad, setFiltroHabilidad] = useState("");

  const publicacionesFiltradas = publicaciones.filter((p) => {
    const textoMatch =
      filtroTexto === "" ||
      p.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(filtroTexto.toLowerCase());

    const habilidadMatch =
      filtroHabilidad === "" ||
      p.habilidades_buscadas?.some((h) =>
        h.toLowerCase().includes(filtroHabilidad.toLowerCase())
      );

    return textoMatch && habilidadMatch;
  });

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
      setPublicaciones((prev) => prev.filter((p) => p.id_publicacion !== id));
    } catch (error) {
      console.error("Error al eliminar publicación:", error);
    }
  };

  return (
    <div className="pl-6">
      {/* Inputs de filtro */}
      <div className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Buscar por título o descripción..."
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          className="px-3 py-1 rounded bg-slate-700 text-white w-full"
        />
        <input
          type="text"
          placeholder="Filtrar por habilidad..."
          value={filtroHabilidad}
          onChange={(e) => setFiltroHabilidad(e.target.value)}
          className="px-3 py-1 rounded bg-slate-700 text-white w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {publicacionesFiltradas.length === 0 ? (
          <p className="text-slate-400">No hay publicaciones aún.</p>
        ) : (
          publicacionesFiltradas.map((p) => {
            const isOwner = userId === p.estudiante;

            return (
              <div
                key={p.id_publicacion}
                className="bg-slate-800 p-4 rounded-lg border border-slate-700 w-full max-w-md mx-auto"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-purple-100 font-semibold text-lg">{p.titulo}</h4>
                </div>

                {/* Alias + fecha/hora */}
                <p className="text-slate-400 text-xs mb-2">
                  Publicado por{" "}
                  <span
                    onClick={() => setPerfilModalId(p.estudiante)}
                    className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                  >
                    {p.autor_alias || "—"}
                  </span>{" "}
                  el{" "}
                  {p.fecha_creacion
                    ? new Date(p.fecha_creacion).toLocaleDateString()
                    : "—"}{" "}
                  a las{" "}
                  {p.fecha_creacion
                    ? new Date(p.fecha_creacion).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>

                <p className="text-slate-300 text-sm">{p.descripcion}</p>
                <p className="text-slate-400 text-xs mt-2">
                  Habilidades buscadas: {p.habilidades_buscadas?.join(", ") || "—"}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Habilidades ofrecidas: {p.habilidades_ofrecidas?.join(", ") || "—"}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {!isOwner && (
                    <>
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        onClick={() => iniciarChat(p.id_publicacion)}
                        title="Iniciar chat con el autor"
                      >
                        Iniciar chat
                      </button>

                      <CrearReporte context={{ publicacionId: p.id_publicacion }} />
                    </>
                  )}

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
              await fetchPublicaciones();
            }}
          />
        )}
      </div>

      {/* Modal de perfil público del autor */}
      {perfilModalId && (
        <PerfilVista id={perfilModalId} onClose={() => setPerfilModalId(null)} />
      )}
    </div>
  );
};

export default PublicationsFeed;
