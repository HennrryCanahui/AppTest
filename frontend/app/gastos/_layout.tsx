import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, useRouter } from "expo-router";
import { TouchableOpacity, Text, Platform } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GastosLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#10b981",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.replace('/(tabs)')}
            style={{ marginLeft: 16, flexDirection: 'row', alignItems: 'center' }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={{ marginLeft: 4, color: '#fff', fontWeight: '600' }}>Tareas</Text>
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 80 : 60 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 20 : insets.bottom,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="login"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Gastos",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="categorias"
        options={{
          title: "Categorías",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-open" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reporte"
        options={{
          title: "Reporte",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
