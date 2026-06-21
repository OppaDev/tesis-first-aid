import { postForm, postJson } from "@/src/services/api";
import { ConsultaResponse } from "@/src/types/api";

export function consultarTexto(texto: string): Promise<ConsultaResponse> {
  return postJson<ConsultaResponse>("/consulta", { texto });
}

export function consultarAudio(uri: string): Promise<ConsultaResponse> {
  const form = new FormData();
  // En React Native, FormData acepta { uri, name, type } para archivos.
  form.append("archivo", {
    uri,
    name: "consulta.m4a",
    type: "audio/m4a",
  } as any);
  return postForm<ConsultaResponse>("/consulta/audio", form);
}
