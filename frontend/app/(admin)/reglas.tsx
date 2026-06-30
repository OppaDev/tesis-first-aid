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
  useWindowDimensions,
  View,
} from "react-native";

import { Boton } from "@/src/components/Boton";
import { Paginador } from "@/src/components/Paginador";
import { ColumnaTabla, Tabla } from "@/src/components/Tabla";
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
const ANCHO_TABLA = 768; // >= tabla; < tarjetas

export default function Reglas() {
  const [reglas, setReglas] = useState<ReglaAlertaResponse[]>([]);
  const [emergencias, setEmergencias] = useState<EmergenciaItem[]>([]);
  const [condiciones, setCondiciones] = useState<CondicionCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const LIMITE = 20;
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  // Formulario
  const [modal, setModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [idCondicion, setIdCondicion] = useState<number | null>(null);
  const [idEmergencia, setIdEmergencia] = useState<string | null>(null);
  const [severidad, setSeveridad] = useState<string>("media");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const esAncho = width >= ANCHO_TABLA;

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const [pag, e, cat] = await Promise.all([
        listarReglas(LIMITE, offset),
        listarEmergencias(),
        listarCatalogo(),
      ]);
      if (pag.items.length === 0 && offset > 0) {
        setOffset(Math.max(0, offset - LIMITE)); // página vacía tras borrar → retrocede
        return;
      }
      setReglas(pag.items);
      setTotal(pag.total);
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
  }, [offset]);

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

  const columnas: ColumnaTabla<ReglaAlertaResponse>[] = [
    {
      titulo: "Condición",
      flex: 1.3,
      render: (r) => (
        <Text style={styles.celdaTexto} numberOfLines={2}>
          {nombreCondicion(r.id_condicion)}
        </Text>
      ),
    },
    {
      titulo: "Emergencia",
      flex: 1.3,
      render: (r) => (
        <Text style={styles.celdaTexto} numberOfLines={2}>
          {nombreEmergencia(r.id_emergencia)}
        </Text>
      ),
    },
    {
      titulo: "Severidad",
      flex: 0.8,
      render: (r) => (
        <Text style={[styles.badge, { color: colorSeveridad(r.severidad) }]}>
          {r.severidad.toUpperCase()}
        </Text>
      ),
    },
    {
      titulo: "Mensaje",
      flex: 2.2,
      render: (r) => (
        <Text style={styles.celdaTexto} numberOfLines={3}>
          {r.mensaje}
        </Text>
      ),
    },
    {
      titulo: "Acciones",
      flex: 1,
      alinear: "flex-end",
      render: (r) => (
        <View style={styles.accionesCelda}>
          <Pressable onPress={() => abrirEditar(r)} hitSlop={8}>
            <MaterialCommunityIcons name="pencil" size={18} color={colors.primario} />
          </Pressable>
          <Pressable onPress={() => borrar(r)} hitSlop={8}>
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
          </Pressable>
        </View>
      ),
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
          <Text style={styles.titulo}>Reglas de alerta</Text>
          <Text style={styles.subtitulo}>{reglas.length} reglas configuradas</Text>
        </View>
        <Pressable onPress={abrirCrear} style={styles.nuevo}>
          <MaterialCommunityIcons name="plus" size={20} color={colors.sobrePrimario} />
          <Text style={styles.nuevoTexto}>Nueva</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.tablaWrap}>
        {esAncho ? (
          <Tabla
            columnas={columnas}
            datos={reglas}
            keyExtractor={(r) => String(r.id_regla)}
            vacioTexto="No hay reglas configuradas"
          />
        ) : reglas.length === 0 ? (
          <Text style={styles.vacio}>No hay reglas configuradas</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.listaCards}>
            {reglas.map((r) => (
              <TarjetaRegla
                key={r.id_regla}
                regla={r}
                condicion={nombreCondicion(r.id_condicion)}
                emergencia={nombreEmergencia(r.id_emergencia)}
                onEditar={() => abrirEditar(r)}
                onEliminar={() => borrar(r)}
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

function TarjetaRegla({
  regla,
  condicion,
  emergencia,
  onEditar,
  onEliminar,
}: {
  regla: ReglaAlertaResponse;
  condicion: string;
  emergencia: string;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardCond}>{condicion}</Text>
          <Text style={styles.cardEmer}>en {emergencia}</Text>
        </View>
        <View style={styles.cardAcciones}>
          <Pressable onPress={onEditar} hitSlop={8}>
            <MaterialCommunityIcons name="pencil" size={20} color={colors.primario} />
          </Pressable>
          <Pressable onPress={onEliminar} hitSlop={8}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
          </Pressable>
        </View>
      </View>
      <Text style={[styles.badge, { color: colorSeveridad(regla.severidad) }]}>
        {regla.severidad.toUpperCase()}
      </Text>
      <Text style={styles.cardMensaje}>{regla.mensaje}</Text>
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
  tablaWrap: { flex: 1, paddingHorizontal: espaciado.xl, paddingBottom: espaciado.xl },
  vacio: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    textAlign: "center",
    padding: espaciado.xl,
  },
  celdaTexto: { color: colors.texto, fontSize: tipografia.etiqueta, lineHeight: 18 },
  badge: { fontSize: tipografia.pequeno, fontWeight: "800" },
  accionesCelda: { flexDirection: "row", gap: espaciado.lg },
  // Tarjetas (móvil)
  listaCards: { gap: espaciado.md, paddingBottom: espaciado.md },
  card: {
    backgroundColor: colors.tarjeta,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colors.borde,
    padding: espaciado.lg,
    gap: espaciado.sm,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: espaciado.sm,
  },
  cardInfo: { flex: 1, gap: 2 },
  cardCond: { color: colors.texto, fontSize: tipografia.cuerpo, fontWeight: "700" },
  cardEmer: { color: colors.textoTenue, fontSize: tipografia.etiqueta },
  cardAcciones: { flexDirection: "row", gap: espaciado.lg },
  cardMensaje: { color: colors.textoTenue, fontSize: tipografia.etiqueta, lineHeight: 18 },
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
