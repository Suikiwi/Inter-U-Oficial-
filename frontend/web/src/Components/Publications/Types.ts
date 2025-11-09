export interface Publication {
  id_publicacion: number;
  titulo: string;
  descripcion: string;
  habilidades_buscadas: string[];
  habilidades_ofrecidas: string[];
  fecha_creacion: string;
  estado: boolean;
  estudiante: number;
  autor_alias?: string;
}

export interface FiltersPublication {
  texto?: string;
  habilidades?: string[];
  ordenar?: "recientes" | "relevancia";
}
