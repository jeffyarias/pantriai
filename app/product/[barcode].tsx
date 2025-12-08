// app/product/[barcode].tsx
import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProductDetails() {
  const { barcode, name, brand, imageUrl } = useLocalSearchParams<{ barcode: string; name?: string; brand?: string; imageUrl?: string }>();

  return (
    <ScrollView contentContainerStyle={s.container}>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={s.image} /> : null}
      <Text style={s.title}>{name || 'Unknown product'}</Text>
      <Text style={s.subtitle}>{brand || 'Unknown brand'}</Text>
      <View style={s.card}>
        <Text style={s.label}>Barcode</Text>
        <Text style={s.value}>{barcode}</Text>
      </View>
      {/* Add more fields later (quantity, categories, nutriments…) */}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:{padding:16,gap:12},
  image:{width:'100%',height:220,borderRadius:12,backgroundColor:'#222'},
  title:{fontSize:20,fontWeight:'700'},
  subtitle:{opacity:0.7},
  card:{backgroundColor:'#111',padding:12,borderRadius:12},
  label:{color:'#aaa',marginBottom:4},
  value:{color:'#fff',fontSize:16}
});
