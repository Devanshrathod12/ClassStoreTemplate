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
    Alert
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';

const DeliveryAddress = ({ route, navigation }) => {
    const { child, pkg } = route.params;
    const [address, setAddress] = useState({
        fullName: child.name,
        phone: '1234567890',
        addressLine: '',
        landmark: '',
        pincode: '',
        city: '',
        state: ''
    });

    const deliveryFee = 49;
    const subtotal = pkg.price;
    const total = subtotal + deliveryFee;

    const getInitials = (name) => {
        if (!name) return '';
        return name.charAt(0).toUpperCase();
    };

    const handleContinueToPayment = () => {
        if (!address.fullName || !address.phone || !address.addressLine || !address.pincode || !address.city || !address.state) {
            Alert.alert("Incomplete Address", "Please fill all the required address details to continue.");
            return;
        }
        
        navigation.navigate(NavigationString.PaymentDetailes, {
            child: child,
            pkg: pkg,
            address: address
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={scale(24)} color={Colors.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Delivery Address</Text>
                    <Text style={styles.headerSubtitle}>Step 1 of 2</Text>
                </View>
                <View style={{width: scale(24)}} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <View style={styles.sectionHeader}>
                        {/* <MaterialCommunityIcons name="receipt-text-check-outline" size={scale(18)} color={Colors.primary} /> */}
                        <MaterialCommunityIcons name="file-document-outline" size={scale(18)} color={Colors.primary} />

                        <Text style={styles.sectionTitle}>Order Summary</Text>
                    </View>
                    <View style={styles.itemRow}>
                        <View style={styles.itemDetails}>
                            <View style={styles.itemAvatar}>
                                <Text style={styles.itemAvatarText}>{getInitials(child.name)}</Text>
                            </View>
                            <View>
                                <Text style={styles.itemName}>{pkg.title}</Text>
                                <Text style={styles.itemFor}>For {child.name} • {child.standard} standard</Text>
                            </View>
                        </View>
                        <Text style={styles.itemPrice}>₹{pkg.price}</Text>
                    </View>
                    <View style={styles.priceBreakdown}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Subtotal</Text>
                            <Text style={styles.priceValue}>₹{subtotal}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Delivery</Text>
                            <Text style={styles.priceValue}>₹{deliveryFee}</Text>
                        </View>
                         <View style={[styles.priceRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{total}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                     <View style={styles.sectionHeader}>
                        <MaterialIcons name="location-on" size={scale(18)} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                    </View>
                    <Text style={styles.sectionSubtitle}>Where should we deliver your books?</Text>
                    
                    <View style={styles.inputRow}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput style={styles.input} value={address.fullName} onChangeText={t => setAddress({...address, fullName: t})} />
                        </View>
                         <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput style={styles.input} value={address.phone} keyboardType="phone-pad" onChangeText={t => setAddress({...address, phone: t})} />
                        </View>
                    </View>
                     <View style={styles.inputGroupFull}>
                        <Text style={styles.inputLabel}>Address</Text>
                        <TextInput style={styles.input} placeholder="House/Flat No., Building, Street, Area" placeholderTextColor={Colors.textMuted} onChangeText={t => setAddress({...address, addressLine: t})} />
                    </View>
                     <View style={styles.inputGroupFull}>
                        <Text style={styles.inputLabel}>Landmark (Optional)</Text>
                        <TextInput style={styles.input} placeholder="Nearby landmark" placeholderTextColor={Colors.textMuted} onChangeText={t => setAddress({...address, landmark: t})} />
                    </View>

                     <View style={styles.inputRow}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Pincode</Text>
                            <TextInput style={styles.input} keyboardType="number-pad" onChangeText={t => setAddress({...address, pincode: t})} />
                        </View>
                         <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>City</Text>
                            <TextInput style={styles.input} onChangeText={t => setAddress({...address, city: t})} />
                        </View>
                         <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>State</Text>
                            <TextInput style={styles.input} onChangeText={t => setAddress({...address, state: t})} />
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.paymentButton} onPress={handleContinueToPayment}>
                    <Text style={styles.paymentButtonText}>Continue to Payment</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: moderateScale(16),
        backgroundColor: Colors.backgroundLight,
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
    content: {
        flexGrow: 1,
        padding: scale(16),
        backgroundColor: Colors.backgroundLight,
    },
    card: {
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderRadius: moderateScale(12),
        padding: moderateScale(14),
        marginBottom: verticalScale(20),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(4)
    },
    sectionTitle: {
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: Colors.textDark,
        marginLeft: scale(8)
    },
    sectionSubtitle: {
        fontSize: fontScale(12),
        color: Colors.textMuted,
        marginLeft: scale(26),
        marginBottom: verticalScale(12)
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(10),
    },
    itemDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemAvatar: {
        width: scale(32),
        height: scale(32),
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
    },
    itemFor: {
        fontSize: fontScale(12),
        color: Colors.textSecondary,
    },
    itemPrice: {
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    priceBreakdown: {
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        marginTop: verticalScale(10),
        paddingTop: verticalScale(10),
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(6),
    },
    priceLabel: {
        fontSize: fontScale(13),
        color: Colors.textSecondary,
    },
    priceValue: {
        fontSize: fontScale(13),
        color: Colors.textDark,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        marginTop: verticalScale(4),
        paddingTop: verticalScale(10),
    },
    totalLabel: {
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    totalValue: {
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: Colors.success,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputGroup: {
        flex: 1,
        marginHorizontal: scale(4),
    },
     inputGroupFull: {
        marginHorizontal: scale(4),
    },
    inputLabel: {
        fontSize: fontScale(12),
        color: Colors.textSecondary,
        marginBottom: verticalScale(6),
        marginTop: verticalScale(8),
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: moderateScale(8),
        paddingHorizontal: scale(12),
        backgroundColor: Colors.backgroundFaded,
        fontSize: fontScale(14),
        color: Colors.textDark,
        height: verticalScale(45),
    },
    footer: {
        padding: moderateScale(16),
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    paymentButton: {
        backgroundColor: Colors.primary,
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(8),
        alignItems: 'center',
    },
    paymentButtonText: {
        color: Colors.textLight,
        fontSize: fontScale(16),
        fontWeight: 'bold',
    },
});

export default DeliveryAddress;