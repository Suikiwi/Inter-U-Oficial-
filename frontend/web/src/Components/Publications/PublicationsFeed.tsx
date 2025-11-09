import React, { useState } from "react";
import FiltersPanel from "./FiltersPanel";
import { usePublications } from "../../Hooks/usePublicaciones";
import type { Publication } from "./Types";

const PublicationsFeed: React.FC = () => {
  const { items, filtros, setFiltros, loading, error } = usePublications();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-100">Publicaciones globales</h1>
        <div className="flex gap-3">
          <input
            placeholder="Buscar..."
            value={filtros.texto ?? ""}
            onChange={(e) => setFiltros({ ...filtros, texto: e.target.value || undefined })}
            className="px-3 py-2 rounded bg-slate-800/50 border border-slate-600/50 text-white text-sm"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 bg-slate-700 text-white rounded-lg"
            title="Filtros"
          >
            <i className="ri-filter-3-line"></i>
          </button>
        </div>
      </div>

      {showFilters && <FiltersPanel filtros={filtros} onChange={setFiltros} />}

      {loading && <p className="text-slate-300">Cargando...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && items.length === 0 && (
        <div className="px-4 py-3 rounded border border-slate-600 bg-slate-800/50 text-slate-300">
          No se encontraron publicaciones.
        </div>
      )}

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p: Publication) => (
          <li key={p.id_publicacion} className="rounded-xl p-4 bg-slate-800/50 border border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{p.titulo}</h3>
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
                <p className="text-xs text-slate-400">{p.autor_alias ?? `Usuario ${p.estudiante}`}</p>
                <p className="text-xs text-slate-500">{new Date(p.fecha_creacion).toLocaleDateString()}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PublicationsFeed;
