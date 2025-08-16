import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';

const PaymentDetailes = ({ route, navigation }) => {
    const { child, pkg, address } = route.params;
    const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or ONLINE

    const deliveryFee = 49;
    const subtotal = pkg.price;
    const total = subtotal + deliveryFee;

    const getInitials = (name) => {
        if (!name) return '';
        return name.charAt(0).toUpperCase();
    };

    const handlePlaceOrder = () => {
        navigation.navigate(NavigationString.Order, {
            child: child,
            pkg: pkg,
            address: address,
            total: total,
            paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'
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
                    <Text style={styles.headerTitle}>Payment</Text>
                    <Text style={styles.headerSubtitle}>Step 2 of 2</Text>
                </View>
                <View style={{width: scale(24)}} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
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
                                <Text style={styles.itemName}>{pkg.title}</Text>
                                <Text style={styles.itemFor}>For {child.name} • {child.standard} standard</Text>
                            </View>
                        </View>
                         <View>
                            <Text style={styles.itemPrice}>₹{pkg.price}</Text>
                            <Text style={styles.itemOriginalPrice}>₹{pkg.originalPrice}</Text>
                        </View>
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
                        <MaterialIcons name="payment" size={scale(18)} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                    </View>
                    <Text style={styles.sectionSubtitle}>Choose your preferred payment method</Text>
                    
                    <TouchableOpacity style={styles.paymentOption} onPress={() => setPaymentMethod('COD')}>
                        <MaterialCommunityIcons name={paymentMethod === 'COD' ? 'radiobox-marked' : 'radiobox-blank'} size={scale(20)} color={Colors.primary} />
                        <View style={styles.paymentTextContainer}>
                            <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                            <Text style={styles.paymentSubtitle}>Pay when your order arrives</Text>
                        </View>
                        <View style={styles.recommendedTag}><Text style={styles.recommendedText}>Recommended</Text></View>
                    </TouchableOpacity>
                    
                     <TouchableOpacity style={styles.paymentOption} onPress={() => setPaymentMethod('ONLINE')} disabled={true}>
                        <MaterialCommunityIcons name={paymentMethod === 'ONLINE' ? 'radiobox-marked' : 'radiobox-blank'} size={scale(20)} color={Colors.border} />
                        <View style={styles.paymentTextContainer}>
                            <Text style={[styles.paymentTitle, {color: Colors.textMuted}]}>Online Payment</Text>
                            <Text style={[styles.paymentSubtitle, {color: Colors.textMuted}]}>UPI, Cards, Net Banking</Text>
                        </View>
                        <View style={styles.comingSoonTag}><Text style={styles.comingSoonText}>Coming Soon</Text></View>
                    </TouchableOpacity>
                </View>

                {paymentMethod === 'COD' && (
                    <View style={styles.codInfoBox}>
                        <MaterialCommunityIcons name="cash" size={scale(20)} color={Colors.primary} />
                        <View style={{flex: 1, marginLeft: scale(10)}}>
                            <Text style={styles.codInfoTitle}>Cash on Delivery</Text>
                            <Text style={styles.codInfoSubtitle}>Pay ₹{total} in cash when your order is delivered. Please keep exact change ready.</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
                    <Text style={styles.placeOrderButtonText}>Place Order - ₹{total}</Text>
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
    itemOriginalPrice: {
        fontSize: fontScale(12),
        color: Colors.textMuted,
        textDecorationLine: 'line-through',
        textAlign: 'right'
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
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(10),
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    paymentTextContainer: {
        flex: 1,
        marginLeft: scale(12),
    },
    paymentTitle: {
        fontSize: fontScale(14),
        fontWeight: '500',
        color: Colors.textDark
    },
    paymentSubtitle: {
        fontSize: fontScale(12),
        color: Colors.textSecondary
    },
    recommendedTag: {
        backgroundColor: Colors.backgroundSuccess,
        borderRadius: moderateScale(6),
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(3),
    },
    recommendedText: {
        color: Colors.success,
        fontSize: fontScale(11),
        fontWeight: 'bold',
    },
    comingSoonTag: {
        backgroundColor: Colors.backgroundFaded,
        borderRadius: moderateScale(6),
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(3),
    },
    comingSoonText: {
        color: Colors.textMuted,
        fontSize: fontScale(11),
    },
    codInfoBox: {
        flexDirection: 'row',
        backgroundColor: Colors.backgroundPrimaryLight,
        padding: moderateScale(12),
        borderRadius: moderateScale(8)
    },
    codInfoTitle: {
        fontSize: fontScale(13),
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    codInfoSubtitle: {
        fontSize: fontScale(12),
        color: Colors.textSecondary,
        marginTop: verticalScale(2),
    },
    footer: {
        padding: moderateScale(16),
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    placeOrderButton: {
        backgroundColor: Colors.button,
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(8),
        alignItems: 'center',
    },
    placeOrderButtonText: {
        color: Colors.textLight,
        fontSize: fontScale(16),
        fontWeight: 'bold',
    },
});

export default PaymentDetailes;