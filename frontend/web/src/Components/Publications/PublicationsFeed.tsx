import React, { useState } from "react";
import FiltersPanel from "./FiltersPanel";
import PublicationFormModal from "./PublicationFormModal";
import { usePublications } from "../../Hooks/usePublicaciones";
import type { Publication } from "./Types";

const PublicationsFeed: React.FC = () => {
  const { items, filtros, setFiltros, loading, error, refetch, eliminar } = usePublications();
  const [openForm, setOpenForm] = useState<{ open: boolean; editId?: number }>({ open: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-100">Publicaciones</h1>
        <button onClick={() => setOpenForm({ open: true })} className="px-4 py-2 bg-purple-600 text-white rounded-lg">
          Nueva publicación
        </button>
      </div>

      <FiltersPanel filtros={filtros} onChange={setFiltros} />

      {loading && <p className="text-slate-300">Cargando...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && items.length === 0 && (
        <div className="px-4 py-3 rounded border border-slate-600 bg-slate-800/50 text-slate-300">
          No se encontraron publicaciones para los criterios indicados.
        </div>
      )}

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p: Publication) => (
          <li key={p.id} className="rounded-xl p-4 bg-slate-800/50 border border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-xs px-2 py-1 rounded ${p.tipo === "oferta" ? "bg-green-600/30 text-green-200" : "bg-blue-600/30 text-blue-200"}`}>
                  {p.tipo}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-white">{p.titulo}</h3>
                <p className="text-slate-300 text-sm mt-1 line-clamp-3">{p.descripcion}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {p.habilidades.map((h, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-600/30 text-purple-200 rounded-full text-xs">{h}</span>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-400">{p.autor_alias}</p>
                <p className="text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => setOpenForm({ open: true, editId: p.id })} className="px-3 py-2 text-sm bg-slate-700 text-white rounded">
                Editar
              </button>
              <button onClick={() => eliminar(p.id)} className="px-3 py-2 text-sm bg-red-600 text-white rounded">
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
          onSaved={() => refetch()}
        />
      )}
    </div>
  );
};

export default PublicationsFeed;
