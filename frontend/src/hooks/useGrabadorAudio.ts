import { useCallback } from "react";
import { Alert } from "react-native";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

// 16 kHz mono: archivo liviano y exactamente lo que Whisper necesita (respuesta rápida).
const OPCIONES = {
  ...RecordingPresets.HIGH_QUALITY,
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 64000,
};

export function useGrabadorAudio() {
  const grabador = useAudioRecorder(OPCIONES);
  const estado = useAudioRecorderState(grabador);

  const iniciar = useCallback(async (): Promise<boolean> => {
    const permiso = await AudioModule.requestRecordingPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        "Micrófono",
        "Se necesita permiso del micrófono para grabar la consulta.",
      );
      return false;
    }
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await grabador.prepareToRecordAsync();
    grabador.record();
    return true;
  }, [grabador]);

  const detener = useCallback(async (): Promise<string | null> => {
    await grabador.stop();
    return grabador.uri ?? null;
  }, [grabador]);

  return {
    grabando: estado.isRecording,
    duracionMs: estado.durationMillis,
    iniciar,
    detener,
  };
}
