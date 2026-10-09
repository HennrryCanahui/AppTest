import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Configuración de Variables de Entorno y Cliente HTTP
// Variable de entorno / configuración
export const GASTOS_API_BASE_URL = process.env.EXPO_PUBLIC_GASTOS_API_BASE_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:8001/api' : 'http://localhost:8001/api');

const GASTOS_TOKEN_KEY = '@gastos_passport_token';

export const saveGastosToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(GASTOS_TOKEN_KEY, token);
};

export const getGastosToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(GASTOS_TOKEN_KEY);
};

export const removeGastosToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(GASTOS_TOKEN_KEY);
};

const getHeaders = async () => {
  const token = await getGastosToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleApiResponse = async (res: Response, fallbackMessage: string) => {
  if (res.status === 401) {
    await removeGastosToken();
    throw new Error('No autorizado. Sesión expirada en API Gastos.');
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 422 && errorData.errors) {
      const errorMessages = Object.values(errorData.errors).flat().join('\n');
      throw new Error(errorMessages);
    }
    throw new Error(errorData.message || `${fallbackMessage} (HTTP ${res.status})`);
  }
};

// ==========================================
// Autenticación
// ==========================================
export const loginGastos = async (email: string, password: string): Promise<void> => {
  const res = await fetch(`${GASTOS_API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password })
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Error al iniciar sesión en Gastos');
  }
  
  const data = await res.json();
  if (data.token) {
    await saveGastosToken(data.token);
  } else if (data.access_token) {
    await saveGastosToken(data.access_token);
  } else {
    throw new Error('Token no recibido de API Gastos');
  }
};

export const registerGastos = async (name: string, email: string, password: string): Promise<void> => {
  const res = await fetch(`${GASTOS_API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, password_confirmation: password })
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Error al registrar en Gastos');
  }
  
  const data = await res.json();
  if (data.token) {
    await saveGastosToken(data.token);
  } else if (data.access_token) {
    await saveGastosToken(data.access_token);
  } else {
    throw new Error('Token no recibido de API Gastos');
  }
};

export const logoutGastos = async (): Promise<void> => {
  try {
    const token = await getGastosToken();
    if (token) {
      await fetch(`${GASTOS_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: await getHeaders(),
      });
    }
  } catch (e) {
    console.error('Error logging out API Gastos:', e);
  } finally {
    await removeGastosToken();
  }
};

// ==========================================
// Perfil
// ==========================================
export interface GastosUserProfile {
  id: number;
  name: string;
  email: string;
}

export const getGastosUserProfile = async (): Promise<GastosUserProfile | null> => {
  try {
    const res = await fetch(`${GASTOS_API_BASE_URL}/usuario`, { headers: await getHeaders() });
    await handleApiResponse(res, 'Error al obtener perfil');
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// ==========================================
// Categorías
// ==========================================
export interface GastoCategory {
  id: number;
  nombre: string;
  color?: string;
}

export const getGastosCategories = async (): Promise<GastoCategory[]> => {
  try {
    const res = await fetch(`${GASTOS_API_BASE_URL}/categorias`, { headers: await getHeaders() });
    await handleApiResponse(res, 'Error al obtener categorías');
    return await res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const addGastosCategory = async (nombre: string, color?: string): Promise<GastoCategory> => {
  const res = await fetch(`${GASTOS_API_BASE_URL}/categorias`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ nombre: nombre.trim(), color }),
  });
  await handleApiResponse(res, 'Error agregando categoría');
  return await res.json();
};

export const updateGastosCategory = async (id: number, nombre: string, color?: string): Promise<void> => {
  const res = await fetch(`${GASTOS_API_BASE_URL}/categorias/${id}`, {
    method: 'PATCH',
    headers: await getHeaders(),
    body: JSON.stringify({ nombre: nombre.trim(), color }),
  });
  await handleApiResponse(res, 'Error editando categoría');
};

export const deleteGastosCategory = async (id: number): Promise<void> => {
  const res = await fetch(`${GASTOS_API_BASE_URL}/categorias/${id}`, {
    method: 'DELETE',
    headers: await getHeaders(),
  });
  await handleApiResponse(res, 'Error al eliminar categoría');
};

// ==========================================
// Gastos
// ==========================================
export interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  fecha_gasto: string;
  notas?: string;
  categoria_id?: number;
  categoria?: GastoCategory;
}

export const getGastos = async (): Promise<Gasto[]> => {
  try {
    const res = await fetch(`${GASTOS_API_BASE_URL}/gastos`, { headers: await getHeaders() });
    await handleApiResponse(res, 'Error al obtener gastos');
    const data = await res.json();
    return data.data || data;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const addGasto = async (descripcion: string, monto: number, fecha_gasto: string, categoria_id?: number, notas?: string): Promise<void> => {
  const res = await fetch(`${GASTOS_API_BASE_URL}/gastos`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ descripcion: descripcion.trim(), monto, fecha_gasto, categoria_id, notas: notas?.trim() }),
  });
  await handleApiResponse(res, 'Error agregando gasto');
};

export const updateGasto = async (id: number, descripcion: string, monto: number, fecha_gasto: string, categoria_id?: number, notas?: string): Promise<void> => {
  const res = await fetch(`${GASTOS_API_BASE_URL}/gastos/${id}`, {
    method: 'PATCH',
    headers: await getHeaders(),
    body: JSON.stringify({ descripcion: descripcion.trim(), monto, fecha_gasto, categoria_id, notas: notas?.trim() }),
  });
  await handleApiResponse(res, 'Error editando gasto');
};

export const deleteGasto = async (id: number): Promise<void> => {
  const res = await fetch(`${GASTOS_API_BASE_URL}/gastos/${id}`, {
    method: 'DELETE',
    headers: await getHeaders(),
  });
  await handleApiResponse(res, 'Error al eliminar gasto');
};
