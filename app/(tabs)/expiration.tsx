// app/(tabs)/expiration.tsx  (or wherever your test tab lives)
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import ExpirationScanner from '../add-item/ExpirationScanner/ExpirationScanner';

export default function ExpirationTestScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Expiration Scanner</Text>

      <View style={{ flex: 1 }}>
        <ExpirationScanner
          buttonLabel={selected ? 'Rescan expiration' : 'Scan expiration'}
          onDetected={(dates) => {
            if (dates && dates.length > 0) {
              setSelected(dates[0]); // first normalized date
            }
          }}
        />
      </View>

      {selected && (
        <View style={styles.footer}>
          <Text style={styles.label}>Detected expiration date:</Text>
          <Text style={styles.date}>{selected}</Text>
          <Button title="Clear" onPress={() => setSelected(null)} />
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
    color: '#fff',
    fontSize: 18,
    zIndex: 10,
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
  label: { color: '#fff', fontSize: 16, marginBottom: 4 },
  date: { color: '#0f0', fontSize: 18, fontWeight: '600' },
});
