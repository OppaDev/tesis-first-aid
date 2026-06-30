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
import { Campo } from "@/src/components/Campo";
import { Paginador } from "@/src/components/Paginador";
import { ColumnaTabla, Tabla } from "@/src/components/Tabla";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
} from "@/src/services/admin";
import { listarCatalogo } from "@/src/services/condiciones";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import { ApiError } from "@/src/types/api";
import { confirmar } from "@/src/utils/confirmar";

interface FilaCategoria {
  id_categoria: number;
  nombre_categoria: string;
  numCondiciones: number;
}

const ANCHO_TABLA = 768; // >= tabla; < tarjetas
const LIMITE = 20;

export default function Categorias() {
  const [categorias, setCategorias] = useState<FilaCategoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const esAncho = width >= ANCHO_TABLA;
  const [offset, setOffset] = useState(0);
  // Paginación del lado del cliente (el catálogo se carga completo).
  const pagina = categorias.slice(offset, offset + LIMITE);

  // Si tras borrar la página queda vacía, retrocede.
  useEffect(() => {
    if (offset > 0 && offset >= categorias.length) {
      setOffset(Math.max(0, offset - LIMITE));
    }
  }, [categorias.length, offset]);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const catalogo = await listarCatalogo();
      setCategorias(
        catalogo.map((c) => ({
          id_categoria: c.id_categoria,
          nombre_categoria: c.nombre_categoria,
          numCondiciones: c.condiciones.length,
        })),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudieron cargar las categorías");
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
    setErrorForm(null);
    setModal(true);
  };

  const abrirEditar = (c: FilaCategoria) => {
    setEditandoId(c.id_categoria);
    setNombre(c.nombre_categoria);
    setErrorForm(null);
    setModal(true);
  };

  const guardar = async () => {
    if (nombre.trim().length === 0) {
      setErrorForm("Escribe el nombre de la categoría.");
      return;
    }
    setGuardando(true);
    setErrorForm(null);
    try {
      const datos = { nombre_categoria: nombre.trim() };
      if (editandoId != null) {
        await actualizarCategoria(editandoId, datos);
      } else {
        await crearCategoria(datos);
      }
      setModal(false);
      await cargar();
    } catch (err) {
      setErrorForm(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (c: FilaCategoria) => {
    const ok = await confirmar(
      "Eliminar categoría",
      `¿Eliminar la categoría "${c.nombre_categoria}"?`,
    );
    if (!ok) return;
    try {
      await eliminarCategoria(c.id_categoria);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar");
    }
  };

  const columnas: ColumnaTabla<FilaCategoria>[] = [
    {
      titulo: "Categoría",
      flex: 2,
      render: (c) => (
        <Text style={styles.celdaFuerte} numberOfLines={1}>
          {c.nombre_categoria}
        </Text>
      ),
    },
    {
      titulo: "Condiciones",
      flex: 1,
      render: (c) => <Text style={styles.celdaTexto}>{c.numCondiciones}</Text>,
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
          <Text style={styles.titulo}>Categorías</Text>
          <Text style={styles.subtitulo}>{categorias.length} categorías</Text>
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
            keyExtractor={(c) => String(c.id_categoria)}
            vacioTexto="No hay categorías"
          />
        ) : categorias.length === 0 ? (
          <Text style={styles.vacio}>No hay categorías</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.listaCards}>
            {pagina.map((c) => (
              <TarjetaCategoria
                key={c.id_categoria}
                categoria={c}
                onEditar={() => abrirEditar(c)}
                onEliminar={() => borrar(c)}
              />
            ))}
          </ScrollView>
        )}
        <Paginador offset={offset} limit={LIMITE} total={categorias.length} onCambiar={setOffset} />
      </View>

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>
              {editandoId != null ? "Editar categoría" : "Nueva categoría"}
            </Text>

            <Campo
              etiqueta="Nombre"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej.: Enfermedades crónicas"
            />

            {errorForm ? <Text style={styles.error}>{errorForm}</Text> : null}

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

function TarjetaCategoria({
  categoria,
  onEditar,
  onEliminar,
}: {
  categoria: FilaCategoria;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardNombre}>{categoria.nombre_categoria}</Text>
        <Text style={styles.cardSub}>
          {categoria.numCondiciones}{" "}
          {categoria.numCondiciones === 1 ? "condición" : "condiciones"}
        </Text>
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
  celdaTexto: { color: colors.textoTenue, fontSize: tipografia.etiqueta },
  celdaFuerte: { color: colors.texto, fontSize: tipografia.etiqueta, fontWeight: "700" },
  accionesCelda: { flexDirection: "row", gap: espaciado.lg },
  // Tarjetas (móvil)
  listaCards: { gap: espaciado.md, paddingBottom: espaciado.md },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.sm,
    backgroundColor: colors.tarjeta,
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colors.borde,
    padding: espaciado.lg,
  },
  cardInfo: { flex: 1, gap: 2 },
  cardNombre: { color: colors.texto, fontSize: tipografia.cuerpo, fontWeight: "700" },
  cardSub: { color: colors.textoTenue, fontSize: tipografia.etiqueta },
  cardAcciones: { flexDirection: "row", gap: espaciado.lg },
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
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  modalTitulo: { color: colors.texto, fontSize: tipografia.subtitulo, fontWeight: "800" },
  modalAcciones: { flexDirection: "row", justifyContent: "flex-end", gap: espaciado.sm },
});
