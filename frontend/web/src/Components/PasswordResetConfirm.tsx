// src/pages/PasswordResetConfirm.tsx
import { useState, type FormEvent, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Layout } from "../Components/Layout";
import styles from "../Css/Login.module.css";

const API_BASE_URL = "http://127.0.0.1:8000";
const DEBUG_MODE = false; // Cambia a true para debug

const PasswordResetConfirm: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ 
    type: "error" | "success"; 
    message: string; 
    details?: any 
  } | null>(null);

  useEffect(() => {
    if (DEBUG_MODE) {
      console.log("=== DEBUG PasswordResetConfirm ===");
      console.log("UID:", uid);
      console.log("Token:", token);
    }
  }, [uid, token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    if (password !== confirmPassword) {
      setAlert({ type: "error", message: "Las contraseñas no coinciden" });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/users/reset_password_confirm/`,
        {
          uid: uid,
          token: token,
          new_password: password,
          re_new_password: confirmPassword
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (DEBUG_MODE) console.log("Respuesta:", response.data);

      setAlert({ type: "success", message: "Contraseña restablecida correctamente. Redirigiendo..." });
      setTimeout(() => navigate("/login", { replace: true }), 3000);

    } catch (err: any) {
      const errorData = err.response?.data || {};
      const errorMsg = 
        errorData.new_password?.[0] || 
        errorData.token?.[0] || 
        errorData.uid?.[0] || 
        errorData.detail || 
        "Error al restablecer la contraseña";

      setAlert({ type: "error", message: errorMsg, details: errorData });
      if (DEBUG_MODE) console.error("Error completo:", errorData);
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
            {DEBUG_MODE && alert.details && (
              <pre className="mt-2 text-xs bg-black bg-opacity-20 p-2 rounded text-white">
                {JSON.stringify(alert.details, null, 2)}
              </pre>
            )}
          </div>
        )}

        <div className="text-center mb-8">
          <div className={styles.floatAnimation}>
            <div className={`w-20 h-20 mx-auto mb-6 bg-linear-to-r from-primary to-purple-600 rounded-full flex items-center justify-center ${styles.glowAnimation}`}>
              <i className="ri-lock-password-line text-white text-2xl"></i>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2 bg-linear-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Restablecer Contraseña
          </h2>
          <p className="text-slate-400">Crea tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className={`rounded-xl p-8 ${styles.glassEffect} ${styles.glowAnimation}`}>
          <div className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Nueva Contraseña *</label>
              <div className="relative">
                <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Mínimo 8 caracteres, mayúscula y número"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">Confirmar Contraseña *</label>
              <div className="relative">
                <i className="ri-lock-password-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Repite tu contraseña"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-linear-to-r from-primary to-purple-600 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-primary transition-all disabled:opacity-50 ${styles.glowAnimation}`}
            >
              <span className="flex items-center justify-center space-x-2">
                <span>{loading ? "Procesando..." : "Restablecer Contraseña"}</span>
                {loading && <i className="ri-loader-4-line animate-spin"></i>}
              </span>
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center space-x-2 text-primary hover:text-purple-400 font-medium transition-all duration-300">
            <i className="ri-arrow-left-line text-sm"></i>
            <span>Volver al login</span>
          </Link>
        </div>

        {DEBUG_MODE && uid && token && (
          <div className="mt-6 p-4 bg-black/30 rounded-lg backdrop-blur-sm">
            <h3 className="text-sm font-bold mb-2 text-yellow-400">Debug Info:</h3>
            <p className="text-xs text-slate-300 break-all">UID: {uid}</p>
            <p className="text-xs text-slate-300 break-all">Token: {token?.substring(0, 50)}...</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PasswordResetConfirm;

///python manage.py shell para evaluar si se cambio la contraseña 
//from accounts.models import User
//u = User.objects.get(email="alicia.norambuena@inacapmail.cl")
//print(u.check_password("Proyectointeru1234"))
