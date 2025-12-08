// app/(tabs)/scan.tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { fetchProductByBarcode } from '../../src/lib/productApi'; // <- keep as-is or use alias '~/lib/productApi'
import { useRouter } from 'expo-router';

export default function ScanScreen() {
  const device = useCameraDevice('back');
  const router = useRouter();
  const [paused, setPaused] = useState(false);
  const [torch, setTorch] = useState<'on'|'off'>('off');
  const [loading, setLoading] = useState(false);
  const last = useRef(0);

  const codeTypes = useMemo(
    () => ['qr','ean-13','ean-8','code-128','upc-a','upc-e'] as const,
    []
  );

  const onScanned = useCallback(async (codes: { value?: string; type: string }[]) => {
    const now = Date.now();
    if (now - last.current < 1200) return;
    last.current = now;

    const value = codes[0]?.value;
    if (!value) return;

    setPaused(true);
    setLoading(true);
    try {
      const product = await fetchProductByBarcode(value);
      setLoading(false);

      if (!product) {
        Alert.alert('Not found', `No product for barcode: ${value}`, [
          { text: 'OK', onPress: () => setPaused(false) },
        ]);
        return;
      }

      // 👇 Go directly to Add Item (inventory entry) after scan
      router.push({
        pathname: '/product/[barcode]/add',
        params: {
          barcode: product.barcode,
          name: product.name ?? '',
          brand: product.brand ?? ''
          // imageUrl optional; omit for now to keep baseline simple
        }
      });
    } catch (e:any) {
      setLoading(false);
      Alert.alert('Error', String(e?.message ?? e), [{ text: 'OK', onPress: () => setPaused(false) }]);
    }
  }, [router]);

  const codeScanner = useCodeScanner({ codeTypes, onCodeScanned: onScanned });

  if (!device) return <View style={s.center}><Text>Loading camera…</Text></View>;

  return (
    <View style={s.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!paused}
        codeScanner={codeScanner}
        fps={30}
        enableZoomGesture
        torch={torch}
      />
      <View style={s.overlayTop}><Text style={s.text}>Point at a barcode / QR</Text></View>
      <View style={s.overlayBottom}>
        <Pressable onPress={() => setTorch(t => (t === 'on' ? 'off' : 'on'))} style={s.button}>
          <Text style={s.buttonText}>{torch === 'on' ? 'Torch: ON' : 'Torch: OFF'}</Text>
        </Pressable>
        {loading && <ActivityIndicator />}
        {paused && !loading && (
          <Pressable onPress={() => setPaused(false)} style={[s.button, s.buttonSecondary]}>
            <Text style={s.buttonText}>Resume</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#000'},
  center:{flex:1,alignItems:'center',justifyContent:'center'},
  overlayTop:{position:'absolute',top:60,alignSelf:'center',backgroundColor:'rgba(0,0,0,0.5)',paddingHorizontal:14,paddingVertical:8,borderRadius:10},
  overlayBottom:{position:'absolute',bottom:40,alignSelf:'center',flexDirection:'row',gap:12,alignItems:'center'},
  text:{color:'#fff',fontSize:16},
  button:{backgroundColor:'rgba(255,255,255,0.14)',paddingHorizontal:16,paddingVertical:10,borderRadius:10,borderWidth:1,borderColor:'rgba(255,255,255,0.25)'},
  buttonSecondary:{backgroundColor:'rgba(0,0,0,0.45)'},
  buttonText:{color:'#fff',fontWeight:'600'}
});
