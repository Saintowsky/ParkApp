import React from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function Layout() {
  const segments: string[] = useSegments();

  const router = useRouter();

  const isAuthScreen = segments.includes("login") || segments.includes("register");

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
      {!isAuthScreen && (
        <View style={styles.navbar}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/profile")}
          >
            <MaterialIcons name="person" size={24} color="white" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/map")}
          >
            <MaterialIcons name="map" size={24} color="white" />
            <Text style={styles.navText}>Map</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#1e90ff",
    paddingVertical: 10,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
});
