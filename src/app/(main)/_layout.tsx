import { Redirect, Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { LoadingView } from '@/components/loading-view';
import { ThemedText } from '@/components/themed-text';
import { ONBOARDING_ROUTE, useOnboardingGate } from '@/lib/onboarding-gate';

function TabIcon({ glyph, color }: { glyph: string; color: ColorValue }) {
  return <ThemedText style={{ color, fontSize: 20 }}>{glyph}</ThemedText>;
}

/** Onboarding sonrası 3 ana ekran: Bugün, Hafta, Ayarlar. */
export default function MainLayout() {
  // S10 N-4: derin bağlantı (`haftik://today`, `haftik://week`) onboarding'i atlayamaz.
  const gate = useOnboardingGate();
  if (gate === 'loading') {
    return <LoadingView />;
  }
  if (gate === 'needed') {
    return <Redirect href={ONBOARDING_ROUTE} />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="today"
        options={{
          title: 'Bugün',
          tabBarIcon: ({ color }) => <TabIcon glyph="📝" color={color} />,
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: 'Hafta',
          tabBarIcon: ({ color }) => <TabIcon glyph="📊" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color }) => <TabIcon glyph="⚙️" color={color} />,
        }}
      />
    </Tabs>
  );
}
