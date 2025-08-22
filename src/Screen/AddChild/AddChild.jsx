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
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import Colors from '../../styles/colors';
import {
  scale,
  fontScale,
  verticalScale,
  moderateScale,
} from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';
import { apiGet, apiPost } from '../../api/api';

const AddChildScreen = ({ route, navigation, onLogout }) => {
  const [localChildren, setLocalChildren] = useState([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownData, setDropdownData] = useState([]);
  const [currentChildIndex, setCurrentChildIndex] = useState(null);
  const [currentField, setCurrentField] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [schoolOptionsFromApi, setSchoolOptionsFromApi] = useState([]);
  const [classOptionsFromApi, setClassOptionsFromApi] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // --- Calendar State ---
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [datePickerIndex, setDatePickerIndex] = useState(null);
  const [pickerMode, setPickerMode] = useState('day'); // 'day', 'month', 'year'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date().toISOString().slice(0, 10));

  const classDropdownRefs = useRef([]);
  const schoolDropdownRefs = useRef([]);

  useFocusEffect(
    useCallback(() => {
      const initialForms = [{ name: '', dob: '', schoolName: '', schoolId: '', standard: '', classId: '' }];
      setLocalChildren(initialForms);
    }, []),
  );

  useEffect(() => {
    const getAsyncData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          showMessage({ message: "Session Error", description: "User not found. Please log in again.", type: "danger" });
        }
      } catch (e) {
        console.error('Failed to fetch data from AsyncStorage:', e);
      }
    };
    getAsyncData();
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
    setLocalChildren([...localChildren, { name: '', dob: '', schoolName: '', schoolId: '', standard: '', classId: '' }]);
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

  const openCalendarForChild = (index) => {
    setDatePickerIndex(index);
    const initialDate = localChildren[index]?.dob ? localChildren[index].dob.replace(/\//g, '-') : new Date().toISOString().slice(0, 10);
    setCurrentCalendarDate(initialDate);
    setCalendarVisible(true);
    setPickerMode('day');
  };
  
  const handleDayPress = (day) => {
    const formattedDate = day.dateString.replace(/-/g, '/');
    const newChildren = [...localChildren];
    newChildren[datePickerIndex].dob = formattedDate;
    setLocalChildren(newChildren);
    setCalendarVisible(false);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setPickerMode('month');
  };

  const handleMonthSelect = (monthIndex) => {
    const newDate = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-01`;
    setCurrentCalendarDate(newDate);
    setPickerMode('day');
  };

  const openDropdown = (index, field, ref) => {
    if (!ref) return;
    ref.measure((_fx, _fy, width, height, px, py) => {
      setDropdownPosition({ top: py + height, left: px, width });
      setCurrentChildIndex(index);
      setCurrentField(field);
      setDropdownData(field === 'schoolName' ? schoolOptionsFromApi : classOptionsFromApi);
      setDropdownVisible(true);
    });
  };

  const handleSelectOption = option => {
    const newChildren = [...localChildren];
    const childIndex = currentChildIndex;
    if (currentField === 'schoolName') {
      const isSameSchool = newChildren[childIndex].schoolId === option.school_id;
      if (!isSameSchool) {
        newChildren[childIndex] = {
          ...newChildren[childIndex],
          schoolName: option.school_name,
          schoolId: option.school_id,
          standard: '',
          classId: '',
        };
        setLocalChildren(newChildren);
        GetClassData(option.school_id);
      }
    } else if (currentField === 'standard') {
      newChildren[childIndex].standard = option.class_number;
      newChildren[childIndex].classId = option.class_id;
      setLocalChildren(newChildren);
    }
    setDropdownVisible(false);
  };

  const handleSaveAndContinue = async () => {
    const childrenToSave = localChildren.filter(child => child.name && child.dob && child.classId && child.schoolId);

    if (localChildren.some(c => c.name || c.dob || c.standard || c.schoolName) && childrenToSave.length !== localChildren.length) {
      showMessage({ message: "Incomplete Information", description: "Please fill in all details for each child.", type: "warning" });
      return;
    }

    if (childrenToSave.length === 0) {
      navigation.navigate(NavigationString.YourChildrenScreen);
      return;
    }
    if (!userId) {
      showMessage({ message: "Session Error", description: "User ID not found. Please log in again.", type: "danger" });
      return;
    }
    setIsLoading(true);
    try {
      const createChildrenPromises = childrenToSave.map(child => {
        const formattedDob = child.dob.replace(/\//g, '-');

        const payload = {
          name: child.name,
          dob: formattedDob,
          user_id: parseInt(userId),
          class_id: String(child.classId),
          school_id: String(child.schoolId),
        };
        return apiPost('/api/v1/children', payload);
      });
      await Promise.all(createChildrenPromises);
      
      const storageKey = `children_extra_data_${userId}`;
      const existingDataString = await AsyncStorage.getItem(storageKey);
      const existingData = existingDataString ? JSON.parse(existingDataString) : {};

      childrenToSave.forEach(child => {
        existingData[child.name] = {
          school_name: child.schoolName,
          class_name: child.standard,
        };
      });

      await AsyncStorage.setItem(storageKey, JSON.stringify(existingData));
      
      showMessage({ message: "Success!", description: "Children's information has been saved.", type: "success" });
      
      const passedChildrenData = childrenToSave.map(child => ({
        name: child.name,
        school_name: child.schoolName,
        class_name: child.standard,
      }));

      navigation.navigate(NavigationString.YourChildrenScreen, {
        newlyAddedChildren: passedChildrenData,
      });

    } catch (error) {
      console.error('Error saving children:', error.response?.data || error);
      showMessage({ message: "Save Failed", description: "Could not save information. Please try again.", type: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate(NavigationString.YourChildrenScreen);
  };

  const DropdownModal = () => (
    <Modal transparent={true} visible={isDropdownVisible} onRequestClose={() => setDropdownVisible(false)}>
      <TouchableOpacity style={styles.modalOverlay} onPress={() => setDropdownVisible(false)}>
        <View style={[styles.modalContent, { top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }]}>
          <FlatList
            data={dropdownData}
            keyExtractor={item => String(item.school_id || item.class_id)}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectOption(item)}>
                <Text style={styles.modalItemText}>{item.school_name || item.class_number}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const CalendarModal = () => {
    const renderContent = () => {
        switch (pickerMode) {
            case 'year':
                const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
                return (
                    <FlatList
                        data={years}
                        keyExtractor={(item) => String(item)}
                        ListHeaderComponent={() => <Text style={styles.pickerTitle}>Select a Year</Text>}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.pickerItem} onPress={() => handleYearSelect(item)}>
                                <Text style={styles.pickerItemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        numColumns={4}
                    />
                );
            case 'month':
                const months = Array.from({ length: 12 }, (_, i) => 
                    new Date(0, i).toLocaleString('default', { month: 'long' })
                );
                return (
                    <View>
                         <TouchableOpacity onPress={() => setPickerMode('year')}>
                            <Text style={styles.pickerTitle}>{`Select a Month in ${selectedYear}`}</Text>
                        </TouchableOpacity>
                        <FlatList
                            data={months}
                            keyExtractor={(item) => item}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity style={styles.pickerItem} onPress={() => handleMonthSelect(index)}>
                                    <Text style={styles.pickerItemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                            numColumns={3}
                        />
                    </View>
                );
            case 'day':
            default:
                return (
                    <Calendar
                        key={currentCalendarDate}
                        current={currentCalendarDate}
                        onDayPress={handleDayPress}
                        maxDate={new Date().toISOString().split('T')[0]}
                        markedDates={{
                            [localChildren[datePickerIndex]?.dob.replace(/\//g, '-')]: { selected: true, selectedColor: Colors.primary }
                        }}
                        renderHeader={(date) => {
                            const headerDate = new Date(date);
                            const month = headerDate.toLocaleString('default', { month: 'long' });
                            const year = headerDate.getFullYear();
                            return (
                                <TouchableOpacity style={styles.calendarHeader} onPress={() => setPickerMode('year')}>
                                    <Text style={styles.calendarHeaderText}>{`${month} ${year}`}</Text>
                                </TouchableOpacity>
                            );
                        }}
                        onMonthChange={(month) => {
                            setCurrentCalendarDate(month.dateString);
                        }}
                        theme={{ todayTextColor: Colors.primary, arrowColor: Colors.primary }}
                    />
                );
        }
    };

    return (
        <Modal
            visible={isCalendarVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setCalendarVisible(false)}
        >
            <TouchableOpacity style={styles.calendarOverlay} onPress={() => setCalendarVisible(false)}>
                <TouchableOpacity activeOpacity={1} style={styles.calendarContainer}>
                   {renderContent()}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="book-open-variant" size={scale(35)} color={Colors.textLight} />
            </View>
            <Text style={styles.title}>Almost There!</Text>
            <Text style={styles.subtitle}>Tell us about your children to personalize their learning</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <MaterialIcons name="school" size={scale(20)} color={Colors.primary} />
              <Text style={styles.formTitle}>Children Information</Text>
            </View>
            <Text style={styles.formSubtitle}>Add details for each child to get personalized book recommendations</Text>
            {localChildren.map((child, index) => (
              <View key={index} style={styles.childFormSection}>
                {localChildren.length > 1 && (
                  <TouchableOpacity style={styles.removeChildButton} onPress={() => handleRemoveChild(index)}>
                    <MaterialCommunityIcons name="delete" size={scale(22)} color={Colors.danger} />
                  </TouchableOpacity>
                )}
                <Text style={styles.childLabel}>Child {index + 1}</Text>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput style={styles.input} placeholder="Enter child's name" placeholderTextColor={Colors.textMuted} value={child.name} onChangeText={text => handleTextInputChange(index, 'name', text)} />
                
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TouchableOpacity style={styles.input} onPress={() => openCalendarForChild(index)}>
                    <Text style={child.dob ? styles.dateText : styles.datePlaceholder}>
                        {child.dob || 'YYYY/MM/DD'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>School Name</Text>
                <TouchableOpacity ref={el => (schoolDropdownRefs.current[index] = el)} style={styles.dropdown} onPress={() => openDropdown(index, 'schoolName', schoolDropdownRefs.current[index])}>
                  <Text style={child.schoolName ? styles.dropdownTextSelected : styles.dropdownText}>{child.schoolName || 'Select school'}</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={scale(20)} color={Colors.textMuted} />
                </TouchableOpacity>
                <Text style={styles.inputLabel}>Class</Text>
                <TouchableOpacity ref={el => (classDropdownRefs.current[index] = el)} style={[styles.dropdown, !child.schoolId && styles.dropdownDisabled]} onPress={() => openDropdown(index, 'standard', classDropdownRefs.current[index])} disabled={!child.schoolId}>
                  <Text style={child.standard ? styles.dropdownTextSelected : styles.dropdownText}>{child.standard || 'Select class'}</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={scale(20)} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addChildButton} onPress={handleAddChild}>
              <MaterialIcons name="add" size={scale(18)} color={Colors.primary} />
              <Text style={styles.addChildText}>Add Another Child</Text>
            </TouchableOpacity>
            <View style={styles.footerButtons}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.continueButton} onPress={handleSaveAndContinue} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator color={Colors.textLight} /> : <Text style={styles.continueButtonText}>Continue</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onLogout}>
                  <Text>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Text style={styles.termsText}>By continuing, you agree to our Terms of Service and Privacy Policy.</Text>
        </ScrollView>
        <DropdownModal />
        <CalendarModal />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    justifyContent: 'center',
    height: verticalScale(45),
    marginBottom: verticalScale(12),
  },
  datePlaceholder: {
    fontSize: fontScale(14),
    color: Colors.textMuted,
  },
  dateText: {
    fontSize: fontScale(14),
    color: Colors.textDark,
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
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: moderateScale(10),
    padding: moderateScale(10),
    width: '90%',
    maxHeight: '70%',
  },
  calendarHeader: {
    padding: 10,
    alignItems: 'center',
  },
  calendarHeaderText: {
    fontSize: fontScale(16),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  pickerTitle: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: verticalScale(10),
    color: Colors.textPrimary,
  },
  pickerItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    margin: 4,
    backgroundColor: Colors.backgroundFaded,
    borderRadius: moderateScale(8),
  },
  pickerItemText: {
    fontSize: fontScale(14),
    color: Colors.textDark,
  },
});

export default AddChildScreen;