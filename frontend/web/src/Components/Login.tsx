// src/pages/Login.tsx
import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Layout } from "../Components/Layout";
import styles from "../Css/Login.module.css";

const API_BASE_URL = "http://127.0.0.1:8000";
const DEBUG_MODE = false;

const log = (...args: any[]) => {
  if (DEBUG_MODE) console.log("[Login Debug]:", ...args);
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ 
    type: "error" | "success" | "info"; 
    message: string; 
    details?: any 
  } | null>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const showAlert = (type: "error" | "success" | "info", message: string, details?: any) => {
    setAlert({ type, message, details });
    setTimeout(() => setAlert(null), 5000);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!email.trim() || !password.trim()) errors.push("Debe completar todos los campos.");
    if (email.trim() && !email.trim().endsWith("@inacapmail.cl")) {
      errors.push("Debe usar un correo institucional @inacapmail.cl");
    }
    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    log(" Iniciando login...", { email, password: password ? "***" : "" });

    const errors = validateForm();
    if (errors.length > 0) {
      showAlert("error", errors.join(" "));
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/jwt/create/`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      log("Login exitoso! Token recibido");

      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      
      showAlert("success", "Login exitoso! Redirigiendo...");
      
      setTimeout(() => {
        navigate("/profile", { replace: true });
      }, 2000);

    } catch (error: any) {
      log(" Error en login:", error.response?.data || error.message);
      
      if (error.code === 'ERR_NETWORK') {
        showAlert("error", "No se pudo conectar con el backend");
      } else if (error.response?.status === 401) {
        showAlert("error", "Credenciales inválidas");
      } else {
        showAlert("error", "Error de autenticación");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout centerContent={true}>
      <div className={`max-w-md w-full ${styles.fadeInUp}`}>
        {alert && (
          <div className={`mb-4 px-4 py-3 rounded-lg border text-sm backdrop-blur-md ${
            alert.type === "error" ? "bg-red-100 border-red-400 text-red-700" : "bg-green-100 border-green-400 text-green-700"
          }`}>
            <div className="font-medium">{alert.message}</div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className={styles.floatAnimation}>
            <div className={`w-20 h-20 mx-auto mb-6 bg-linear-to-r from-primary to-purple-600 rounded-full flex items-center justify-center ${styles.glowAnimation}`}>
              <i className="ri-login-box-line text-white text-2xl"></i>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2 bg-linear-to-r from-white to-slate-300 bg-clip-text text-transparent">
            ¡Bienvenido de nuevo!
          </h2>
          <p className="text-slate-400">Accede a tu universo académico</p>
        </div>

        <form onSubmit={handleSubmit} className={`rounded-xl p-8 ${styles.glassEffect} ${styles.glowAnimation}`}>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Correo Electrónico *</label>
              <div className="relative">
                <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                  placeholder="usuario@inacapmail.cl"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Contraseña *</label>
              <div className="relative">
                <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="text-right">
              <Link to="/reset-password" className="text-sm text-primary hover:text-purple-400 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-linear-to-r from-primary to-purple-600 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-primary transition-all disabled:opacity-50 ${styles.glowAnimation}`}
            >
              <span className="flex items-center justify-center space-x-2">
                <span>{loading ? "Iniciando sesión..." : "Iniciar Sesión"}</span>
                {loading && <i className="ri-loader-4-line animate-spin"></i>}
              </span>
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">¿No tienes una cuenta?</p>
          <Link to="/register" className="inline-flex items-center space-x-2 text-primary hover:text-purple-400 font-medium transition-all duration-300 mt-2">
            <span>Regístrate aquí</span>
            <i className="ri-external-link-line text-xs"></i>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Login;