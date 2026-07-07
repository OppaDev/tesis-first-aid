import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Boton } from "@/src/components/Boton";
import { Campo } from "@/src/components/Campo";
import { CondicionSelector } from "@/src/components/CondicionSelector";
import { Selector } from "@/src/components/Selector";
import { limpiarTexto } from "@/src/utils/texto";
import {
  actualizarPerfilUsuario,
  crearPerfilUsuario,
  obtenerPerfilUsuario,
} from "@/src/services/admin";
import { listarCatalogo } from "@/src/services/condiciones";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import { ApiError, CategoriaConCondiciones } from "@/src/types/api";

const GENEROS = ["masculino", "femenino", "otro"] as const;
const TIPOS_SANGRE = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;

interface Props {
  // cédula del usuario a editar; null = modal cerrado
  cedula: string | null;
  nombre: string;
  onClose: () => void;
  onGuardado?: () => void;
}

export function PerfilClinicoUsuarioModal({
  cedula,
  nombre,
  onClose,
  onGuardado,
}: Props) {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [perfilExiste, setPerfilExiste] = useState(false);

  const [catalogo, setCatalogo] = useState<CategoriaConCondiciones[]>([]);
  const [genero, setGenero] = useState("");
  const [tipoSangre, setTipoSangre] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [seleccion, setSeleccion] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!cedula) return;
    const cargar = async () => {
      setCargando(true);
      setError(null);
      setGenero("");
      setTipoSangre("");
      setAltura("");
      setPeso("");
      setSeleccion({});
      try {
        setCatalogo(await listarCatalogo());
        try {
          const perfil = await obtenerPerfilUsuario(cedula);
          setPerfilExiste(true);
          setGenero(perfil.genero);
          setTipoSangre(perfil.tipo_sangre);
          setAltura(String(perfil.altura_cm));
          setPeso(String(perfil.peso_kg));
          const sel: Record<number, string> = {};
          perfil.condiciones.forEach((c) => {
            sel[c.id_condicion] = c.detalle ?? "";
          });
          setSeleccion(sel);
        } catch (e) {
          if (e instanceof ApiError && e.status === 404) {
            setPerfilExiste(false); // el usuario aún no tiene perfil: modo crear
          } else {
            throw e;
          }
        }
      } catch (e) {
        setError(
          e instanceof ApiError ? e.message : "No se pudo cargar el perfil",
        );
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [cedula]);

  const alternarCondicion = (id: number) => {
    setSeleccion((prev) => {
      const copia = { ...prev };
      if (id in copia) {
        delete copia[id];
      } else {
        copia[id] = "";
      }
      return copia;
    });
  };

  const ponerDetalle = (id: number, detalle: string) => {
    setSeleccion((prev) => ({ ...prev, [id]: detalle }));
  };

  const guardar = async () => {
    if (!cedula) return;
    const alturaNum = Number(altura);
    const pesoNum = Number(peso);
    if (!genero || !tipoSangre) {
      setError("Selecciona género y tipo de sangre.");
      return;
    }
    if (!alturaNum || alturaNum <= 0 || !pesoNum || pesoNum <= 0) {
      setError("Altura y peso deben ser números válidos.");
      return;
    }
    if (!Number.isInteger(alturaNum)) {
      setError("La altura debe ser un número entero en centímetros.");
      return;
    }

    const payload = {
      genero,
      tipo_sangre: tipoSangre,
      altura_cm: alturaNum,
      peso_kg: pesoNum,
      condiciones: Object.entries(seleccion).map(([id, det]) => {
        const detalle = limpiarTexto(det);
        return {
          id_condicion: Number(id),
          detalle: detalle === "" ? null : detalle,
        };
      }),
    };

    setError(null);
    setGuardando(true);
    try {
      if (perfilExiste) {
        await actualizarPerfilUsuario(cedula, payload);
      } else {
        await crearPerfilUsuario(cedula, payload);
      }
      onGuardado?.();
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar el perfil");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      visible={cedula !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.titulo}>Perfil clínico</Text>
          <Text style={styles.subtitulo}>{nombre}</Text>

          {cargando ? (
            <View style={styles.estado}>
              <ActivityIndicator color={colors.primario} size="large" />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.form}>
              {!perfilExiste ? (
                <Text style={styles.aviso}>
                  Este usuario aún no tiene perfil clínico. Al guardar, lo crearás.
                </Text>
              ) : null}

              <Selector
                etiqueta="Género"
                opciones={GENEROS}
                valor={genero}
                onChange={setGenero}
              />
              <Selector
                etiqueta="Tipo de sangre"
                opciones={TIPOS_SANGRE}
                valor={tipoSangre}
                onChange={setTipoSangre}
              />
              <Campo
                etiqueta="Altura (cm)"
                value={altura}
                // Centímetros enteros: se descarta cualquier caracter no numérico.
                onChangeText={(t) => setAltura(t.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                placeholder="175"
                maxLength={3}
              />
              <Campo
                etiqueta="Peso (kg)"
                value={peso}
                onChangeText={setPeso}
                keyboardType="numeric"
                placeholder="70"
                maxLength={6}
              />

              <CondicionSelector
                catalogo={catalogo}
                seleccion={seleccion}
                onToggle={alternarCondicion}
                onDetalle={ponerDetalle}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </ScrollView>
          )}

          <View style={styles.acciones}>
            <Boton titulo="Cancelar" variante="secundario" onPress={onClose} />
            <Boton titulo="Guardar" onPress={guardar} cargando={guardando} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: espaciado.xl,
  },
  card: {
    backgroundColor: colors.superficie,
    borderRadius: radio.lg,
    padding: espaciado.lg,
    gap: espaciado.sm,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
    maxHeight: "90%",
  },
  titulo: { color: colors.texto, fontSize: tipografia.subtitulo, fontWeight: "800" },
  subtitulo: { color: colors.textoTenue, fontSize: tipografia.etiqueta },
  estado: { paddingVertical: espaciado.xxl, alignItems: "center" },
  form: { gap: espaciado.md, paddingVertical: espaciado.md },
  aviso: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    backgroundColor: colors.fondo,
    borderRadius: radio.md,
    padding: espaciado.md,
    lineHeight: 18,
  },
  error: { color: colors.error, fontSize: tipografia.etiqueta },
  acciones: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: espaciado.sm,
    marginTop: espaciado.sm,
  },
});
