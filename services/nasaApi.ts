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
const DEFAULT_API_KEY = 'DEMO_KEY';

/**
 * Obtiene una lista de imágenes aleatorias desde la API APOD de la NASA.
 * @param count Número de imágenes a solicitar (por defecto 10)
 * @param apiKey Llave de la API de la NASA (por defecto DEMO_KEY)
 * @returns Promesa que resuelve a una lista de ApodItem filtrada por tipo 'image'
 */
export async function fetchNasaApod(
  count: number = 10,
  apiKey: string = DEFAULT_API_KEY
): Promise<ApodItem[]> {
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
      // Ignorar fallas de lectura de JSON
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
