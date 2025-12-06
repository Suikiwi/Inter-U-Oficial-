import type { ReactNode } from "react";
import styles from "../../css/Profile.module.css";   /* mismo CSS que usa Profile */

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
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-x-hidden">
      {/* Fondos (copiados de Profile) */}
      <div className="fixed inset-0 bg-[radial-linear(ellipse_at_top,var(--tw-linear-stops))] from-purple-900/20 via-slate-900/50 to-black/80 pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

      {/* Header idéntico al de Profile */}
      {showHeader && (
        <header className={`relative z-10 ${styles.glassEffect}`}>
          <div className="max-w-7xl mx-auto px-4 py-4 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <span className="font-['Pacifico'] text-2xl text-primary font-bold">Inter-U</span>
            </div>
          </div>
        </header>
      )}

      {/* Main con el mismo espaciado que Profile */}
      <main className="relative z-10 py-12 px-4">
        <div className={`max-w-7xl mx-auto ${centerContent ? "flex items-center justify-center min-h-[calc(100vh-8rem)]" : ""}`}>
          {children}
        </div>
      </main>

      {/* Footer idéntico al de Profile */}
      {showFooter && (
        <footer className={`relative z-10 ${styles.glassEffect}`}>
          <div className="max-w-7xl mx-auto px-4 py-6 border-t border-purple-500/20">
            <div className="text-center text-sm text-slate-400">
              <p>© 2025 Inter-U. Todos los derechos reservados.</p>
              <div className="flex justify-center space-x-4 mt-2">
                <span className="text-purple-400">Políticas</span>
                <span className="text-purple-400">Términos</span>
                <span className="text-purple-400">Soporte</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};