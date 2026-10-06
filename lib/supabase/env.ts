/**
 * Valida una variable de entorno obligatoria.
 *
 * Importante: se llama con `process.env.NEXT_PUBLIC_X` de forma **estática**,
 * nunca con `process.env[name]`. Next.js sólo inlinea en el bundle del cliente
 * los accesos estáticos; un acceso dinámico quedaría `undefined` en el navegador.
 */
export function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copiá .env.example a .env.local y completala.`,
    );
  }
  return value;
}
