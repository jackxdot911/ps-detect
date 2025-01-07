import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from "@expo/vector-icons";

interface CameraProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
}

interface CameraButtonProps {
  onPress: () => void;
}

const Camera: React.FC<CameraProps> & { Button: React.FC<CameraButtonProps> } = ({
  onCapture,
  onClose,
}) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();

  // Handle no permissions state
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  // Handle denied permissions state
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.permissionButton, styles.closeButton]} 
          onPress={onClose}
        >
          <Text style={styles.permissionButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraType = () => {
    setFacing(current => 
      current === 'back' ? 'front' : 'back'
    );
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        exif: false,
      });
      
      if (photo?.uri) {
        onCapture(photo.uri);
        onClose();
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to take picture. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onMountError={(error) => {
          console.error("Camera mount error:", error);
          Alert.alert("Error", "Failed to start camera. Please try again.");
          onClose();
        }}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <MaterialIcons name="close" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <MaterialIcons name="flip-camera-ios" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

Camera.Button = ({ onPress }) => (
  <TouchableOpacity style={styles.uploadButton} onPress={onPress}>
    <Text style={styles.uploadButtonText}>Camera</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 32,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  button: {
    padding: 12,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  uploadButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#4a90e2",
    fontSize: 16,
    fontWeight: "600",
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: "#4a90e2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: "#666",
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Camera;