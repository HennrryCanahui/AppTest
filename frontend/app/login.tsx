import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { saveApiKey } from '../services/authService';

const DEMO_API_KEY = 'w7gGyWv5cKR2L0Cy2F2ja3TN5nYhbqdUAu1QdVym';

export default function LoginScreen() {
  const [apiKey, setApiKey] = useState(DEMO_API_KEY);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    try {
      await saveApiKey(apiKey.trim());
      router.replace('/(tabs)/nasa');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setApiKey(DEMO_API_KEY);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <Text style={styles.subtitle}>Ingresa tu API Key de la NASA</Text>
      
      <View style={styles.demoInfoContainer}>
        <Text style={styles.demoInfoText}>
          Modo Demostración: Ya se ha preconfigurado una API Key de prueba. Puedes usarla directamente o ingresar la tuya.
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="API Key"
        value={apiKey}
        onChangeText={setApiKey}
        autoCapitalize="none"
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={[styles.button, !apiKey.trim() && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={!apiKey.trim() || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Iniciar Sesión</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>Restablecer clave por defecto</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center'
  },
  demoInfoContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  demoInfoText: {
    fontSize: 14,
    color: '#1e3a8a',
    textAlign: 'center',
    lineHeight: 20
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 24
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  resetButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center'
  },
  resetButtonText: {
    color: '#3b82f6',
    fontSize: 15,
    fontWeight: '600'
  }
});
