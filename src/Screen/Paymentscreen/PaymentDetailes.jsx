// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     SafeAreaView,
//     StatusBar,
//     ScrollView,
//     TouchableOpacity
// } from 'react-native';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// import Colors from '../../styles/colors';
// import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
// import NavigationString from '../../Navigation/NavigationString';

// const PaymentDetailes = ({ route, navigation }) => {
//     const { child, pkg, address } = route.params;
//     const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or ONLINE

//     const deliveryFee = 49;
//     const subtotal = pkg.price;
//     const total = subtotal + deliveryFee;

//     const getInitials = (name) => {
//         if (!name) return '';
//         return name.charAt(0).toUpperCase();
//     };

//     const handlePlaceOrder = () => {
//         navigation.navigate(NavigationString.Order, {
//             child: child,
//             pkg: pkg,
//             address: address,
//             total: total,
//             paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'
//         });
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={() => navigation.goBack()}>
//                     <MaterialIcons name="arrow-back" size={scale(24)} color={Colors.textPrimary} />
//                 </TouchableOpacity>
//                 <View>
//                     <Text style={styles.headerTitle}>Payment</Text>
//                     <Text style={styles.headerSubtitle}>Step 2 of 2</Text>
//                 </View>
//                 <View style={{width: scale(24)}} />
//             </View>

//             <ScrollView contentContainerStyle={styles.content}>
//                 <View style={styles.card}>
//                     <View style={styles.sectionHeader}>
//                         <MaterialCommunityIcons name="file-document-outline" size={scale(18)} color={Colors.primary} />
//                         <Text style={styles.sectionTitle}>Order Summary</Text>
//                     </View>
//                     <View style={styles.itemRow}>
//                         <View style={styles.itemDetails}>
//                             <View style={styles.itemAvatar}>
//                                 <Text style={styles.itemAvatarText}>{getInitials(child.name)}</Text>
//                             </View>
//                             <View>
//                                 <Text style={styles.itemName}>{pkg.title}</Text>
//                                 <Text style={styles.itemFor}>For {child.name} • {child.standard} standard</Text>
//                             </View>
//                         </View>
//                          <View>
//                             <Text style={styles.itemPrice}>₹{pkg.price}</Text>
//                             <Text style={styles.itemOriginalPrice}>₹{pkg.originalPrice}</Text>
//                         </View>
//                     </View>
//                     <View style={styles.priceBreakdown}>
//                         <View style={styles.priceRow}>
//                             <Text style={styles.priceLabel}>Subtotal</Text>
//                             <Text style={styles.priceValue}>₹{subtotal}</Text>
//                         </View>
//                         <View style={styles.priceRow}>
//                             <Text style={styles.priceLabel}>Delivery</Text>
//                             <Text style={styles.priceValue}>₹{deliveryFee}</Text>
//                         </View>
//                          <View style={[styles.priceRow, styles.totalRow]}>
//                             <Text style={styles.totalLabel}>Total</Text>
//                             <Text style={styles.totalValue}>₹{total}</Text>
//                         </View>
//                     </View>
//                 </View>

//                 <View style={styles.card}>
//                      <View style={styles.sectionHeader}>
//                         <MaterialIcons name="payment" size={scale(18)} color={Colors.primary} />
//                         <Text style={styles.sectionTitle}>Payment Method</Text>
//                     </View>
//                     <Text style={styles.sectionSubtitle}>Choose your preferred payment method</Text>
                    
//                     <TouchableOpacity style={styles.paymentOption} onPress={() => setPaymentMethod('COD')}>
//                         <MaterialCommunityIcons name={paymentMethod === 'COD' ? 'radiobox-marked' : 'radiobox-blank'} size={scale(20)} color={Colors.primary} />
//                         <View style={styles.paymentTextContainer}>
//                             <Text style={styles.paymentTitle}>Cash on Delivery</Text>
//                             <Text style={styles.paymentSubtitle}>Pay when your order arrives</Text>
//                         </View>
//                         <View style={styles.recommendedTag}><Text style={styles.recommendedText}>Recommended</Text></View>
//                     </TouchableOpacity>
                    
