import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/theme/theme";

export default function AppLayout() {
  const token = useAuthStore((s) => s.token);
  // En web solo se ofrece la gestión del perfil: la consulta de emergencia
  // vive en la app móvil (la pestaña se oculta y la ruta muestra un aviso).
  const esWeb = Platform.OS === "web";

  // Sin guard de login en móvil: la consulta es accesible para usuarios
  // anónimos (en una emergencia no se exige iniciar sesión). La pestaña
  // Perfil solo aparece con sesión iniciada.
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
          href: esWeb ? null : undefined, // en web no hay consulta de emergencia
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="medical-bag" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          href: token ? undefined : null, // oculta la pestaña si no hay sesión
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
      {/* Ruta de resultado: accesible por navegación, oculta de la barra. */}
      <Tabs.Screen name="protocolo" options={{ href: null }} />
    </Tabs>
  );
}
