import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

// TODO: import your real barcode scanner component here
// For now, we’ll assume you have <BarcodeScanner onDetected={handleBarcodeDetected} />
// You can replace this stub with your VisionCamera-based scanner.

function FakeBarcodeScanner({ onDetected }: { onDetected: (code: string) => void }) {
  // TEMP: simulate a barcode after 2 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDetected('8901234567890'); // fake barcode value
    }, 2000);
    return () => clearTimeout(timer);
  }, [onDetected]);

  return (
    <View style={styles.fakeScanner}>
      <Text style={styles.fakeScannerText}>[Barcode scanner goes here]</Text>
      <Text style={styles.fakeScannerTextSmall}>Point at the barcode...</Text>
    </View>
  );
}

export default function AddItemStartScreen() {
  const router = useRouter();
  const [barcode, setBarcode] = useState<string | null>(null);
  const [handled, setHandled] = useState(false); // avoid double handling

  const handleBarcodeDetected = (code: string) => {
    if (handled) return;
    setHandled(true);
    setBarcode(code);

    Alert.alert(
      'Barcode detected',
      `We found: ${code}\n\nDo you want to scan the expiration date now?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setHandled(false) },
        {
          text: 'Scan expiration date',
          onPress: () => {
            // Navigate to your ExpirationScreen and pass the barcode
            router.push({
              pathname: '/screens/AddItemFlow/ExpirationScreen',
              params: { barcode: code },
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan product barcode</Text>
      <Text style={styles.subtitle}>
        Point your camera at the barcode to identify the product.
      </Text>

      {/* Replace FakeBarcodeScanner with your real VisionCamera-based scanner */}
      <View style={{ flex: 1, marginTop: 16 }}>
        <FakeBarcodeScanner onDetected={handleBarcodeDetected} />
      </View>

      {barcode && (
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Last barcode:</Text>
          <Text style={styles.infoValue}>{barcode}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  fakeScanner: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fakeScannerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fakeScannerTextSmall: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  infoBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
