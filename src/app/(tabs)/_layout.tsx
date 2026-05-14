import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import MiniPlayer from '../../components/MiniPlayer';

export default function TabLayout() {
  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#6B7280',
          headerShown: true,
          tabBarStyle: {
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            height: Platform.OS === 'ios' ? 80 : 60,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Ana Sayfa',
            headerTitle: '1 Saatte 1 Kitap',
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Kütüphanem',
            headerTitle: 'Kütüphanem',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Ayarlar',
            headerTitle: 'Ayarlar',
          }}
        />
      </Tabs>
      {/* MiniPlayer sits above the tab bar and persists across all tabs */}
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
