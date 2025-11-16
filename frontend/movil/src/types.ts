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

export interface Publication {
  id_publicacion: number;
  titulo: string;
  descripcion: string;
  habilidades_buscadas: string[];
  habilidades_ofrecidas?: string[];
  fecha_creacion: string;
  estado?: boolean;
  estudiante: number;
  autor_alias?: string;
}