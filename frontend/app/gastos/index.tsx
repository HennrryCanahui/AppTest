import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, Modal, ScrollView, Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getGastos, addGasto, updateGasto, deleteGasto, getGastosCategories, Gasto, GastoCategory } from '../../services/gastosApi';
import { Ionicons } from '@expo/vector-icons';

export default function GastosIndex() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<GastoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);

  // Form
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha_gasto, setFechaGasto] = useState(new Date().toISOString().split('T')[0]);
  const [notas, setNotas] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const router = useRouter();

  const loadData = async () => {
    try {
      setLoading(true);
      const [gastosData, categoriasData] = await Promise.all([
        getGastos(),
        getGastosCategories()
      ]);
      setGastos(gastosData);
      setCategorias(categoriasData);
    } catch (error: any) {
      if (error.message.includes('401')) {
        router.replace('/gastos/login');
      } else {
        Alert.alert('Error', 'No se pudieron cargar los datos');
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleSave = async () => {
    if (!descripcion.trim() || !monto) {
      Alert.alert('Error', 'Descripción y monto son requeridos');
      return;
    }
    try {
      if (editingGasto) {
        await updateGasto(editingGasto.id, descripcion, parseFloat(monto), fecha_gasto, categoriaId, notas);
      } else {
        await addGasto(descripcion, parseFloat(monto), fecha_gasto, categoriaId, notas);
      }
      setModalVisible(false);
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (Platform.OS === 'web') {
      if (window.confirm('¿Seguro que deseas eliminar este gasto?')) {
        try {
          await deleteGasto(id);
          loadData();
        } catch (e: any) {
          Alert.alert('Error', e.message);
        }
      }
    } else {
      Alert.alert('Eliminar', '¿Seguro que deseas eliminar este gasto?', [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGasto(id);
              loadData();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]);
    }
  };

  const openModal = (gasto?: Gasto) => {
    if (gasto) {
      setEditingGasto(gasto);
      setDescripcion(gasto.descripcion);
      setMonto(gasto.monto.toString());
      setFechaGasto(gasto.fecha_gasto ? gasto.fecha_gasto.split('T')[0] : '');
      setNotas(gasto.notas || '');
      setCategoriaId(gasto.categoria_id);
    } else {
      setEditingGasto(null);
      setDescripcion('');
      setMonto('');
      setFechaGasto(new Date().toISOString().split('T')[0]);
      setNotas('');
      setCategoriaId(categorias.length > 0 ? categorias[0].id : undefined);
    }
    setModalVisible(true);
  };

  const total = gastos.reduce((sum, g) => sum + Number(g.monto), 0);

  if (loading && gastos.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.totalText}>Total: Q{total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={gastos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const cat = categorias.find(c => c.id === item.categoria_id);
          return (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <View>
                  <Text style={styles.gastoDesc}>{item.descripcion}</Text>
                  <Text style={styles.gastoDate}>{item.fecha_gasto ? item.fecha_gasto.split('T')[0] : ''} {cat ? `• ${cat.nombre}` : ''}</Text>
                </View>
                <Text style={styles.gastoMonto}>Q{Number(item.monto).toFixed(2)}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(item)}>
                  <Ionicons name="pencil" size={20} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes gastos registrados.</Text>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingGasto ? 'Editar Gasto' : 'Nuevo Gasto'}</Text>
            
            <TextInput style={styles.input} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} />
            <TextInput style={styles.input} placeholder="Monto" keyboardType="numeric" value={monto} onChangeText={setMonto} />
            <TextInput style={styles.input} placeholder="Fecha (YYYY-MM-DD)" value={fecha_gasto} onChangeText={setFechaGasto} />
            <TextInput style={styles.input} placeholder="Notas (Opcional)" value={notas} onChangeText={setNotas} />
            
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 10 }}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {categorias.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={{
                    backgroundColor: categoriaId === cat.id ? (cat.color || '#10b981') : '#f8fafc',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: cat.color || '#10b981'
                  }}
                  onPress={() => setCategoriaId(cat.id)}
                >
                  <Text style={{ color: categoriaId === cat.id ? '#fff' : (cat.color || '#10b981'), fontWeight: '600' }}>
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSave}>
                <Text style={styles.btnSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  totalText: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  addButton: { flexDirection: 'row', backgroundColor: '#10b981', padding: 10, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 4 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 8, padding: 16, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
  gastoDesc: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  gastoDate: { fontSize: 13, color: '#64748b', marginTop: 4 },
  gastoMonto: { fontSize: 18, fontWeight: 'bold', color: '#ef4444' },
  actions: { flexDirection: 'row' },
  actionBtn: { padding: 8 },
  deleteBtn: { marginLeft: 4 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 40, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#0f172a' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  btnCancel: { padding: 12, marginRight: 12 },
  btnCancelText: { color: '#64748b', fontSize: 16, fontWeight: '600' },
  btnSave: { backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  btnSaveText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
