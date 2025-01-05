import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import { fetchUserAttributes } from "@aws-amplify/auth";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import Modal from "react-native-modal";

const Profile = () => {
  const { signOut } = useAuthenticator();
  const [userInfo, setUserInfo]: any = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const user = await fetchUserAttributes();
      setUserInfo(user);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching user info:", error);
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    setIsModalVisible(false); // Close the modal after signing out
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible); // Toggle modal visibility
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Profile Info Section */}
        <View style={styles.infoContainer}>
          <ShimmerPlaceHolder
            shimmerStyle={{
              marginBottom: 5,
            }}
            visible={!isLoading} // Run shimmer effect while loading
          >
            <Text style={styles.name}>{userInfo?.email?.split("@")[0]}</Text>
          </ShimmerPlaceHolder>
          <ShimmerPlaceHolder
            visible={!isLoading} // Run shimmer effect while loading
          >
            <Text style={styles.email}>{userInfo?.email}</Text>
          </ShimmerPlaceHolder>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={toggleModal}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        onBackButtonPress={toggleModal}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Are you sure you want to sign out?
          </Text>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalButton} onPress={toggleModal}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSignOut}
            >
              <Text style={styles.modalButtonText}>Yes, Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
    textAlign: "center", // Center the email text
    flexShrink: 1,
    width: "100%",
  },
  signOutButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  signOutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Modal Styles
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 5,
    width: "40%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Profile;
