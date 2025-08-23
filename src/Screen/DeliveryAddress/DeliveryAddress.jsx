import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { showMessage } from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';
import { apiPost } from '../../api/api';

const DeliveryAddress = ({ route, navigation }) => {
    const { child, pkg } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [address, setAddress] = useState({
        fullName: child.name,
        phone: '',
        addressLine1: '',
        addressLine2: '',
        pincode: '',
        city: '',
        state: '',
        country: 'India'
    });

    const deliveryFee = 49;
    const subtotal = pkg.price;
    const total = subtotal + deliveryFee;

    const getInitials = (name) => {
        if (!name) return '';
        return name.charAt(0).toUpperCase();
    };

    const handleContinueToPayment = async () => {
        if (!address.fullName || !address.phone || !address.addressLine1 || !address.pincode || !address.city || !address.state || !address.country) {
            Alert.alert("Incomplete Address", "Please fill all the required address details to continue.");
            return;
        }
        
        setIsLoading(true);

        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                showMessage({ message: "Authentication Error", description: "Could not find user ID. Please log in again.", type: "danger" });
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

            const response = await apiPost('/api/v1/address', payload);

            showMessage({
                message: "Address Saved",
                description: "Your delivery address has been saved.",
                type: "success",
            });

            navigation.navigate(NavigationString.PaymentDetailes, {
                child: child,
                pkg: pkg,
                address: { ...address, address_id: response.address_id },
            });

        } catch (error) {
            console.error("Failed to save address:", error.response?.data || error);
            showMessage({
                message: "Error",
                description: "Could not save your address. Please try again.",
                type: "danger",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={scale(24)} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Add Delivery Address</Text>
                    <Text style={styles.headerSubtitle}>Step 1 of 2</Text>
                </View>
                <View style={{width: scale(24)}} />
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="file-document-outline" size={scale(18)} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                    </View>
                    <View style={styles.itemRow}>
                        <View style={styles.itemDetails}>
                            <View style={styles.itemAvatar}>
                                <Text style={styles.itemAvatarText}>{getInitials(child.name)}</Text>
                            </View>
                            <View>
                                <Text style={styles.itemName} numberOfLines={1}>{pkg.title}</Text>
                                <Text style={styles.itemFor}>For {child.name} • {child.standard} standard</Text>
                            </View>
                        </View>
                        <Text style={styles.itemPrice}>₹{subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.priceBreakdown}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Subtotal</Text>
                            <Text style={styles.priceValue}>₹{subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Delivery</Text>
                            <Text style={styles.priceValue}>₹{deliveryFee.toFixed(2)}</Text>
                        </View>
                         <View style={[styles.priceRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                     <View style={styles.sectionHeader}>
                        <MaterialIcons name="location-on" size={scale(18)} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Shipping Address</Text>
                    </View>
                    <Text style={styles.sectionSubtitle}>Where should we deliver your order?</Text>
                    
                    <View style={styles.inputRow}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput style={styles.input} value={address.fullName} onChangeText={t => setAddress({...address, fullName: t})} />
                        </View>
                         <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput style={styles.input} value={address.phone} keyboardType="phone-pad" onChangeText={t => setAddress({...address, phone: t})} maxLength={10} />
                        </View>
                    </View>
                     <View style={styles.inputGroupFull}>
                        <Text style={styles.inputLabel}>Address (House No, Building, Street)</Text>
                        <TextInput style={styles.input} placeholder="e.g. 123, Sunshine Apartments" placeholderTextColor={Colors.textMuted} onChangeText={t => setAddress({...address, addressLine1: t})} />
                    </View>
                     <View style={styles.inputGroupFull}>
                        <Text style={styles.inputLabel}>Landmark</Text>
                        <TextInput style={styles.input} placeholder="e.g. Near City Park" placeholderTextColor={Colors.textMuted} onChangeText={t => setAddress({...address, addressLine2: t})} />
                    </View>

                     <View style={styles.inputRow}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Pincode</Text>
                            <TextInput style={styles.input} keyboardType="number-pad" onChangeText={t => setAddress({...address, pincode: t})} maxLength={6} />
                        </View>
                         <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>City</Text>
                            <TextInput style={styles.input} onChangeText={t => setAddress({...address, city: t})} />
                        </View>
                    </View>
                    <View style={styles.inputRow}>
                         <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>State</Text>
                            <TextInput style={styles.input} onChangeText={t => setAddress({...address, state: t})} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Country</Text>
                            <TextInput style={styles.input} value={address.country} editable={false} />
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.paymentButton, isLoading && styles.disabledButton]} onPress={handleContinueToPayment} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color={Colors.textLight} />
                    ) : (
                        <Text style={styles.paymentButtonText}>Save and Continue</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: moderateScale(16), backgroundColor: Colors.backgroundLight },
    headerTitle: { fontSize: fontScale(18), fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
    headerSubtitle: { fontSize: fontScale(12), color: Colors.textSecondary, textAlign: 'center' },
    content: { flexGrow: 1, padding: scale(16), backgroundColor: Colors.backgroundLight },
    card: { backgroundColor: Colors.WhiteBackgroudcolor, borderRadius: moderateScale(12), padding: moderateScale(14), marginBottom: verticalScale(20), elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(4) },
    sectionTitle: { fontSize: fontScale(14), fontWeight: 'bold', color: Colors.textDark, marginLeft: scale(8) },
    sectionSubtitle: { fontSize: fontScale(12), color: Colors.textMuted, marginLeft: scale(26), marginBottom: verticalScale(12) },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: verticalScale(10) },
    itemDetails: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    itemAvatar: { width: scale(32), height: scale(32), borderRadius: moderateScale(8), backgroundColor: Colors.backgroundPrimaryLight, justifyContent: 'center', alignItems: 'center', marginRight: scale(10) },
    itemAvatarText: { fontSize: fontScale(16), fontWeight: 'bold', color: Colors.primary },
    itemName: { fontSize: fontScale(14), fontWeight: 'bold', color: Colors.textDark, flexShrink: 1 },
    itemFor: { fontSize: fontScale(12), color: Colors.textSecondary },
    itemPrice: { fontSize: fontScale(14), fontWeight: 'bold', color: Colors.textDark, marginLeft: scale(8) },
    priceBreakdown: { borderTopWidth: 1, borderTopColor: Colors.borderLight, marginTop: verticalScale(10), paddingTop: verticalScale(10) },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(6) },
    priceLabel: { fontSize: fontScale(13), color: Colors.textSecondary },
    priceValue: { fontSize: fontScale(13), color: Colors.textDark },
    totalRow: { borderTopWidth: 1, borderTopColor: Colors.borderLight, marginTop: verticalScale(4), paddingTop: verticalScale(10) },
    totalLabel: { fontSize: fontScale(14), fontWeight: 'bold', color: Colors.textDark },
    totalValue: { fontSize: fontScale(14), fontWeight: 'bold', color: Colors.success },
    inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: -scale(4) },
    inputGroup: { flex: 1, marginHorizontal: scale(4) },
    inputGroupFull: { marginHorizontal: scale(4) },
    inputLabel: { fontSize: fontScale(12), color: Colors.textSecondary, marginBottom: verticalScale(6), marginTop: verticalScale(8) },
    input: { borderWidth: 1, borderColor: Colors.border, borderRadius: moderateScale(8), paddingHorizontal: scale(12), backgroundColor: Colors.backgroundFaded, fontSize: fontScale(14), color: Colors.textDark, height: verticalScale(45) },
    footer: { padding: moderateScale(16), backgroundColor: Colors.WhiteBackgroudcolor, borderTopWidth: 1, borderTopColor: Colors.borderLight },
    paymentButton: { backgroundColor: Colors.primary, paddingVertical: verticalScale(14), borderRadius: moderateScale(8), alignItems: 'center' },
    disabledButton: { backgroundColor: Colors.primary, opacity: 0.7 },
    paymentButtonText: { color: Colors.textLight, fontSize: fontScale(16), fontWeight: 'bold' },
});

export default DeliveryAddress;