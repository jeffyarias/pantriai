import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import ExpirationScanner from '../../../components/AddItem/ExpirationScanner/ExpirationScanner';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ExpirationScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const { barcode } = route.params ?? {};
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ position: 'absolute', top: 50, left: 20, zIndex: 2 }}>
        Scan expiration date {barcode ? `for ${barcode}` : ''}
      </Text>
      <ExpirationScanner /* inside, call setSelected on detection */ />
      {selected && (
        <View style={{ position: 'absolute', bottom: 40, left: 20, right: 20 }}>
          <Text>Detected: {selected}</Text>
          <Button title="Confirm & Save" onPress={() => {
            // save { barcode, expiration: selected } to local DB
            // then nav.goBack() or to success screen
            nav.goBack();
          }} />
        </View>
      )}
    </View>
  );
}
