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
  Alert,
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
import { apiGet, apiPost, apiDelete } from '../../api/api';

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

  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [datePickerIndex, setDatePickerIndex] = useState(null);
  const [pickerMode, setPickerMode] = useState('day');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date().toISOString().slice(0, 10));

  const schoolDropdownRefs = useRef([]);
  const classDropdownRefs = useRef([]);

  const isEditMode = !!route.params?.existingChildren;

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          showMessage({ message: "Session Error", description: "User not found. Please log in again.", type: "danger" });
        }
        await GetSchoolData();

        if (isEditMode) {
          const formattedChildren = route.params.existingChildren.map(child => ({
            ...child,
            dob: child.dob.replace(/-/g, '/'),
            standard: child.class_name,
            schoolName: child.school_name,
          }));
          setLocalChildren(formattedChildren);
        } else {
          setLocalChildren([{ name: '', dob: '', schoolName: '', schoolId: '', standard: '', classId: '' }]);
        }
      } catch (e) {
        console.error('Initialization error:', e);
      }
    };
    
    initialize();
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

  const handleRemoveNewChild = index => {
      const newChildren = [...localChildren];
      newChildren.splice(index, 1);
      setLocalChildren(newChildren);
  };

  const handleDeleteExistingChild = (childId, index) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to remove this child?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            setIsLoading(true);
            try {
              await apiDelete(`/api/v1/children/${childId}`);
              
              const newChildren = [...localChildren];
              newChildren.splice(index, 1);
              setLocalChildren(newChildren);

              showMessage({ message: "Child removed successfully", type: "success" });

            } catch (error) {
              console.error("Failed to delete child:", error);
              showMessage({ message: "Error", description: "Could not remove child. Please try again.", type: "danger" });
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
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
    if (!ref) {
        showMessage({ message: "Error opening dropdown. Please try again.", type: 'danger' });
        return;
    }
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
        newChildren[childIndex].schoolName = option.school_name;
        newChildren[childIndex].schoolId = option.school_id;
        newChildren[childIndex].standard = '';
        newChildren[childIndex].classId = '';
        setLocalChildren(newChildren);
        GetClassData(option.school_id);
    } else if (currentField === 'standard') {
      newChildren[childIndex].standard = option.class_number;
      newChildren[childIndex].classId = option.class_id;
      setLocalChildren(newChildren);
    }
    setDropdownVisible(false);
  };

  const handleSaveAndContinue = async () => {
    const childrenToSave = localChildren.filter(child => !child.id && child.name && child.dob && child.classId && child.schoolId);
    const newChildrenForms = localChildren.filter(child => !child.id);

    if (newChildrenForms.length > 0 && newChildrenForms.length !== childrenToSave.length) {
        showMessage({ message: "Incomplete Information", description: "Please fill all details for the new child.", type: "warning" });
        return;
    }

    if (childrenToSave.length === 0 && isEditMode) {
      navigation.navigate(NavigationString.YourChildrenScreen, { refresh: true });
      return;
    }

    if (!isEditMode && newChildrenForms.length === 0) {
        navigation.navigate(NavigationString.YourChildrenScreen);
        return;
    }

    if (!userId) {
      showMessage({ message: "Session Error", description: "User ID not found. Please log in again.", type: "danger" });
      return;
    }

    setIsLoading(true);
    try {
      if(childrenToSave.length > 0) {
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
      }
      
      showMessage({ message: "Success!", description: "Information has been updated.", type: "success" });
      
      navigation.navigate(NavigationString.YourChildrenScreen, { refresh: true });

    } catch (error) {
      console.error('Error saving children:', error.response?.data || error);
      showMessage({ message: "Save Failed", description: "Could not save new information. Please try again.", type: "danger" });
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
            <Text style={styles.title}>{isEditMode ? 'Edit Children' : 'Almost There!'}</Text>
            <Text style={styles.subtitle}>{isEditMode ? 'Manage your children’s information' : 'Tell us about your children to personalize their learning'}</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <MaterialIcons name="school" size={scale(20)} color={Colors.primary} />
              <Text style={styles.formTitle}>Children Information</Text>
            </View>
            <Text style={styles.formSubtitle}>Add details for each child to get personalized book recommendations</Text>
            {localChildren.map((child, index) => {
                const isExistingChild = !!child.id;
                return (
                    <View key={child.id || `new-${index}`} style={styles.childFormSection}>
                        {isExistingChild ? (
                            <TouchableOpacity style={styles.removeChildButton} onPress={() => handleDeleteExistingChild(child.id, index)}>
                                <MaterialCommunityIcons name="delete" size={scale(22)} color={Colors.danger} />
                            </TouchableOpacity>
                        ) : (
                            (localChildren.filter(c => !c.id).length > (isEditMode ? 0 : 1) || (isEditMode && localChildren.filter(c => !c.id).length > 0)) && (
                                <TouchableOpacity style={styles.removeChildButton} onPress={() => handleRemoveNewChild(index)}>
                                    <MaterialCommunityIcons name="close" size={scale(22)} color={Colors.textMuted} />
                                </TouchableOpacity>
                            )
                        )}
                        <Text style={styles.childLabel}>Child {index + 1}</Text>
                        
                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput 
                            style={[styles.input, isExistingChild && styles.inputDisabled]} 
                            placeholder="Enter child's name" 
                            placeholderTextColor={Colors.textMuted} 
                            value={child.name} 
                            onChangeText={text => handleTextInputChange(index, 'name', text)}
                            editable={!isExistingChild}
                        />
                        
                        <Text style={styles.inputLabel}>Date of Birth</Text>
                        <TouchableOpacity 
                            style={[styles.input, isExistingChild && styles.inputDisabled]} 
                            onPress={() => openCalendarForChild(index)}
                            disabled={isExistingChild}
                        >
                            <Text style={child.dob ? styles.dateText : styles.datePlaceholder}>
                                {child.dob || 'YYYY/MM/DD'}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.inputLabel}>School Name</Text>
                        <TouchableOpacity 
                            ref={el => (schoolDropdownRefs.current[index] = el)}
                            style={[styles.dropdown, isExistingChild && styles.inputDisabled]} 
                            onPress={() => openDropdown(index, 'schoolName', schoolDropdownRefs.current[index])}
                            disabled={isExistingChild}
                        >
                          <Text style={child.schoolName ? styles.dropdownTextSelected : styles.dropdownText}>{child.schoolName || 'Select school'}</Text>
                          <MaterialIcons name="keyboard-arrow-down" size={scale(20)} color={Colors.textMuted} />
                        </TouchableOpacity>

                        <Text style={styles.inputLabel}>Class</Text>
                        <TouchableOpacity 
                            ref={el => (classDropdownRefs.current[index] = el)}
                            style={[styles.dropdown, (isExistingChild || !child.schoolId) && styles.inputDisabled]} 
                            onPress={() => openDropdown(index, 'standard', classDropdownRefs.current[index])} 
                            disabled={isExistingChild || !child.schoolId}
                        >
                          <Text style={child.standard ? styles.dropdownTextSelected : styles.dropdownText}>{child.standard || 'Select class'}</Text>
                          <MaterialIcons name="keyboard-arrow-down" size={scale(20)} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                );
            })}

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
    padding: 5,
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
  inputDisabled: {
      backgroundColor: '#f0f0f0',
      color: Colors.textMuted,
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
// ye wo code hai jisme addchild me sirf child ka data dikh rha hai update bnhi ho rha delete ho rha hai 









/////////////////////// esme nhiche wale me cart ka item payment me hi pased order pr dleet kr ha ahi order confir pr nhi 
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../../styles/colors';
import {
  scale,
  fontScale,
  verticalScale,
  moderateScale,
} from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';
import { apiGet, apiPost, apiDelete } from '../../api/api';
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';

const PaymentDetailes = ({ route, navigation }) => {
  const { orderData, address: initialAddress } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(initialAddress || null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const getSubtotal = () => {
    if (!orderData) return 0;
    if (orderData.isFromCart) {
      return parseFloat(orderData.cart?.total_amount || 0);
    } else {
      return parseFloat(orderData.pkg?.price || 0);
    }
  };

  const subtotal = getSubtotal();
  const total = subtotal;

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsDataLoading(true);
        try {
          const userId = await AsyncStorage.getItem('userId');
          if (!userId) {
            throw new Error('User ID not found');
          }

          const response = await apiGet(`/api/v1/address/user/${userId}`);
          if (response && Array.isArray(response) && response.length > 0) {
            setSavedAddresses(response);
            if (selectedSavedAddress) {
              const stillExists = response.some(a => a.address_id === selectedSavedAddress.address_id);
              if (!stillExists) {
                setSelectedSavedAddress(response[0]);
              }
            } else {
              setSelectedSavedAddress(response[0]);
            }
          } else {
            setSavedAddresses([]);
            setSelectedSavedAddress(null);
            showMessage({
              message: 'No Address Found',
              description: 'Please add a delivery address to continue.',
              type: 'warning',
            });
            navigation.replace(NavigationString.DeliveryAddress);
          }
        } catch (error) {
          console.error('Failed to fetch addresses:', error);
          showMessage({
            message: 'Error',
            description: 'Could not fetch addresses.',
            type: 'danger',
          });
          navigation.goBack();
        } finally {
          setIsDataLoading(false);
        }
      };

      if (orderData) {
        fetchData();
      } else {
        setIsDataLoading(false);
      }
    }, [orderData, selectedSavedAddress, navigation])
  );

  const getInitials = name => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  const handleDeleteAddress = async addressIdToDelete => {
    try {
      await apiDelete(`/api/v1/address/${addressIdToDelete}`);
      showMessage({ message: 'Address Deleted', type: 'success' });

      const updatedAddresses = savedAddresses.filter(addr => addr.address_id !== addressIdToDelete);
      setSavedAddresses(updatedAddresses);

      if (selectedSavedAddress?.address_id === addressIdToDelete) {
        const newSelected = updatedAddresses.length > 0 ? updatedAddresses[0] : null;
        setSelectedSavedAddress(newSelected);
        if (!newSelected) {
          showMessage({
            message: 'No Addresses Left',
            description: 'Please add a new address.',
            type: 'warning',
          });
          navigation.replace(NavigationString.DeliveryAddress);
        }
      }
    } catch (error) {
      showMessage({
        message: 'Could not delete address.',
        type: 'danger',
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedSavedAddress) {
      showMessage({ message: 'Missing Information', description: 'Please select a delivery address.', type: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      const userPhoneNumber = await AsyncStorage.getItem('mobile_number');
      if (!userPhoneNumber) {
        showMessage({
          message: 'Authentication Error',
          description: 'Your phone number could not be found. Please log in again.',
          type: 'danger',
        });
        setIsLoading(false);
        return;
      }

      const payload = {
        delivery_address: `${selectedSavedAddress.address_line1}, ${selectedSavedAddress.city}, ${selectedSavedAddress.state} - ${selectedSavedAddress.pincode}`,
        delivery_phone: userPhoneNumber,
        delivery_notes: deliveryNotes.trim(),
        payment_method: paymentMethod,
      };

      const createdOrder = await apiPost('/api/v1/orders', payload);
      showMessage({ message: 'Order Placed Successfully!', type: 'success' });

      if (orderData.isFromCart && orderData.cart && orderData.cart.items && orderData.cart.items.length > 0) {
        try {
          await Promise.all(orderData.cart.items.map(async (item) => {
            await apiDelete(`/api/v1/cart/items/${item.cart_item_id}`);
          }));
          console.log("Cart items successfully cleared after order placement.");
        } catch (cartClearError) {
          console.error("Failed to clear cart items after order:", cartClearError);
        }
      }

      navigation.navigate(NavigationString.Order, {
        orderData,
        total,
        paymentMethod,
        address: selectedSavedAddress,
        orderDetails: createdOrder,
        deliveryPhoneNumber: userPhoneNumber,
      });

    } catch (error) {
      console.error('Failed to place order:', error.response?.data || error);
      showMessage({
        message: 'Order Failed',
        description: 'Please try again.',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = addr => {
    return `${addr.address_line1}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
  };

  const getOrderDisplayInfo = () => {
    if (!orderData) return { name: '', subtitle: '', quantity: 0 };

    if (orderData.isFromCart) {
      return {
        name: 'Items from Cart',
        subtitle: `Total Items: ${orderData.cart?.quantity || 0}`,
        quantity: orderData.cart?.quantity || 0
      };
    } else {
      return {
        name: orderData.pkg?.title || orderData.pkg?.bundle_name || 'Package',
        subtitle: `For ${orderData.child?.name || ''} • Class ${orderData.child?.standard || ''}`,
        quantity: 1
      };
    }
  };

  if (isDataLoading || !orderData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Payment Details...</Text>
      </View>
    );
  }

  const orderDisplayInfo = getOrderDisplayInfo();

  return (
    <AdaptiveSafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons
              name="arrow-back"
              size={scale(24)}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: scale(24) }} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.itemRow}>
              <View style={styles.itemDetails}>
                <View style={styles.itemAvatar}>
                  {orderData.isFromCart ? (
                    <MaterialCommunityIcons
                      name="cart"
                      size={scale(20)}
                      color={Colors.primary}
                    />
                  ) : (
                    <Text style={styles.itemAvatarText}>
                      {getInitials(orderData.child?.name || 'P')}
                    </Text>
                  )}
                </View>
                <View>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {orderDisplayInfo.name}
                  </Text>
                  <Text style={styles.itemFor}>
                    {orderDisplayInfo.subtitle}
                  </Text>
                </View>
              </View>
              <Text style={styles.itemPrice}>₹{subtotal.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Shipping Address</Text>
            {savedAddresses.map(addr => (
              <View key={addr.address_id} style={styles.addressOptionContainer}>
                <TouchableOpacity
                  style={styles.addressOption}
                  onPress={() => setSelectedSavedAddress(addr)}
                >
                  <MaterialCommunityIcons
                    name={
                      selectedSavedAddress?.address_id === addr.address_id
                        ? 'radiobox-marked'
                        : 'radiobox-blank'
                    }
                    size={scale(20)}
                    color={Colors.primary}
                  />
                  <View style={{ marginLeft: scale(10), flex: 1 }}>
                    <Text style={styles.addressOptionName}>
                      {addr.fullName}
                    </Text>
                    <Text style={styles.addressOptionText}>
                      {formatAddress(addr)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteAddress(addr.address_id)}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={scale(22)}
                    color={Colors.danger}
                  />
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={styles.notesInput}
              placeholder="Delivery Notes (Optional)"
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setPaymentMethod('COD')}
            >
              <MaterialCommunityIcons
                name={
                  paymentMethod === 'COD' ? 'radiobox-marked' : 'radiobox-blank'
                }
                size={scale(20)}
                color={Colors.primary}
              />
              <Text style={styles.paymentTitle}>Cash on Delivery</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.totalRowFooter}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.placeOrderButton,
              isLoading && styles.disabledButton,
            ]}
            onPress={handlePlaceOrder}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textLight} />
            ) : (
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </AdaptiveSafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
  },
  loadingText: {
    marginTop: 15,
    fontSize: fontScale(14),
    color: Colors.textSecondary,
  },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(16),
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  content: {
    flexGrow: 1,
    padding: scale(16),
  },
  card: {
    backgroundColor: 'white',
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    marginBottom: verticalScale(20),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: fontScale(15),
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: verticalScale(12),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetails: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(8),
    backgroundColor: Colors.backgroundPrimaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  itemAvatarText: {
    fontSize: fontScale(16),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  itemName: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: Colors.textDark,
    flexShrink: 1,
  },
  itemFor: { fontSize: fontScale(12), color: Colors.textSecondary },
  itemPrice: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  addressOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingVertical: verticalScale(8),
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: scale(10),
  },
  addressOptionName: {
    fontSize: fontScale(13),
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  addressOptionText: { fontSize: fontScale(13), color: Colors.textSecondary },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    backgroundColor: Colors.backgroundFaded,
    fontSize: fontScale(14),
    color: Colors.textDark,
    height: verticalScale(45),
    marginTop: verticalScale(15),
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
  },
  paymentTitle: {
    fontSize: fontScale(14),
    fontWeight: '500',
    color: Colors.textDark,
    marginLeft: scale(12),
  },
  footer: {
    padding: moderateScale(16),
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  totalRowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  totalLabel: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  totalValue: {
    fontSize: fontScale(16),
    fontWeight: 'bold',
    color: Colors.success,
  },
  placeOrderButton: {
    backgroundColor: Colors.primary,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: Colors.primary, opacity: 0.7 },
  placeOrderButtonText: {
    color: Colors.textLight,
    fontSize: fontScale(16),
    fontWeight: 'bold',
  },
});

export default PaymentDetailes;