import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, MapPressEvent } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"]; 

type LocationType = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} | null;

type Pin = {
  id: string;
  latitude: number;
  longitude: number;
  color: string;
  description: string;
  creator: string; 
  creatorEmail: string; 
  timestamp: string;
};

export default function MapScreen() {
  const [location, setLocation] = useState<LocationType>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tempPin, setTempPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("red");
  const [destination, setDestination] = useState<Pin | null>(null);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isPinListModalVisible, setIsPinListModalVisible] = useState(false);
  const GOOGLE_MAPS_API_KEY = "";

  const currentUserEmail = auth.currentUser?.email;
  const currentUserName = auth.currentUser?.displayName || "Anonymous";

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location permission is required to use this feature."
          );
          setLoading(false);
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        await loadPins();
        setLoading(false);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to fetch location.");
        setLoading(false);
      }
    })();
  }, []);

  const loadPins = async () => {
    try {
      const snapshot = await getDocs(collection(db, "points"));
      const loadedPins = snapshot.docs.map((doc) => ({
        id: doc.id,
        latitude: doc.data().latitude,
        longitude: doc.data().longitude,
        color: doc.data().color,
        description: doc.data().description,
        creator: doc.data().creator,
        creatorEmail: doc.data().creatorEmail,
        timestamp: doc.data().timestamp,
      }));
      setPins(loadedPins);
    } catch (error) {
      console.error("Error loading pins:", error);
    }
  };

  const savePinToFirebase = async () => {
    if (!tempPin) return;

    try {
      const docRef = await addDoc(collection(db, "points"), {
        latitude: tempPin.latitude,
        longitude: tempPin.longitude,
        color,
        description,
        creator: currentUserName,
        creatorEmail: currentUserEmail,
        timestamp: new Date().toISOString(),
      });

      setPins((prevPins) => [
        ...prevPins,
        {
          id: docRef.id,
          latitude: tempPin.latitude,
          longitude: tempPin.longitude,
          color,
          description,
          creator: currentUserName,
          creatorEmail: currentUserEmail!,
          timestamp: new Date().toISOString(),
        },
      ]);
      Alert.alert("Success", "Pin saved to Firebase!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save pin to Firebase.");
    } finally {
      setShowModal(false);
      setTempPin(null);
      setDescription("");
      setColor("red");
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setTempPin({ latitude, longitude });
    setShowModal(true);
  };

  const handleMarkerPress = (pin: Pin) => {
    setSelectedPin(pin);
  };

  const handleNavigateToPin = (pin: Pin) => {
    setDestination(pin);
    setSelectedPin(null);
  };

  const handleDeletePin = async () => {
    if (!selectedPin) return;

    if (selectedPin.creatorEmail !== currentUserEmail) {
      Alert.alert("Permission Denied", "You can only delete your own pins.");
      return;
    }

    try {
      await deleteDoc(doc(db, "points", selectedPin.id));
      setPins((prevPins) => prevPins.filter((pin) => pin.id !== selectedPin.id));
      Alert.alert("Success", "Pin deleted successfully!");
      setSelectedPin(null);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to delete the pin.");
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  const createPinAtUserLocation = async () => {
    if (!location) {
      Alert.alert("Error", "User location not found.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "points"), {
        latitude: location.latitude,
        longitude: location.longitude,
        color: "blue", 
        description: "Pinned at user's location",
        creator: currentUserName,
        creatorEmail: currentUserEmail,
        timestamp: new Date().toISOString(),
      });

      setPins((prevPins) => [
        ...prevPins,
        {
          id: docRef.id,
          latitude: location.latitude,
          longitude: location.longitude,
          color: "blue",
          description: "Pinned at user's location",
          creator: currentUserName,
          creatorEmail: currentUserEmail!,
          timestamp: new Date().toISOString(),
        },
      ]);

      Alert.alert("Success", "Pin created at your location!");
    } catch (error) {
      console.error("Error creating pin at location:", error);
      Alert.alert("Error", "Failed to create pin.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={location || undefined}
        onPress={handleMapPress}
        showsUserLocation
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
            pinColor={pin.color}
            title={pin.description}
            description={`Created by: ${pin.creator}`}
            onPress={() => handleMarkerPress(pin)}
          />
        ))}

        {destination && (
          <MapViewDirections
            origin={{
              latitude: location!.latitude,
              longitude: location!.longitude,
            }}
            destination={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={5}
            strokeColor="#1e90ff"
          />
        )}
      </MapView>
      <TouchableOpacity
        style={styles.showPinsButton}
        onPress={() => setIsPinListModalVisible(true)}
      >
        <Text style={styles.showPinsButtonText}>View Nearby Pins</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.createPinButton}
        onPress={createPinAtUserLocation}
      >
        <Text style={styles.createPinButtonText}>Pin My Location</Text>
      </TouchableOpacity>
      <Modal visible={isPinListModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nearby Pins</Text>
            <FlatList
              data={pins.map((pin) => ({
                ...pin,
                distance: calculateDistance(
                  location!.latitude,
                  location!.longitude,
                  pin.latitude,
                  pin.longitude
                ),
              }))}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.pinItem}>
                  <Text style={styles.pinDescription}>{item.description}</Text>
                  <Text style={styles.pinDistance}>
                    {item.distance.toFixed(2)} km away
                  </Text>
                </View>
              )}
            />
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setIsPinListModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create a New Pin</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter description"
              value={description}
              onChangeText={setDescription}
            />
            <Text style={styles.label}>Pick a Color:</Text>
            <View style={styles.colorPicker}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: c,
                      borderWidth: c === color ? 3 : 1,
                      borderColor: c === color ? "#000" : "#ccc",
                    },
                  ]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={savePinToFirebase}
            >
              <Text style={styles.buttonText}>Save Pin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={!!selectedPin} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPin && (
              <>
                <Text style={styles.modalTitle}>Pin Details</Text>
                <Text style={styles.infoText}>Description: {selectedPin.description}</Text>
                <Text style={styles.infoText}>Creator: {selectedPin.creator}</Text>
                <Text style={styles.infoText}>
                  Created on: {new Date(selectedPin.timestamp).toLocaleString()}
                </Text>
                <TouchableOpacity
                  style={[styles.button, styles.navigateButton]}
                  onPress={() => handleNavigateToPin(selectedPin)}
                >
                  <Text style={styles.buttonText}>Navigate to Pin</Text>
                </TouchableOpacity>
                {selectedPin.creatorEmail === currentUserEmail && (
                  <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={handleDeletePin}
                  >
                    <Text style={styles.buttonText}>Delete Pin</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={() => setSelectedPin(null)}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  colorPicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "#F44336",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  closeButton: {
    backgroundColor: "#1E90FF",
  },
  navigateButton: {
    backgroundColor: "#1E90FF",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  showPinsButton: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 1,
  },
  showPinsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  pinItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  pinDescription: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  pinDistance: {
    fontSize: 14,
    color: "#666",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  createPinButton: {
    width:100,
    height:100,
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 100,
    alignItems: "center",
    zIndex: 1,
  },
  createPinButtonText: {
    top:10,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign:'center',
  },
});
