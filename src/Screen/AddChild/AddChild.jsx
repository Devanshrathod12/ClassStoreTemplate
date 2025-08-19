import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
// SAHI IMPORT: useFocusEffect yahan se aata hai
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage import
import Colors from '../../styles/colors';
import {
  scale,
  fontScale,
  verticalScale,
  moderateScale,
} from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';
import { apiGet, apiPost } from '../../api/api'; // apiPost import

const AddChildScreen = ({ route, navigation }) => {
  // Redux se ab sirf mobile number le rahe hain UI ke liye
  const persistedMobileNumber = useSelector(
    state => state.auth.user?.mobileNumber,
  );

  const isEditMode = route.params?.editMode || false;
  const mobileNumber = route.params?.mobileNumber || persistedMobileNumber;

  const [localChildren, setLocalChildren] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownData, setDropdownData] = useState([]);
  const [currentChildIndex, setCurrentChildIndex] = useState(null);
  const [currentField, setCurrentField] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [schoolOptionsFromApi, setSchoolOptionsFromApi] = useState([]);
  const [classOptionsFromApi, setClassOptionsFromApi] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null); // User ID ke liye state

  const classDropdownRefs = useRef([]);
  const schoolDropdownRefs = useRef([]);

  useFocusEffect(
    useCallback(() => {
      const initialForms = [
        {
          name: '',
          dob: '',
          schoolName: '',
          schoolId: '',
          standard: '',
          classId: '',
        },
      ];
      setLocalChildren(initialForms);
    }, []),
  );

  useEffect(() => {
    // Function to get User ID from AsyncStorage
    const getUserIdFromStorage = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId !== null) {
          setUserId(storedUserId);
          console.log('AsyncStorage se User ID mili:', storedUserId);
        } else {
          Alert.alert('Session Error', 'User not found. Please login again.');
        }
      } catch (e) {
        console.error('AsyncStorage se User ID nikalne mein error:', e);
      }
    };

    getUserIdFromStorage();
    GetSchoolData();
  }, []);

  const GetSchoolData = async () => {
    try {
      const response = await apiGet('/api/v1/school');
      if (response && Array.isArray(response)) {
        setSchoolOptionsFromApi(response);
      } else {
        setSchoolOptionsFromApi([]);
      }
    } catch (error) {
      console.log('Error fetching schools:', error);
    }
  };

  const GetClassData = async schoolId => {
    if (!schoolId) return;
    try {
      setClassOptionsFromApi([]);
      const response = await apiGet(`/api/v1/class/school/${schoolId}`);
      if (response && Array.isArray(response)) {
        setClassOptionsFromApi(response);
      } else {
        setClassOptionsFromApi([]);
      }
    } catch (error) {
      console.log('Error fetching classes:', error);
    }
  };

  const handleAddChild = () => {
    setLocalChildren([
      ...localChildren,
      {
        name: '',
        dob: '',
        schoolName: '',
        schoolId: '',
        standard: '',
        classId: '',
      },
    ]);
  };

  const handleRemoveChild = index => {
    if (localChildren.length > 1) {
      const newChildren = [...localChildren];
      newChildren.splice(index, 1);
      setLocalChildren(newChildren);
    }
  };

  const handleTextInputChange = (index, field, value) => {
    const newChildren = [...localChildren];
    newChildren[index][field] = value;
    setLocalChildren(newChildren);
  };

  const openDropdown = (index, field, ref) => {
    if (!ref) return;
    ref.measure((_fx, _fy, width, height, px, py) => {
      setDropdownPosition({ top: py + height, left: px, width });
      setCurrentChildIndex(index);
      setCurrentField(field);
      setDropdownData(
        field === 'schoolName' ? schoolOptionsFromApi : classOptionsFromApi,
      );
      setDropdownVisible(true);
    });
  };

  const handleSelectOption = option => {
    const newChildren = [...localChildren];
    const childIndex = currentChildIndex;

    if (currentField === 'schoolName') {
      const isSameSchool =
        newChildren[childIndex].schoolId === option.school_id;
      if (!isSameSchool) {
        newChildren[childIndex] = {
          ...newChildren[childIndex],
          schoolName: option.school_name,
          schoolId: option.school_id,
          standard: '', // Class ko reset karo
          classId: '', // Class ID ko bhi reset karo
        };
        setLocalChildren(newChildren);
        GetClassData(option.school_id);
      }
    } else if (currentField === 'standard') {
      newChildren[childIndex].standard = option.class_number; // Ye UI mein dikhega
      newChildren[childIndex].classId = option.class_id; // Ye API ke liye save hoga
      setLocalChildren(newChildren);
    }

    setDropdownVisible(false);
  };

  const handleSaveAndContinue = async () => {
    const childrenToSave = localChildren.filter(
      child => child.name && child.dob && child.classId && child.schoolId,
    );

    if (
      localChildren.some(c => c.name || c.dob || c.standard || c.schoolName) &&
      childrenToSave.length !== localChildren.length
    ) {
      Alert.alert(
        'Adhuri Jaankari',
        'Kripya sabhi bachho ke liye poori details bharein.',
      );
      return;
    }

    if (childrenToSave.length === 0) {
      navigation.navigate(NavigationString.YourChildrenScreen);
      return;
    }

    if (!userId) {
      Alert.alert(
        'Session Error',
        'User ID nahi mili. Kripya dobara login karein.',
      );
      return;
    }

    setIsLoading(true);
    try {
      const createChildrenPromises = childrenToSave.map(child => {
        const payload = {
          name: child.name,
          age: 10,
          user_id: parseInt(userId), 
          class_id: child.classId,
          school_id: child.schoolId,
        };
        return apiPost('/api/v1/children', payload);
      });

      await Promise.all(createChildrenPromises);

      Alert.alert('Safal!', 'Bachho ki jaankari save ho gayi hai.');
      navigation.navigate(NavigationString.YourChildrenScreen);
    } catch (error) {
      console.error(
        'Bachho ko save karne mein error:',
        error.response?.data || error,
      );
      Alert.alert(
        'Error',
        'Jaankari save nahi ho payi. Kripya dobara koshish karein.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate(NavigationString.YourChildrenScreen);
  };

  const DropdownModal = () => (
    <Modal
      transparent={true}
      visible={isDropdownVisible}
      onRequestClose={() => setDropdownVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={() => setDropdownVisible(false)}
      >
        <View
          style={[
            styles.modalContent,
            {
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            },
          ]}
        >
          <FlatList
            data={dropdownData}
            keyExtractor={item => item.school_id || item.class_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => handleSelectOption(item)}
              >
                <Text style={styles.modalItemText}>
                  {item.school_name || item.class_number}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.backgroundLight}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={scale(35)}
                color={Colors.textLight}
              />
            </View>
            <Text style={styles.title}>Almost There!</Text>
            <Text style={styles.subtitle}>
              Tell us about your children to personalize their learning
            </Text>
          </View>

          <View style={styles.loggedInContainer}>
            <View style={styles.loggedInIconCircle}>
              <MaterialIcons
                name="check"
                size={scale(20)}
                color={Colors.success}
              />
            </View>
            <View>
              <Text style={styles.loggedInText}>Logged in as</Text>
              <Text style={styles.loggedInNumber}>+91 {mobileNumber}</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <MaterialIcons
                name="school"
                size={scale(20)}
                color={Colors.primary}
              />
              <Text style={styles.formTitle}>Children Information</Text>
            </View>
            <Text style={styles.formSubtitle}>
              Add details for each child to get personalized book
              recommendations
            </Text>

            {localChildren.map((child, index) => (
              <View key={index} style={styles.childFormSection}>
                {localChildren.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeChildButton}
                    onPress={() => handleRemoveChild(index)}
                  >
                    <MaterialCommunityIcons
                      name="delete"
                      size={scale(22)}
                      color={Colors.danger}
                    />
                  </TouchableOpacity>
                )}
                <Text style={styles.childLabel}>Child {index + 1}</Text>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter child's name"
                  placeholderTextColor={Colors.textMuted}
                  value={child.name}
                  onChangeText={text =>
                    handleTextInputChange(index, 'name', text)
                  }
                />
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={Colors.textMuted}
                  value={child.dob}
                  onChangeText={text =>
                    handleTextInputChange(index, 'dob', text)
                  }
                />
                <Text style={styles.inputLabel}>School Name</Text>
                <TouchableOpacity
                  ref={el => (schoolDropdownRefs.current[index] = el)}
                  style={styles.dropdown}
                  onPress={() =>
                    openDropdown(
                      index,
                      'schoolName',
                      schoolDropdownRefs.current[index],
                    )
                  }
                >
                  <Text
                    style={
                      child.schoolName
                        ? styles.dropdownTextSelected
                        : styles.dropdownText
                    }
                  >
                    {child.schoolName || 'Select school'}
                  </Text>
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={scale(20)}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
                <Text style={styles.inputLabel}>Class</Text>
                <TouchableOpacity
                  ref={el => (classDropdownRefs.current[index] = el)}
                  style={[
                    styles.dropdown,
                    !child.schoolId && styles.dropdownDisabled,
                  ]}
                  onPress={() =>
                    openDropdown(
                      index,
                      'standard',
                      classDropdownRefs.current[index],
                    )
                  }
                  disabled={!child.schoolId}
                >
                  <Text
                    style={
                      child.standard
                        ? styles.dropdownTextSelected
                        : styles.dropdownText
                    }
                  >
                    {child.standard || 'Select class'}
                  </Text>
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={scale(20)}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addChildButton}
              onPress={handleAddChild}
            >
              <MaterialIcons
                name="add"
                size={scale(18)}
                color={Colors.primary}
              />
              <Text style={styles.addChildText}>Add Another Child</Text>
            </TouchableOpacity>
            <View style={styles.footerButtons}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleSaveAndContinue}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.textLight} />
                  ) : (
                    <Text style={styles.continueButtonText}>Continue</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </ScrollView>
        <DropdownModal />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles (No Changes)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(30),
  },
  headerContainer: { alignItems: 'center', marginTop: verticalScale(15) },
  logoContainer: {
    width: scale(60),
    height: scale(60),
    borderRadius: moderateScale(16),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  title: {
    fontSize: fontScale(24),
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: fontScale(14),
    color: Colors.textSecondary,
    marginTop: verticalScale(5),
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },
  termsText: {
    fontSize: fontScale(11),
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: scale(20),
    marginTop: verticalScale(20),
    lineHeight: verticalScale(16),
  },
  loggedInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    width: '100%',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(10),
    marginTop: verticalScale(20),
  },
  loggedInIconCircle: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: Colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  loggedInText: { color: Colors.textLight, fontSize: fontScale(12) },
  loggedInNumber: {
    color: Colors.textLight,
    fontSize: fontScale(14),
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    alignItems: 'center',
    marginTop: verticalScale(15),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formHeader: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  formTitle: {
    fontSize: fontScale(16),
    fontWeight: 'bold',
    color: Colors.textDark,
    marginLeft: scale(8),
  },
  formSubtitle: {
    fontSize: fontScale(12),
    color: Colors.textMuted,
    width: '100%',
    marginTop: verticalScale(4),
    marginBottom: verticalScale(15),
  },
  childFormSection: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: verticalScale(15),
    marginBottom: verticalScale(15),
    position: 'relative',
    padding: moderateScale(10),
    borderRadius: moderateScale(8),
  },
  removeChildButton: {
    position: 'absolute',
    top: verticalScale(10),
    right: 0,
    zIndex: 1,
  },
  childLabel: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: verticalScale(10),
  },
  inputLabel: {
    fontSize: fontScale(12),
    color: Colors.textSecondary,
    alignSelf: 'flex-start',
    marginBottom: verticalScale(6),
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    backgroundColor: Colors.backgroundFaded,
    fontSize: fontScale(14),
    color: Colors.textDark,
    height: verticalScale(45),
    marginBottom: verticalScale(12),
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    backgroundColor: Colors.backgroundFaded,
    height: verticalScale(45),
    marginBottom: verticalScale(12),
  },
  dropdownDisabled: { backgroundColor: '#f0f0f0' },
  dropdownText: { fontSize: fontScale(14), color: Colors.textMuted },
  dropdownTextSelected: { fontSize: fontScale(14), color: Colors.textDark },
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    marginTop: verticalScale(10),
  },
  addChildText: {
    color: Colors.primary,
    fontSize: fontScale(14),
    fontWeight: 'bold',
    marginLeft: scale(8),
  },
  footerButtons: { width: '100%', marginTop: verticalScale(20) },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(25),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: scale(100),
  },
  skipButton: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(20),
    alignItems: 'center',
  },
  continueButtonText: {
    color: Colors.textLight,
    fontSize: fontScale(16),
    fontWeight: 'bold',
  },
  skipButtonText: {
    color: Colors.textMuted,
    fontSize: fontScale(14),
    fontWeight: '500',
  },
  modalOverlay: { flex: 1 },
  modalContent: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: moderateScale(8),
    maxHeight: verticalScale(400),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalItem: {
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalItemText: { fontSize: fontScale(14), color: Colors.textPrimary },
});

export default AddChildScreen;
