/**
 * Validaciones en tiempo real de los formularios, espejo de las reglas
 * del backend (cedula_service.py, EmailStr y edad_validator.py).
 */

export const EDAD_MINIMA = 18;

/** Valida una cédula ecuatoriana: 10 dígitos, provincia 01-24, tercer dígito
 * <= 5 y dígito verificador (módulo 10 con coeficientes 2,1,2,1,2,1,2,1,2). */
export function cedulaValida(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) {
    return false;
  }
  const provincia = Number(cedula.slice(0, 2));
  if (provincia < 1 || provincia > 24) {
    return false;
  }
  if (Number(cedula[2]) > 5) {
    return false;
  }
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const suma = coeficientes.reduce((acc, coef, i) => {
    const producto = Number(cedula[i]) * coef;
    return acc + (producto > 9 ? producto - 9 : producto);
  }, 0);
  const verificador = (10 - (suma % 10)) % 10;
  return verificador === Number(cedula[9]);
}

/** Formato básico de correo (la validación estricta la hace el backend). */
export function emailValido(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

/** Fecha de nacimiento máxima permitida: hoy hace EDAD_MINIMA años. */
export function fechaMaximaNacimiento(): Date {
  const fecha = new Date();
  fecha.setFullYear(fecha.getFullYear() - EDAD_MINIMA);
  return fecha;
}
