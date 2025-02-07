import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ImageBackground,
} from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";

import backgroundImage from "./72b20aec-adab-477e-ba12-3ba60b42dee5.webp";
import app from "./firebaseConfig";

const auth = getAuth(app);

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/map"); 
    } catch (error: any) {
          const errorMessage = error.message || "Something went wrong. Please try again.";
          Alert.alert("Login Failed", errorMessage);
        }
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome! Please Log In</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <Button title="Login" onPress={handleLogin} />
        <Text style={styles.registerText}>
          Don't have an account?{" "}
          <Text
            style={styles.registerLink}
            onPress={() => router.push("/register")}
          >
            Register here
          </Text>
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#fff",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  registerText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#fff",
  },
  registerLink: {
    color: "#1e90ff",
    fontWeight: "bold",
  },
});
