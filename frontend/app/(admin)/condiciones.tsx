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
import { Campo } from "@/src/components/Campo";
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
        nombre_condicion: nombre.trim(),
        descripcion_condicion: descripcion.trim(),
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
          <Pressable onPress={() => abrirEditar(c)} hitSlop={8}>
            <MaterialCommunityIcons name="pencil" size={18} color={colors.primario} />
          </Pressable>
          <Pressable onPress={() => borrar(c)} hitSlop={8}>
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
          <Text style={styles.titulo}>Catálogo de condiciones</Text>
          <Text style={styles.subtitulo}>{condiciones.length} condiciones</Text>
        </View>
        <Pressable onPress={abrirCrear} style={styles.nuevo}>
          <MaterialCommunityIcons name="plus" size={20} color={colors.sobrePrimario} />
          <Text style={styles.nuevoTexto}>Nueva</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.tablaWrap}>
        <Tabla
          columnas={columnas}
          datos={condiciones}
          keyExtractor={(c) => String(c.id_condicion)}
          vacioTexto="No hay condiciones en el catálogo"
        />
      </View>

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>
              {editandoId != null ? "Editar condición" : "Nueva condición"}
            </Text>

            <ScrollView contentContainerStyle={styles.formContenido}>
              <Campo etiqueta="Nombre" value={nombre} onChangeText={setNombre} placeholder="Ej.: Diabetes" />

              <Text style={styles.campoEtiqueta}>Descripción</Text>
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción genérica de la condición"
                placeholderTextColor={colors.textoTenue}
                style={styles.textarea}
                multiline
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
