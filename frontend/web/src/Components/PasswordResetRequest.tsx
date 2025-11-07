import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000"; // ✅ SIN ESPACIO
const DEBUG_MODE = true;

const PasswordResetRequest: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const showAlert = (type: "error" | "success", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 10000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    if (DEBUG_MODE) console.log("[Reset] Enviando email:", email);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/users/reset_password/`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );
      
      if (DEBUG_MODE) console.log("[Reset] Respuesta:", response.status);
      
      showAlert("success", 
        `✅ Solicitud enviada.\n📧 Revisa tu correo (incluye Spam/Promociones)`,
      );
      
      setTimeout(() => navigate("/login"), 3000);

    } catch (err: any) {
      if (DEBUG_MODE) console.error("[Reset] Error:", err.response?.data || err.message);
      
      const errorMsg = err.response?.data?.email?.[0] || 
                      err.response?.data?.detail || 
                      "Error al procesar la solicitud";
      showAlert("error", `❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Recuperar Contraseña</h2>
        {alert && (
          <div className={`mb-4 p-3 rounded ${alert.type === "error" ? "bg-red-600" : "bg-green-600"}`}>
            {alert.message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@inacapmail.cl"
            className="w-full p-3 mb-4 bg-gray-700 rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 p-3 rounded disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
        <Link to="/login" className="text-purple-400 mt-4 block">← Volver al login</Link>
      </div>
    </div>
  );
};

export default PasswordResetRequest;