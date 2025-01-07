// Home.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import Upload from "@/components/Upload";
import Camera from "@/components/Camera";

const Home = () => {
  const [images, setImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  const handleNewImage = (imageUri: string) => {
    setImages((prev) => [imageUri, ...prev]);
  };

  const renderImageItem = ({ item }: { item: string }) => (
    <View style={styles.imageItem}>
      <Image source={{ uri: item }} style={styles.image} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {showCamera ? (
        <Camera
          onCapture={handleNewImage}
          onClose={() => setShowCamera(false)}
        />
      ) : (
        <>
          <Text style={styles.mainTxt}>Gallery</Text>
          <View style={styles.uploadSection}>
            <Text style={styles.uploadTitle}>Upload or Capture Images</Text>
            <View style={styles.buttonContainer}>
              <Upload onUpload={handleNewImage} />
              <Camera.Button onPress={() => setShowCamera(true)} />
            </View>
          </View>
          {images.length > 0 ? (
            <FlatList
              data={images}
              renderItem={renderImageItem}
              keyExtractor={(_, index) => index.toString()}
              numColumns={3}
              contentContainerStyle={styles.imageGallery}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No images yet. Start by uploading or capturing one!
              </Text>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  mainTxt: {
    fontSize: 32,
    marginVertical: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1a1a1a",
  },
  uploadSection: {
    backgroundColor: "#4a90e2",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  imageGallery: {
    padding: 8,
  },
  imageItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default Home;
