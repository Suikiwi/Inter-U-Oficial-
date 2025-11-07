import { useEffect, useState } from "react";
import type { PerfilData } from "../Hooks/useProfile";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  perfil: PerfilData | null;
  onSave: (data: Partial<PerfilData>) => Promise<void>;
}

const CARRERAS = [
  "Ingeniería en Informática",
  "Ingeniería en Conectividad y Redes",
  "Ingeniería en Automatización",
  "Ingeniería Civil Industrial",
  "Ingeniería Comercial",
  "Ingeniería Mecánica",
  "Ingeniería Eléctrica",
  "Ingeniería en Construcción",
  "Ingeniería en Prevención de Riesgos",
];

const AREAS = [
  "Desarrollo de Software",
  "Redes y Telecomunicaciones",
  "Automatización Industrial",
  "Gestión de Proyectos",
  "Ciberseguridad",
  "Inteligencia Artificial",
  "Bases de Datos",
  "UX/UI",
  "Cloud Computing",
];

const EditProfileModal: React.FC<Props> = ({ isOpen, onClose, perfil, onSave }) => {
  const [formData, setFormData] = useState<Partial<PerfilData>>({
    nombre: "",
    apellido: "",
    alias: "",
    carrera: "",
    area: "",
    biografia: "",
    foto: "",
    habilidades_ofrecidas: [],
  });

  const [habilidadesText, setHabilidadesText] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (perfil) {
      setFormData({
        nombre: perfil.nombre || "",
        apellido: perfil.apellido || "",
        alias: perfil.alias || "",
        carrera: perfil.carrera || "",
        area: perfil.area || "",
        biografia: perfil.biografia || "",
        foto: perfil.foto || "",
        habilidades_ofrecidas: Array.isArray(perfil.habilidades_ofrecidas) ? perfil.habilidades_ofrecidas : [],
      });
      setHabilidadesText(Array.isArray(perfil.habilidades_ofrecidas) ? perfil.habilidades_ofrecidas.join(", ") : "");
    }
  }, [perfil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const habilidadesArray = habilidadesText
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h.length > 0);
      await onSave({ ...formData, habilidades_ofrecidas: habilidadesArray });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop: solo aquí se cierra al hacer clic fuera */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl rounded-xl bg-slate-800/60 border border-purple-500/30 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-slate-600/40">
            <h2 className="text-lg md:text-xl font-bold text-purple-100">Editar Perfil</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-all"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="max-h-[75vh] overflow-y-auto custom-scroll p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre / Apellido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre ?? ""}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Apellido *</label>
                  <input
                    type="text"
                    value={formData.apellido ?? ""}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Alias */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Alias (público)</label>
                <input
                  type="text"
                  value={formData.alias ?? ""}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Nombre que otros verán"
                />
              </div>

              {/* Carrera / Área */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Carrera *</label>
                  <select
                    value={formData.carrera ?? ""}
                    onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                    required
                  >
                    <option value="">Selecciona tu carrera</option>
                    {CARRERAS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Área *</label>
                  <select
                    value={formData.area ?? ""}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                    required
                  >
                    <option value="">Selecciona tu área</option>
                    {AREAS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Biografía */}
              <div>
                <label className="block text_sm font-medium text-slate-300 mb-1">Biografía</label>
                <textarea
                  value={formData.biografia ?? ""}
                  onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                  rows={3}
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>

              {/* Foto */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">URL de Foto</label>
                <input
                  type="url"
                  value={formData.foto ?? ""}
                  onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                  placeholder="https://ejemplo.com/foto.jpg"
                />
              </div>

              {/* Habilidades */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Habilidades ofrecidas</label>
                <textarea
                  value={habilidadesText}
                  onChange={(e) => setHabilidadesText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                  rows={3}
                  placeholder="Ej: React, UX, Gestión de proyectos"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Sepáralas por coma. Se guardan como lista en la base de datos.
                </p>
              </div>

              {/* Acciones: pegadas abajo del área scroll */}
              <div className="sticky bottom-0 pt-3">
                <div className="flex gap-3 bg-slate-800/40 backdrop-blur-sm p-3 rounded-lg">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-linear-to-r from-primary to-purple-600 rounded-lg text-white font-medium hover:from-purple-600 hover:to-primary transition-all disabled:opacity-50 text-sm"
                  >
                    {saving ? "Guardando..." : "Guardar Cambios"}
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

export default EditProfileModal;
