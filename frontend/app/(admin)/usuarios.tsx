import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { Boton } from "@/src/components/Boton";
import { BotonIcono } from "@/src/components/BotonIcono";
import { Campo } from "@/src/components/Campo";
import { Paginador } from "@/src/components/Paginador";
import { PerfilClinicoUsuarioModal } from "@/src/components/PerfilClinicoUsuarioModal";
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
import { passwordValida, requisitosPassword } from "@/src/utils/password";

const ID_ROL_USUARIO = 2;
const ANCHO_TABLA = 768; // >= tabla; < tarjetas con menú de acciones

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
  const [confirmarPass, setConfirmarPass] = useState("");
  const [idRol, setIdRol] = useState<number>(ID_ROL_USUARIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Validación de contraseña en tiempo real (solo al crear)
  const requisitos = requisitosPassword(password);
  const passwordOk = passwordValida(password);
  const passwordsCoinciden = password.length > 0 && password === confirmarPass;
  const mostrarNoCoinciden = confirmarPass.length > 0 && password !== confirmarPass;

  // Modal de perfil clínico (crear/editar el perfil de un usuario)
  const [perfilCedula, setPerfilCedula] = useState<string | null>(null);
  const [perfilNombre, setPerfilNombre] = useState("");

  // Menú de acciones (3 puntos) en la vista de tarjetas (móvil)
  const [menuUsuario, setMenuUsuario] = useState<UsuarioAdmin | null>(null);

  const { width } = useWindowDimensions();
  const esAncho = width >= ANCHO_TABLA;

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
    setConfirmarPass("");
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
        if (cedula.trim().length < 10 || !fechaNac) {
          setErrorForm("Revisa la cédula (10 dígitos) y la fecha de nacimiento.");
          setGuardando(false);
          return;
        }
        if (!passwordValida(password) || password !== confirmarPass) {
          setErrorForm("La contraseña no cumple los requisitos o no coincide.");
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

  const abrirPerfil = (u: UsuarioAdmin) => {
    setPerfilNombre(`${u.nombres} ${u.apellidos}`);
    setPerfilCedula(u.cedula);
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
            <BotonIcono
              icono="pencil"
              etiqueta="Editar"
              size={18}
              color={colors.primario}
              onPress={() => abrirEditar(u)}
            />
            <BotonIcono
              icono="clipboard-pulse-outline"
              etiqueta="Perfil clínico"
              size={18}
              color={colors.primario}
              onPress={() => abrirPerfil(u)}
            />
            <BotonIcono
              icono={esAdmin ? "account-arrow-down" : "shield-account"}
              etiqueta={esAdmin ? "Quitar admin" : "Hacer admin"}
              size={18}
              color={colors.primario}
              onPress={() => alternarRol(u)}
            />
            <BotonIcono
              icono="trash-can-outline"
              etiqueta="Eliminar"
              size={18}
              color={colors.error}
              onPress={() => borrar(u)}
            />
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
        {esAncho ? (
          <Tabla
            columnas={columnas}
            datos={usuarios}
            keyExtractor={(u) => u.cedula}
            vacioTexto="No hay usuarios registrados"
          />
        ) : usuarios.length === 0 ? (
          <Text style={styles.vacio}>No hay usuarios registrados</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.listaCards}>
            {usuarios.map((u) => (
              <TarjetaUsuario
                key={u.cedula}
                usuario={u}
                onMenu={() => setMenuUsuario(u)}
              />
            ))}
          </ScrollView>
        )}
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
                  <View>
                    <Campo
                      etiqueta="Contraseña"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      placeholder="Mínimo 8 caracteres"
                    />
                    {password.length > 0 ? (
                      <View style={styles.requisitos}>
                        {requisitos.map((r) => (
                          <View key={r.etiqueta} style={styles.requisito}>
                            <MaterialCommunityIcons
                              name={r.cumple ? "check-circle" : "close-circle"}
                              size={14}
                              color={r.cumple ? colors.exito : colors.error}
                            />
                            <Text
                              style={[
                                styles.requisitoTexto,
                                { color: r.cumple ? colors.exito : colors.textoTenue },
                              ]}
                            >
                              {r.etiqueta}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                  <View>
                    <Campo
                      etiqueta="Confirmar contraseña"
                      value={confirmarPass}
                      onChangeText={setConfirmarPass}
                      secureTextEntry
                      placeholder="Repite la contraseña"
                    />
                    {mostrarNoCoinciden ? (
                      <Text style={styles.pista}>Las contraseñas no coinciden</Text>
                    ) : passwordsCoinciden ? (
                      <Text style={styles.pistaOk}>Las contraseñas coinciden</Text>
                    ) : null}
                  </View>
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
              <Boton
                titulo="Guardar"
                onPress={guardar}
                cargando={guardando}
                deshabilitado={modo === "crear" && (!passwordOk || !passwordsCoinciden)}
              />
            </View>
          </View>
        </View>
      </Modal>

      <PerfilClinicoUsuarioModal
        cedula={perfilCedula}
        nombre={perfilNombre}
        onClose={() => setPerfilCedula(null)}
      />

      <MenuAcciones
        usuario={menuUsuario}
        onCerrar={() => setMenuUsuario(null)}
        onEditar={abrirEditar}
        onPerfil={abrirPerfil}
        onRol={alternarRol}
        onEliminar={borrar}
      />
    </View>
  );
}

function TarjetaUsuario({
  usuario,
  onMenu,
}: {
  usuario: UsuarioAdmin;
  onMenu: () => void;
}) {
  const esAdmin = usuario.id_rol === ID_ROL_ADMIN;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNombre} numberOfLines={1}>
            {usuario.nombres} {usuario.apellidos}
          </Text>
          <Text style={styles.cardEmail} numberOfLines={1}>
            {usuario.email}
          </Text>
        </View>
        <BotonIcono
          icono="dots-vertical"
          etiqueta="Opciones"
          size={22}
          color={colors.textoTenue}
          estilo={styles.kebab}
          onPress={onMenu}
        />
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.cardCedula}>CI: {usuario.cedula}</Text>
        <View style={[styles.rolBadge, esAdmin ? styles.rolAdmin : null]}>
          <Text style={[styles.rolTexto, esAdmin ? styles.rolTextoAdmin : null]}>
            {usuario.nombre_rol ?? "—"}
          </Text>
        </View>
      </View>
    </View>
  );
}

function MenuAcciones({
  usuario,
  onCerrar,
  onEditar,
  onPerfil,
  onRol,
  onEliminar,
}: {
  usuario: UsuarioAdmin | null;
  onCerrar: () => void;
  onEditar: (u: UsuarioAdmin) => void;
  onPerfil: (u: UsuarioAdmin) => void;
  onRol: (u: UsuarioAdmin) => void;
  onEliminar: (u: UsuarioAdmin) => void;
}) {
  if (!usuario) return null;
  const esAdmin = usuario.id_rol === ID_ROL_ADMIN;

  // Cierra el menú antes de ejecutar la acción (evita modales superpuestos).
  const ejecutar = (accion: (u: UsuarioAdmin) => void) => {
    onCerrar();
    accion(usuario);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCerrar}>
      <Pressable style={styles.menuOverlay} onPress={onCerrar}>
        <Pressable style={styles.menuSheet}>
          <Text style={styles.menuTitulo} numberOfLines={1}>
            {usuario.nombres} {usuario.apellidos}
          </Text>

          <MenuItem icono="pencil" texto="Editar datos" onPress={() => ejecutar(onEditar)} />
          <MenuItem
            icono="clipboard-pulse-outline"
            texto="Perfil clínico"
            onPress={() => ejecutar(onPerfil)}
          />
          <MenuItem
            icono={esAdmin ? "account-arrow-down" : "shield-account"}
            texto={esAdmin ? "Quitar administrador" : "Hacer administrador"}
            onPress={() => ejecutar(onRol)}
          />
          <MenuItem
            icono="trash-can-outline"
            texto="Eliminar"
            peligro
            onPress={() => ejecutar(onEliminar)}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MenuItem({
  icono,
  texto,
  onPress,
  peligro,
}: {
  icono: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  texto: string;
  onPress: () => void;
  peligro?: boolean;
}) {
  const color = peligro ? colors.error : colors.texto;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed ? styles.menuItemPress : null]}
    >
      <MaterialCommunityIcons name={icono} size={20} color={peligro ? colors.error : colors.primario} />
      <Text style={[styles.menuItemTexto, { color }]}>{texto}</Text>
    </Pressable>
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
  vacio: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    textAlign: "center",
    padding: espaciado.xl,
  },
  // Tarjetas (móvil)
  listaCards: { gap: espaciado.md, paddingBottom: espaciado.md },
  card: {
    backgroundColor: colors.tarjeta,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colors.borde,
    padding: espaciado.lg,
    gap: espaciado.md,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espaciado.sm,
  },
  cardInfo: { flex: 1, gap: 2 },
  cardNombre: { color: colors.texto, fontSize: tipografia.cuerpo, fontWeight: "700" },
  cardEmail: { color: colors.textoTenue, fontSize: tipografia.etiqueta },
  kebab: { padding: espaciado.xs, marginTop: -espaciado.xs, marginRight: -espaciado.xs },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardCedula: { color: colors.textoTenue, fontSize: tipografia.etiqueta },
  // Menú de acciones (3 puntos)
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuSheet: {
    backgroundColor: colors.superficie,
    borderTopLeftRadius: radio.lg,
    borderTopRightRadius: radio.lg,
    padding: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.xs,
  },
  menuTitulo: {
    color: colors.textoTenue,
    fontSize: tipografia.pequeno,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: espaciado.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.sm,
    borderRadius: radio.md,
  },
  menuItemPress: { backgroundColor: colors.fondo },
  menuItemTexto: { fontSize: tipografia.cuerpo, fontWeight: "600" },
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
  requisitos: {
    marginTop: espaciado.sm,
    gap: espaciado.xs,
  },
  requisito: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
  },
  requisitoTexto: {
    fontSize: tipografia.pequeno,
  },
  pista: {
    color: colors.error,
    fontSize: tipografia.pequeno,
    marginTop: espaciado.xs,
  },
  pistaOk: {
    color: colors.exito,
    fontSize: tipografia.pequeno,
    marginTop: espaciado.xs,
  },
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
