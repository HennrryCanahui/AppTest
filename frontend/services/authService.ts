import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = '@passport_token';
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api';

export const saveToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const logout = async (): Promise<void> => {
  try {
    const token = await getToken();
    if (token) {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    }
  } catch (e) {
    console.error('Error logging out API:', e);
  } finally {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return token !== null;
};

export const login = async (email: string, password: string): Promise<void> => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password })
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 422 && data.errors) {
      const errorMessages = Object.values(data.errors).flat().join('\n');
      throw new Error(errorMessages);
    }
    throw new Error(data.message || 'Error al iniciar sesión');
  }

  if (data.access_token) {
    await saveToken(data.access_token);
  } else {
    throw new Error('Token no recibido del servidor');
  }
};

export const register = async (name: string, email: string, password: string): Promise<void> => {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      password_confirmation: password
    })
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 422 && data.errors) {
      const errorMessages = Object.values(data.errors).flat().join('\n');
      throw new Error(errorMessages);
    }
    throw new Error(data.message || 'Error en el registro');
  }

  if (data.access_token) {
    await saveToken(data.access_token);
  } else {
    throw new Error('Token no recibido del servidor');
  }
};