/**
 * Configuración de la lectura por voz (TTS) del protocolo.
 * Se ajusta en `.env` con las variables EXPO_PUBLIC_VOZ_*.
 * Las variables de entorno llegan como string, por eso se parsean aquí.
 */

const VELOCIDAD_DEFECTO = 1.15; // 1.0 = normal; súbelo para leer más rápido
const IDIOMA_DEFECTO = "es";

function aNumero(valor: string | undefined, porDefecto: number): number {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : porDefecto;
}

/** Velocidad de lectura. 1.0 = normal; valores mayores leen más rápido. */
export const VOZ_VELOCIDAD = aNumero(
  process.env.EXPO_PUBLIC_VOZ_VELOCIDAD,
  VELOCIDAD_DEFECTO,
);

/** Idioma de la síntesis de voz (BCP-47), p. ej. "es", "es-ES". */
export const VOZ_IDIOMA = process.env.EXPO_PUBLIC_VOZ_IDIOMA ?? IDIOMA_DEFECTO;
