import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { showMessage } from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';
import { apiPost, apiGet } from '../../api/api';
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';

const DeliveryAddress = ({ route, navigation }) => {
const [isLoading, setIsLoading] = useState(false);
const [isCheckingAddress, setIsCheckingAddress] = useState(true);
const [orderData, setOrderData] = useState(null);
const [fromPaymentScreen, setFromPaymentScreen] = useState(false);
const [address, setAddress] = useState({
fullName: '', phone: '', addressLine1: '', addressLine2: '',
pincode: '', city: '', state: '', country: 'India'
});

useEffect(() => {
    const initializeAndCheckAddress = async () => {
        let currentOrderData;
        let isFromPayment = false;
        
        try {
            const params = route.params || {};
            
            if (params.fromPaymentScreen) {
                isFromPayment = true;
                setFromPaymentScreen(true);
                currentOrderData = params.orderData;
            } else if (params.orderData) {
                currentOrderData = params.orderData;
            } else if (params.child && params.pkg) {
                currentOrderData = { isFromCart: false, ...params };
            } else {
                const cartDetails = await apiGet('/api/v1/cart');
                if (!cartDetails || cartDetails.quantity === 0) {
                    showMessage({ message: 'Your cart is empty', type: 'warning' });
                    navigation.goBack();
                    return;
                }
                currentOrderData = { isFromCart: true, cart: cartDetails };
            }
            
            setOrderData(currentOrderData);

            if (isFromPayment) {
                setIsCheckingAddress(false);
                return;
            }

            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                const savedAddresses = await apiGet(`/api/v1/address/user/${userId}`);
                if (savedAddresses && savedAddresses.length > 0) {
                    navigation.replace(NavigationString.PaymentDetailes, {
                        orderData: currentOrderData,
                        address: savedAddresses[0],
                    });
                    return;
                }
            }
            setIsCheckingAddress(false);
        } catch (error) {
            console.error("Initialization or Address Check Error:", error);
            showMessage({ message: "Error", description: "Could not proceed to checkout.", type: "danger" });
            setIsCheckingAddress(false);
            navigation.goBack();
        }
    };

    initializeAndCheckAddress();
}, [route.params, navigation]);

const subtotal = orderData ? (orderData.isFromCart ? parseFloat(orderData.cart.total_amount) : orderData.pkg.price) : 0;
const total = subtotal;

const getInitials = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
};

const handleGoBack = () => {
    if (fromPaymentScreen) {
        navigation.goBack();
    } else {
        navigation.goBack();
    }
};

const handleContinueToPayment = async () => {
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.pincode || !address.city || !address.state) {
        Alert.alert("Incomplete Address", "Please fill all required fields.");
        return;
    }
    setIsLoading(true);
    try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
            showMessage({ message: "Authentication Error", description: "User ID not found.", type: "danger" });
            setIsLoading(false);
            return;
        }
        const payload = {
            user_id: parseInt(userId, 10), address_line1: address.addressLine1, address_line2: address.addressLine2 || '',
            city: address.city, state: address.state, pincode: address.pincode, country: address.country,
            address_type: "Shipping", fullName: address.fullName, phone: address.phone
        };
        const response = await apiPost('/api/v1/address', payload);
        navigation.navigate(NavigationString.PaymentDetailes, {
            orderData,
            address: { ...address, address_id: response.address_id },
        });
    } catch (error) {
        console.error("Failed to save address:", error.response?.data || error);
        showMessage({ message: "Error", description: "Could not save your address.", type: "danger" });
    } finally {
        setIsLoading(false);
    }
};

if (isCheckingAddress) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Checking for saved addresses...</Text>
        </View>
    );
}

