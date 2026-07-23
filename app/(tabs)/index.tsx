import { FlatList, StyleSheet, Text, View } from 'react-native';

const INITIAL_TASKS = [
  { id: '1', title: 'Completar el proyecto de Expo', done: false },
  { id: '2', title: 'Estudiar para el examen de la U', done: true },
];

export default function TasksScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={INITIAL_TASKS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={[styles.taskText, item.done && styles.taskDone]}>
              {item.title}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  taskText: { fontSize: 16, color: '#1e293b' },
  taskDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
});