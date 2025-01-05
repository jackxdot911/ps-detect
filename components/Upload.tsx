import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";

interface UploadProps {
  onUpload: (uri: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onUpload }) => {
  const uploadImage = async () => {
    try {
      // Request permissions first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert("You need to allow access to your photos to upload images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: false,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        onUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={uploadImage}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>Upload</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#4a90e2",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Upload;