return (
    <AdaptiveSafeAreaView>
    <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack}><MaterialIcons name="arrow-back" size={scale(24)} color={Colors.textPrimary} /></TouchableOpacity>
            <View><Text style={styles.headerTitle}>Add Delivery Address</Text><Text style={styles.headerSubtitle}>Step 1 of 2</Text></View>
            <View style={{width: scale(24)}} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {orderData && (
                <View style={styles.card}>
                    <View style={styles.sectionHeader}><MaterialCommunityIcons name="file-document-outline" size={scale(18)} color={Colors.primary} /><Text style={styles.sectionTitle}>Order Summary</Text></View>
                    <View style={styles.itemRow}>
                        <View style={styles.itemDetails}>
                            <View style={styles.itemAvatar}>
                                {orderData.isFromCart ?
                                    <MaterialCommunityIcons name="cart" size={scale(20)} color={Colors.primary} /> :
                                    <Text style={styles.itemAvatarText}>{getInitials(orderData.child.name)}</Text>
                                }
                            </View>
                            <View>
                                {orderData.isFromCart ? (
                                    <><Text style={styles.itemName}>Items from Cart</Text><Text style={styles.itemFor}>Total Items: {orderData.cart.quantity}</Text></>
                                ) : (
                                    <><Text style={styles.itemName} numberOfLines={1}>{orderData.pkg.title}</Text><Text style={styles.itemFor}>For {orderData.child.name} • {orderData.child.standard} standard</Text></>
                                )}
                            </View>
                        </View>
                        <Text style={styles.itemPrice}>₹{subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.priceBreakdown}>
                        <View style={styles.priceRow}><Text style={styles.priceLabel}>Subtotal</Text><Text style={styles.priceValue}>₹{subtotal.toFixed(2)}</Text></View>
                        <View style={[styles.priceRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>₹{total.toFixed(2)}</Text></View>
                    </View>
                </View>
            )}
            <View style={styles.card}>
                 <View style={styles.sectionHeader}><MaterialIcons name="location-on" size={scale(18)} color={Colors.primary} /><Text style={styles.sectionTitle}>Shipping Address</Text></View>
                <Text style={styles.sectionSubtitle}>Where should we deliver your order?</Text>
                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}><Text style={styles.inputLabel}>Full Name</Text><TextInput style={styles.input} value={address.fullName} onChangeText={t => setAddress({...address, fullName: t})} /></View>
                    <View style={styles.inputGroup}><Text style={styles.inputLabel}>Phone Number</Text><TextInput style={styles.input} value={address.phone} keyboardType="phone-pad" onChangeText={t => setAddress({...address, phone: t})} maxLength={10} /></View>
                </View>
                <View style={styles.inputGroupFull}><Text style={styles.inputLabel}>Address</Text><TextInput style={styles.input} value={address.addressLine1} placeholder="House No, Building, Street" onChangeText={t => setAddress({...address, addressLine1: t})} /></View>
                <View style={styles.inputGroupFull}><Text style={styles.inputLabel}>Landmark</Text><TextInput style={styles.input} value={address.addressLine2} placeholder="Near City Park" onChangeText={t => setAddress({...address, addressLine2: t})} /></View>
                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}><Text style={styles.inputLabel}>Pincode</Text><TextInput style={styles.input} value={address.pincode} keyboardType="number-pad" onChangeText={t => setAddress({...address, pincode: t})} maxLength={6} /></View>
                    <View style={styles.inputGroup}><Text style={styles.inputLabel}>City</Text><TextInput style={styles.input} value={address.city} onChangeText={t => setAddress({...address, city: t})} /></View>
                </View>
                <View style={styles.inputRow}>
                     <View style={styles.inputGroup}><Text style={styles.inputLabel}>State</Text><TextInput style={styles.input} value={address.state} onChangeText={t => setAddress({...address, state: t})} /></View>
                    <View style={styles.inputGroup}><Text style={styles.inputLabel}>Country</Text><TextInput style={styles.input} value={address.country} editable={false} /></View>
                </View>
            </View>
        </ScrollView>
        <View style={styles.footer}>
            <TouchableOpacity style={[styles.paymentButton, isLoading && styles.disabledButton]} onPress={handleContinueToPayment} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color={Colors.textLight} /> : <Text style={styles.paymentButtonText}>Save and Continue</Text>}
            </TouchableOpacity>
        </View>
    </View>
    </AdaptiveSafeAreaView>
);
};

const styles = StyleSheet.create({
loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.backgroundLight },
loadingText: { marginTop: 15, fontSize: fontScale(14), color: Colors.textSecondary },
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
itemAvatar: { width: scale(40), height: scale(40), borderRadius: moderateScale(8), backgroundColor: Colors.backgroundPrimaryLight, justifyContent: 'center', alignItems: 'center', marginRight: scale(12) },
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