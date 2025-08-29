import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import Colors from '../../styles/colors';
import {
  scale,
  fontScale,
  verticalScale,
  moderateScale,
} from '../../styles/stylesconfig';
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';

const AccountSetting = ({ onLogout }) => {
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await AsyncStorage.multiRemove([
        'user_token',
        'userId',
        'mobile_number'
      ]);
      
      showMessage({
        message: "Logged Out",
        description: "You have been successfully logged out.",
        type: "success",
        icon: "success",
        duration: 2500, // Slightly reduced duration for flash message
      });
      
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      showMessage({
        message: "Logout Error",
        description: "Failed to logout properly. Please try again.",
        type: "danger",
        icon: "danger",
        duration: 3500,
      });
    }
  };

  const cancelLogout = () => {
    setLogoutModalVisible(false);
  };

  return (
    <AdaptiveSafeAreaView>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account Settings</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={scale(18)} color={Colors.danger} /> {/* Icon size adjusted */}
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLogoutModalVisible}
        onRequestClose={cancelLogout}
      >
        <TouchableWithoutFeedback onPress={cancelLogout}>
          <View style={styles.centeredView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <MaterialIcons
                  name="exit-to-app" // Changed icon for better representation of logout
                  size={scale(40)} // Smaller icon size
                  color={Colors.primary} 
                  style={styles.modalIcon}
                />
                <Text style={styles.modalTitle}>Confirm Log Out</Text>
                <Text style={styles.modalText}>
                  Are you sure you want to log out from your account? You will need to sign in again to access your profile.
                </Text>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.buttonCancel]}
                    onPress={cancelLogout}
                  >
                    <Text style={styles.buttonCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.buttonConfirm]}
                    onPress={confirmLogout}
                  >
                    <Text style={styles.buttonConfirmText}>Log Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </AdaptiveSafeAreaView>
  );
};

export default AccountSetting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15), // Reduced header vertical padding slightly
    backgroundColor: Colors.WhiteBackgroudcolor,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: fontScale(18), // Slightly smaller header title font
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(20),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WhiteBackgroudcolor,
    paddingVertical: verticalScale(14), // Reduced button vertical padding
    borderRadius: moderateScale(10), // Slightly smaller border radius
    borderWidth: 1,
    borderColor: Colors.danger,
    marginTop: verticalScale(20),
  },
  logoutButtonText: {
    fontSize: fontScale(15), // Smaller logout button text font
    fontWeight: 'bold',
    color: Colors.danger,
    marginLeft: scale(8),
  },

  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    margin: scale(20),
    backgroundColor: Colors.WhiteBackgroudcolor,
    borderRadius: moderateScale(15), // Smaller border radius for modal
    padding: scale(30), // Reduced modal padding
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  modalIcon: {
    marginBottom: verticalScale(12), // Reduced margin below icon
  },
  modalTitle: {
    marginBottom: verticalScale(12), // Reduced margin below title
    textAlign: 'center',
    fontSize: fontScale(20), // Smaller modal title font
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  modalText: {
    marginBottom: verticalScale(20), // Reduced margin below text
    textAlign: 'center',
    fontSize: fontScale(14), // Smaller modal body text font
    color: Colors.textGray,
    lineHeight: verticalScale(20), // Adjusted line height
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: moderateScale(8), // Slightly smaller border radius for buttons
    paddingVertical: verticalScale(12), // Reduced button vertical padding
    flex: 1,
    marginHorizontal: scale(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: Colors.lightGray,
  },
  buttonCancelText: {
    color: Colors.textDark,
    fontWeight: 'bold',
    fontSize: fontScale(14), // Smaller button text font
  },
  buttonConfirm: {
    backgroundColor: Colors.danger,
  },
  buttonConfirmText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: fontScale(14), // Smaller button text font
  },
});