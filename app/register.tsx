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
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";

import backgroundImage from "./72b20aec-adab-477e-ba12-3ba60b42dee5.webp";
import app from "./firebaseConfig";

const auth = getAuth(app);

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }
  
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Registration Successful", "You can now log in!");
      router.push("/")
    } catch (error: any) {
      const errorMessage = error.message || "Something went wrong. Please try again.";
      Alert.alert("Registration Failed", errorMessage);
    }
  };
  

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Create an Account</Text>
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
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <Button title="Register" onPress={handleRegister} />
        <Text style={styles.loginText}>
          Already have an account?{" "}
          <Text
            style={styles.loginLink}
            onPress={() => router.push("/")}
          >
            Log in here
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
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
  loginText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#fff",
  },
  loginLink: {
    color: "#1e90ff",
    fontWeight: "bold",
  },
});
