import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE_KEY = '@nasa_api_key';

export const saveApiKey = async (apiKey: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  } catch (error) {
    console.error('Error saving API Key', error);
    throw error;
  }
};

export const getStoredApiKey = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Error getting API Key', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Error removing API Key', error);
    throw error;
  }
};
