import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function AuthPopupScreen() {
  const { provider } = useLocalSearchParams<{ provider: string }>();

  useEffect(() => {
    if (Platform.OS !== "web") return;

    if (!provider || !["google", "github", "apple"].includes(provider)) {
      window.opener?.postMessage({ type: "oauth-error", error: "Invalid provider" }, "*");
      return;
    }

    // UI mock only: social auth is a placeholder in build phase.
    window.opener?.postMessage(
      { type: "oauth-error", error: "Social authentication is currently mocked in UI mode." },
      "*"
    );
    setTimeout(() => window.close(), 1200);
  }, [provider]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Social authentication is in mock mode...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: "#333",
  },
});
