import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  Keyboard,
  Dimensions, 
} from 'react-native';
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
import { apiGet, apiPost, apiDelete, apiPut } from '../../api/api';
import AdaptiveSafeAreaView from "../AdaptiveSafeAreaView";

const AddChildScreen = ({ route, navigation, onLogout }) => {
  const [localChildren, setLocalChildren] = useState([]);
  const [originalChildren, setOriginalChildren] = useState([]); 
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownData, setDropdownData] = useState([]);
  const [currentChildIndex, setCurrentChildIndex] = useState(null);
  const [currentField, setCurrentField] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(verticalScale(200));
  const [schoolOptionsFromApi, setSchoolOptionsFromApi] = useState([]);
  const [classOptionsFromApi, setClassOptionsFromApi] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingChildId, setUpdatingChildId] = useState(null);
  const [loadingClassesForIndex, setLoadingClassesForIndex] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [datePickerIndex, setDatePickerIndex] = useState(null);
  const [pickerMode, setPickerMode] = useState('day');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date().toISOString().slice(0, 10));

  const schoolDropdownRefs = useRef([]);
  const classDropdownRefs = useRef([]);
  const scrollViewRef = useRef(null); 

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
          setOriginalChildren(JSON.parse(JSON.stringify(formattedChildren))); 
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

  const GetClassData = async (schoolId, index) => {
    if (!schoolId) return;
    setLoadingClassesForIndex(index);
    setClassOptionsFromApi([]); 
    try {
      const response = await apiGet(`/api/v1/class/school/${schoolId}`);
      if (response && Array.isArray(response)) {
        setClassOptionsFromApi(response);
      } else {
        setClassOptionsFromApi([]);
      }
    } catch (error) {
      console.log('Error fetching classes:', error);
      setClassOptionsFromApi([]);
    } finally {
      setLoadingClassesForIndex(null); 
    }
  };

  const handleAddChild = () => {
    setLocalChildren([...localChildren, { name: '', dob: '', schoolName: '', schoolId: '', standard: '', classId: '' }]);
    setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
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
    const newChildren = localChildren.map((child, i) => {
        if (i === index) {
            return { ...child, [field]: value };
        }
        return child;
    });
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
    const newChildren = localChildren.map((child, index) => {
        if (index === datePickerIndex) {
            return { ...child, dob: formattedDate };
        }
        return child;
    });
    setLocalChildren(newChildren);
    setCalendarVisible(false);
    Keyboard.dismiss();
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
      const windowHeight = Dimensions.get('window').height;
      const spaceBelow = windowHeight - (py + height) - verticalScale(20); 
      setDropdownMaxHeight(spaceBelow > 100 ? spaceBelow : verticalScale(200));

      setDropdownPosition({ top: py + height, left: px, width });
      setCurrentChildIndex(index);
      setCurrentField(field);
      setDropdownData(field === 'schoolName' ? schoolOptionsFromApi : classOptionsFromApi);
      setDropdownVisible(true);
    });
  };

  const handleSelectOption = option => {
    const childIndex = currentChildIndex;
    const newChildren = localChildren.map((child, index) => {
        if (index === childIndex) {
            if (currentField === 'schoolName') {
                return {
                    ...child,
                    schoolName: option.school_name,
                    schoolId: option.school_id,
                    standard: '', 
                    classId: '',  
                };
            } else if (currentField === 'standard') {
                return {
                    ...child,
                    standard: option.class_number,
                    classId: option.class_id,
                };
            }
        }
        return child;
    });
    setLocalChildren(newChildren);

    if (currentField === 'schoolName') {
        GetClassData(option.school_id, childIndex);
    }

    setDropdownVisible(false);
    Keyboard.dismiss();
  };

  // Central function to update AsyncStorage
  const updateChildrenExtraData = async (childrenToUpdate) => {
    if (!userId) return;
    const storageKey = `children_extra_data_${userId}`;
    try {
        const existingDataString = await AsyncStorage.getItem(storageKey);
        const existingData = existingDataString ? JSON.parse(existingDataString) : {};
        
        childrenToUpdate.forEach(child => {
            // Use the permanent child ID as the key
            existingData[child.id] = {
                school_name: child.schoolName,
                class_name: child.standard,
            };
        });

        await AsyncStorage.setItem(storageKey, JSON.stringify(existingData));
    } catch (e) {
        console.error("Failed to update children's extra data in AsyncStorage", e);
    }
  };

  const handleUpdateSingleChild = async (child) => {
    if (!isChildModified(child)) {
        showMessage({ message: "No Changes", description: "No information was changed for this child.", type: "info" });
        return;
    }
    setUpdatingChildId(child.id);
    try {
        const formattedDob = child.dob.replace(/\//g, '-');
        const payload = {
            name: child.name,
            dob: formattedDob,
            class_id: String(child.classId),
            school_id: String(child.schoolId)
        };
        await apiPut(`/api/v1/children/${child.id}`, payload);

        // Update AsyncStorage with the changed data
        await updateChildrenExtraData([child]);

        const newOriginals = originalChildren.map(c => c.id === child.id ? { ...child } : c);
        setOriginalChildren(newOriginals);
        
        showMessage({ message: "Child Updated", description: `${child.name}'s information has been updated.`, type: "success" });
    } catch (error) {
        console.error('Failed to update child:', error);
        showMessage({ message: "Update Failed", description: "Could not update child. Please try again.", type: "danger" });
    } finally {
        setUpdatingChildId(null);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!userId) {
      showMessage({ message: "Session Error", description: "User ID not found. Please log in again.", type: "danger" });
      return;
    }

    const newChildrenForms = localChildren.filter(child => !child.id);
    const childrenToSave = newChildrenForms.filter(child => child.name && child.dob && child.classId && child.schoolId);
    
    if (newChildrenForms.length > 0 && newChildrenForms.length !== childrenToSave.length) {
        showMessage({ message: "Incomplete Information", description: "Please fill all details for the new child.", type: "warning" });
        return;
    }
    
    const childrenToUpdate = localChildren.filter(child => child.id && isChildModified(child));

    if (childrenToSave.length === 0 && childrenToUpdate.length === 0) {
      showMessage({ message: "No Changes", description: "There is no new information to save.", type: "info" });
      navigation.navigate(NavigationString.YourChildrenScreen, { refresh: true });
      return;
    }

    setIsLoading(true);
    try {
      const createPromises = childrenToSave.map(child => {
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

      const updatePromises = childrenToUpdate.map(child => {
          const formattedDob = child.dob.replace(/\//g, '-');
          const payload = {
            name: child.name,
            dob: formattedDob,
            class_id: String(child.classId),
            school_id: String(child.schoolId),
          };
          return apiPut(`/api/v1/children/${child.id}`, payload);
      });
      
      const createdChildrenResults = await Promise.all(createPromises);
      await Promise.all(updatePromises);

      // Combine newly created children (with their new IDs) and updated children
      const allUpdatedChildren = [
        ...childrenToUpdate,
        ...createdChildrenResults.map((newChild, index) => ({
            ...childrenToSave[index], // Get schoolName and standard from original form data
            id: newChild.id, // Use the new ID from the API response
        }))
      ];
      
      await updateChildrenExtraData(allUpdatedChildren);
      
      showMessage({ message: "Success!", description: "All changes have been saved successfully.", type: "success" });
      navigation.navigate(NavigationString.YourChildrenScreen, { refresh: true });

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
  
  const isChildModified = (child) => {
      if (!child.id) return false;
      const originalChild = originalChildren.find(c => c.id === child.id);
      if (!originalChild) return false;

      const nameChanged = child.name !== originalChild.name;
      const dobChanged = child.dob !== originalChild.dob;
      const schoolChanged = String(child.schoolId) !== String(originalChild.schoolId);
      const classChanged = String(child.classId) !== String(originalChild.classId);

      return nameChanged || dobChanged || schoolChanged || classChanged;
  };

  const DropdownModal = () => (
    <Modal transparent={true} visible={isDropdownVisible} onRequestClose={() => setDropdownVisible(false)}>
      <TouchableOpacity style={styles.modalOverlay} onPress={() => setDropdownVisible(false)}>
        <View style={[styles.modalContent, { top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width, maxHeight: dropdownMaxHeight }]}>
          <FlatList
            data={dropdownData}
            keyExtractor={(item, index) => `${item.school_id || item.class_id}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectOption(item)}>
                <Text style={styles.modalItemText}>{item.school_name || item.class_number}</Text>
              </TouchableOpacity>
            )}
            nestedScrollEnabled={true}
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
                                renderItem={({ item, index: monthIndex }) => (
                                    <TouchableOpacity style={styles.pickerItem} onPress={() => handleMonthSelect(monthIndex)}>
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
     <AdaptiveSafeAreaView>
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
          </View>

          {isEditMode && localChildren.length === 0 ? (
            <View style={styles.noChildrenContainer}>
                <Text style={styles.noChildrenText}>You have not added any children yet. Please add a child.</Text>
            </View>
           ) : (
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <MaterialIcons name="school" size={scale(20)} color={Colors.primary} />
              <Text style={styles.formTitle}>Children Information</Text>
            </View>
            <Text style={styles.formSubtitle}>Add details for each child to get personalized book recommendations</Text>
            {localChildren.map((child, index) => {
                const isModified = isChildModified(child);
                return (
                    <View key={child.id || `new-${index}`} style={styles.childFormSection}>
                        {child.id ? (
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
                            style={styles.input}
                            placeholder="Enter child's name" 
                            placeholderTextColor={Colors.textMuted} 
                            value={child.name} 
                            onChangeText={text => handleTextInputChange(index, 'name', text)}
                        />
                        
                        <Text style={styles.inputLabel}>Date of Birth</Text>
                        <TouchableOpacity 
                            style={styles.input}
                            onPress={() => openCalendarForChild(index)}
                        >
                            <Text style={child.dob ? styles.dateText : styles.datePlaceholder}>
                                {child.dob || 'YYYY/MM/DD'}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.inputLabel}>School Name</Text>
                        <TouchableOpacity 
                            ref={el => (schoolDropdownRefs.current[index] = el)}
                            style={styles.dropdown}
                            onPress={() => openDropdown(index, 'schoolName', schoolDropdownRefs.current[index])}
                        >
                          <Text style={child.schoolName ? styles.dropdownTextSelected : styles.dropdownText}>{child.schoolName || 'Select school'}</Text>
                          <MaterialIcons name="keyboard-arrow-down" size={scale(20)} color={Colors.textMuted} />
                        </TouchableOpacity>

                        <Text style={styles.inputLabel}>Class</Text>
                        <TouchableOpacity 
                            ref={el => (classDropdownRefs.current[index] = el)}
                            style={[styles.dropdown, !child.schoolId && styles.inputDisabled]}
                            onPress={() => openDropdown(index, 'standard', classDropdownRefs.current[index])} 
                            disabled={!child.schoolId || loadingClassesForIndex === index}
                        >
                          {loadingClassesForIndex === index ? (
                            <ActivityIndicator size="small" color={Colors.primary} />
                          ) : (
                            <>
                              <Text style={child.standard ? styles.dropdownTextSelected : styles.dropdownText}>
                                {child.standard || 'Select class'}
                              </Text>
                              <MaterialIcons name="keyboard-arrow-down" size={scale(20)} color={Colors.textMuted} />
                            </>
                          )}
                        </TouchableOpacity>
                        
                        {isModified && (
                            <TouchableOpacity 
                                style={styles.updateChildButton} 
                                onPress={() => handleUpdateSingleChild(child)}
                                disabled={updatingChildId === child.id}
                            >
                                {updatingChildId === child.id ? 
                                    <ActivityIndicator color={Colors.textLight} /> : 
                                    <Text style={styles.updateChildButtonText}>Update Child</Text>
                                }
                            </TouchableOpacity>
                        )}
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
                  {isLoading ? <ActivityIndicator color={Colors.textLight} /> : <Text style={styles.continueButtonText}>{isEditMode ? "Save Changes" : "Save & Continue"}</Text>}
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
           )}
          <Text style={styles.termsText}>By continuing, you agree to our Terms of Service and Privacy Policy.</Text>
        </ScrollView>
        <DropdownModal />
        <CalendarModal />
      </KeyboardAvoidingView>
    </View>
    </AdaptiveSafeAreaView>
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
    updateChildButton: {
      backgroundColor: "#000",
      paddingVertical: verticalScale(12),
      borderRadius: moderateScale(8),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: verticalScale(4),
    },
    updateChildButtonText: {
        color: Colors.textLight,
        fontSize: fontScale(14),
        fontWeight: 'bold',
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
    noChildrenContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: scale(20),
    },
    noChildrenText: {
      fontSize: fontScale(16),
      color: Colors.textSecondary,
      textAlign: 'center',
    },
  });

export default AddChildScreen;