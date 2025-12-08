import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  visible: boolean;
  productTitle?: string;
  onScanDate: () => void;
  onEnterManual: () => void;
  onSkip: () => void;
};

export default function ExpirationChoiceModal({ visible, productTitle, onScanDate, onEnterManual, onSkip }: Props) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{productTitle || 'Product detected'}</Text>
          <Text style={styles.subtitle}>Add an expiration date:</Text>
          <TouchableOpacity style={styles.btn} onPress={onScanDate}><Text style={styles.btnText}>📷 Scan expiration date</Text></TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={onEnterManual}><Text style={styles.btnText}>⌨️ Enter manually</Text></TouchableOpacity>
          <TouchableOpacity onPress={onSkip}><Text style={styles.link}>Skip for now</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 12 },
  btn: { paddingVertical: 12 },
  btnText: { fontSize: 16 },
  link: { textAlign: 'center', color: '#007aff', marginTop: 8 }
});
