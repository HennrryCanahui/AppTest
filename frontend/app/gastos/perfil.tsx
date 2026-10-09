import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getGastosUserProfile, removeGastosToken, getGastosToken } from '../../services/gastosApi';

export default function PerfilScreen() {
  const [profile, setProfile] = useState<{name: string, email: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const data = await getGastosUserProfile();
          setProfile(data);
        } catch (error: any) {
          if (error.message.includes('401')) {
            router.replace('/gastos/login');
          }
        } finally {
          setLoading(false);
        }
      };
      loadProfile();
    }, [])
  );

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro que deseas salir?')) {
        await removeGastosToken();
        router.replace('/gastos/login');
      }
    } else {
      Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas salir?', [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salir', 
          style: 'destructive',
          onPress: async () => {
            await removeGastosToken();
            router.replace('/gastos/login');
          }
        }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.name || 'Usuario'}</Text>
        <Text style={styles.email}>{profile?.email || 'Sin correo'}</Text>
        
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Cerrar Sesión de Gastos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24, justifyContent: 'center' },
  centered: { alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', elevation: 2 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  email: { fontSize: 16, color: '#64748b', marginBottom: 32 },
  logoutBtn: { backgroundColor: '#ef4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, width: '100%', alignItems: 'center' },
  logoutBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
