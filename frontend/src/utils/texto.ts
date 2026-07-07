/**
 * Límites de longitud de las entradas de texto (espejo de los DTOs del backend)
 * y limpieza de texto libre.
 */

/** Narrativa o pregunta de la consulta de emergencia. */
export const LIMITE_NARRATIVA = 400;
/** Texto libre largo: mensaje de regla, descripción, detalle de condición. */
export const LIMITE_TEXTO_LARGO = 300;
/** Texto corto: nombres, apellidos, nombres de catálogo. */
export const LIMITE_TEXTO_CORTO = 100;
/** Longitud máxima de un correo (RFC 5321). */
export const LIMITE_EMAIL = 254;
/** bcrypt solo usa los primeros 72 bytes de la contraseña. */
export const LIMITE_PASSWORD = 72;

/**
 * Sanitiza texto libre antes de enviarlo: elimina etiquetas tipo HTML
 * (aunque no se ejecutan, se ve mal que queden almacenadas) y caracteres
 * de control, conservando los saltos de línea.
 */
export function limpiarTexto(valor: string): string {
  return valor
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x09\x0b-\x1f\x7f]/g, "")
    .trim();
}
