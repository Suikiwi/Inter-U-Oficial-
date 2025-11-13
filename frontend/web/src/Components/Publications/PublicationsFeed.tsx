import React, { useEffect, useState } from "react";
import { obtenerPublicacionesGlobal, eliminarPublicacion } from "../../Services/publications";
import type { Publication } from "./Types";
import PublicationFormModal from "./PublicationFormModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getUserIdFromAccessToken } from "../../Services/auth";

const PublicationsFeed: React.FC = () => {
  const [publicaciones, setPublicaciones] = useState<Publication[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | undefined>(undefined);
  const navigate = useNavigate();
  const userId = getUserIdFromAccessToken();

  const fetchData = async () => {
    try {
      const data = await obtenerPublicacionesGlobal();
      setPublicaciones(data);
    } catch (err) {
      console.error("Error al cargar publicaciones:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const iniciarChat = async (idPublicacion: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.post(
        "http://127.0.0.1:8000/api/chats/",
        { publicacion: idPublicacion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/chat/${data.id_chat}`);
    } catch (err) {
      console.error("Error al iniciar chat:", err);
      alert("No se pudo iniciar el chat.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await eliminarPublicacion(id);
      setPublicaciones((prev) => prev.filter((p) => p.id_publicacion !== id));
    } catch (err) {
      console.error("Error al eliminar publicación:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        
      </div>

      {publicaciones.length === 0 ? (
        <p className="text-slate-400">No hay publicaciones aún.</p>
      ) : (
        publicaciones.map((p) => (
          <div
            key={p.id_publicacion}
            className="bg-slate-800 p-4 rounded-lg border border-slate-700"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-purple-100 font-semibold text-lg">{p.titulo}</h4>
              <i className="ri-more-2-fill text-slate-400 text-xl" />
            </div>

            <p className="text-slate-300 text-sm">{p.descripcion}</p>
            <p className="text-slate-400 text-xs mt-2">
              Habilidades buscadas: {p.habilidades_buscadas?.join(", ")}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                onClick={() => iniciarChat(p.id_publicacion)}
              >
                Iniciar chat
              </button>
              <button
                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                onClick={() => console.log("Crear reporte para", p.id_publicacion)}
              >
                Crear reporte
              </button>

              {userId === p.estudiante && (
                <>
                  <button
                    onClick={() => {
                      setEditId(p.id_publicacion);
                      setShowModal(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id_publicacion)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <PublicationFormModal
          idEdit={editId}
          onClose={() => setShowModal(false)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
};

export default PublicationsFeed;
