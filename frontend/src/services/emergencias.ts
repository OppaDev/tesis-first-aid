import { getJson } from "@/src/services/api";
import { EmergenciaItem } from "@/src/types/api";

export function listarEmergencias(): Promise<EmergenciaItem[]> {
  return getJson<EmergenciaItem[]>("/emergencias");
}
