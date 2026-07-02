import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Boton } from "@/src/components/Boton";
import { CambiarPasswordModal } from "@/src/components/CambiarPasswordModal";
import { Campo } from "@/src/components/Campo";
import { CondicionSelector } from "@/src/components/CondicionSelector";
import { Selector } from "@/src/components/Selector";
import { listarCatalogo } from "@/src/services/condiciones";
import {
  actualizarPerfil,
  crearPerfil,
  eliminarPerfil,
  obtenerPerfil,
} from "@/src/services/perfil";
import { ID_ROL_ADMIN, useAuthStore } from "@/src/store/authStore";
import { colors, espaciado, radio, tipografia } from "@/src/theme/theme";
import {
  ApiError,
  CategoriaConCondiciones,
  PerfilResponse,
} from "@/src/types/api";

const GENEROS = ["masculino", "femenino", "otro"] as const;
const TIPOS_SANGRE = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as const;

export default function Perfil() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const rol = useAuthStore((s) => s.rol);
  const esAdmin = rol === ID_ROL_ADMIN;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);
  const [catalogo, setCatalogo] = useState<CategoriaConCondiciones[]>([]);
  const [modo, setModo] = useState<"ver" | "editar">("ver");
  const [cambiarPass, setCambiarPass] = useState(false);

  // Campos del formulario
  const [genero, setGenero] = useState("");
  const [tipoSangre, setTipoSangre] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [seleccion, setSeleccion] = useState<Record<number, string>>({});

  useEffect(() => {
    const cargar = async () => {
      if (!token) {
        setCargando(false);
        return;
      }
      setCargando(true);
      setError(null);
      try {
        setCatalogo(await listarCatalogo());
        try {
          setPerfil(await obtenerPerfil());
        } catch (e) {
          if (e instanceof ApiError && e.status === 404) {
            setPerfil(null);
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
  }, [token]);

  const abrirEdicion = () => {
    setError(null);
    if (perfil) {
      setGenero(perfil.genero);
      setTipoSangre(perfil.tipo_sangre);
      setAltura(String(perfil.altura_cm));
      setPeso(String(perfil.peso_kg));
      const sel: Record<number, string> = {};
      perfil.condiciones.forEach((c) => {
        sel[c.id_condicion] = c.detalle ?? "";
      });
      setSeleccion(sel);
    } else {
      setGenero("");
      setTipoSangre("");
      setAltura("");
      setPeso("");
      setSeleccion({});
    }
    setModo("editar");
  };

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

    const condiciones = Object.entries(seleccion).map(([id, det]) => ({
      id_condicion: Number(id),
      detalle: det.trim() === "" ? null : det.trim(),
    }));

    const payload = {
      genero,
      tipo_sangre: tipoSangre,
      altura_cm: alturaNum,
      peso_kg: pesoNum,
      condiciones,
    };

    setError(null);
    setGuardando(true);
    try {
      const resultado = perfil
        ? await actualizarPerfil(payload)
        : await crearPerfil(payload);
      setPerfil(resultado);
      setModo("ver");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar el perfil");
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = () => {
    Alert.alert(
      "Eliminar perfil",
      "¿Seguro que deseas eliminar tu perfil clínico? Se perderán tus condiciones.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await eliminarPerfil();
              setPerfil(null);
            } catch (e) {
              setError(
                e instanceof ApiError ? e.message : "No se pudo eliminar",
              );
            }
          },
        },
      ],
    );
  };

  if (!token) {
    return (
      <View style={styles.flex}>
        <View style={[styles.cabecera, { paddingTop: insets.top + espaciado.md }]}>
          <Text style={styles.titulo}>Mi perfil clínico</Text>
        </View>
        <View style={styles.vacio}>
          <MaterialCommunityIcons
            name="account-lock-outline"
            size={56}
            color={colors.textoTenue}
          />
          <Text style={styles.vacioTitulo}>Inicia sesión para tu perfil</Text>
          <Text style={styles.ayuda}>
            Con tu perfil clínico, la app te muestra alertas personalizadas durante
            una emergencia.
          </Text>
          <Boton titulo="Iniciar sesión" onPress={() => router.push("/login")} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={[styles.cabecera, { paddingTop: insets.top + espaciado.md }]}>
        <Text style={styles.titulo}>Mi perfil clínico</Text>
        <View style={styles.cabeceraAcciones}>
          <Pressable onPress={() => setCambiarPass(true)} hitSlop={12}>
            <MaterialCommunityIcons name="lock-reset" size={24} color={colors.primario} />
          </Pressable>
          {esAdmin ? (
            <Pressable onPress={() => router.push("/reglas" as Href)} hitSlop={12}>
              <MaterialCommunityIcons name="shield-account" size={24} color={colors.primario} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <CambiarPasswordModal
        visible={cambiarPass}
        onClose={() => setCambiarPass(false)}
        onExito={() =>
          Alert.alert("Contraseña actualizada", "Tu contraseña se cambió correctamente.")
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.contenido,
          { paddingBottom: insets.bottom + espaciado.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {cargando ? (
          <View style={styles.estado}>
            <ActivityIndicator color={colors.primario} size="large" />
          </View>
        ) : modo === "editar" ? (
          <FormularioPerfil
            genero={genero}
            setGenero={setGenero}
            tipoSangre={tipoSangre}
            setTipoSangre={setTipoSangre}
            altura={altura}
            setAltura={setAltura}
            peso={peso}
            setPeso={setPeso}
            catalogo={catalogo}
            seleccion={seleccion}
            onToggle={alternarCondicion}
            onDetalle={ponerDetalle}
            error={error}
            guardando={guardando}
            onGuardar={guardar}
            onCancelar={() => {
              setError(null);
              setModo("ver");
            }}
          />
        ) : perfil ? (
          <VistaPerfil
            perfil={perfil}
            onEditar={abrirEdicion}
            onEliminar={confirmarEliminar}
            error={error}
          />
        ) : (
          <VacioPerfil onCrear={abrirEdicion} error={error} />
        )}
      </ScrollView>
    </View>
  );
}

function VistaPerfil({
  perfil,
  onEditar,
  onEliminar,
  error,
}: {
  perfil: PerfilResponse;
  onEditar: () => void;
  onEliminar: () => void;
  error: string | null;
}) {
  return (
    <View style={styles.bloque}>
      <View style={styles.tarjeta}>
        {perfil.edad != null ? (
          <Dato etiqueta="Edad" valor={`${perfil.edad} años`} />
        ) : null}
        <Dato etiqueta="Género" valor={perfil.genero} />
        <Dato etiqueta="Tipo de sangre" valor={perfil.tipo_sangre} />
        <Dato etiqueta="Altura" valor={`${perfil.altura_cm} cm`} />
        <Dato etiqueta="Peso" valor={`${perfil.peso_kg} kg`} />
        {perfil.imc != null ? (
          <Dato etiqueta="IMC" valor={perfil.imc.toFixed(1)} />
        ) : null}
      </View>

      <Text style={styles.subtitulo}>Condiciones</Text>
      {perfil.condiciones.length === 0 ? (
        <Text style={styles.ayuda}>Sin condiciones registradas.</Text>
      ) : (
        perfil.condiciones.map((c) => (
          <View key={c.id_condicion} style={styles.condicionTarjeta}>
            <Text style={styles.condicionNombre}>{c.nombre_condicion}</Text>
            {c.detalle ? (
              <Text style={styles.condicionDetalle}>{c.detalle}</Text>
            ) : null}
          </View>
        ))
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Boton titulo="Editar perfil" onPress={onEditar} />
      <Boton titulo="Eliminar perfil" variante="secundario" onPress={onEliminar} />
    </View>
  );
}

function VacioPerfil({
  onCrear,
  error,
}: {
  onCrear: () => void;
  error: string | null;
}) {
  return (
    <View style={styles.vacio}>
      <MaterialCommunityIcons
        name="clipboard-pulse-outline"
        size={56}
        color={colors.textoTenue}
      />
      <Text style={styles.vacioTitulo}>Aún no tienes perfil clínico</Text>
      <Text style={styles.ayuda}>
        Crea tu perfil para recibir alertas personalizadas durante una
        emergencia.
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Boton titulo="Crear perfil" onPress={onCrear} />
    </View>
  );
}

function FormularioPerfil(props: {
  genero: string;
  setGenero: (v: string) => void;
  tipoSangre: string;
  setTipoSangre: (v: string) => void;
  altura: string;
  setAltura: (v: string) => void;
  peso: string;
  setPeso: (v: string) => void;
  catalogo: CategoriaConCondiciones[];
  seleccion: Record<number, string>;
  onToggle: (id: number) => void;
  onDetalle: (id: number, detalle: string) => void;
  error: string | null;
  guardando: boolean;
  onGuardar: () => void;
  onCancelar: () => void;
}) {
  return (
    <View style={styles.bloque}>
      <Selector
        etiqueta="Género"
        opciones={GENEROS}
        valor={props.genero}
        onChange={props.setGenero}
      />
      <Selector
        etiqueta="Tipo de sangre"
        opciones={TIPOS_SANGRE}
        valor={props.tipoSangre}
        onChange={props.setTipoSangre}
      />
      <Campo
        etiqueta="Altura (cm)"
        value={props.altura}
        onChangeText={props.setAltura}
        keyboardType="numeric"
        placeholder="175"
      />
      <Campo
        etiqueta="Peso (kg)"
        value={props.peso}
        onChangeText={props.setPeso}
        keyboardType="numeric"
        placeholder="70"
      />

      <CondicionSelector
        catalogo={props.catalogo}
        seleccion={props.seleccion}
        onToggle={props.onToggle}
        onDetalle={props.onDetalle}
      />

      {props.error ? <Text style={styles.error}>{props.error}</Text> : null}

      <Boton
        titulo="Guardar"
        onPress={props.onGuardar}
        cargando={props.guardando}
      />
      <Boton
        titulo="Cancelar"
        variante="secundario"
        onPress={props.onCancelar}
      />
    </View>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={styles.datoFila}>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
      <Text style={styles.datoValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.fondo,
  },
  cabecera: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: espaciado.xl,
    paddingBottom: espaciado.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
  },
  cabeceraAcciones: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.lg,
  },
  titulo: {
    color: colors.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: "800",
  },
  contenido: {
    padding: espaciado.xl,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  bloque: {
    gap: espaciado.lg,
  },
  estado: {
    paddingVertical: espaciado.xxl,
    alignItems: "center",
  },
  tarjeta: {
    backgroundColor: colors.tarjeta,
    borderRadius: radio.lg,
    padding: espaciado.lg,
    gap: espaciado.md,
  },
  datoFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datoEtiqueta: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
  },
  datoValor: {
    color: colors.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: "700",
  },
  subtitulo: {
    color: colors.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: "700",
  },
  condicionTarjeta: {
    backgroundColor: colors.tarjeta,
    borderRadius: radio.md,
    padding: espaciado.md,
    gap: espaciado.xs,
  },
  condicionNombre: {
    color: colors.texto,
    fontSize: tipografia.cuerpo,
    fontWeight: "600",
  },
  condicionDetalle: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    fontStyle: "italic",
  },
  vacio: {
    alignItems: "center",
    gap: espaciado.md,
    paddingVertical: espaciado.xxl,
  },
  vacioTitulo: {
    color: colors.texto,
    fontSize: tipografia.subtitulo,
    fontWeight: "700",
    textAlign: "center",
  },
  ayuda: {
    color: colors.textoTenue,
    fontSize: tipografia.etiqueta,
    textAlign: "center",
    lineHeight: 20,
  },
  error: {
    color: colors.error,
    fontSize: tipografia.etiqueta,
  },
});
