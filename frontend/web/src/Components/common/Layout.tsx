import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../../css/Login.module.css";

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

  const token = !!localStorage.getItem("accessToken");

  return (
    <div className="bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/50 to-black/80 pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

      {/* Header solo con logo */}
      {showHeader && (
        <header className={`relative z-10 ${styles.glassEffect}`}>
          <div className="max-w-7xl mx-auto px-4 py-4 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <Link to="/" className="font-['Pacifico'] text-2xl text-primary font-bold">
                Inter-U
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Contenido */}
      <main
        className={`flex-1 relative z-10 ${
          centerContent ? "flex items-center justify-center py-12 px-4" : "px-4 py-10"
        }`}
      >
        {children}
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className={`relative z-10 mt-auto ${styles.glassEffect}`}>
          <div className="max-w-7xl mx-auto px-4 py-6 border-t border-purple-500/20">
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
