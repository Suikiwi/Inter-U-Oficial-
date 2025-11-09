import React from "react";
import type { FiltersPublication } from "./Types";

interface Props {
  filtros: FiltersPublication;
  onChange: (f: FiltersPublication) => void;
}

const FiltersPanel: React.FC<Props> = ({ filtros, onChange }) => {
  const set = (patch: Partial<FiltersPublication>) => onChange({ ...filtros, ...patch });

  return (
    <div className="rounded-xl p-4 bg-slate-800/50 border border-slate-700 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Buscar por texto..."
          value={filtros.texto ?? ""}
          onChange={(e) => set({ texto: e.target.value || undefined })}
          className="px-3 py-2 rounded bg-slate-800/50 border border-slate-600/50 text-white"
        />
        <input
          placeholder="Habilidades (coma)"
          value={(filtros.habilidades ?? []).join(", ")}
          onChange={(e) =>
            set({
              habilidades: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          className="px-3 py-2 rounded bg-slate-800/50 border border-slate-600/50 text-white"
        />
        <select
          value={filtros.ordenar ?? "recientes"}
          onChange={(e) => set({ ordenar: e.target.value as "recientes" | "relevancia" })}
          className="px-3 py-2 rounded bg-slate-800/50 border border-slate-600/50 text-white"
        >
          <option value="recientes">Recientes</option>
          <option value="relevancia">Relevancia</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onChange({})}
          className="px-4 py-2 border border-slate-600 rounded text-slate-300 hover:bg-slate-700/50"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default FiltersPanel;
