import { useEffect, useState } from "react";
import axios from "axios";

interface PerfilVistaProps {
  id: number;         
  onClose: () => void;
}

export default function PerfilVista({ id, onClose }: PerfilVistaProps) {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const { data } = await axios.get(
          `http://127.0.0.1:8000/perfiles/usuario/${id}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPerfil(data);
      } catch (err) {
        console.error("Error al cargar perfil:", err);
        setPerfil(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#1A1A2E] text-white p-6 rounded-xl w-[90%] max-w-xl shadow-lg relative">
        {loading ? (
          <p className="text-slate-400">Cargando perfil...</p>
        ) : !perfil ? (
          <p className="text-red-400">No se pudo cargar el perfil.</p>
        ) : (
          <>
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-purple-400 hover:text-purple-300 font-semibold text-lg"
              aria-label="Cerrar"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-2">
              {perfil.alias || `${perfil.nombre} ${perfil.apellido}`}
            </h3>
            <p><strong>Nombre:</strong> {perfil.nombre} {perfil.apellido}</p>
            <p><strong>Carrera:</strong> {perfil.carrera}</p>
            <p><strong>Área:</strong> {perfil.area}</p>
            <p><strong>Biografía:</strong> {perfil.biografia || "—"}</p>
            <p><strong>Habilidades ofrecidas:</strong> {perfil.habilidades_ofrecidas?.join(", ") || "—"}</p>
          </>
        )}
      </div>
    </div>
  );
}
