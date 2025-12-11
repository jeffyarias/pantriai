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
import { extractDates } from '../../../utils/dateUtils';

// --- extra helper JUST for things like "BEST BY DCT 14 2028" -----

const MONTHS: Record<string, string> = {
  JAN: '01',
  FEB: '02',
  MAR: '03',
  APR: '04',
  MAY: '05',
  JUN: '06',
  JUL: '07',
  AUG: '08',
  SEP: '09',
  SEPT: '09',
  OCT: '10',
  NOV: '11',
  DEC: '12',
};

function fuzzyMonth(token: string): string | null {
  const clean = token.toUpperCase().replace(/[^A-Z]/g, '');
  if (MONTHS[clean]) return MONTHS[clean];

  if (clean.length !== 3) return null;

  let bestKey: string | null = null;
  let bestDiff = 10;

  for (const key of Object.keys(MONTHS)) {
    if (key.length !== 3) continue;
    let diff = 0;
    for (let i = 0; i < 3; i++) {
      if (clean[i] !== key[i]) diff++;
    }
    if (diff < bestDiff) {
      bestDiff = diff;
      bestKey = key;
    }
  }

  if (bestKey && bestDiff <= 1) {
    // allow one-letter typo, e.g. DCT -> OCT
    return MONTHS[bestKey];
  }
  return null;
}

function bestByFallbackDate(text: string): string[] {
  const upper = text.toUpperCase();

  // Example it will match: "BEST BY DCT 14 2028"
  const m = upper.match(/BEST\s+BY\s+([A-Z]{2,4})\s+(\d{1,2})\s+(\d{4})/);
  if (!m) return [];

  const [, monthToken, dayToken, yearToken] = m;
  const month = fuzzyMonth(monthToken);
  const day = dayToken.replace(/\D/g, '');
  const year = yearToken.replace(/\D/g, '');

  if (!month || !day || day.length === 0 || year.length !== 4) return [];

  const iso = `${year}-${month}-${day.padStart(2, '0')}`;
  return [iso];
}

// -----------------------------------------------------------------

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
      let rawPath: string | undefined =
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

      // Flatten text
      const pieces: string[] = [];
      (ocrBlocks || []).forEach((b: any) => {
        if (b?.text) pieces.push(b.text);
        (b?.lines || []).forEach(
          (ln: any) => ln?.text && pieces.push(ln.text),
        );
      });

      const combined = pieces.join(' ');

      // 1) original numeric matching (your working logic)
      const rawMatches =
        combined.match(
          /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|20\d{2}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/g,
        ) || [];

      let normalized = extractDates(rawMatches);

      // 2) extra fallback for "BEST BY DCT 14 2028" style
      if (normalized.length === 0) {
        const fallback = bestByFallbackDate(combined);
        if (fallback.length > 0) {
          normalized = fallback;
        }
      }

      if (normalized.length === 0) {
        // keep debug: shows what OCR saw when no date parsed
        Alert.alert('No date found', combined.slice(0, 300) || '(no OCR text)');
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
