/**
 * Sistema de diseño — marca SanFra (COAC San Francisco).
 * Tema oscuro, profesional, con acento lavanda. Sin emojis: se usan iconos.
 */

export const colors = {
  // Base oscura
  fondo: "#0B0B0F",
  superficie: "#16161B",
  tarjeta: "#20202A",
  borde: "#2C2C36",

  // Texto
  texto: "#F5F5F7",
  textoTenue: "#9CA3AF",

  // Acento de marca (lavanda)
  primario: "#C3AEE8", // fondo de botones; usar texto oscuro encima
  primarioFuerte: "#8B6FD6", // estados activos / acentos
  sobrePrimario: "#1A1330",

  // Semánticos (severidad de alertas) — legibles sobre oscuro
  critica: "#F87171",
  alta: "#FB923C",
  media: "#FBBF24",
  baja: "#818CF8",

  // Utilidad
  exito: "#34D399",
  error: "#F87171",
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
