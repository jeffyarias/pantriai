import React, { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Keyboard } from 'react-native';

const STORAGE_KEY = 'pantriai_items';

type StoredItem = {
  barcode: string;
  name?: string;
  brand?: string;
  qty: number;
  expiresAt?: string;  // ISO (optional)
  createdAt: string;
};

export default function AddItem() {
  const router = useRouter();
  const { barcode, name, brand } = useLocalSearchParams<{ barcode: string; name?: string; brand?: string }>();

  const [qty, setQty] = useState('1');
 // Default one month from today
const [date, setDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const dateLabel = useMemo(() => (date ? date.toDateString() : 'None (optional)'), [date]);

  const save = async () => {
    const nQty = Math.max(1, parseInt(qty || '1', 10));
    const payload: StoredItem = {
      barcode: String(barcode),
      name: name ? String(name) : undefined,
      brand: brand ? String(brand) : undefined,
      qty: nQty,
      expiresAt: date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list: StoredItem[] = raw ? JSON.parse(raw) : [];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...list, payload]));

    Alert.alert('Saved', `Added ${payload.name || 'item'} x${nQty}`, [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Add to Inventory</Text>
      <Text style={s.small}>Barcode: {barcode}</Text>
      {name ? <Text style={s.sub}>{name}{brand ? ` — ${brand}` : ''}</Text> : null}

      <View style={s.row}>
        <Text style={s.label}>Quantity</Text>
    <TextInput
  keyboardType="number-pad"
  value={qty}
  onChangeText={setQty}
  onSubmitEditing={() => Keyboard.dismiss()}
  returnKeyType="done"
  submitBehavior="blurAndSubmit"  // or "submit" if you want to stay focused
  style={s.input}
/>
      </View>

      <View style={{ height: 12 }} />

      <Text style={s.label}>Expiration date (optional)</Text>
      {Platform.OS === 'android' && (
        <Pressable style={s.button} onPress={() => setShowPicker(true)}>
          <Text style={s.buttonText}>Pick: {dateLabel}</Text>
        </Pressable>
      )}
      {showPicker && (
        <DateTimePicker
          value={date ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_, d) => { if (d) setDate(d); if (Platform.OS === 'android') setShowPicker(false); }}
        />
      )}

      <Pressable style={[s.button, s.primary]} onPress={save}>
        <Text style={s.buttonText}>Save</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container:{ flex:1, padding:16, gap:12 },
  title:{ fontSize:20, fontWeight:'700' },
  sub:{ opacity:0.8 },
  small:{ color:'#aaa' },
  row:{ flexDirection:'row', alignItems:'center', gap:12 },
  label:{ fontWeight:'600' },
  input:{ backgroundColor:'#111', color:'#fff', paddingHorizontal:12, paddingVertical:8, borderRadius:8, minWidth:80 },
  button:{ backgroundColor:'#111', padding:12, borderRadius:10, alignItems:'center' },
  primary:{ backgroundColor:'#1e90ff' },
  buttonText:{ color:'#fff', fontWeight:'600' },
});
