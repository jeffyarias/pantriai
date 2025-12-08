import React, { useState, useRef } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProductScanner from '../../components/ProductScanner/ProductScanner';
import ExpirationChoiceModal from '../../components/AddItem/ExpirationChoiceModal';

export default function ProductScanScreen() {
  const nav = useNavigation();
  const [barcode, setBarcode] = useState<string | null>(null);
  const [showChoice, setShowChoice] = useState(false);
  const handled = useRef(false);

  const handleDetected = async (code: string) => {
    if (handled.current) return;
    handled.current = true;
    setBarcode(code);

    // (Optional) Look up product title here; stub for now:
    const productTitle = `Barcode ${code}`;
    // Show modal after product scan:
    setShowChoice(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <ProductScanner onDetected={handleDetected} />
      <ExpirationChoiceModal
        visible={showChoice}
        productTitle={barcode || undefined}
        onScanDate={() => {
          setShowChoice(false);
          // Pass barcode to the expiration scan screen:
          // @ts-ignore
          nav.navigate('Expiration', { barcode });
        }}
        onEnterManual={() => {
          setShowChoice(false);
          // @ts-ignore
          nav.navigate('ManualDate', { barcode });
        }}
        onSkip={() => {
          setShowChoice(false);
          // maybe go back or continue flow without date
          // @ts-ignore
          nav.goBack();
        }}
      />
    </View>
  );
}
