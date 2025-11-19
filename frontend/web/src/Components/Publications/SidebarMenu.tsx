import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, MessagesSquare, Bell, ShieldAlert } from "lucide-react";
import { isAdminFromToken } from  "../../Services/auth";
import NotificacionesVisual from "../notificaciones/NotificacionesVisual";
import HistorialChat from "../chat/HistorialChat";

const SidebarMenu: React.FC = () => {
  const navigate = useNavigate();
  const esAdmin = isAdminFromToken();

  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  return (
    <>
      {/* Botones del sidebar */}
      <div className="absolute top-[72px] left-4 z-30 flex flex-col items-center gap-6 bg-slate-800/80 p-4 rounded-xl shadow-lg">
        <button
          title="Perfil"
          onClick={() => navigate("/profile")}
          className="hover:scale-110 transition-transform"
        >
          <User className="text-purple-300 w-6 h-6" />
        </button>

        <button
          title="Historial de chat"
          onClick={() => setMostrarHistorial((prev) => !prev)}
          className="hover:scale-110 transition-transform"
        >
          <MessagesSquare className="text-purple-300 w-6 h-6" />
        </button>

        <button
          title="Notificaciones"
          onClick={() => setMostrarNotificaciones((prev) => !prev)}
          className="hover:scale-110 transition-transform"
        >
          <Bell className="text-purple-300 w-6 h-6" />
        </button>

        {esAdmin && (
          <button
            title="Moderar reportes"
            onClick={() => navigate("/moderar-reportes")}
            className="hover:scale-110 transition-transform"
          >
            <ShieldAlert className="text-red-400 w-6 h-6" />
          </button>
        )}
      </div>

      {/* Panel flotante de historial */}
      {mostrarHistorial && (
        <div className="fixed top-[72px] left-24 z-40 w-[300px] max-h-[80vh] overflow-y-auto bg-slate-900/80 border border-slate-700 rounded-xl p-4 shadow-xl">
          <HistorialChat />
        </div>
      )}

      {/* Panel flotante de notificaciones */}
      {mostrarNotificaciones && (
        <div className="fixed top-[72px] left-24 z-40 w-[300px] max-h-[80vh] overflow-y-auto bg-slate-900/80 border border-slate-700 rounded-xl p-4 shadow-xl">
          <NotificacionesVisual />
        </div>
      )}
    </>
  );
};

export default SidebarMenu;
