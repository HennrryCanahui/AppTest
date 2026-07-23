import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#252542ff',
          borderTopColor: '#7879a6ff',
        },
        tabBarActiveTintColor: '#d4d9f9ff',
        tabBarInactiveTintColor: '#9097d2ff',

      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

