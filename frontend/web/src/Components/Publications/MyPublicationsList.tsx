import React, { useEffect, useState } from "react";
import { obtenerPublicacion, eliminarPublicacion } from "../../Services/publications";
import PublicationFormModal from "./PublicationFormModal";
import type { Publication } from "./Types";
import axios from "axios";

const MyPublicationsList: React.FC = () => {
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState<{ open: boolean; editId?: number }>({ open: false });

  const fetchMisPublicaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.get("http://127.0.0.1:8000/api/publicaciones/mias/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(data);
    } catch (err: any) {
      setError("No se pudieron cargar tus publicaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisPublicaciones();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta publicación?")) return;
    try {
      await eliminarPublicacion(id);
      setItems((prev) => prev.filter((p) => p.id_publicacion !== id));
      alert("✅ Publicación eliminada correctamente");
    } catch (err) {
      console.error("Error al eliminar publicación:", err);
      alert("❌ No se pudo eliminar la publicación");
    }
  };

  const handleEdit = (id: number) => {
    setOpenForm({ open: true, editId: id });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-purple-100">Mis publicaciones</h1>

      {loading && <p className="text-slate-300">Cargando...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && items.length === 0 && (
        <div className="px-4 py-3 rounded border border-slate-600 bg-slate-800/50 text-slate-300">
          No tienes publicaciones aún.
        </div>
      )}

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => (
          <li
            key={p.id_publicacion}
            className="rounded-xl p-4 bg-slate-800/50 border border-slate-700 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{p.titulo}</h3>
                <p className="text-slate-300 text-sm mt-1">{p.descripcion}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {p.habilidades_buscadas.map((h, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-purple-600/30 text-purple-200 rounded-full text-xs"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">{p.autor_alias ?? `Usuario ${p.estudiante}`}</p>
                <p className="text-xs text-slate-500">
                  {new Date(p.fecha_creacion).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEdit(p.id_publicacion)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(p.id_publicacion)}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {openForm.open && (
        <PublicationFormModal
          idEdit={openForm.editId}
          onClose={() => setOpenForm({ open: false })}
          onSaved={() => {
            setOpenForm({ open: false });
            fetchMisPublicaciones(); // refrescar lista después de guardar
          }}
        />
      )}
    </div>
  );
};

export default MyPublicationsList;
