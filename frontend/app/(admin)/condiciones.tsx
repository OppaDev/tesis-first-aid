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
import { BotonIcono } from "@/src/components/BotonIcono";
import {
  LIMITE_TEXTO_CORTO,
  LIMITE_TEXTO_LARGO,
  limpiarTexto,
} from "@/src/utils/texto";
import { Campo } from "@/src/components/Campo";
import { Paginador } from "@/src/components/Paginador";
import { ColumnaTabla, Tabla } from "@/src/components/Tabla";
import {
  actualizarCondicion,
  crearCondicion,
  eliminarCondicion,
} from "@/src/services/admin";
import { listarCatalogo } from "@/src/services/condiciones";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import { ApiError } from "@/src/types/api";
import { confirmar } from "@/src/utils/confirmar";

interface FilaCondicion {
  id_condicion: number;
  nombre_condicion: string;
  descripcion_condicion: string;
  id_categoria: number;
  nombreCategoria: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

const ANCHO_TABLA = 768; // >= tabla; < tarjetas
const LIMITE = 20;

export default function Condiciones() {
  const [condiciones, setCondiciones] = useState<FilaCondicion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [idCategoria, setIdCategoria] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const esAncho = width >= ANCHO_TABLA;
  const [offset, setOffset] = useState(0);
  // Paginación del lado del cliente (el catálogo se carga completo).
  const pagina = condiciones.slice(offset, offset + LIMITE);

  useEffect(() => {
    if (offset > 0 && offset >= condiciones.length) {
      setOffset(Math.max(0, offset - LIMITE));
    }
  }, [condiciones.length, offset]);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const catalogo = await listarCatalogo();
      setCategorias(
        catalogo.map((c) => ({ id: c.id_categoria, nombre: c.nombre_categoria })),
      );
      setCondiciones(
        catalogo.flatMap((cat) =>
          cat.condiciones.map((c) => ({
            id_condicion: c.id_condicion,
            nombre_condicion: c.nombre_condicion,
            descripcion_condicion: c.descripcion_condicion,
            id_categoria: cat.id_categoria,
            nombreCategoria: cat.nombre_categoria,
          })),
        ),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cargar el catálogo");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCrear = () => {
    setEditandoId(null);
    setNombre("");
    setDescripcion("");
    setIdCategoria(null);
    setErrorForm(null);
    setModal(true);
  };

  const abrirEditar = (c: FilaCondicion) => {
    setEditandoId(c.id_condicion);
    setNombre(c.nombre_condicion);
    setDescripcion(c.descripcion_condicion);
    setIdCategoria(c.id_categoria);
    setErrorForm(null);
    setModal(true);
  };

  const guardar = async () => {
    if (nombre.trim().length === 0 || descripcion.trim().length === 0 || idCategoria == null) {
      setErrorForm("Completa nombre, descripción y categoría.");
      return;
    }
    setGuardando(true);
    setErrorForm(null);
    try {
      const datos = {
        nombre_condicion: limpiarTexto(nombre),
        descripcion_condicion: limpiarTexto(descripcion),
        id_categoria: idCategoria,
      };
      if (editandoId != null) {
        await actualizarCondicion(editandoId, datos);
      } else {
        await crearCondicion(datos);
      }
      setModal(false);
      await cargar();
    } catch (err) {
      setErrorForm(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (c: FilaCondicion) => {
    const ok = await confirmar(
      "Eliminar condición",
      `Eliminar "${c.nombre_condicion}" también borra sus reglas de alerta y la quita de los perfiles de los usuarios. ¿Continuar?`,
    );
    if (!ok) return;
    try {
      await eliminarCondicion(c.id_condicion);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar");
    }
  };

  const columnas: ColumnaTabla<FilaCondicion>[] = [
    {
      titulo: "Condición",
      flex: 1.3,
      render: (c) => (
        <Text style={styles.celdaFuerte} numberOfLines={2}>
          {c.nombre_condicion}
        </Text>
      ),
    },
    {
      titulo: "Descripción",
      flex: 2.2,
      render: (c) => (
        <Text style={styles.celdaTexto} numberOfLines={3}>
          {c.descripcion_condicion}
        </Text>
      ),
    },
    {
      titulo: "Categoría",
      flex: 1.2,
      render: (c) => (
        <Text style={styles.celdaTexto} numberOfLines={2}>
          {c.nombreCategoria}
        </Text>
      ),
    },
    {
      titulo: "Acciones",
      flex: 1,
      alinear: "flex-end",
      render: (c) => (
        <View style={styles.accionesCelda}>
          <BotonIcono
            icono="pencil"
            etiqueta="Editar"
            size={18}
            color={colors.primario}
            onPress={() => abrirEditar(c)}
          />
          <BotonIcono
            icono="trash-can-outline"
            etiqueta="Eliminar"
            size={18}
            color={colors.error}
            onPress={() => borrar(c)}
          />
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
        <View style={styles.tituloWrap}>
          <Text style={styles.titulo} numberOfLines={2}>
            Catálogo de condiciones
          </Text>
          <Text style={styles.subtitulo}>{condiciones.length} condiciones</Text>
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
            datos={pagina}
            keyExtractor={(c) => String(c.id_condicion)}
            vacioTexto="No hay condiciones en el catálogo"
          />
        ) : condiciones.length === 0 ? (
          <Text style={styles.vacio}>No hay condiciones en el catálogo</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.listaCards}>
            {pagina.map((c) => (
              <TarjetaCondicion
                key={c.id_condicion}
                condicion={c}
                onEditar={() => abrirEditar(c)}
                onEliminar={() => borrar(c)}
              />
            ))}
          </ScrollView>
        )}
        <Paginador offset={offset} limit={LIMITE} total={condiciones.length} onCambiar={setOffset} />
      </View>

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>
              {editandoId != null ? "Editar condición" : "Nueva condición"}
            </Text>

            <ScrollView contentContainerStyle={styles.formContenido}>
              <Campo
                etiqueta="Nombre"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej.: Diabetes"
                maxLength={LIMITE_TEXTO_CORTO}
              />

              <Text style={styles.campoEtiqueta}>Descripción</Text>
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción genérica de la condición"
                placeholderTextColor={colors.textoTenue}
                style={styles.textarea}
                multiline
                maxLength={LIMITE_TEXTO_LARGO}
              />

              <Text style={styles.campoEtiqueta}>Categoría</Text>
              <View style={styles.chips}>
                {categorias.map((cat) => {
                  const activo = cat.id === idCategoria;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setIdCategoria(cat.id)}
                      style={[styles.chip, activo ? styles.chipActivo : null]}
                    >
                      <Text style={[styles.chipTexto, activo ? styles.chipTextoActivo : null]}>
                        {cat.nombre}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

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

function TarjetaCondicion({
  condicion,
  onEditar,
  onEliminar,
}: {
  condicion: FilaCondicion;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardNombre}>{condicion.nombre_condicion}</Text>
        <View style={styles.cardAcciones}>
          <BotonIcono
            icono="pencil"
            etiqueta="Editar"
            size={20}
            color={colors.primario}
            onPress={onEditar}
          />
          <BotonIcono
            icono="trash-can-outline"
            etiqueta="Eliminar"
            size={20}
            color={colors.error}
            onPress={onEliminar}
          />
        </View>
      </View>
      <Text style={styles.cardDesc}>{condicion.descripcion_condicion}</Text>
      <View style={styles.cardCatRow}>
        <MaterialCommunityIcons name="shape-outline" size={14} color={colors.textoTenue} />
        <Text style={styles.cardCat}>{condicion.nombreCategoria}</Text>
      </View>
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
    gap: espaciado.md,
    padding: espaciado.xl,
  },
  tituloWrap: { flex: 1 },
  titulo: { color: colors.texto, fontSize: tipografia.subtitulo, fontWeight: "800" },
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
    gap: espaciado.sm,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: espaciado.sm,
  },
  cardNombre: {
    flex: 1,
    color: colors.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: "700",
  },
  cardAcciones: { flexDirection: "row", gap: espaciado.lg },
  cardDesc: { color: colors.textoTenue, fontSize: tipografia.etiqueta, lineHeight: 18 },
  cardCatRow: { flexDirection: "row", alignItems: "center", gap: espaciado.xs },
  cardCat: { color: colors.textoTenue, fontSize: tipografia.pequeno, fontWeight: "600" },
  celdaTexto: { color: colors.textoTenue, fontSize: tipografia.etiqueta, lineHeight: 18 },
  celdaFuerte: { color: colors.texto, fontSize: tipografia.etiqueta, fontWeight: "700" },
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
    maxWidth: 560,
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
  textarea: {
    backgroundColor: colors.fondo,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.md,
    padding: espaciado.md,
    minHeight: 80,
    color: colors.texto,
    fontSize: tipografia.cuerpo,
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
