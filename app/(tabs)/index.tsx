import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/pantri3.avif')}
            style={styles.pantriLogo}
          />
        }
      >
        {/* HEADER */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">PantriAI</ThemedText>
          <ThemedText type="subtitle">Your smart pantry assistant</ThemedText>
        </ThemedView>

        {/* QUICK ACTION */}
        <ThemedView style={styles.section}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/scan')}
          >
            <ThemedText type="defaultSemiBold" style={styles.addButtonText}>
              + Add Item
            </ThemedText>
          </TouchableOpacity>
          <ThemedText type="default">
            Scan a product barcode to quickly add it to your pantry.
          </ThemedText>
        </ThemedView>

        {/* EXPIRING SOON */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Expiring soon</ThemedText>
          <ThemedText type="default" style={styles.placeholder}>
            No items close to expiring 🎉
          </ThemedText>
        </ThemedView>

        {/* RECENTLY ADDED */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Recently added</ThemedText>
          <ThemedText type="default" style={styles.placeholder}>
            Your latest items will appear here once you start adding them.
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  pantriLogo: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
},
  titleContainer: {
    gap: 4,
    marginBottom: 24,
  },
  section: {
    gap: 8,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  placeholder: {
    color: '#888',
  },
});
