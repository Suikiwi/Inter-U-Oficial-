import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Layout } from "../../Components/common/Layout";
import styles from "../../css/Login.module.css";
import ConsentModal from "../../Components/common/ConsentModal";

const API_BASE_URL = "http://127.0.0.1:8000";
const DEBUG_MODE = true;

const log = (...args: any[]) => {
  if (DEBUG_MODE) console.log("[Login Debug]:", ...args);
};

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "success" | "info";
    message: string;
    details?: any;
  } | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [consentModalVisible, setConsentModalVisible] = useState(false);

  const showAlert = (
    type: "error" | "success" | "info",
    message: string,
    details?: any
  ) => {
    setAlert({ type, message, details });
    setTimeout(() => setAlert(null), 5000);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!email.trim() || !password.trim())
      errors.push("Debe completar todos los campos.");
    if (email.trim() && !email.trim().endsWith("@inacapmail.cl")) {
      errors.push("Debe usar un correo institucional @inacapmail.cl");
    }
    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    log("Iniciando login...", { email, password: password ? "***" : "" });

    const errors = validateForm();
    if (errors.length > 0) {
      showAlert("error", errors.join(" "));
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login/`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const accessToken: string = response.data.access;
      const refreshToken: string = response.data.refresh;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const isAdmin = payload?.is_admin_interu === true;

      const consentResp = await axios.get(
        `${API_BASE_URL}/consentimiento/verificar/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      log("Consentimiento:", consentResp.data);
      log("JWT payload:", payload);
      log("is_admin_interu:", isAdmin);

      if (consentResp.data.consentimiento_aceptado) {
        navigate(isAdmin ? "/moderar-reportes" : "/profile", { replace: true });
      } else {
        setConsentModalVisible(true);
      }
    } catch (error: any) {
      log("Error en login:", error?.response?.data ?? error?.message);

      if (error?.code === "ERR_NETWORK") {
        showAlert("error", "No se pudo conectar con el backend");
      } else if (error?.response?.status === 401) {
        showAlert("error", "Credenciales inválidas");
      } else {
        showAlert("error", "Error de autenticación");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ConsentModal
        visible={consentModalVisible}
        onAccept={async () => {
          const token = localStorage.getItem("accessToken");
          if (!token) {
            showAlert("error", "Sesión no válida. Inicia sesión nuevamente.");
            navigate("/login", { replace: true });
            return;
          }

          try {
            await axios.post(
              `${API_BASE_URL}/consentimiento/registrar/`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setConsentModalVisible(false);

            const payload = JSON.parse(atob(token.split(".")[1]));
            const isAdmin = payload?.is_admin_interu === true;
            navigate(isAdmin ? "/moderar-reportes" : "/profile", { replace: true });
          } catch {
            showAlert("error", "No se pudo registrar el consentimiento.");
          }
        }}
        onDecline={() => {
          setConsentModalVisible(true);
        }}
      />

      <Layout centerContent={true}>
        <div className={`max-w-md w-full ${styles.fadeInUp}`}>
          {alert && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg border text-sm backdrop-blur-md ${
                alert.type === "error"
                  ? "bg-red-100 border-red-400 text-red-700"
                  : alert.type === "success"
                  ? "bg-green-100 border-green-400 text-green-700"
                  : "bg-blue-100 border-blue-400 text-blue-700"
              }`}
            >
              <div className="font-medium">{alert.message}</div>
            </div>
          )}

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-white">
              ¡Bienvenido de nuevo!
            </h2>
            <p className="text-slate-400">Accede a tu universo académico</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className={`rounded-xl p-8 ${styles.glassEffect} ${styles.glowAnimation}`}
          >
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                  placeholder="usuario@inacapmail.cl"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">¿No tienes una cuenta?</p>
            <Link to="/register" className="text-primary hover:text-purple-400 font-medium">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Login;
