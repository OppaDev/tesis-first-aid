import { getJson } from "@/src/services/api";
import { CategoriaConCondiciones } from "@/src/types/api";

export function listarCatalogo(): Promise<CategoriaConCondiciones[]> {
  return getJson<CategoriaConCondiciones[]>("/condiciones");
}
