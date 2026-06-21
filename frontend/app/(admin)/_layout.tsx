import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, Redirect, Slot, usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ID_ROL_ADMIN, useAuthStore } from "@/src/store/authStore";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";

type NombreIcono = keyof typeof MaterialCommunityIcons.glyphMap;

const ITEMS: { href: Href; label: string; icono: NombreIcono }[] = [
  { href: "/reglas" as Href, label: "Reglas", icono: "format-list-checks" },
  { href: "/condiciones" as Href, label: "Condiciones", icono: "clipboard-pulse-outline" },
  { href: "/categorias" as Href, label: "Categorías", icono: "shape-outline" },
  { href: "/usuarios" as Href, label: "Usuarios", icono: "account-group" },
];

const ANCHO_SIDEBAR = 768; // breakpoint: >= usa sidebar; < usa barra superior

export default function AdminLayout() {
  const hidratado = useAuthStore((s) => s.hidratado);
  const token = useAuthStore((s) => s.token);
  const rol = useAuthStore((s) => s.rol);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);
  const { width } = useWindowDimensions();

  if (hidratado && (!token || rol !== ID_ROL_ADMIN)) {
    return <Redirect href={token ? "/" : "/login"} />;
  }

  const anchoSuficiente = width >= ANCHO_SIDEBAR;

  if (anchoSuficiente) {
    return (
      <View style={styles.filaRaiz}>
        <Sidebar onSalir={cerrarSesion} />
        <View style={styles.contenido}>
          <Slot />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.columnaRaiz}>
      <TopBar onSalir={cerrarSesion} />
      <View style={styles.contenido}>
        <Slot />
      </View>
    </View>
  );
}

function Sidebar({ onSalir }: { onSalir: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.sidebar, { paddingTop: insets.top + espaciado.xl }]}>
      <View style={styles.marca}>
        <Text style={styles.logo}>SanFra</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeTexto}>ADMIN</Text>
        </View>
      </View>

      <View style={styles.navVertical}>
        {ITEMS.map((item) => (
          <NavItem key={item.label} item={item} vertical />
        ))}
      </View>

      <Pressable onPress={onSalir} style={styles.salirSidebar} hitSlop={8}>
        <MaterialCommunityIcons name="logout" size={20} color={colors.textoTenue} />
        <Text style={styles.salirTexto}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

function TopBar({ onSalir }: { onSalir: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.topbar, { paddingTop: insets.top + espaciado.md }]}>
      <Text style={styles.logoTop}>
        SanFra <Text style={styles.logoAdmin}>Admin</Text>
      </Text>
      <View style={styles.navHorizontal}>
        {ITEMS.map((item) => (
          <NavItem key={item.label} item={item} vertical={false} />
        ))}
        <Pressable onPress={onSalir} style={styles.salirTop} hitSlop={8}>
          <MaterialCommunityIcons name="logout" size={18} color={colors.textoTenue} />
        </Pressable>
      </View>
    </View>
  );
}

function NavItem({
  item,
  vertical,
}: {
  item: { href: Href; label: string; icono: NombreIcono };
  vertical: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activo = pathname === item.href;

  return (
    <Pressable
      onPress={() => router.push(item.href)}
      style={[
        vertical ? styles.itemVertical : styles.itemHorizontal,
        activo ? styles.itemActivo : null,
      ]}
    >
      <MaterialCommunityIcons
        name={item.icono}
        size={20}
        color={activo ? colors.sobrePrimario : colors.textoTenue}
      />
      <Text style={[styles.itemTexto, activo ? styles.itemTextoActivo : null]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filaRaiz: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.fondo,
  },
  columnaRaiz: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  contenido: {
    flex: 1,
  },
  // Sidebar (web/escritorio)
  sidebar: {
    width: 240,
    backgroundColor: colors.superficie,
    borderRightWidth: 1,
    borderRightColor: colors.borde,
    paddingHorizontal: espaciado.lg,
    paddingBottom: espaciado.xl,
    gap: espaciado.xl,
  },
  marca: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
  },
  logo: {
    color: colors.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: "800",
  },
  badge: {
    backgroundColor: colors.primario,
    borderRadius: radio.sm,
    paddingHorizontal: espaciado.sm,
    paddingVertical: 2,
  },
  badgeTexto: {
    color: colors.sobrePrimario,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  navVertical: {
    gap: espaciado.xs,
    flex: 1,
  },
  itemVertical: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.md,
    borderRadius: radio.md,
  },
  salirSidebar: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.md,
  },
  // TopBar (móvil)
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: espaciado.xl,
    paddingBottom: espaciado.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
    backgroundColor: colors.superficie,
  },
  logoTop: {
    color: colors.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: "800",
  },
  logoAdmin: {
    color: colors.primario,
  },
  navHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
  },
  itemHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.md,
    borderRadius: radio.md,
  },
  salirTop: {
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.sm,
  },
  // Compartido
  itemActivo: {
    backgroundColor: colors.primario,
  },
  itemTexto: {
    color: colors.textoTenue,
    fontSize: tipografia.cuerpo,
    fontWeight: "600",
  },
  itemTextoActivo: {
    color: colors.sobrePrimario,
    fontWeight: "700",
  },
  salirTexto: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    fontWeight: "600",
  },
});
