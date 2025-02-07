import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { auth } from "./firebaseConfig";
import { signOut, updateProfile, User } from "firebase/auth";
import { router } from "expo-router";

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);


  const handleLogout = () => {
    signOut(auth)
    router.push("/login"); 
  }
  const handleSaveDisplayName = async () => {
    if (!user) {
      Alert.alert("Error", "No user is currently logged in.");
      return;
    }

    try {
      if (!displayName.trim()) {
        Alert.alert("Error", "Display name cannot be empty.");
        return;
      }

      await updateProfile(user as User, { displayName });
      Alert.alert("Success", "Display name updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating display name: ", error);
      Alert.alert("Error", "Failed to update display name.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || "N/A"}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>Display Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter display name"
          />
        ) : (
          <Text style={styles.value}>
            {user?.displayName || "No display name set"}
          </Text>
        )}
      </View>

      {isEditing ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveDisplayName}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setIsEditing(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.buttonText}>Edit Display Name</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={() => handleLogout()}
        >
          <Text style={styles.buttonText}>Log out</Text>
        </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f4f8",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 30,
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
  display:'flex',
  justifyContent:'center',
  width:'100%',
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButton: {
    width:'45%',
    backgroundColor: "#4caf50",
  },
  cancelButton: {
    width:'45%',
    backgroundColor: "#f44336",
  },
  editButton: {
    backgroundColor: "#1e90ff",
    marginHorizontal: 5,
  },
  logoutButton: {
    backgroundColor: "red",
    marginHorizontal: 5,
  },
  buttonText: {
    textAlign:'center',
    width:'100%',
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
