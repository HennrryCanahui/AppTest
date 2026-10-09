import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getGastos, getGastosCategories, Gasto, GastoCategory, getGastosToken } from '../../services/gastosApi';
import { Ionicons } from '@expo/vector-icons';

export default function GastosReporteScreen() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categories, setCategories] = useState<GastoCategory[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const token = await getGastosToken();
        if (!token) {
          router.replace('/gastos/login');
          return;
        }
        const [allGastos, allCategories] = await Promise.all([
          getGastos(),
          getGastosCategories()
        ]);
        setGastos(allGastos);
        setCategories(allCategories);
      };
      loadData();
    }, [])
  );

  const { currentMonthGastos, totalMonth, groupedByCategory } = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Filtrar al mes actual
    const monthGastos = gastos.filter(g => {
      const gDate = new Date(g.fecha_gasto);
      return gDate.getMonth() === currentMonth && gDate.getFullYear() === currentYear;
    });

    // Sumar total
    const total = monthGastos.reduce((sum, g) => sum + parseFloat(g.monto.toString()), 0);

    // Agrupar por categoría
    const grouped: Record<number, number> = {};
    let unassigned = 0;

    monthGastos.forEach(g => {
      const m = parseFloat(g.monto.toString());
      if (g.categoria_id) {
        grouped[g.categoria_id] = (grouped[g.categoria_id] || 0) + m;
      } else {
        unassigned += m;
      }
    });

    const categoryBreakdown = categories
      .filter(c => grouped[c.id])
      .map(c => ({
        id: c.id,
        nombre: c.nombre,
        color: c.color || '#cbd5e1',
        total: grouped[c.id]
      }))
      .sort((a, b) => b.total - a.total);

    if (unassigned > 0) {
      categoryBreakdown.push({
        id: -1,
        nombre: 'Sin Categoría',
        color: '#94a3b8',
        total: unassigned
      });
    }

    return { currentMonthGastos: monthGastos.sort((a, b) => new Date(b.fecha_gasto).getTime() - new Date(a.fecha_gasto).getTime()), totalMonth: total, groupedByCategory: categoryBreakdown };
  }, [gastos, categories]);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const currentMonthName = monthNames[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Total {currentMonthName} {currentYear}</Text>
        <Text style={styles.totalAmount}>Q{totalMonth.toFixed(2)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Desglose por Categoría</Text>
      {groupedByCategory.length === 0 ? (
        <Text style={styles.emptyText}>No hay gastos este mes.</Text>
      ) : (
        <View style={styles.card}>
          {groupedByCategory.map(cat => (
            <View key={cat.id} style={styles.categoryRow}>
              <View style={styles.catInfo}>
                <View style={[styles.catColor, { backgroundColor: cat.color }]} />
                <Text style={styles.catName}>{cat.nombre}</Text>
              </View>
              <Text style={styles.catAmount}>Q{cat.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Transacciones del Mes</Text>
      {currentMonthGastos.length === 0 ? (
        <Text style={styles.emptyText}>No hay transacciones.</Text>
      ) : (
        <View style={styles.card}>
          {currentMonthGastos.map(item => {
            const cat = categories.find(c => c.id === item.categoria_id);
            return (
              <View key={item.id} style={styles.transactionRow}>
                <View style={styles.tLeft}>
                  <Text style={styles.tDesc}>{item.descripcion}</Text>
                  <Text style={styles.tDate}>{item.fecha_gasto ? item.fecha_gasto.split('T')[0] : ''} • {cat ? cat.nombre : 'Sin categoría'}</Text>
                </View>
                <Text style={styles.tAmount}>Q{parseFloat(item.monto.toString()).toFixed(2)}</Text>
              </View>
            );
          })}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  headerCard: { backgroundColor: '#10b981', padding: 24, borderRadius: 16, alignItems: 'center', elevation: 4, marginBottom: 24 },
  headerTitle: { color: '#ecfdf5', fontSize: 16, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
  totalAmount: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  catInfo: { flexDirection: 'row', alignItems: 'center' },
  catColor: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  catName: { fontSize: 16, color: '#334155' },
  catAmount: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tLeft: { flex: 1 },
  tDesc: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  tDate: { fontSize: 12, color: '#64748b', marginTop: 4 },
  tAmount: { fontSize: 16, fontWeight: 'bold', color: '#ef4444' },
  emptyText: { textAlign: 'center', color: '#64748b', marginVertical: 16 }
});
