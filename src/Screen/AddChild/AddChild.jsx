import React, { useState, useRef, useCallback } from 'react';
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
    Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { setChildren } from '../../Redux/childSlice/childSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';

const AddChildScreen = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const persistedChildren = useSelector((state) => state.child.children);
    const persistedMobileNumber = useSelector((state) => state.auth.user?.mobileNumber);
    
    const isEditMode = route.params?.editMode || false;

    const mobileNumber = route.params?.mobileNumber || persistedMobileNumber;

    const [localChildren, setLocalChildren] = useState([]);
    const [childrenStatus, setChildrenStatus] = useState([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownData, setDropdownData] = useState([]);
    const [currentChildIndex, setCurrentChildIndex] = useState(null);
    const [currentField, setCurrentField] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

    const ageDropdownRefs = useRef([]);
    const classDropdownRefs = useRef([]);
    
    useFocusEffect(
        useCallback(() => {
            const initialForms = isEditMode && persistedChildren.length > 0
                ? persistedChildren
                : [{ name: '', age: '', standard: '', schoolName: '' }];
            setLocalChildren(initialForms);

            if (isEditMode && persistedChildren.length > 0) {
                setChildrenStatus(persistedChildren.map(() => 'saved'));
            } else {
                setChildrenStatus(initialForms.map(() => 'new'));
            }
        }, [isEditMode, persistedChildren])
    );

    const ageOptions = [
        '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
        '13', '14', '15', '16', '17', '18', '19', '20', '21+'
    ];

    const classOptions = [
        'Nursery', 'LKG', 'UKG',
        '1', '2', '3', '4', '5', '6',
        '7', '8', '9', '10', '11', '12'
    ];

    const handleAddChild = () => {
        setLocalChildren([...localChildren, { name: '', age: '', standard: '', schoolName: '' }]);
        setChildrenStatus([...childrenStatus, 'new']);
    };

    const handleRemoveChild = (index) => {
        if (localChildren.length > 1) {
            const newChildren = [...localChildren];
            newChildren.splice(index, 1);
            setLocalChildren(newChildren);

            const newStatus = [...childrenStatus];
            newStatus.splice(index, 1);
            setChildrenStatus(newStatus);
        }
    };

    const handleChildDataChange = (index, field, value) => {
        const newChildren = [...localChildren];
        newChildren[index] = { ...newChildren[index], [field]: value };
        setLocalChildren(newChildren);

        if (childrenStatus[index] === 'saved') {
            const newStatus = [...childrenStatus];
            newStatus[index] = 'editing';
            setChildrenStatus(newStatus);
        }
    };

    const openDropdown = (index, field, ref) => {
        if (!ref) return;
        ref.measure((fx, fy, width, height, px, py) => {
            setDropdownPosition({ top: py + height, left: px, width });
            setCurrentChildIndex(index);
            setCurrentField(field);
            setDropdownData(field === 'age' ? ageOptions : classOptions);
            setDropdownVisible(true);
        });
    };

    const handleSelectOption = (option) => {
        handleChildDataChange(currentChildIndex, currentField, option);
        setDropdownVisible(false);
    };

    const handleSaveAndContinue = () => {
        const childrenToSave = localChildren.filter(
            child => child.name && child.age && child.standard && child.schoolName
        );

        if (localChildren.some(c => c.name || c.age || c.standard || c.schoolName) && childrenToSave.length !== localChildren.length) {
            Alert.alert("Incomplete Details", "Please fill all details for the children you've added.");
            return;
        }

        if (childrenToSave.length === 0) {
            navigation.navigate(NavigationString.YourChildren);
            return;
        }

        if (isEditMode) {
            dispatch(setChildren(childrenToSave));
        } else {
            dispatch(setChildren([...persistedChildren, ...childrenToSave]));
        }

        setChildrenStatus(childrenToSave.map(() => 'saved'));

        navigation.navigate(NavigationString.YourChildrenScreen);
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
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setDropdownVisible(false)}>
                <View style={[styles.modalContent, { top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }]}>
                    <FlatList
                        data={dropdownData}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectOption(item)}>
                                <Text style={styles.modalItemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.headerContainer}>
                        <View style={styles.logoContainer}>
                            <MaterialCommunityIcons name="book-open-variant" size={scale(35)} color={Colors.textLight} />
                        </View>
                        <Text style={styles.title}>Almost There!</Text>
                        <Text style={styles.subtitle}>Tell us about your children to personalize their learning</Text>
                    </View>

                    <View style={styles.loggedInContainer}>
                        <View style={styles.loggedInIconCircle}>
                            <MaterialIcons name="check" size={scale(20)} color={Colors.success} />
                        </View>
                        <View>
                            <Text style={styles.loggedInText}>Logged in as</Text>
                            <Text style={styles.loggedInNumber}>+91 {mobileNumber}</Text>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.formHeader}>
                            <MaterialIcons name="school" size={scale(20)} color={Colors.primary} />
                            <Text style={styles.formTitle}>Children Information</Text>
                        </View>
                        <Text style={styles.formSubtitle}>Add details for each child to get personalized book recommendations</Text>

                        {localChildren.map((child, index) => (
                            <View key={index} style={[styles.childFormSection, childrenStatus[index] === 'saved' && styles.childFormSectionSaved]}>
                                {localChildren.length > 1 && (
                                    <TouchableOpacity style={styles.removeChildButton} onPress={() => handleRemoveChild(index)}>
                                        <MaterialCommunityIcons name="delete" size={scale(22)} color={Colors.danger} />
                                    </TouchableOpacity>
                                )}
                                <Text style={[styles.childLabel, childrenStatus[index] === 'saved' && styles.childLabelSaved]}>
                                    Child {index + 1} {childrenStatus[index] === 'saved' && '(Saved)'}
                                </Text>

                                <Text style={styles.inputLabel}>Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter child's name"
                                    placeholderTextColor={Colors.textMuted}
                                    value={child.name}
                                    onChangeText={(text) => handleChildDataChange(index, 'name', text)}
                                    
                                />

                                <Text style={styles.inputLabel}>Age</Text>
                                <TouchableOpacity
                                    ref={el => ageDropdownRefs.current[index] = el}
                                    style={styles.dropdown}
                                    onPress={() => openDropdown(index, 'age', ageDropdownRefs.current[index])}
                                >
                                    <Text style={child.age ? styles.dropdownTextSelected : styles.dropdownText}>{child.age || 'Select age'}</Text>
                                    <MaterialIcons name="keyboard-arrow-down" size={scale(20)} color={Colors.textMuted} />
                                </TouchableOpacity>

                                <Text style={styles.inputLabel}>Class</Text>
                                <TouchableOpacity
                                    ref={el => classDropdownRefs.current[index] = el}
                                    style={styles.dropdown}
                                    onPress={() => openDropdown(index, 'standard', classDropdownRefs.current[index])}
                                >
                                    <Text style={child.standard ? styles.dropdownTextSelected : styles.dropdownText}>{child.standard || 'Select class'}</Text>
                                    <MaterialIcons name="keyboard-arrow-down" size={scale(20)} color={Colors.textMuted} />
                                </TouchableOpacity>

                                <Text style={styles.inputLabel}>School Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter school name"
                                    placeholderTextColor={Colors.textMuted}
                                    value={child.schoolName}
                                    onChangeText={(text) => handleChildDataChange(index, 'schoolName', text)}
                                />
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addChildButton} onPress={handleAddChild}>
                            <MaterialIcons name="add" size={scale(18)} color={Colors.primary} />
                            <Text style={styles.addChildText}>Add Another Child</Text>
                        </TouchableOpacity>

                        <View style={styles.footerButtons}>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.continueButton} onPress={handleSaveAndContinue}>
                                    <Text style={styles.continueButtonText}>Continue To ClassStore</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundLight,
    },
    content: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(30),
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: verticalScale(15),
    },
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
    loggedInText: {
        color: Colors.textLight,
        fontSize: fontScale(12),
    },
    loggedInNumber: {
        color: Colors.textLight,
        fontSize: fontScale(14),
        fontWeight: '500',
    },
    formContainer: {
        width: '100%',
        backgroundColor: Colors.WhiteBackgroudcolor,
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
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
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
    childFormSectionSaved: {
        backgroundColor: '#17d6241b', 
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
    childLabelSaved: {
        color: Colors.textSecondary,
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
    dropdownText: {
        fontSize: fontScale(14),
        color: Colors.textMuted,
    },
    dropdownTextSelected: {
        fontSize: fontScale(14),
        color: Colors.textDark,
    },
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
    footerButtons: {
        width: '100%',
        marginTop: verticalScale(20),
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent:"space-evenly", 
        alignItems: "center"
    },
    continueButton: {
        backgroundColor: Colors.primary,
        paddingVertical: verticalScale(14),
        paddingHorizontal: scale(25),
        borderRadius: moderateScale(8),
        alignItems: 'center',
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
    modalOverlay: {
        flex: 1,
    },
    modalContent: {
        position: 'absolute',
        backgroundColor: Colors.WhiteBackgroudcolor,
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
    modalItemText: {
        fontSize: fontScale(14),
        color: Colors.textPrimary,
    },
});

export default AddChildScreen;