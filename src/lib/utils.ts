import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Función throttle para limitar la frecuencia de ejecución de una función
 * @param fn Función a ejecutar
 * @param wait Tiempo mínimo entre ejecuciones en ms
 * @returns Función throttled
 */
export function throttle<T extends (...args: unknown[]) => ReturnType<T>>(fn: T, wait: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function(...args: Parameters<T>) {
    const now = Date.now();
    const delta = now - lastCall;

    if (delta < wait) {
      // Guardar los argumentos más recientes para ejecutarlos cuando termine el tiempo
      lastArgs = args;

      // Asegurar que tenemos solo un timeout pendiente
      if (timeout === null) {
        timeout = setTimeout(() => {
          lastCall = Date.now();
          timeout = null;
          
          if (lastArgs) {
            fn(...lastArgs);
            lastArgs = null;
          }
        }, wait - delta);
      }
      
      return;
    }

    lastCall = now;
    fn(...args);
    lastArgs = null;
  };
}

/**
 * Suspende la ejecución durante el tiempo especificado
 * @param ms Tiempo en milisegundos
 * @returns Promise que se resuelve después del tiempo especificado
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Comprueba si un objeto es una promesa
 * @param value Valor a comprobar
 * @returns Boolean indicando si es una promesa
 */
export const isPromise = <T>(value: unknown): value is Promise<T> => {
  return Boolean(value) && typeof value === 'object' && value !== null && 'then' in value && typeof (value as {then: unknown}).then === 'function';
};

/**
 * Intenta una operación con reintentos automáticos
 * @param operation Función a ejecutar
 * @param retries Número de reintentos
 * @param delay Tiempo entre reintentos en ms
 * @returns Promise con el resultado de la operación
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 300
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    await sleep(delay);
    return withRetry(operation, retries - 1, delay * 1.5);
  }
}