//                      <TouchableOpacity style={styles.paymentOption} onPress={() => setPaymentMethod('ONLINE')} disabled={true}>
//                         <MaterialCommunityIcons name={paymentMethod === 'ONLINE' ? 'radiobox-marked' : 'radiobox-blank'} size={scale(20)} color={Colors.border} />
//                         <View style={styles.paymentTextContainer}>
//                             <Text style={[styles.paymentTitle, {color: Colors.textMuted}]}>Online Payment</Text>
//                             <Text style={[styles.paymentSubtitle, {color: Colors.textMuted}]}>UPI, Cards, Net Banking</Text>
//                         </View>
//                         <View style={styles.comingSoonTag}><Text style={styles.comingSoonText}>Coming Soon</Text></View>
//                     </TouchableOpacity>
//                 </View>

//                 {paymentMethod === 'COD' && (
//                     <View style={styles.codInfoBox}>
//                         <MaterialCommunityIcons name="cash" size={scale(20)} color={Colors.primary} />
//                         <View style={{flex: 1, marginLeft: scale(10)}}>
//                             <Text style={styles.codInfoTitle}>Cash on Delivery</Text>
//                             <Text style={styles.codInfoSubtitle}>Pay ₹{total} in cash when your order is delivered. Please keep exact change ready.</Text>
//                         </View>
//                     </View>
//                 )}
//             </ScrollView>

