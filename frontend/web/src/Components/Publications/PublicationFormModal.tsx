import React, { useEffect, useState } from "react";
import { crearPublicacion, editarPublicacion, obtenerPublicacion } from "../../Services/publications";
import type { Publication } from "./Types";
import { useNavigate } from "react-router-dom";
import { getUserIdFromAccessToken } from "../../Services/auth";

interface Props {
  idEdit?: number;
  onClose: () => void;
  onSaved: () => void;
}

const PublicationFormModal: React.FC<Props> = ({ idEdit, onClose, onSaved }) => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [habilidadesText, setHabilidadesText] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!idEdit) return;
      try {
        setLoading(true);
        const p: Publication = await obtenerPublicacion(idEdit);
        setTitulo(p?.titulo ?? "");
        setDescripcion(p?.descripcion ?? "");
        setHabilidadesText(Array.isArray(p?.habilidades_buscadas) ? p.habilidades_buscadas.join(", ") : "");
      } catch (e) {
        console.error("Error cargando publicación:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const habilidades_buscadas = habilidadesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const estudiante = getUserIdFromAccessToken();
    if (!estudiante) {
      alert("No se pudo obtener tu ID de usuario. Intenta iniciar sesión nuevamente.");
      setSaving(false);
      return;
    }

    const payload = { titulo, descripcion, habilidades_buscadas, estudiante };

    try {
      if (idEdit) {
        await editarPublicacion(idEdit, payload);
      } else {
        await crearPublicacion(payload);
      }

      onSaved();
      onClose();
      // navigate("/publications/mias"); ← desactivado
      navigate(0); // ← recarga sin romper sesión
    } catch (err: any) {
      const data = err.response?.data;
      console.error("Error del backend:", data);

      if (data?.perfil) {
        alert("Debes completar tu perfil antes de publicar.");
      } else if (data?.habilidades_ofrecidas) {
        alert("Tu perfil debe tener al menos una habilidad ofrecida.");
      } else if (data?.habilidades_buscadas) {
        alert("Las habilidades buscadas deben ser una lista. Usa comas para separarlas.");
      } else if (data?.titulo) {
        alert("El título es obligatorio.");
      } else if (typeof data === "object" && data) {
        const errores = Object.entries(data)
          .map(([campo, msg]) => `${campo}: ${Array.isArray(msg) ? msg.join(", ") : String(msg)}`)
          .join("\n");
        alert("Error al crear publicación:\n" + errores);
      } else {
        alert("No se pudo crear/editar la publicación.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl rounded-xl bg-slate-800/60 border border-purple-500/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-600/40">
          <h2 className="text-lg md:text-xl font-bold text-purple-100">
            {idEdit ? "Editar publicación" : "Nueva publicación"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/40"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          {loading ? (
            <p className="text-slate-300">Cargando publicación...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Título *</label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Habilidades buscadas *</label>
                <textarea
                  value={habilidadesText}
                  onChange={(e) => setHabilidadesText(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white"
                  placeholder="Ej: React, UX, Gestión de proyectos"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-purple-600 rounded-lg text-white disabled:opacity-50"
                >
                  {saving ? "Guardando..." : idEdit ? "Guardar Cambios" : "Crear Publicación"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicationFormModal;
