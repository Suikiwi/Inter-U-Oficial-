import { useEffect, useState } from "react";
import type { Publication, FiltersPublication } from "../Components/Publications/Types";
import { listarPublicaciones, crearPublicacion, editarPublicacion, eliminarPublicacion } from "../Services/publications";

export const usePublications = (initialFilters: FiltersPublication = {}) => {
  const [items, setItems] = useState<Publication[]>([]);
  const [filtros, setFiltros] = useState<FiltersPublication>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listarPublicaciones(filtros as Record<string, any>);
      setItems(data);
    } catch (e: any) {
      setError(e?.message ?? "Error loading publications");
    } finally {
      setLoading(false);
    }
  };

  const crear = async (payload: Partial<Publication>) => {
    const created = await crearPublicacion(payload);
    setItems((prev) => [created, ...prev]);
    return created;
  };

  const editar = async (id: number, payload: Partial<Publication>) => {
    const updated = await editarPublicacion(id, payload);
    setItems((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const eliminar = async (id: number) => {
    await eliminarPublicacion(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filtros)]);

  return { items, filtros, setFiltros, loading, error, refetch, crear, editar, eliminar };
};
