/**
 * Sistema de diseño — app de primeros auxilios SanFra (COAC San Francisco).
 *
 * Tema CLARO de emergencia: base blanca, limpia y legible, con el ROJO como
 * color de acción/urgencia (botones, alertas críticas). Se conserva el morado
 * institucional de SanFra como acento SECUNDARIO (marca). Sin emojis: iconos.
 */

export const colors = {
  // Base clara
  fondo: "#F3F5F9", // fondo de la app (blanco suave)
  superficie: "#FFFFFF", // inputs, chips, cabeceras
  tarjeta: "#FFFFFF", // tarjetas (elevadas sobre el fondo)
  borde: "#DDE2EA",

  // Texto
  texto: "#16181D",
  textoTenue: "#5B6472",

  // Acento de acción / emergencia (rojo)
  primario: "#DC2626", // fondo de botones; usar texto blanco encima
  primarioFuerte: "#B91C1C", // estados activos / acentos fuertes
  sobrePrimario: "#FFFFFF",

  // Acento institucional SanFra (morado) — secundario / marca
  secundario: "#6D28D9",
  sobreSecundario: "#FFFFFF",

  // Semánticos (severidad de alertas) — legibles sobre claro
  critica: "#DC2626",
  alta: "#EA580C",
  media: "#CA8A04",
  baja: "#6D28D9",

  // Utilidad
  exito: "#16A34A",
  error: "#DC2626",
  transparente: "transparent",
} as const;

export const espaciado = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radio = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

export const tipografia = {
  titulo: 28,
  subtitulo: 20,
  cuerpo: 16,
  etiqueta: 14,
  pequeno: 12,
} as const;

/** Color de la barra/etiqueta según la severidad de una alerta clínica. */
export function colorSeveridad(severidad: string): string {
  switch (severidad) {
    case "critica":
      return colors.critica;
    case "alta":
      return colors.alta;
    case "media":
      return colors.media;
    default:
      return colors.baja;
  }
}
