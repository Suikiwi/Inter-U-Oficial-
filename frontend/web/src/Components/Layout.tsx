import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../Css/Login.module.css";
import SidebarMenu from "../Components/Publications/SidebarMenu";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  centerContent?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  centerContent = false,
}) => {
  const location = useLocation();
  const isAuthPage =
    location.pathname.includes("/login") ||
    location.pathname.includes("/register") ||
    location.pathname.includes("/reset-password");

  const token = !!localStorage.getItem("accessToken");

  return (
    <div className="bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Fondo */}
      <div className="fixed inset-0 bg-[radial-linear(ellipse_at_top,var(--tw-linear-stops))] from-purple-900/20 via-slate-900/50 to-black/80 pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

      {/* Header */}
      {showHeader && (
        <header className={`relative z-10 ${styles.glassEffect}`}>
          <div className="max-w-7xl mx-auto px-4 py-4 border-b border-purple-500/20 ml-24">
            <div className="flex items-center justify-between">
              <Link to="/" className="font-['Pacifico'] text-2xl text-primary font-bold">
                Inter-U
              </Link>

              <nav className="flex gap-4 items-center">
                <Link to="/publications" className="text-slate-300 hover:text-primary" title="Feed">
                  <i className="ri-home-4-line text-xl" />
                </Link>

                {token ? (
                  <>
                    <Link to="/notifications" className="text-slate-300 hover:text-primary" title="Notificaciones">
                      <i className="ri-notification-3-line text-xl" />
                    </Link>
                    <Link to="/messages" className="text-slate-300 hover:text-primary" title="Mensajes">
                      <i className="ri-mail-line text-xl" />
                    </Link>
                    <Link to="/profile" className="text-slate-300 hover:text-primary" title="Perfil">
                      <i className="ri-user-3-line text-xl" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-slate-300 hover:text-primary" title="Iniciar sesión">
                      <i className="ri-login-box-line text-xl" />
                    </Link>
                    <Link to="/register" className="text-slate-300 hover:text-primary" title="Registrarse">
                      <i className="ri-user-add-line text-xl" />
                    </Link>
                  </>
                )}

                {isAuthPage && (
                  <Link to="/login" className="text-slate-300 hover:text-primary" title="Volver">
                    <i className="ri-arrow-go-back-line text-xl" />
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </header>
      )}

      {/* Sidebar fijo */}
      <SidebarMenu />

      {/* Contenido principal con margen izquierdo */}
      <main
        className={`flex-1 relative z-10 ${centerContent ? "flex items-center justify-center py-12 px-4" : "ml-24 px-4 py-10"}`}
      >
        {children}
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className={`relative z-10 mt-auto ${styles.glassEffect}`}>
          <div className="max-w-7xl mx-auto px-4 py-6 border-t border-purple-500/20 ml-24">
            <div className="text-center text-sm text-slate-400">
              <p>© 2025 Inter-U. Todos los derechos reservados.</p>
              <div className="flex justify-center space-x-4 mt-2">
                <Link to="/privacy" className="text-purple-400 hover:text-purple-300">Políticas</Link>
                <Link to="/terms" className="text-purple-400 hover:text-purple-300">Términos</Link>
                <Link to="/support" className="text-purple-400 hover:text-purple-300">Soporte</Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
