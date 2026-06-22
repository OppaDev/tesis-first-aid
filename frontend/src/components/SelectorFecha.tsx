import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";

interface Props {
  etiqueta: string;
  valor: Date | null;
  onChange: (fecha: Date) => void;
  maxima?: Date;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const ANIO_MIN = 1920;
const FILA = 48;

function rango(desde: number, hasta: number): number[] {
  const arr: number[] = [];
  for (let i = desde; i <= hasta; i++) arr.push(i);
  return arr;
}

function diasEnMes(anio: number, mes: number): number {
  return new Date(anio, mes + 1, 0).getDate();
}

function formatear(d: Date): string {
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${d.getFullYear()}`;
}

export function SelectorFecha({ etiqueta, valor, onChange, maxima }: Props) {
  const tope = maxima ?? new Date();
  const [visible, setVisible] = useState(false);

  const inicial = valor ?? new Date(tope.getFullYear() - 25, 0, 1);
  const [anio, setAnio] = useState(inicial.getFullYear());
  const [mes, setMes] = useState(inicial.getMonth());
  const [dia, setDia] = useState(inicial.getDate());

  const esAnioTope = anio === tope.getFullYear();
  const esMesTope = esAnioTope && mes === tope.getMonth();

  // No permitir meses/días futuros si está en el año/mes tope
  useEffect(() => {
    if (esAnioTope && mes > tope.getMonth()) {
      setMes(tope.getMonth());
    }
  }, [anio]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const maxDia = esMesTope
      ? Math.min(diasEnMes(anio, mes), tope.getDate())
      : diasEnMes(anio, mes);
    if (dia > maxDia) {
      setDia(maxDia);
    }
  }, [anio, mes]); // eslint-disable-line react-hooks/exhaustive-deps

  const anios = rango(ANIO_MIN, tope.getFullYear());
  const meses = esAnioTope
    ? rango(0, tope.getMonth())
    : rango(0, 11);
  const maxDia = esMesTope
    ? Math.min(diasEnMes(anio, mes), tope.getDate())
    : diasEnMes(anio, mes);
  const dias = rango(1, maxDia);

  const confirmar = () => {
    onChange(new Date(anio, mes, dia));
    setVisible(false);
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>

      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [styles.input, pressed ? styles.presionado : null]}
      >
        <Text style={[styles.texto, valor ? null : styles.placeholder]}>
          {valor ? formatear(valor) : "Seleccionar fecha"}
        </Text>
        <MaterialCommunityIcons name="calendar" size={20} color={colors.textoTenue} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.tarjeta} onPress={() => {}}>
            <Text style={styles.tituloModal}>Fecha de nacimiento</Text>

            <View style={styles.columnas}>
              <Columna
                titulo="Día"
                datos={dias}
                seleccionado={dia}
                onSelect={setDia}
                flex={0.8}
              />
              <Columna
                titulo="Mes"
                datos={meses}
                seleccionado={mes}
                onSelect={setMes}
                formato={(i) => MESES[i]}
                flex={1.4}
              />
              <Columna
                titulo="Año"
                datos={anios}
                seleccionado={anio}
                onSelect={setAnio}
                flex={1}
              />
            </View>

            <View style={styles.acciones}>
              <Pressable onPress={() => setVisible(false)} style={styles.botonTexto}>
                <Text style={styles.cancelarTexto}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={confirmar} style={styles.botonConfirmar}>
                <Text style={styles.confirmarTexto}>Confirmar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Columna({
  titulo,
  datos,
  seleccionado,
  onSelect,
  formato,
  flex,
}: {
  titulo: string;
  datos: number[];
  seleccionado: number;
  onSelect: (valor: number) => void;
  formato?: (valor: number) => string;
  flex: number;
}) {
  const indice = Math.max(0, datos.indexOf(seleccionado));

  return (
    <View style={[styles.columna, { flex }]}>
      <Text style={styles.columnaTitulo}>{titulo}</Text>
      <FlatList
        data={datos}
        keyExtractor={(item) => String(item)}
        getItemLayout={(_, index) => ({
          length: FILA,
          offset: FILA * index,
          index,
        })}
        initialScrollIndex={indice}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const activo = item === seleccionado;
          return (
            <Pressable
              onPress={() => onSelect(item)}
              style={[styles.item, activo ? styles.itemActivo : null]}
            >
              <Text
                style={[styles.itemTexto, activo ? styles.itemTextoActivo : null]}
                numberOfLines={1}
              >
                {formato ? formato(item) : String(item)}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.xs,
  },
  etiqueta: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    fontWeight: "600",
  },
  input: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.superficie,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radio.md,
    paddingHorizontal: espaciado.lg,
  },
  presionado: {
    opacity: 0.85,
  },
  texto: {
    color: colors.texto,
    fontSize: tipografia.cuerpo,
  },
  placeholder: {
    color: colors.textoTenue,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: espaciado.xl,
  },
  tarjeta: {
    backgroundColor: colors.tarjeta,
    borderRadius: radio.lg,
    padding: espaciado.lg,
    gap: espaciado.md,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  tituloModal: {
    color: colors.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: "800",
    textAlign: "center",
  },
  columnas: {
    flexDirection: "row",
    gap: espaciado.sm,
    height: FILA * 5,
  },
  columna: {
    gap: espaciado.xs,
  },
  columnaTitulo: {
    color: colors.textoTenue,
    fontSize: tipografia.pequeno,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
  },
  item: {
    height: FILA,
    borderRadius: radio.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: espaciado.xs,
  },
  itemActivo: {
    backgroundColor: colors.primario,
  },
  itemTexto: {
    color: colors.texto,
    fontSize: tipografia.cuerpo,
  },
  itemTextoActivo: {
    color: colors.sobrePrimario,
    fontWeight: "800",
  },
  acciones: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: espaciado.sm,
  },
  botonTexto: {
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.lg,
  },
  cancelarTexto: {
    color: colors.textoTenue,
    fontSize: tipografia.cuerpo,
    fontWeight: "600",
  },
  botonConfirmar: {
    backgroundColor: colors.primario,
    borderRadius: radio.md,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.xl,
  },
  confirmarTexto: {
    color: colors.sobrePrimario,
    fontSize: tipografia.cuerpo,
    fontWeight: "800",
  },
});
