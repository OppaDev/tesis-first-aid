/**
 * Política de contraseñas (espejo del backend): mínimo 8 caracteres,
 * al menos una mayúscula, una minúscula y un carácter especial.
 */

export interface RequisitoPassword {
  etiqueta: string;
  cumple: boolean;
}

export function requisitosPassword(pw: string): RequisitoPassword[] {
  return [
    { etiqueta: "Mínimo 8 caracteres", cumple: pw.length >= 8 },
    { etiqueta: "Una mayúscula", cumple: /[A-Z]/.test(pw) },
    { etiqueta: "Una minúscula", cumple: /[a-z]/.test(pw) },
    { etiqueta: "Un carácter especial", cumple: /[^A-Za-z0-9]/.test(pw) },
  ];
}

export function passwordValida(pw: string): boolean {
  return requisitosPassword(pw).every((r) => r.cumple);
}
