import { View, Text, StyleSheet } from 'react-native';

export default function CategoriesScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mis Categorías</Text>
            <Text style={styles.subtitle}> Universidad •  Trabajo •  Personal</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    subtitle: { marginTop: 8, color: '#64748b' },
});