import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { setManejadorSesionExpirada } from "@/src/services/api";
import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/theme/theme";

export default function RootLayout() {
  const hidratar = useAuthStore((s) => s.hidratar);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);

  useEffect(() => {
    hidratar();
  }, [hidratar]);

  // Ante un 401 con sesión vigente: cerrar sesión y volver al login.
  useEffect(() => {
    setManejadorSesionExpirada(() => {
      cerrarSesion();
      router.replace("/login");
    });
    return () => setManejadorSesionExpirada(null);
  }, [cerrarSesion]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.fondo },
        }}
      />
    </SafeAreaProvider>
  );
}
