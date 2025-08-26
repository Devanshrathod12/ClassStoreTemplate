import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    Alert, 
    ActivityIndicator,
    FlatList 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { showMessage } from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import { apiPost, apiGet } from '../../api/api';
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';

const AddAddress = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [address, setAddress] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        pincode: '',
        city: '',
        state: '',
        country: 'India'
    });

    useEffect(() => {
        fetchSavedAddresses();
    }, []);

    const fetchSavedAddresses = async () => {
        try {
            setIsLoadingAddresses(true);
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                const addresses = await apiGet(`/api/v1/address/user/${userId}`);
                setSavedAddresses(addresses || []);
                if (addresses && addresses.length > 0) {
                    setSelectedAddressId(addresses[0].address_id);
                }
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!address.fullName || !address.phone || !address.addressLine1 || !address.pincode || !address.city || !address.state) {
            Alert.alert("Incomplete Address", "Please fill all required fields.");
            return;
        }

        setIsLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                showMessage({ 
                    message: "Authentication Error", 
                    description: "User ID not found.", 
                    type: "danger" 
                });
                setIsLoading(false);
                return;
            }

            const payload = {
                user_id: parseInt(userId, 10),
                address_line1: address.addressLine1,
                address_line2: address.addressLine2 || '',
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                country: address.country,
                address_type: "Shipping",
                fullName: address.fullName,
                phone: address.phone
            };

            await apiPost('/api/v1/address', payload);
            showMessage({ 
                message: "Success!", 
                description: "Address saved successfully.", 
                type: "success" 
            });
            
            // Reset form
            setAddress({
                fullName: '',
                phone: '',
                addressLine1: '',
                addressLine2: '',
                pincode: '',
                city: '',
                state: '',
                country: 'India'
            });
            setShowAddForm(false);
            
            // Refresh addresses list
            fetchSavedAddresses();
        } catch (error) {
            console.error("Failed to save address:", error.response?.data || error);
            showMessage({ 
                message: "Error", 
                description: "Could not save your address.", 
                type: "danger" 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderAddressItem = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.addressCard,
                selectedAddressId === item.address_id && styles.selectedAddressCard
            ]}
            onPress={() => setSelectedAddressId(item.address_id)}
        >
            <View style={styles.addressHeader}>
                <View style={styles.radioButton}>
                    {selectedAddressId === item.address_id && (
                        <View style={styles.radioButtonSelected} />
                    )}
                </View>
                <View style={styles.addressInfo}>
                    <Text style={styles.addressName}>{item.fullName}</Text>
                    <Text style={styles.addressPhone}>{item.phone}</Text>
                </View>
                <MaterialCommunityIcons 
                    name="home" 
                    size={scale(20)} 
                    color={selectedAddressId === item.address_id ? Colors.primary : Colors.textMuted} 
                />
            </View>
            <Text style={styles.addressDetails}>
                {item.address_line1}
                {item.address_line2 ? `, ${item.address_line2}` : ''}
            </Text>
            <Text style={styles.addressLocation}>
                {item.city}, {item.state} - {item.pincode}
            </Text>
        </TouchableOpacity>
    );

    if (isLoadingAddresses) {
        return (
            <AdaptiveSafeAreaView>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading addresses...</Text>
                </View>
            </AdaptiveSafeAreaView>
        );
    }

    return (
        <AdaptiveSafeAreaView>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={scale(24)} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Delivery Addresses</Text>
                        <Text style={styles.headerSubtitle}>Manage your addresses</Text>
                    </View>
                    <View style={{ width: scale(24) }} />
                </View>

                <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                    {/* Saved Addresses Section */}
                    {savedAddresses.length > 0 && (
                        <View style={styles.savedAddressesSection}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="location-on" size={scale(18)} color={Colors.primary} />
                                <Text style={styles.sectionTitle}>Saved Addresses</Text>
                            </View>
                            <FlatList
                                data={savedAddresses}
                                renderItem={renderAddressItem}
                                keyExtractor={(item) => item.address_id.toString()}
                                scrollEnabled={false}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    )}

                    {/* Add New Address Button */}
                    <TouchableOpacity 
                        style={styles.addAddressButton}
                        onPress={() => setShowAddForm(!showAddForm)}
                    >
                        <MaterialIcons 
                            name={showAddForm ? "remove" : "add"} 
                            size={scale(20)} 
                            color={Colors.primary} 
                        />
                        <Text style={styles.addAddressText}>
                            {showAddForm ? "Cancel" : "Add New Address"}
                        </Text>
                    </TouchableOpacity>

                    {/* Add Address Form */}
                    {showAddForm && (
                        <View style={styles.card}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons name="add-location" size={scale(18)} color={Colors.primary} />
                                <Text style={styles.sectionTitle}>New Address</Text>
                            </View>
                            <Text style={styles.sectionSubtitle}>Enter your delivery address details</Text>

                            <View style={styles.inputRow}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Full Name</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        value={address.fullName} 
                                        onChangeText={text => setAddress({...address, fullName: text})} 
                                        placeholder="Enter full name"
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Phone Number</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        value={address.phone} 
                                        keyboardType="phone-pad" 
                                        onChangeText={text => setAddress({...address, phone: text})} 
                                        maxLength={10}
                                        placeholder="Enter phone number"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroupFull}>
                                <Text style={styles.inputLabel}>Address</Text>
                                <TextInput 
                                    style={styles.input} 
                                    value={address.addressLine1} 
                                    placeholder="House No, Building, Street" 
                                    onChangeText={text => setAddress({...address, addressLine1: text})} 
                                />
                            </View>

                            <View style={styles.inputGroupFull}>
                                <Text style={styles.inputLabel}>Landmark (Optional)</Text>
                                <TextInput 
                                    style={styles.input} 
                                    value={address.addressLine2} 
                                    placeholder="Near City Park" 
                                    onChangeText={text => setAddress({...address, addressLine2: text})} 
                                />
                            </View>

                            <View style={styles.inputRow}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Pincode</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        value={address.pincode} 
                                        keyboardType="number-pad" 
                                        onChangeText={text => setAddress({...address, pincode: text})} 
                                        maxLength={6}
                                        placeholder="Enter pincode"
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>City</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        value={address.city} 
                                        onChangeText={text => setAddress({...address, city: text})} 
                                        placeholder="Enter city"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputRow}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>State</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        value={address.state} 
                                        onChangeText={text => setAddress({...address, state: text})} 
                                        placeholder="Enter state"
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Country</Text>
                                    <TextInput 
                                        style={[styles.input, { backgroundColor: Colors.backgroundFaded, color: Colors.textMuted }]}
                                        value={address.country} 
                                        editable={false}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity 
                                style={[styles.saveButton, isLoading && styles.disabledButton]} 
                                onPress={handleSaveAddress} 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color={Colors.textLight} />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Address</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </View>
        </AdaptiveSafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: Colors.background 
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.backgroundLight
    },
    loadingText: {
        marginTop: 15,
        fontSize: fontScale(14),
        color: Colors.textSecondary
    },
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
        textAlign: 'center' 
    },
    headerSubtitle: { 
        fontSize: fontScale(12), 
        color: Colors.textSecondary, 
        textAlign: 'center' 
    },
   
    savedAddressesSection: {
        padding: scale(15),
        paddingBottom: 0,
    },
    sectionHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: verticalScale(12) 
    },
    sectionTitle: { 
        fontSize: fontScale(16), 
        fontWeight: 'bold', 
        color: Colors.textDark, 
        marginLeft: scale(8) 
    },
    addressCard: {
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        marginBottom: verticalScale(12),
        borderWidth: 2,
        borderColor: Colors.borderLight,
       
    },
    selectedAddressCard: {
        borderColor: Colors.primary,
        backgroundColor: Colors.backgroundPrimaryLight,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    radioButton: {
        width: scale(20),
        height: scale(20),
        borderRadius: scale(10),
        borderWidth: 2,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    radioButtonSelected: {
        width: scale(10),
        height: scale(10),
        borderRadius: scale(5),
        backgroundColor: Colors.primary,
    },
    addressInfo: {
        flex: 1,
    },
    addressName: {
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    addressPhone: {
        fontSize: fontScale(12),
        color: Colors.textSecondary,
        marginTop: verticalScale(2),
    },
    addressDetails: {
        fontSize: fontScale(13),
        color: Colors.textDark,
        marginBottom: verticalScale(4),
        marginLeft: scale(32),
    },
    addressLocation: {
        fontSize: fontScale(12),
        color: Colors.textSecondary,
        marginLeft: scale(32),
    },
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        margin: scale(16),
        marginTop: 0,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
    },
    addAddressText: {
        fontSize: fontScale(14),
        fontWeight: '600',
        color: Colors.primary,
        marginLeft: scale(8),
    },
    card: { 
        backgroundColor: Colors.WhiteBackgroudcolor, 
        borderRadius: moderateScale(12), 
        padding: moderateScale(16), 
        margin: scale(16),
        marginTop: 0,
        elevation: 2, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 2 
    },
    sectionSubtitle: { 
        fontSize: fontScale(12), 
        color: Colors.textMuted, 
        marginLeft: scale(26), 
        marginBottom: verticalScale(16) 
    },
    inputRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginHorizontal: -scale(4) 
    },
    inputGroup: { 
        flex: 1, 
        marginHorizontal: scale(4) 
    },
    inputGroupFull: { 
        marginHorizontal: scale(4) 
    },
    inputLabel: { 
        fontSize: fontScale(12), 
        color: Colors.textSecondary, 
        marginBottom: verticalScale(6), 
        marginTop: verticalScale(8) 
    },
    input: { 
        borderWidth: 1, 
        borderColor: Colors.border, 
        borderRadius: moderateScale(8), 
        paddingHorizontal: scale(12), 
        backgroundColor: Colors.backgroundFaded, 
        fontSize: fontScale(14), 
        color: Colors.textDark, 
        height: verticalScale(45) 
    },
    saveButton: { 
        backgroundColor: Colors.primary, 
        paddingVertical: verticalScale(14), 
        borderRadius: moderateScale(8), 
        alignItems: 'center',
        marginTop: verticalScale(16),
    },
    disabledButton: { 
        backgroundColor: Colors.primary, 
        opacity: 0.7 
    },
    saveButtonText: { 
        color: Colors.textLight, 
        fontSize: fontScale(16), 
        fontWeight: 'bold' 
    },
});

export default AddAddress;