// types.ts
export interface PerfilData {
  id?: number;
  nombre: string;
  apellido: string;
  alias?: string;
  carrera?: string;
  area?: string;
  biografia?: string;
  foto?: string;
  habilidades_ofrecidas?: string[];
  email?: string;
  is_admin_interu?: boolean;
}
