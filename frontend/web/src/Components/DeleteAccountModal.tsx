import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

const DeleteAccountModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!password) {
      setError("Debes ingresar tu contraseña");
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await onConfirm(password);
      onClose();
    } catch (err: any) {
      setError(err.message || "Contraseña incorrecta");
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-xl p-8 bg-slate-800/50 border border-red-500/20 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-full flex items-center justify-center">
            <i className="ri-alert-line text-red-500 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Eliminar Cuenta</h2>
          <p className="text-slate-300">
            Esta acción es irreversible. Se eliminarán todos tus datos.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirma tu contraseña *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:border-red-500 focus:outline-none"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error && (
            <div className="px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={deleting}
              className="flex-1 px-6 py-3 bg-red-600 rounded-lg text-white font-medium hover:bg-red-500 transition-all disabled:opacity-50"
            >
              {deleting ? "Eliminando..." : "Eliminar Cuenta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
