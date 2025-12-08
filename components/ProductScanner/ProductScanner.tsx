import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useBarcodeProcessor } from './useBarcodeProcessor';

type Props = { onDetected: (barcode: string) => void };

export default function ProductScanner({ onDetected }: Props) {
  const device = useCameraDevice('back');               // ✅ use this in v4
  const frameProcessor = useBarcodeProcessor(onDetected);

  if (device == null) return <Text>Loading camera…</Text>;

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
      />
      <View style={styles.hint}><Text style={styles.hintText}>Align the barcode in the frame</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { position: 'absolute', bottom: 60, alignSelf: 'center', padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8 },
  hintText: { color: '#fff', fontSize: 16 }
});