//             <View style={styles.footer}>
//                 <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
//                     <Text style={styles.placeOrderButtonText}>Place Order - ₹{total}</Text>
//                 </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: Colors.background,
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         padding: moderateScale(16),
//         backgroundColor: Colors.backgroundLight,
//     },
//     headerTitle: {
//         fontSize: fontScale(18),
//         fontWeight: 'bold',
//         color: Colors.textPrimary,
//         textAlign: 'center'
//     },
//     headerSubtitle: {
//         fontSize: fontScale(12),
//         color: Colors.textSecondary,
//         textAlign: 'center'
//     },
//     content: {
//         flexGrow: 1,
//         padding: scale(16),
//         backgroundColor: Colors.backgroundLight,
//     },
//     card: {
//         backgroundColor: Colors.WhiteBackgroudcolor,
//         borderRadius: moderateScale(12),
//         padding: moderateScale(14),
//         marginBottom: verticalScale(20),
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.05,
//         shadowRadius: 2,
//     },
//     sectionHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: verticalScale(4)
//     },
//     sectionTitle: {
//         fontSize: fontScale(14),
//         fontWeight: 'bold',
//         color: Colors.textDark,
//         marginLeft: scale(8)
//     },
//     sectionSubtitle: {
//         fontSize: fontScale(12),
//         color: Colors.textMuted,
//         marginLeft: scale(26),
//         marginBottom: verticalScale(12)
//     },
//     itemRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingVertical: verticalScale(10),
//     },
//     itemDetails: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//     },
//     itemAvatar: {
//         width: scale(32),
//         height: scale(32),
//         borderRadius: moderateScale(8),
//         backgroundColor: Colors.backgroundPrimaryLight,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: scale(10),
//     },
//     itemAvatarText: {
//         fontSize: fontScale(16),
//         fontWeight: 'bold',
//         color: Colors.primary,
//     },
//     itemName: {
//         fontSize: fontScale(14),
//         fontWeight: 'bold',
//         color: Colors.textDark,
//     },
//     itemFor: {
//         fontSize: fontScale(12),
//         color: Colors.textSecondary,
//     },
//     itemPrice: {
//         fontSize: fontScale(14),
//         fontWeight: 'bold',
//         color: Colors.textDark,
//     },
//     itemOriginalPrice: {
//         fontSize: fontScale(12),
//         color: Colors.textMuted,
//         textDecorationLine: 'line-through',
//         textAlign: 'right'
//     },
//     priceBreakdown: {
//         borderTopWidth: 1,
//         borderTopColor: Colors.borderLight,
//         marginTop: verticalScale(10),
//         paddingTop: verticalScale(10),
//     },
//     priceRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: verticalScale(6),
//     },
//     priceLabel: {
//         fontSize: fontScale(13),
//         color: Colors.textSecondary,
//     },
//     priceValue: {
//         fontSize: fontScale(13),
//         color: Colors.textDark,
//     },
//     totalRow: {
//         borderTopWidth: 1,
//         borderTopColor: Colors.borderLight,
//         marginTop: verticalScale(4),
//         paddingTop: verticalScale(10),
//     },
//     totalLabel: {
//         fontSize: fontScale(14),
//         fontWeight: 'bold',
//         color: Colors.textDark,
//     },
//     totalValue: {
//         fontSize: fontScale(14),
//         fontWeight: 'bold',
//         color: Colors.success,
//     },
//     paymentOption: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: verticalScale(10),
//         borderTopWidth: 1,
//         borderTopColor: Colors.borderLight,
//     },
//     paymentTextContainer: {
//         flex: 1,
//         marginLeft: scale(12),
//     },
//     paymentTitle: {
//         fontSize: fontScale(14),
//         fontWeight: '500',
//         color: Colors.textDark
//     },
//     paymentSubtitle: {
//         fontSize: fontScale(12),
//         color: Colors.textSecondary
//     },
//     recommendedTag: {
//         backgroundColor: Colors.backgroundSuccess,
//         borderRadius: moderateScale(6),
//         paddingHorizontal: scale(8),
//         paddingVertical: verticalScale(3),
//     },
//     recommendedText: {
//         color: Colors.success,
//         fontSize: fontScale(11),
//         fontWeight: 'bold',
//     },
//     comingSoonTag: {
//         backgroundColor: Colors.backgroundFaded,
//         borderRadius: moderateScale(6),
//         paddingHorizontal: scale(8),
//         paddingVertical: verticalScale(3),
//     },
//     comingSoonText: {
//         color: Colors.textMuted,
//         fontSize: fontScale(11),
//     },
//     codInfoBox: {
//         flexDirection: 'row',
//         backgroundColor: Colors.backgroundPrimaryLight,
//         padding: moderateScale(12),
//         borderRadius: moderateScale(8)
//     },
//     codInfoTitle: {
//         fontSize: fontScale(13),
//         fontWeight: 'bold',
//         color: Colors.textDark,
//     },
//     codInfoSubtitle: {
//         fontSize: fontScale(12),
//         color: Colors.textSecondary,
//         marginTop: verticalScale(2),
//     },
//     footer: {
//         padding: moderateScale(16),
//         backgroundColor: Colors.WhiteBackgroudcolor,
//         borderTopWidth: 1,
//         borderTopColor: Colors.borderLight,
//     },
//     placeOrderButton: {
//         backgroundColor: Colors.button,
//         paddingVertical: verticalScale(14),
//         borderRadius: moderateScale(8),
//         alignItems: 'center',
//     },
//     placeOrderButtonText: {
//         color: Colors.textLight,
//         fontSize: fontScale(16),
//         fontWeight: 'bold',
//     },
// });

// export default PaymentDetailes;
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Alert
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import { useFocusEffect } from '@react-navigation/native';

import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';
import { apiGet, apiPost, apiDelete } from '../../api/api';

