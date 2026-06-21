import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/theme/theme";

export default function AppLayout() {
  const token = useAuthStore((s) => s.token);
  const hidratado = useAuthStore((s) => s.hidratado);

  if (hidratado && !token) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primario,
        tabBarInactiveTintColor: colors.textoTenue,
        tabBarStyle: {
          backgroundColor: colors.superficie,
          borderTopColor: colors.borde,
        },
      }}
    >
      <Tabs.Screen
        name="consulta"
        options={{
          title: "Consulta",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="medical-bag" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
