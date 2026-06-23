import { create } from "zustand";

import { ConsultaResponse } from "@/src/types/api";

/**
 * Guarda el último resultado de consulta para pasarlo del chat (`consulta.tsx`)
 * a la pantalla independiente de protocolo (`protocolo.tsx`) sin serializar el
 * payload en los params de la ruta.
 */
interface ResultadoState {
  resultado: ConsultaResponse | null;
  setResultado: (r: ConsultaResponse) => void;
  limpiar: () => void;
}

export const useResultadoStore = create<ResultadoState>((set) => ({
  resultado: null,
  setResultado: (r) => set({ resultado: r }),
  limpiar: () => set({ resultado: null }),
}));