const PaymentDetailes = ({ route, navigation }) => {
    const { child, pkg } = route.params;

    const [isLoading, setIsLoading] = useState(false);
    const [isAddressLoading, setIsAddressLoading] = useState(true);
    
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedSavedAddress, setSelectedSavedAddress] = useState(route.params?.address || null);
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');

    const deliveryFee = 49;
    const subtotal = pkg.price;
    const total = subtotal + deliveryFee;

    useFocusEffect(
        React.useCallback(() => {
            const fetchAddresses = async () => {
                setIsAddressLoading(true);
                try {
                    const userId = await AsyncStorage.getItem('userId');
                    if (!userId) {
                        throw new Error("User ID not found");
                    }
                    const response = await apiGet(`/api/v1/address/user/${userId}`);
                    if (response && Array.isArray(response) && response.length > 0) {
                        setSavedAddresses(response);
                        if (route.params?.address) {
                            setSelectedSavedAddress(response.find(a => a.address_id === route.params.address.address_id) || response[0]);
                        } else if (!selectedSavedAddress) {
                            setSelectedSavedAddress(response[0]);
                        }
                    } else {
                        setSavedAddresses([]);
                        Alert.alert(
                            "No Address Found",
                            "Please add a delivery address to continue.",
                            [{ text: "OK", onPress: () => navigation.goBack() }]
                        );
                    }
                } catch (error) {
                    console.error("Failed to fetch saved addresses:", error);
                    Alert.alert("Error", "Could not fetch addresses. Please go back and try again.", [{ text: "OK", onPress: () => navigation.goBack() }]);
                } finally {
                    setIsAddressLoading(false);
                }
            };
            fetchAddresses();
        }, [route.params?.address])
    );

    const getInitials = (name) => {
        if (!name) return '';
        return name.charAt(0).toUpperCase();
    };
    
    const handleDeleteAddress = (addressIdToDelete) => {
        Alert.alert(
            "Delete Address",
            "Are you sure you want to delete this address?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await apiDelete(`/api/v1/address/${addressIdToDelete}`);
                            showMessage({ message: "Address Deleted Successfully!", type: "success" });
                            const updatedAddresses = savedAddresses.filter(addr => addr.address_id !== addressIdToDelete);
                            setSavedAddresses(updatedAddresses);

                            if (selectedSavedAddress?.address_id === addressIdToDelete) {
                                if (updatedAddresses.length > 0) {
                                    setSelectedSavedAddress(updatedAddresses[0]);
                                } else {
                                    setSelectedSavedAddress(null);
                                    Alert.alert("No Addresses Left", "All addresses have been deleted. Please add a new one.", [
                                        { text: "OK", onPress: () => navigation.goBack() }
                                    ]);
                                }
                            }
                        } catch (error) {
                            console.error("Failed to delete address:", error.response?.data || error);
                            showMessage({ message: "Error", description: "Could not delete address. Please try again.", type: "danger" });
                        }
                    },
                },
            ]
        );
    };

    const handlePlaceOrder = async () => {
        if (!selectedSavedAddress) {
            Alert.alert("Missing Information", "Please select a delivery address to place the order.");
            return;
        }

        setIsLoading(true);
        
        const fullAddressString = `${selectedSavedAddress.address_line1}, ${selectedSavedAddress.address_line2 || ''}, ${selectedSavedAddress.city}, ${selectedSavedAddress.state} - ${selectedSavedAddress.pincode}`;
        
        const payload = {
            delivery_address: fullAddressString,
            delivery_phone: selectedSavedAddress.phone,
            delivery_notes: deliveryNotes,
            payment_method: paymentMethod
        };

        try {
            await apiPost('/api/v1/orders', payload);
            showMessage({ message: "Order Placed Successfully!", type: "success" });
            navigation.navigate(NavigationString.Order);

        } catch (error) {
            console.error("Failed to place order:", error.response?.data || error);
            showMessage({ message: "Order Failed", description: "Something went wrong. Please try again.", type: "danger" });
        } finally {
            setIsLoading(false);
        }
    };

    const formatAddress = (addr) => {
        return `${addr.address_line1}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={scale(24)} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment</Text>
                <View style={{width: scale(24)}} />
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.itemRow}>
                        <View style={styles.itemDetails}>
                            <View style={styles.itemAvatar}>
                                <Text style={styles.itemAvatarText}>{getInitials(child.name)}</Text>
                            </View>
                            <View>
                                <Text style={styles.itemName} numberOfLines={1}>{pkg.title}</Text>
                                <Text style={styles.itemFor}>For {child.name} • Class {child.standard}</Text>
                            </View>
                        </View>
                        <Text style={styles.itemPrice}>₹{subtotal.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Select Shipping Address</Text>
                    
                    {isAddressLoading ? <ActivityIndicator style={{marginVertical: 10}}/> :
                        savedAddresses.map(addr => (
                            <View key={addr.address_id} style={styles.addressOptionContainer}>
                                <TouchableOpacity style={styles.addressOption} onPress={() => setSelectedSavedAddress(addr)}>
                                    <MaterialCommunityIcons name={selectedSavedAddress?.address_id === addr.address_id ? 'radiobox-marked' : 'radiobox-blank'} size={scale(20)} color={Colors.primary} />
                                    <View style={{marginLeft: scale(10), flex: 1}}>
                                        <Text style={styles.addressOptionName}>{addr.fullName || child.name}</Text>
                                        <Text style={styles.addressOptionText}>{formatAddress(addr)}</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteAddress(addr.address_id)}>
                                    <MaterialCommunityIcons name="trash-can-outline" size={scale(22)} color={Colors.danger} />
                                </TouchableOpacity>
                            </View>
                        ))
                    }

                    <TextInput style={styles.notesInput} placeholder="Delivery Notes (Optional)" value={deliveryNotes} onChangeText={setDeliveryNotes} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <TouchableOpacity style={styles.paymentOption} onPress={() => setPaymentMethod('COD')}>
                        <MaterialCommunityIcons name={paymentMethod === 'COD' ? 'radiobox-marked' : 'radiobox-blank'} size={scale(20)} color={Colors.primary} />
                        <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.totalRowFooter}>
                    <Text style={styles.totalLabel}>Grand Total</Text>
                    <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={[styles.placeOrderButton, isLoading && styles.disabledButton]} onPress={handlePlaceOrder} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color={Colors.textLight} /> : <Text style={styles.placeOrderButtonText}>Place Order</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: moderateScale(16), backgroundColor: Colors.backgroundLight },
    headerTitle: { fontSize: fontScale(18), fontWeight: 'bold', color: Colors.textPrimary },
    content: { flexGrow: 1, padding: scale(16), backgroundColor: Colors.backgroundLight },
    card: { backgroundColor: Colors.WhiteBackgroudcolor, borderRadius: moderateScale(12), padding: moderateScale(14), marginBottom: verticalScale(20), elevation: 2 },
    sectionTitle: { fontSize: fontScale(15), fontWeight: 'bold', color: Colors.textDark, marginBottom: verticalScale(12) },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemDetails: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    itemAvatar: { width: scale(32), height: scale(32), borderRadius: moderateScale(8), backgroundColor: Colors.backgroundPrimaryLight, justifyContent: 'center', alignItems: 'center', marginRight: scale(10) },
    itemAvatarText: { fontSize: fontScale(16), fontWeight: 'bold', color: Colors.primary },
    itemName: { fontSize: fontScale(14), fontWeight: 'bold', color: Colors.textDark, flexShrink: 1 },
    itemFor: { fontSize: fontScale(12), color: Colors.textSecondary },
    itemPrice: { fontSize: fontScale(14), fontWeight: 'bold', color: Colors.textDark },
    addressOptionContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingVertical: verticalScale(8) },
    addressOption: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: scale(10) },
    addressOptionName: { fontSize: fontScale(13), fontWeight: 'bold', color: Colors.textDark },
    addressOptionText: { fontSize: fontScale(13), color: Colors.textSecondary },
    notesInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: moderateScale(8), paddingHorizontal: scale(12), backgroundColor: Colors.backgroundFaded, fontSize: fontScale(14), color: Colors.textDark, height: verticalScale(45), marginTop: verticalScale(15) },
    paymentOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(8) },
    paymentTitle: { fontSize: fontScale(14), fontWeight: '500', color: Colors.textDark, marginLeft: scale(12) },
    footer: { padding: moderateScale(16), backgroundColor: Colors.WhiteBackgroudcolor, borderTopWidth: 1, borderTopColor: Colors.borderLight },
    totalRowFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(12) },
    totalLabel: { fontSize: fontScale(14), fontWeight: 'bold', color: Colors.textDark },
    totalValue: { fontSize: fontScale(16), fontWeight: 'bold', color: Colors.success },
    placeOrderButton: { backgroundColor: Colors.primary, paddingVertical: verticalScale(14), borderRadius: moderateScale(8), alignItems: 'center' },
    disabledButton: { backgroundColor: Colors.primary, opacity: 0.7 },
    placeOrderButtonText: { color: Colors.textLight, fontSize: fontScale(16), fontWeight: 'bold' },
});

export default PaymentDetailes;