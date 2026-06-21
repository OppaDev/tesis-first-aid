import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Boton } from "@/src/components/Boton";
import { Campo } from "@/src/components/Campo";
import { Paginador } from "@/src/components/Paginador";
import { SelectorFecha } from "@/src/components/SelectorFecha";
import { ColumnaTabla, Tabla } from "@/src/components/Tabla";
import {
  actualizarUsuario,
  cambiarRol,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
} from "@/src/services/admin";
import { ID_ROL_ADMIN } from "@/src/store/authStore";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import { ApiError, UsuarioAdmin } from "@/src/types/api";
import { confirmar } from "@/src/utils/confirmar";

const ID_ROL_USUARIO = 2;

function aISO(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const LIMITE = 20;
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  // Formulario crear/editar
  const [modal, setModal] = useState(false);
  const [modo, setModo] = useState<"crear" | "editar">("crear");
  const [cedula, setCedula] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [fechaNac, setFechaNac] = useState<Date | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idRol, setIdRol] = useState<number>(ID_ROL_USUARIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const pag = await listarUsuarios(LIMITE, offset);
      if (pag.items.length === 0 && offset > 0) {
        setOffset(Math.max(0, offset - LIMITE));
        return;
      }
      setUsuarios(pag.items);
      setTotal(pag.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar los usuarios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [offset]);

  const abrirCrear = () => {
    setModo("crear");
    setCedula("");
    setNombres("");
    setApellidos("");
    setFechaNac(null);
    setEmail("");
    setPassword("");
    setIdRol(ID_ROL_USUARIO);
    setErrorForm(null);
    setModal(true);
  };

  const abrirEditar = (u: UsuarioAdmin) => {
    setModo("editar");
    setCedula(u.cedula);
    setNombres(u.nombres);
    setApellidos(u.apellidos);
    setEmail(u.email);
    setErrorForm(null);
    setModal(true);
  };

  const guardar = async () => {
    if (nombres.trim().length < 2 || apellidos.trim().length < 2 || !email.includes("@")) {
      setErrorForm("Completa nombres, apellidos y un correo válido.");
      return;
    }
    setGuardando(true);
    setErrorForm(null);
    try {
      if (modo === "crear") {
        if (cedula.trim().length < 10 || !fechaNac || password.length < 6) {
          setErrorForm("Revisa cédula (10 dígitos), fecha de nacimiento y contraseña (mín. 6).");
          setGuardando(false);
          return;
        }
        await crearUsuario({
          cedula: cedula.trim(),
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          fecha_nacimiento: aISO(fechaNac),
          email: email.trim(),
          password,
          id_rol: idRol,
        });
      } else {
        await actualizarUsuario(cedula, {
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          email: email.trim(),
        });
      }
      setModal(false);
      await cargar();
    } catch (err) {
      setErrorForm(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  const alternarRol = async (u: UsuarioAdmin) => {
    const esAdmin = u.id_rol === ID_ROL_ADMIN;
    const ok = await confirmar(
      esAdmin ? "Quitar administrador" : "Hacer administrador",
      `${u.nombres} ${u.apellidos} pasará a rol "${esAdmin ? "usuario" : "administrador"}".`,
    );
    if (!ok) return;
    setError(null);
    try {
      await cambiarRol(u.cedula, esAdmin ? ID_ROL_USUARIO : ID_ROL_ADMIN);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cambiar el rol");
    }
  };

  const borrar = async (u: UsuarioAdmin) => {
    const ok = await confirmar(
      "Eliminar usuario",
      `¿Eliminar a ${u.nombres} ${u.apellidos}? También se borra su perfil clínico.`,
    );
    if (!ok) return;
    setError(null);
    try {
      await eliminarUsuario(u.cedula);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar");
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
      flex: 1.1,
      alinear: "flex-end",
      render: (u) => {
        const esAdmin = u.id_rol === ID_ROL_ADMIN;
        return (
          <View style={styles.accionesCelda}>
            <Pressable onPress={() => abrirEditar(u)} hitSlop={8}>
              <MaterialCommunityIcons name="pencil" size={18} color={colors.primario} />
            </Pressable>
            <Pressable onPress={() => alternarRol(u)} hitSlop={8}>
              <MaterialCommunityIcons
                name={esAdmin ? "account-arrow-down" : "shield-account"}
                size={18}
                color={colors.primario}
              />
            </Pressable>
            <Pressable onPress={() => borrar(u)} hitSlop={8}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
            </Pressable>
          </View>
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
        <View>
          <Text style={styles.titulo}>Usuarios</Text>
          <Text style={styles.subtitulo}>{total} registrados</Text>
        </View>
        <Pressable onPress={abrirCrear} style={styles.nuevo}>
          <MaterialCommunityIcons name="account-plus" size={20} color={colors.sobrePrimario} />
          <Text style={styles.nuevoTexto}>Nuevo</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.tablaWrap}>
        <Tabla
          columnas={columnas}
          datos={usuarios}
          keyExtractor={(u) => u.cedula}
          vacioTexto="No hay usuarios registrados"
        />
        <Paginador offset={offset} limit={LIMITE} total={total} onCambiar={setOffset} />
      </View>

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>
              {modo === "crear" ? "Nuevo usuario" : "Editar usuario"}
            </Text>

            <ScrollView contentContainerStyle={styles.formContenido}>
              {modo === "crear" ? (
                <Campo
                  etiqueta="Cédula"
                  value={cedula}
                  onChangeText={setCedula}
                  keyboardType="number-pad"
                  maxLength={10}
                  placeholder="0123456789"
                />
              ) : null}
              <Campo etiqueta="Nombres" value={nombres} onChangeText={setNombres} placeholder="Nombres" />
              <Campo etiqueta="Apellidos" value={apellidos} onChangeText={setApellidos} placeholder="Apellidos" />
              <Campo
                etiqueta="Correo"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="usuario@correo.com"
              />

              {modo === "crear" ? (
                <>
                  <SelectorFecha
                    etiqueta="Fecha de nacimiento"
                    valor={fechaNac}
                    onChange={setFechaNac}
                    maxima={new Date()}
                  />
                  <Campo
                    etiqueta="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="Mínimo 6 caracteres"
                  />
                  <Text style={styles.campoEtiqueta}>Rol</Text>
                  <View style={styles.chips}>
                    {[
                      { id: ID_ROL_USUARIO, label: "Usuario" },
                      { id: ID_ROL_ADMIN, label: "Administrador" },
                    ].map((r) => {
                      const activo = r.id === idRol;
                      return (
                        <Pressable
                          key={r.id}
                          onPress={() => setIdRol(r.id)}
                          style={[styles.chip, activo ? styles.chipActivo : null]}
                        >
                          <Text style={[styles.chipTexto, activo ? styles.chipTextoActivo : null]}>
                            {r.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              ) : null}

              {errorForm ? <Text style={styles.error}>{errorForm}</Text> : null}
            </ScrollView>

            <View style={styles.modalAcciones}>
              <Boton titulo="Cancelar" variante="secundario" onPress={() => setModal(false)} />
              <Boton titulo="Guardar" onPress={guardar} cargando={guardando} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  cabecera: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: espaciado.xl,
  },
  titulo: { color: colors.texto, fontSize: tipografia.titulo, fontWeight: "800" },
  subtitulo: { color: colors.textoTenue, fontSize: tipografia.etiqueta },
  nuevo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
    backgroundColor: colors.primario,
    borderRadius: radio.md,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.lg,
  },
  nuevoTexto: { color: colors.sobrePrimario, fontWeight: "800" },
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
  accionesCelda: { flexDirection: "row", gap: espaciado.lg },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: espaciado.xl,
  },
  modalCard: {
    backgroundColor: colors.superficie,
    borderRadius: radio.lg,
    padding: espaciado.lg,
    gap: espaciado.md,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
    maxHeight: "90%",
  },
  modalTitulo: { color: colors.texto, fontSize: tipografia.subtitulo, fontWeight: "800" },
  formContenido: { gap: espaciado.md },
  campoEtiqueta: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    fontWeight: "700",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: espaciado.sm },
  chip: {
    paddingVertical: espaciado.xs,
    paddingHorizontal: espaciado.md,
    borderRadius: radio.full,
    borderWidth: 1,
    borderColor: colors.borde,
    backgroundColor: colors.tarjeta,
  },
  chipActivo: { backgroundColor: colors.primario, borderColor: colors.primario },
  chipTexto: { color: colors.texto, fontSize: tipografia.etiqueta },
  chipTextoActivo: { color: colors.sobrePrimario, fontWeight: "700" },
  modalAcciones: { flexDirection: "row", justifyContent: "flex-end", gap: espaciado.sm },
});
