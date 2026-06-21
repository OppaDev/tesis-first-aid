import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ColumnaTabla, Tabla } from "@/src/components/Tabla";
import { cambiarRol, listarUsuarios } from "@/src/services/admin";
import { ID_ROL_ADMIN } from "@/src/store/authStore";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import { ApiError, UsuarioAdmin } from "@/src/types/api";
import { confirmar } from "@/src/utils/confirmar";

const ID_ROL_USUARIO = 2;

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setUsuarios(await listarUsuarios());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los usuarios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const alternarRol = async (u: UsuarioAdmin) => {
    const esAdmin = u.id_rol === ID_ROL_ADMIN;
    const nuevoRol = esAdmin ? ID_ROL_USUARIO : ID_ROL_ADMIN;
    const ok = await confirmar(
      esAdmin ? "Quitar administrador" : "Hacer administrador",
      `${u.nombres} ${u.apellidos} pasará a rol "${esAdmin ? "usuario" : "administrador"}".`,
    );
    if (!ok) return;
    setError(null);
    try {
      await cambiarRol(u.cedula, nuevoRol);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar el rol");
    }
  };

  const columnas: ColumnaTabla<UsuarioAdmin>[] = [
    {
      titulo: "Nombre",
      flex: 1.6,
      render: (u) => (
        <Text style={styles.celdaFuerte} numberOfLines={1}>
          {u.nombres} {u.apellidos}
        </Text>
      ),
    },
    {
      titulo: "Correo",
      flex: 1.6,
      render: (u) => (
        <Text style={styles.celdaTexto} numberOfLines={1}>
          {u.email}
        </Text>
      ),
    },
    {
      titulo: "Cédula",
      flex: 1,
      render: (u) => <Text style={styles.celdaTexto}>{u.cedula}</Text>,
    },
    {
      titulo: "Rol",
      flex: 0.9,
      render: (u) => {
        const esAdmin = u.id_rol === ID_ROL_ADMIN;
        return (
          <View style={[styles.rolBadge, esAdmin ? styles.rolAdmin : null]}>
            <Text style={[styles.rolTexto, esAdmin ? styles.rolTextoAdmin : null]}>
              {u.nombre_rol ?? "—"}
            </Text>
          </View>
        );
      },
    },
    {
      titulo: "Acciones",
      flex: 1.3,
      alinear: "flex-end",
      render: (u) => {
        const esAdmin = u.id_rol === ID_ROL_ADMIN;
        return (
          <Pressable onPress={() => alternarRol(u)} style={styles.accion} hitSlop={8}>
            <MaterialCommunityIcons
              name={esAdmin ? "account-arrow-down" : "shield-account"}
              size={18}
              color={colors.primario}
            />
            <Text style={styles.accionTexto}>
              {esAdmin ? "Quitar admin" : "Hacer admin"}
            </Text>
          </Pressable>
        );
      },
    },
  ];

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={colors.primario} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>Usuarios</Text>
        <Text style={styles.subtitulo}>{usuarios.length} registrados</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.tablaWrap}>
        <Tabla
          columnas={columnas}
          datos={usuarios}
          keyExtractor={(u) => u.cedula}
          vacioTexto="No hay usuarios registrados"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  cabecera: { padding: espaciado.xl, gap: espaciado.xs },
  titulo: { color: colors.texto, fontSize: tipografia.titulo, fontWeight: "800" },
  subtitulo: { color: colors.textoTenue, fontSize: tipografia.etiqueta },
  error: { color: colors.error, fontSize: tipografia.etiqueta, paddingHorizontal: espaciado.xl },
  tablaWrap: { flex: 1, paddingHorizontal: espaciado.xl, paddingBottom: espaciado.xl },
  celdaTexto: { color: colors.textoTenue, fontSize: tipografia.etiqueta },
  celdaFuerte: { color: colors.texto, fontSize: tipografia.etiqueta, fontWeight: "700" },
  rolBadge: {
    paddingVertical: 2,
    paddingHorizontal: espaciado.md,
    borderRadius: radio.full,
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
  },
  rolAdmin: { borderColor: colors.primario },
  rolTexto: { color: colors.textoTenue, fontSize: tipografia.pequeno, fontWeight: "700" },
  rolTextoAdmin: { color: colors.primario },
  accion: { flexDirection: "row", alignItems: "center", gap: espaciado.xs },
  accionTexto: { color: colors.primario, fontSize: tipografia.etiqueta, fontWeight: "600" },
});
