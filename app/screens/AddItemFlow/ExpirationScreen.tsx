// app/expiration.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import ExpirationScanner from '@/app/add-item/ExpirationScanner/ExpirationScanner';

export default function ExpirationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ barcode?: string }>();
  const { barcode } = params;
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Scan expiration date {barcode ? `for ${barcode}` : ''}
      </Text>

      <View style={styles.scannerContainer}>
        <ExpirationScanner
          buttonLabel="Scan expiration date"
          onDetected={(dates) => {
            if (dates && dates.length > 0) {
              // Take the first date for now
              setSelected(dates[0]);
            }
          }}
        />
      </View>

      {selected && (
        <View style={styles.footer}>
          <Text style={styles.detected}>Detected: {selected}</Text>
          <Button
            title="Confirm & Save"
            onPress={() => {
              // TODO: save { barcode, expiration: selected } to local DB
              // For now, just go back
              router.back();
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  title: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 2,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scannerContainer: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 10,
  },
  detected: {
    color: '#fff',
    marginBottom: 8,
    fontSize: 16,
  },
});
