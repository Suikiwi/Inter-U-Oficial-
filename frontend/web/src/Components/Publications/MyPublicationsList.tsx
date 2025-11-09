import React, { useEffect, useState } from "react";
import { obtenerMisPublicaciones, eliminarPublicacion } from "../../Services/publications";
import type { Publication } from "./Types";

interface Props {
  onEdit: (id: number) => void;
  onRefresh?: () => void;
}

const MyPublicationsList: React.FC<Props> = ({ onEdit, onRefresh }) => {
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obtenerMisPublicaciones();
      setItems(data);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar tus publicaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await eliminarPublicacion(id);
      await load();
      onRefresh?.();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <p className="text-slate-300">Cargando mis publicaciones...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <ul className="space-y-4">
      {items.map((p) => (
        <li key={p.id_publicacion} className="rounded-xl p-4 bg-slate-800/50 border border-slate-700">
          <div className="flex justify-between">
            <div>
              <h3 className="text-white font-semibold">{p.titulo}</h3>
              <p className="text-slate-300 text-sm mt-1">{p.descripcion}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {p.habilidades_buscadas.map((h, i) => (
                  <span key={i} className="px-2 py-1 bg-purple-600/30 text-purple-200 rounded-full text-xs">
                    {h}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">{new Date(p.fecha_creacion).toLocaleDateString()}</p>
              <div className="flex gap-2 mt-2 justify-end">
                <button onClick={() => onEdit(p.id_publicacion)} className="px-3 py-1 bg-slate-700 text-white rounded">
                  Editar
                </button>
                <button onClick={() => handleDelete(p.id_publicacion)} className="px-3 py-1 bg-red-600 text-white rounded">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </li>
      ))}
      {items.length === 0 && (
        <div className="px-4 py-3 rounded border border-slate-600 bg-slate-800/50 text-slate-300">
          Aún no tienes publicaciones.
        </div>
      )}
    </ul>
  );
};

export default MyPublicationsList;
