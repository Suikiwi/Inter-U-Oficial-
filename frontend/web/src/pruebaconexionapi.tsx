import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PruebaConexionAPI: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const navigate = useNavigate();

  const showAlert = (type: 'error' | 'success', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showAlert('error', 'Por favor completa todos los campos');
      return;
    }

    // ✅ Validación corregida para correos institucionales de INACAP
    if (!email.includes('@inacap.cl')) {
      showAlert('error', 'Por favor ingresa un correo institucional válido de INACAP');
      return;
    }

    if (password.length < 8) {
      showAlert('error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/login/',
        {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'api_43eb0e60c8ca455fa1fe1985ffd026a0', // reemplaza con tu clave real si el backend lo requiere
          },
          withCredentials: true,
        }
      );

      const { message, token } = response.data;

      showAlert('success', message || 'Inicio de sesión exitoso');

      if (token) {
        localStorage.setItem('authToken', token);
      }

      setTimeout(() => navigate('/profile'), 1500);
    } catch (error: any) {
      if (error.response) {
        showAlert('error', error.response.data.message || 'Credenciales inválidas');
      } else {
        showAlert('error', 'No se pudo conectar con el servidor');
      }
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-[400px] h-[400px] bg-gradient-radial from-purple-700 via-slate-900 to-purple-700 rounded-xl shadow-xl flex flex-col justify-center px-6">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">¡Bienvenido de nuevo!</h2>
        <p className="text-slate-300 text-center mb-4 text-sm">Accede a tu universo académico</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-200 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 text-white rounded-md border border-slate-600 placeholder-slate-400 text-sm"
              placeholder="usuario@inacap.cl"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-200 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 text-white rounded-md border border-slate-600 placeholder-slate-400 text-sm"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="mr-2"
              />
              Recordarme
            </label>
            <a href="#" className="text-purple-300 hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition text-sm"
          >
            Iniciar Sesión
          </button>
        </form>

        {alert && (
          <div
            className={`mt-3 px-3 py-2 rounded-md border text-sm ${
              alert.type === 'error'
                ? 'bg-red-100 border-red-400 text-red-700'
                : 'bg-green-100 border-green-400 text-green-700'
            }`}
          >
            {alert.message}
          </div>
        )}
      </div>
    </main>
  );
};

export default PruebaConexionAPI;
