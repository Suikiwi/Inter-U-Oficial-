import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Globe, MessagesSquare, Bell } from "lucide-react";

const SidebarMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-24 bg-slate-900 flex flex-col items-center py-10 space-y-12 fixed top-0 left-0 h-full z-40 border-r border-slate-800">
      <button
        title="Perfil"
        onClick={() => navigate("/perfil")}
        className="hover:scale-110 transition-transform"
      >
        <User className="text-purple-400 w-8 h-8" />
      </button>

      <button
        title="Historial de chat"
        onClick={() => navigate("/historial-chat")}
        className="hover:scale-110 transition-transform"
      >
        <MessagesSquare className="text-purple-400 w-8 h-8" />
      </button>

      <button
        title="Notificaciones"
        onClick={() => navigate("/notificaciones")}
        className="hover:scale-110 transition-transform"
      >
        <Bell className="text-purple-400 w-8 h-8" />
      </button>
    </aside>
  );
};

export default SidebarMenu;
