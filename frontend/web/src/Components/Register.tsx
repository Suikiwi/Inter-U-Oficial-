import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import styles from "../Css/Login.module.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message: successMessage } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ 
    type: "error" | "success"; 
    message: string;
    details?: any;
  } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [acepta, setAcepta] = useState(false);

  const showAlert = (type: "error" | "success", message: string, details?: any) => {
    setAlert({ type, message, details });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      showAlert("error", "Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setAlert(null);

    try {
      await axios.post(`${API_BASE_URL}/api/auth/users/`, {
        email,
        password,
        acepta_politicas: acepta,
      });
      navigate("/login", { state: { message: " Registro exitoso. Revisa tu email para activar tu cuenta." } });
    } catch (err: any) {
      //  CORREGIDO: Eliminada la referencia a `log`
      showAlert("error", err.response?.data?.email?.[0] || "Error en registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-linear(ellipse_at_top,var(--tw-linear-stops))] from-purple-900/20 via-slate-900/50 to-black/80 pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />
      
      <header className={`relative z-10 ${styles.glassEffect}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-['Pacifico'] text-2xl text-primary font-bold">Inter-U</Link>
            <Link to="/login" className="text-slate-300 hover:text-primary transition-colors">Volver</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {alert && (
            <div className={`mb-4 px-4 py-3 rounded-lg border text-sm backdrop-blur-md ${
              alert.type === "error" ? "bg-red-100 border-red-400 text-red-700" : "bg-green-100 border-green-400 text-green-700"
            }`}>
              <div className="font-medium">{alert.message}</div>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 px-4 py-3 rounded-lg border bg-green-100 border-green-400 text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          <div className="text-center mb-8">
            <div className={styles.floatAnimation}>
              <div className={`w-20 h-20 mx-auto mb-6 bg-linear-to-r from-primary to-purple-600 rounded-full flex items-center justify-center ${styles.glowAnimation}`}>
                <i className="ri-user-add-line text-white text-2xl"></i>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-linear-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Crear Cuenta
            </h2>
            <p className="text-slate-400">Únete a la comunidad académica</p>
          </div>

          <form onSubmit={handleSubmit} className={`rounded-xl p-8 ${styles.glassEffect} ${styles.glowAnimation}`}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                <div className="relative">
                  <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                    placeholder="usuario@inacapmail.cl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña *</label>
                <div className="relative">
                  <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Mínimo 8 caracteres, mayúscula y número"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Repetir Contraseña *</label>
                <div className="relative">
                  <i className="ri-lock-password-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Confirma tu contraseña"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={acepta}
                  onChange={(e) => setAcepta(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-slate-800 border-slate-600 rounded focus:ring-purple-500"
                  required
                />
                <span className="text-slate-300 text-sm">Acepto las políticas de uso</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-linear-to-r from-primary to-purple-600 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-primary transition-all disabled:opacity-50 ${styles.glowAnimation}`}
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>{loading ? "Registrando..." : "Crear Cuenta"}</span>
                  {loading && <i className="ri-loader-4-line animate-spin"></i>}
                </span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Register;