// src/components/ConsentModal.tsx
import React, { useEffect, useState } from "react";

type Props = {
  visible: boolean;
  onAccept: () => void;
  onDecline?: () => void;
};

const ConsentModal: React.FC<Props> = ({ visible, onAccept, onDecline }) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!visible) setChecked(false);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-2xl w-full bg-slate-900 rounded-lg shadow-lg p-6 text-slate-200">
        <h3 className="text-xl font-semibold mb-3">Consentimiento informado</h3>

        <div className="text-sm leading-relaxed mb-4">
          <p className="mb-2">
            Al registrarte y usar Inter-U autorizas el tratamiento de tus datos para fines académicos y administrativos.
          </p>
          <p className="mb-2">
            La información recolectada (correo institucional, nombre, publicaciones y metadatos) será utilizada exclusivamente con fines educativos y de gestión institucional.
          </p>
          <p className="mb-2">
            Puedes revocar este consentimiento en cualquier momento mediante los canales establecidos en la plataforma.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Más detalles sobre la política de privacidad y tratamiento de datos están disponibles en la sección correspondiente.
          </p>
        </div>

        <label className="flex items-start space-x-3 mb-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary focus:ring-0"
          />
          <span className="text-sm">
            He leído la información y doy mi consentimiento para el tratamiento de datos con las finalidades descritas
          </span>
        </label>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => onDecline && onDecline()}
            className="px-4 py-2 rounded-md bg-slate-700 text-sm text-slate-200 hover:bg-slate-600"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => {
              if (!checked) return;
              try {
                localStorage.setItem("interu_consent", "accepted");
              } catch {}
              onAccept();
            }}
            disabled={!checked}
            className={`px-4 py-2 rounded-md text-sm text-white ${checked ? "bg-linear-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary" : "bg-slate-700 opacity-60 cursor-not-allowed"}`}
          >
            Aceptar y continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
