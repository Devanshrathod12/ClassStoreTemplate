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
import { apiGet, apiPost } from '../../api/api';

const PaymentDetailes = ({ route, navigation }) => {
    const { child, pkg, address } = route.params;

    const [isLoading, setIsLoading] = useState(false);
    const [isAddressLoading, setIsAddressLoading] = useState(true);
    
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedSavedAddress, setSelectedSavedAddress] = useState(address);
    const [manualInputs, setManualInputs] = useState({ address: '', phone: '', notes: '' });
    const [addressSource, setAddressSource] = useState('SAVED'); // 'SAVED' or 'NEW'
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
                    if (userId) {
                        const response = await apiGet(`/api/v1/address/user/${userId}`);
                        if (response && Array.isArray(response) && response.length > 0) {
                            setSavedAddresses(response);
                            if (!selectedSavedAddress) {
                                setSelectedSavedAddress(response[0]);
                            }
                        } else {
                            setAddressSource('NEW');
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch saved addresses:", error);
                } finally {
                    setIsAddressLoading(false);
                }
            };
            fetchAddresses();
        }, [])
    );

    const getInitials = (name) => {
        if (!name) return '';
        return name.charAt(0).toUpperCase();
    };

    const handlePlaceOrder = async () => {
        setIsLoading(true);
        let payload;

        if (addressSource === 'SAVED') {
            if (!selectedSavedAddress) {
                Alert.alert("Missing Information", "Please select a saved delivery address.");
                setIsLoading(false);
                return;
            }
            const fullAddressString = `${selectedSavedAddress.address_line1}, ${selectedSavedAddress.address_line2 || ''}, ${selectedSavedAddress.city}, ${selectedSavedAddress.state} - ${selectedSavedAddress.pincode}`;
            payload = {
                delivery_address: fullAddressString,
                delivery_phone: selectedSavedAddress.phone || address.phone,
                delivery_notes: manualInputs.notes,
                payment_method: paymentMethod
            };
        } else {
            if (!manualInputs.address || !manualInputs.phone) {
                Alert.alert("Missing Information", "Please enter a delivery address and phone number.");
                setIsLoading(false);
                return;
            }
            payload = {
                delivery_address: manualInputs.address,
                delivery_phone: manualInputs.phone,
                delivery_notes: manualInputs.notes,
                payment_method: paymentMethod
            };
        }

        try {
            console.log("Placing Order with Payload:", JSON.stringify(payload, null, 2));
            const response = await apiPost('/api/v1/orders', payload);
            console.log("Order Placed Response:", JSON.stringify(response, null, 2));
            showMessage({ message: "Order Placed Successfully!", type: "success" });
            navigation.navigate(NavigationString.Order, { orderDetails: response });

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
                    <Text style={styles.sectionTitle}>Shipping Details</Text>

                    <TouchableOpacity style={styles.addressSourceOption} onPress={() => setAddressSource('SAVED')}>
                        <MaterialCommunityIcons name={addressSource === 'SAVED' ? 'radiobox-marked' : 'radiobox-blank'} size={scale(20)} color={Colors.primary} />
                        <Text style={styles.addressSourceText}>Use a saved address</Text>
                    </TouchableOpacity>

                    {addressSource === 'SAVED' && (
                        isAddressLoading ? <ActivityIndicator style={{marginVertical: 10}}/> :
                        <View style={styles.subContainer}>
                            {savedAddresses.map(addr => (
                                <TouchableOpacity key={addr.address_id} style={styles.addressOption} onPress={() => setSelectedSavedAddress(addr)}>
                                    <MaterialCommunityIcons name={selectedSavedAddress?.address_id === addr.address_id ? 'circle-slice-8' : 'circle-outline'} size={scale(18)} color={Colors.primary} />
                                    <View style={{marginLeft: scale(10), flex: 1}}>
                                        <Text style={styles.addressOptionName}>{addr.fullName || child.name}</Text>
                                        <Text style={styles.addressOptionText}>{formatAddress(addr)}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <TouchableOpacity style={styles.addressSourceOption} onPress={() => setAddressSource('NEW')}>
                        <MaterialCommunityIcons name={addressSource === 'NEW' ? 'radiobox-marked' : 'radiobox-blank'} size={scale(20)} color={Colors.primary} />
                        <Text style={styles.addressSourceText}>Enter a new address</Text>
                    </TouchableOpacity>
                    
                    {addressSource === 'NEW' && (
                        <View style={styles.subContainer}>
                            <TextInput style={styles.input} placeholder="Delivery Address (House, Street, Area)" value={manualInputs.address} onChangeText={t => setManualInputs({...manualInputs, address: t})} />
                            <TextInput style={styles.input} placeholder="Delivery Phone Number" value={manualInputs.phone} onChangeText={t => setManualInputs({...manualInputs, phone: t})} keyboardType="phone-pad" maxLength={10} />
                        </View>
                    )}

                    <TextInput style={styles.notesInput} placeholder="Delivery Notes (Optional)" value={manualInputs.notes} onChangeText={t => setManualInputs({...manualInputs, notes: t})} />
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
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: moderateScale(16), backgroundColor: Colors.backgroundLight,
    },
    headerTitle: {
        fontSize: fontScale(18), fontWeight: 'bold', color: Colors.textPrimary,
    },
    content: {
        flexGrow: 1, padding: scale(16), backgroundColor: Colors.backgroundLight,
    },
    card: {
        backgroundColor: Colors.WhiteBackgroudcolor, borderRadius: moderateScale(12),
        padding: moderateScale(14), marginBottom: verticalScale(20), elevation: 2,
    },
    sectionTitle: {
        fontSize: fontScale(15), fontWeight: 'bold', color: Colors.textDark, marginBottom: verticalScale(12)
    },
    itemRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    itemDetails: {
        flexDirection: 'row', alignItems: 'center', flex: 1,
    },
    itemAvatar: {
        width: scale(32), height: scale(32), borderRadius: moderateScale(8),
        backgroundColor: Colors.backgroundPrimaryLight, justifyContent: 'center', alignItems: 'center',
        marginRight: scale(10),
    },
    itemAvatarText: {
        fontSize: fontScale(16), fontWeight: 'bold', color: Colors.primary,
    },
    itemName: {
        fontSize: fontScale(14), fontWeight: 'bold', color: Colors.textDark, flexShrink: 1,
    },
    itemFor: {
        fontSize: fontScale(12), color: Colors.textSecondary,
    },
    itemPrice: {
        fontSize: fontScale(14), fontWeight: 'bold', color: Colors.textDark,
    },
    addressSourceOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(8)
    },
    addressSourceText: {
        fontSize: fontScale(14),
        color: Colors.textDark,
        marginLeft: scale(12),
        fontWeight: '500'
    },
    subContainer: {
        paddingLeft: scale(32),
        paddingBottom: verticalScale(10),
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        marginBottom: verticalScale(10),
    },
    addressOption: {
        flexDirection: 'row',
        paddingVertical: verticalScale(8),
    },
    addressOptionName: {
        fontSize: fontScale(13),
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    addressOptionText: {
        fontSize: fontScale(13),
        color: Colors.textSecondary,
    },
    input: {
        borderWidth: 1, borderColor: Colors.border, borderRadius: moderateScale(8),
        paddingHorizontal: scale(12), backgroundColor: Colors.backgroundFaded,
        fontSize: fontScale(14), color: Colors.textDark,
        height: verticalScale(45),
        marginTop: verticalScale(10)
    },
    notesInput: {
        borderWidth: 1, borderColor: Colors.border, borderRadius: moderateScale(8),
        paddingHorizontal: scale(12), backgroundColor: Colors.backgroundFaded,
        fontSize: fontScale(14), color: Colors.textDark,
        height: verticalScale(45), marginTop: verticalScale(10),
    },
    paymentOption: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: verticalScale(8),
    },
    paymentTitle: {
        fontSize: fontScale(14), fontWeight: '500', color: Colors.textDark, marginLeft: scale(12),
    },
    footer: {
        padding: moderateScale(16), backgroundColor: Colors.WhiteBackgroudcolor,
        borderTopWidth: 1, borderTopColor: Colors.borderLight,
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
        backgroundColor: Colors.button, paddingVertical: verticalScale(14),
        borderRadius: moderateScale(8), alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: Colors.button, opacity: 0.7,
    },
    placeOrderButtonText: {
        color: Colors.textLight, fontSize: fontScale(16), fontWeight: 'bold',
    },
});

export default PaymentDetailes;