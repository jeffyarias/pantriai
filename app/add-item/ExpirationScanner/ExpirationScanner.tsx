// app/add-item/ExpirationScanner/ExpirationScanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MlkitOcr from 'react-native-mlkit-ocr';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { extractDates } from '../../utils/dateUtils';

type Props = {
  /** Called when one or more normalized dates (YYYY-MM-DD) are extracted */
  onDetected?: (dates: string[]) => void;
  /** Optional: show a “Scan” button label override */
  buttonLabel?: string;
};

export default function ExpirationScanner({
  onDetected,
  buttonLabel = 'Scan expiration',
}: Props) {
  const device = useCameraDevice('back');
  const camRef = useRef<Camera>(null);

  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dates, setDates] = useState<string[]>([]);

  // Ask for camera permission on mount
  useEffect(() => {
    (async () => {
      const status = await Camera.getCameraPermissionStatus();
      if (status !== 'granted') {
        const res = await Camera.requestCameraPermission();
        setReady(res === 'granted' && !!device);
      } else {
        setReady(!!device);
      }
    })();
  }, [device]);

  const runOcr = async () => {
    if (!camRef.current || busy) return;

    try {
      setBusy(true);

      // Take a high-quality still photo
      const photo = await camRef.current.takePhoto({
        flash: 'off',
      });

      // Get usable file path / URI
      const rawPath: string | undefined =
        (photo as any).path ||
        (photo as any).uri ||
        (photo as any).filePath ||
        (photo as any).imagePath;

      if (!rawPath) {
        Alert.alert('Photo error', 'Could not read image path.');
        return;
      }

      const uri = rawPath.startsWith('file://') ? rawPath : `file://${rawPath}`;

      // Run ML Kit OCR
      const ocrBlocks = await MlkitOcr.detectFromUri(uri);

      // Flatten text into one big string
      const pieces: string[] = [];
      (ocrBlocks || []).forEach((b: any) => {
        if (b?.text) pieces.push(b.text);
        (b?.lines || []).forEach(
          (ln: any) => ln?.text && pieces.push(ln.text),
        );
      });

      const combined = pieces.join(' ');

      // ✅ Single universal extractor
      const normalized = extractDates(combined);

      if (normalized.length === 0) {
        Alert.alert(
          'No date found',
          combined.slice(0, 300) || '(no OCR text)',
        );
      }

      setDates(normalized);
      onDetected?.(normalized);
    } catch (e: any) {
      console.warn('OCR error:', e);
      Alert.alert('OCR failed', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  if (!device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.centerText}>Finding camera…</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>Please grant camera permission.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={camRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        photo
      />

      <View style={styles.overlay}>
        {dates.length > 0 ? (
          <Text style={styles.result}>📅 {dates.join(', ')}</Text>
        ) : (
          <Text style={styles.hint}>Point at the printed expiration date</Text>
        )}

        <TouchableOpacity
          style={[styles.snapBtn, busy && { opacity: 0.6 }]}
          onPress={runOcr}
          disabled={busy}
        >
          <Text style={styles.snapText}>
            {busy ? 'Processing…' : buttonLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
    gap: 12,
  },
  hint: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  result: {
    color: 'lime',
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  snapBtn: {
    backgroundColor: '#1e90ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  snapText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  centerText: { color: '#fff', marginTop: 8, fontSize: 16 },
});
