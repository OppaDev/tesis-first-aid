import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAuthStore } from "@/src/store/authStore";
import { colors } from "@/src/theme/theme";

export default function RootLayout() {
  const hidratar = useAuthStore((s) => s.hidratar);

  useEffect(() => {
    hidratar();
  }, [hidratar]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.fondo },
        }}
      />
    </SafeAreaProvider>
  );
}
