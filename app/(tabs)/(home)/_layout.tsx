import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="provider-profile" options={{ headerShown: false }} />
      <Stack.Screen name="service-detail" options={{ headerShown: false }} />
    </Stack>
  );
}
