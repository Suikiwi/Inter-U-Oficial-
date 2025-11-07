import React, { useEffect, useState } from "react";
import { crearPublicacion, editarPublicacion, obtenerPublicacion } from "../../Services/publications";
import type { Publication, PublicationAvailability, PublicationModality, PublicationType } from "./Types";

interface Props {
  idEdit?: number;
  onClose: () => void;
  onSaved: () => void;
}

const PublicationFormModal: React.FC<Props> = ({ idEdit, onClose, onSaved }) => {
  const [tipo, setTipo] = useState<PublicationType>("oferta");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [habilidadesText, setHabilidadesText] = useState("");
  const [modalidad, setModalidad] = useState<PublicationModality>("remoto");
  const [disponibilidad, setDisponibilidad] = useState<PublicationAvailability>("proyecto");
  const [area, setArea] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [contacto, setContacto] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!idEdit) return;
      const p: Publication = await obtenerPublicacion(idEdit);
      setTipo(p.tipo);
      setTitulo(p.titulo);
      setDescripcion(p.descripcion);
      setHabilidadesText(p.habilidades.join(", "));
      setModalidad(p.modalidad);
      setDisponibilidad(p.disponibilidad);
      setArea(p.area);
      setUbicacion(p.ubicacion || "");
      setContacto(p.contacto || "");
    };
    load();
  }, [idEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const habilidades = habilidadesText.split(",").map((s) => s.trim()).filter(Boolean);
    const payload: Partial<Publication> = {
      tipo,
      titulo,
      descripcion,
      habilidades,
      modalidad,
      disponibilidad,
      area,
      ubicacion,
      contacto,
      estado: "activa",
    };

    try {
      if (idEdit) await editarPublicacion(idEdit, payload);
      else await crearPublicacion(payload);
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl rounded-xl bg-slate-800/60 border border-purple-500/30 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex justify-between items-center p-5 border-b border-slate-600/40">
            <h2 className="text-lg md:text-xl font-bold text-purple-100">
              {idEdit ? "Editar publicación" : "Nueva publicación"}
            </h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/40">
              <i className="ri-close-line text-xl" />
            </button>
          </div>

          <div className="max-h-[75vh] overflow-y-auto custom-scroll p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Tipo *</label>
                  <select value={tipo} onChange={(e) => setTipo(e.target.value as PublicationType)} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white">
                    <option value="oferta">Oferta</option>
                    <option value="demanda">Demanda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">Modalidad *</label>
                  <select value={modalidad} onChange={(e) => setModalidad(e.target.value as PublicationModality)} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white">
                    <option value="remoto">Remoto</option>
                    <option value="presencial">Presencial</option>
                    <option value="híbrido">Híbrido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Título *</label>
                <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white" required />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Descripción *</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white" required />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Habilidades *</label>
                <textarea value={habilidadesText} onChange={(e) => setHabilidadesText(e.target.value)} rows={2} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white" placeholder="Ej: React, UX, Gestión de proyectos" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Disponibilidad *</label>
                  <select value={disponibilidad} onChange={(e) => setDisponibilidad(e.target.value as PublicationAvailability)} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white">
                    <option value="proyecto">Proyecto</option>
                    <option value="part-time">Part-time</option>
                    <option value="full-time">Full-time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">Área *</label>
                  <input value={area} onChange={(e) => setArea(e.target.value)} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Ubicación</label>
                  <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Contacto</label>
                  <input value={contacto} onChange={(e) => setContacto(e.target.value)} className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white" placeholder="Email o enlace" />
                </div>
              </div>

              <div className="sticky bottom-0 pt-3">
                <div className="flex gap-3 bg-slate-800/40 backdrop-blur-sm p-3 rounded-lg">
                  <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-purple-600 rounded-lg text-white disabled:opacity-50">
                    {saving ? "Guardando..." : idEdit ? "Guardar Cambios" : "Crear Publicación"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationFormModal;
