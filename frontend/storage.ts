import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredApiKey } from './services/authService';
import { Platform } from 'react-native';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  categoryId: string | null;
  completed: boolean;
  category_name?: string | null;
  category_color?: string | null;
}

// URL base inteligente: usa 10.0.2.2 para el emulador de Android, o localhost
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api';

const getHeaders = async () => {
  // Se obtiene el token de Passport (reutilizamos getStoredApiKey por compatibilidad con el entorno actual)
  const token = await getStoredApiKey() || await AsyncStorage.getItem('@passport_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// ==========================================
// 1. CRUD DE CATEGORÍAS (Backend Laravel)
// ==========================================

export const getCategories = async (): Promise<Category[]> => {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    console.error('Error al leer categorías del servidor:', e);
    return [];
  }
};

export const addCategory = async (name: string, color: string): Promise<Category> => {
  const res = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ name: name.trim(), color }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error agregando categoría');
  }
  return await res.json();
};

export const updateCategory = async (id: string, name: string, color: string): Promise<void> => {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PUT',
    headers: await getHeaders(),
    body: JSON.stringify({ name: name.trim(), color }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error editando categoría');
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: await getHeaders(),
  });
  if (!res.ok) throw new Error('Error al eliminar categoría');
};

// ==========================================
// 2. CRUD DE TAREAS (Backend Laravel)
// ==========================================

export const getTasks = async (): Promise<Task[]> => {
  try {
    const res = await fetch(`${API_URL}/tasks`, {
      headers: await getHeaders(),
    });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    console.error('Error al leer tareas del servidor:', e);
    return [];
  }
};

export const addTask = async (title: string, categoryId: string | null): Promise<void> => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ title: title.trim(), category_id: categoryId }),
  });
  if (!res.ok) throw new Error('Error agregando tarea');
};

export const toggleTaskCompleted = async (id: string): Promise<void> => {
  try {
    // 1. Obtener estado actual
    const getRes = await fetch(`${API_URL}/tasks/${id}`, { headers: await getHeaders() });
    if (!getRes.ok) return;
    const task = await getRes.json();
    
    // 2. Enviar actualización
    await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify({ completed: !task.completed }),
    });
  } catch (e) {
    console.error('Error al marcar tarea como completada:', e);
  }
};

export const updateTask = async (id: string, title: string, categoryId: string | null): Promise<void> => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: await getHeaders(),
    body: JSON.stringify({ title: title.trim(), category_id: categoryId }),
  });
  if (!res.ok) throw new Error('Error al editar tarea');
};

export const deleteTask = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: await getHeaders(),
  });
  if (!res.ok) throw new Error('Error al eliminar tarea');
};