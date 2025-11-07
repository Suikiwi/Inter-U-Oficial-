export type PublicationType = "oferta" | "demanda";
export type PublicationModality = "remoto" | "presencial" | "híbrido";
export type PublicationAvailability = "part-time" | "full-time" | "proyecto";
export type PublicationState = "activa" | "pausada" | "cerrada";

export interface Publication {
  id: number;
  tipo: PublicationType;
  titulo: string;
  descripcion: string;
  habilidades: string[];
  modalidad: PublicationModality;
  disponibilidad: PublicationAvailability;
  area: string;
  autor_alias: string;
  autor_id: number;
  ubicacion?: string;
  contacto?: string;
  estado: PublicationState;
  created_at: string;
  updated_at: string;
}

export interface FiltersPublication {
  texto?: string;
  tipo?: PublicationType;
  modalidad?: PublicationModality;
  disponibilidad?: PublicationAvailability;
  area?: string;
  estado?: PublicationState;
  habilidades?: string[];
  ordenar?: "recientes" | "relevancia";
}
