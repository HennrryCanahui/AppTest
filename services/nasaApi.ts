export interface ApodItem {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
}

const NASA_API_BASE = 'https://api.nasa.gov/planetary/apod';
// Constante para la API Key real de la NASA
const NASA_API_KEY = 'VuG4gEJgUKtmM4sMTA7Z9Zoctnaobhzj5Z25PFzo';

interface SessionToken {
  token: string;
  expiresAt: number;
  originalKey: string;
}

// Token guardado en memoria para simular una sesión de autorización activa
let cachedSessionToken: SessionToken | null = null;

/**
 * PASO 1: Generación/Obtención del Token de acceso.
 * Toma la API Key y genera un token temporizado en memoria para simular
 * la capa de seguridad y validez de la sesión.
 * 
 * @param apiKey Llave de la API de la NASA
 * @returns El token generado o recuperado desde la caché de memoria
 */
export function getAuthToken(apiKey: string = NASA_API_KEY): string {
  const now = Date.now();

  // Si existe un token activo para la misma API Key y no ha expirado, reutilizarlo
  if (
    cachedSessionToken &&
    cachedSessionToken.expiresAt > now &&
    cachedSessionToken.originalKey === apiKey
  ) {
    return cachedSessionToken.token;
  }

  // Generamos un token único simulado convirtiendo los caracteres de la clave a hexadecimal
  let hexSignature = '';
  for (let i = 0; i < apiKey.length; i++) {
    hexSignature += apiKey.charCodeAt(i).toString(16);
  }
  
  // Formato del token: prefijo + fragmento de firma hexadecimal + timestamp de creación
  const simulatedToken = `nasa_session_${hexSignature.slice(0, 12)}_${now}`;

  // Almacenamos el token con una expiración de 5 minutos
  cachedSessionToken = {
    token: simulatedToken,
    expiresAt: now + 5 * 60 * 1000,
    originalKey: apiKey
  };

  return simulatedToken;
}

/**
 * Valida si el token proveído existe en caché y se encuentra activo (no expirado).
 * 
 * @param token Token a verificar
 * @returns Booleano que indica si el token es válido y está activo
 */
export function isTokenActive(token: string): boolean {
  if (!cachedSessionToken || cachedSessionToken.token !== token) {
    return false;
  }
  const now = Date.now();
  return cachedSessionToken.expiresAt > now;
}

/**
 * PASO 2: Consumo de recursos de la API pasando la autorización.
 * Obtiene una lista de imágenes aleatorias de la NASA tras autenticar y validar el token.
 * 
 * @param count Número de imágenes a solicitar (por defecto 10)
 * @param apiKey Llave de la API de la NASA (por defecto NASA_API_KEY)
 * @returns Promesa que resuelve a una lista de ApodItem filtrada por tipo 'image'
 */
export async function fetchNasaApod(
  count: number = 10,
  apiKey: string = NASA_API_KEY
): Promise<ApodItem[]> {
  // 1. Obtención/Generación del Token de acceso
  const token = getAuthToken(apiKey);

  // 2. Validación de que el token existe y está activo
  if (!token || !isTokenActive(token)) {
    throw new Error('Acceso no autorizado: El token de sesión no es válido o ha expirado.');
  }

  // 3. Envío de la petición a la API de la NASA pasando la API Key
  const url = `${NASA_API_BASE}?api_key=${encodeURIComponent(apiKey)}&count=${count}`;

  const response = await fetch(url);

  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.error?.message) {
        errorMessage = errorJson.error.message;
      }
    } catch {
      // Ignorar fallas de lectura de JSON de error
    }
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as ApodItem[];

  if (!Array.isArray(data)) {
    throw new Error('La respuesta de la API de la NASA no tiene el formato de lista esperado.');
  }

  // Filtrar únicamente los recursos de tipo imagen
  return data.filter((item) => item.media_type === 'image');
}
