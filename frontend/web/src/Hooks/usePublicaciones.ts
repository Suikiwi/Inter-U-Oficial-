import { useEffect, useState } from "react";
import type { Publication, FiltersPublication } from "../Components/Publications/Types";
import { listarPublicaciones } from "../Services/publications";

export const usePublications = (initialFilters: FiltersPublication = {}) => {
  const [items, setItems] = useState<Publication[]>([]);
  const [filtros, setFiltros] = useState<FiltersPublication>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarPublicaciones(filtros);
      setItems(data);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar publicaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [JSON.stringify(filtros)]);

  return { items, filtros, setFiltros, loading, error, refetch };
};
