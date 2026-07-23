import { View, Text, StyleSheet } from 'react-native';

export default function StatsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.metric}>2 / 5</Text>
            <Text style={styles.label}>Tareas Completadas Hoy</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    metric: { fontSize: 48, fontWeight: 'bold', color: '#2563eb' },
    label: { fontSize: 16, color: '#64748b', marginTop: 4 },
});