import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Boton } from "@/src/components/Boton";
import {
  actualizarRegla,
  crearRegla,
  eliminarRegla,
  listarReglas,
} from "@/src/services/admin";
import { listarCatalogo } from "@/src/services/condiciones";
import { listarEmergencias } from "@/src/services/emergencias";
import { colorSeveridad, colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import {
  ApiError,
  CondicionCatalogo,
  EmergenciaItem,
  ReglaAlertaResponse,
} from "@/src/types/api";
import { confirmar } from "@/src/utils/confirmar";

const SEVERIDADES = ["critica", "alta", "media", "baja"];

export default function Reglas() {
  const [reglas, setReglas] = useState<ReglaAlertaResponse[]>([]);
  const [emergencias, setEmergencias] = useState<EmergenciaItem[]>([]);
  const [condiciones, setCondiciones] = useState<CondicionCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario
  const [modal, setModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [idCondicion, setIdCondicion] = useState<number | null>(null);
  const [idEmergencia, setIdEmergencia] = useState<string | null>(null);
  const [severidad, setSeveridad] = useState<string>("media");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [r, e, cat] = await Promise.all([
        listarReglas(),
        listarEmergencias(),
        listarCatalogo(),
      ]);
      setReglas(r);
      setEmergencias(e);
      setCondiciones(cat.flatMap((c) => c.condiciones));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar las reglas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const nombreCondicion = (id: number) =>
    condiciones.find((c) => c.id_condicion === id)?.nombre_condicion ?? `#${id}`;
  const nombreEmergencia = (id: string) =>
    emergencias.find((e) => e.id_emergencia === id)?.nombre_emergencia ?? id;

  const abrirCrear = () => {
    setEditandoId(null);
    setIdCondicion(null);
    setIdEmergencia(null);
    setSeveridad("media");
    setMensaje("");
    setErrorForm(null);
    setModal(true);
  };

  const abrirEditar = (r: ReglaAlertaResponse) => {
    setEditandoId(r.id_regla);
    setIdCondicion(r.id_condicion);
    setIdEmergencia(r.id_emergencia);
    setSeveridad(r.severidad);
    setMensaje(r.mensaje);
    setErrorForm(null);
    setModal(true);
  };

  const guardar = async () => {
    if (idCondicion == null || !idEmergencia || mensaje.trim().length === 0) {
      setErrorForm("Selecciona condición, emergencia y escribe el mensaje.");
      return;
    }
    setGuardando(true);
    setErrorForm(null);
    try {
      const datos = {
        id_condicion: idCondicion,
        id_emergencia: idEmergencia,
        severidad,
        mensaje: mensaje.trim(),
      };
      if (editandoId != null) {
        await actualizarRegla(editandoId, datos);
      } else {
        await crearRegla(datos);
      }
      setModal(false);
      await cargar();
    } catch (err) {
      setErrorForm(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (r: ReglaAlertaResponse) => {
    const ok = await confirmar(
      "Eliminar regla",
      `¿Eliminar la regla de "${nombreCondicion(r.id_condicion)}" en "${nombreEmergencia(r.id_emergencia)}"?`,
    );
    if (!ok) return;
    try {
      await eliminarRegla(r.id_regla);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar");
    }
  };

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
          <Text style={styles.titulo}>Reglas de alerta</Text>
          <Text style={styles.subtitulo}>{reglas.length} reglas configuradas</Text>
        </View>
        <Pressable onPress={abrirCrear} style={styles.nuevo}>
          <MaterialCommunityIcons name="plus" size={20} color={colors.sobrePrimario} />
          <Text style={styles.nuevoTexto}>Nueva</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView contentContainerStyle={styles.lista}>
        {reglas.map((r) => {
          const color = colorSeveridad(r.severidad);
          return (
            <View key={r.id_regla} style={[styles.tarjeta, { borderLeftColor: color }]}>
              <View style={styles.tarjetaCabecera}>
                <Text style={styles.cruce} numberOfLines={1}>
                  {nombreCondicion(r.id_condicion)} → {nombreEmergencia(r.id_emergencia)}
                </Text>
                <Text style={[styles.badge, { color }]}>{r.severidad.toUpperCase()}</Text>
              </View>
              <Text style={styles.mensaje}>{r.mensaje}</Text>
              <View style={styles.acciones}>
                <Pressable onPress={() => abrirEditar(r)} style={styles.accion} hitSlop={8}>
                  <MaterialCommunityIcons name="pencil" size={18} color={colors.primario} />
                  <Text style={styles.accionTexto}>Editar</Text>
                </Pressable>
                <Pressable onPress={() => borrar(r)} style={styles.accion} hitSlop={8}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
                  <Text style={[styles.accionTexto, { color: colors.error }]}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>
              {editandoId != null ? "Editar regla" : "Nueva regla"}
            </Text>

            <ScrollView contentContainerStyle={styles.formContenido}>
              <Text style={styles.campoEtiqueta}>Condición</Text>
              <Chips
                opciones={condiciones.map((c) => ({
                  valor: c.id_condicion,
                  label: c.nombre_condicion,
                }))}
                seleccion={idCondicion}
                onSelect={(v) => setIdCondicion(v as number)}
              />

              <Text style={styles.campoEtiqueta}>Emergencia</Text>
              <Chips
                opciones={emergencias.map((e) => ({
                  valor: e.id_emergencia,
                  label: e.nombre_emergencia,
                }))}
                seleccion={idEmergencia}
                onSelect={(v) => setIdEmergencia(v as string)}
              />

              <Text style={styles.campoEtiqueta}>Severidad</Text>
              <Chips
                opciones={SEVERIDADES.map((s) => ({ valor: s, label: s }))}
                seleccion={severidad}
                onSelect={(v) => setSeveridad(v as string)}
              />

              <Text style={styles.campoEtiqueta}>Mensaje</Text>
              <TextInput
                value={mensaje}
                onChangeText={setMensaje}
                placeholder="Indicación clínica que verá el rescatista"
                placeholderTextColor={colors.textoTenue}
                style={styles.textarea}
                multiline
              />

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

function Chips({
  opciones,
  seleccion,
  onSelect,
}: {
  opciones: { valor: number | string; label: string }[];
  seleccion: number | string | null;
  onSelect: (valor: number | string) => void;
}) {
  return (
    <View style={styles.chips}>
      {opciones.map((op) => {
        const activo = op.valor === seleccion;
        return (
          <Pressable
            key={String(op.valor)}
            onPress={() => onSelect(op.valor)}
            style={[styles.chip, activo ? styles.chipActivo : null]}
          >
            <Text style={[styles.chipTexto, activo ? styles.chipTextoActivo : null]}>
              {op.label}
            </Text>
          </Pressable>
        );
      })}
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
  lista: { padding: espaciado.xl, paddingTop: 0, gap: espaciado.md },
  tarjeta: {
    backgroundColor: colors.tarjeta,
    borderRadius: radio.md,
    borderLeftWidth: 4,
    padding: espaciado.lg,
    gap: espaciado.sm,
  },
  tarjetaCabecera: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.sm,
  },
  cruce: { flex: 1, color: colors.texto, fontSize: tipografia.cuerpo, fontWeight: "700" },
  badge: { fontSize: tipografia.pequeno, fontWeight: "800" },
  mensaje: { color: colors.texto, fontSize: tipografia.etiqueta, lineHeight: 20 },
  acciones: { flexDirection: "row", gap: espaciado.lg, marginTop: espaciado.xs },
  accion: { flexDirection: "row", alignItems: "center", gap: espaciado.xs },
  accionTexto: { color: colors.primario, fontSize: tipografia.etiqueta, fontWeight: "600" },
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
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
    maxHeight: "90%",
  },
  modalTitulo: { color: colors.texto, fontSize: tipografia.subtitulo, fontWeight: "800" },
  formContenido: { gap: espaciado.sm },
  campoEtiqueta: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    fontWeight: "700",
    marginTop: espaciado.sm,
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
  textarea: {
    backgroundColor: colors.fondo,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.md,
    padding: espaciado.md,
    minHeight: 90,
    color: colors.texto,
    fontSize: tipografia.cuerpo,
  },
  modalAcciones: { flexDirection: "row", justifyContent: "flex-end", gap: espaciado.sm },
});
