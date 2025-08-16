import React, { useEffect } from 'react';
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
import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';

const Order = ({ route, navigation }) => {
    const { child, pkg, address, total, paymentMethod } = route.params;

    const orderNumber = `CS${Math.floor(1000000 + Math.random() * 9000000)}`;

    const handleContinueShopping = () => {
        navigation.navigate(NavigationString.YourChildrenScreen);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.successIconContainer}>
                    <MaterialCommunityIcons name="check-decagram" size={scale(50)} color={Colors.success} />
                </View>

                <Text style={styles.title}>Order Confirmed!</Text>
                <Text style={styles.subtitle}>Your order has been successfully placed</Text>

                <View style={styles.card}>
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderNumber}>Order #{orderNumber}</Text>
                        <Text style={styles.deliveryEstimate}>Expected delivery in 3-5 business days</Text>
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Order Details</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Bundle:</Text>
                            <Text style={styles.detailValue}>{pkg.title}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>For:</Text>
                            <Text style={styles.detailValue}>{child.name}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Class:</Text>
                            <Text style={styles.detailValue}>{child.standard}</Text>
                        </View>
                    </View>

                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        <Text style={styles.addressText}>{address.fullName}</Text>
                        <Text style={styles.addressText}>{address.addressLine}, {address.landmark}</Text>
                        <Text style={styles.addressText}>{address.city}, {address.state} - {address.pincode}</Text>
                        <Text style={styles.addressText}>Phone: +91 {address.phone}</Text>
                    </View>

                    <View style={styles.totalSection}>
                        <View>
                            <Text style={styles.totalLabel}>Total Paid:</Text>
                            <Text style={styles.paymentMethod}>Payment Method: {paymentMethod}</Text>
                        </View>
                        <Text style={styles.totalValue}>₹{total}</Text>
                    </View>

                    <TouchableOpacity onPress={()=> navigation.navigate("YourChildrenScreen")} style={styles.continueButton} onPress={handleContinueShopping}>
                        <Text style={styles.continueButtonText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
        padding: scale(16),
    },
    successIconContainer: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        backgroundColor: Colors.backgroundSuccess,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(20),
    },
    title: {
        fontSize: fontScale(22),
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginTop: verticalScale(16),
    },
    subtitle: {
        fontSize: fontScale(14),
        color: Colors.textSecondary,
        marginBottom: verticalScale(20),
    },
    card: {
        width: '100%',
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    orderInfo: {
        alignItems: 'center',
        paddingBottom: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    orderNumber: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: Colors.success,
    },
    deliveryEstimate: {
        fontSize: fontScale(12),
        color: Colors.textMuted,
        marginTop: verticalScale(4),
    },
    detailSection: {
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    sectionTitle: {
        fontSize: fontScale(12),
        color: Colors.textMuted,
        marginBottom: verticalScale(8),
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(4),
    },
    detailLabel: {
        fontSize: fontScale(14),
        color: Colors.textSecondary,
    },
    detailValue: {
        fontSize: fontScale(14),
        color: Colors.textDark,
        fontWeight: '500',
        textAlign: 'right',
    },
    addressText: {
        fontSize: fontScale(14),
        color: Colors.textSecondary,
        lineHeight: verticalScale(20),
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        backgroundColor: Colors.backgroundSuccess,
        marginHorizontal: -moderateScale(16),
        paddingHorizontal: moderateScale(16),
    },
    totalLabel: {
        fontSize: fontScale(14),
        color: Colors.textDark,
        fontWeight: 'bold',
    },
    paymentMethod: {
        fontSize: fontScale(12),
        color: Colors.success,
    },
    totalValue: {
        fontSize: fontScale(20),
        fontWeight: 'bold',
        color: Colors.success,
    },
    continueButton: {
        backgroundColor: Colors.primary,
        borderRadius: moderateScale(8),
        paddingVertical: verticalScale(14),
        alignItems: 'center',
        marginTop: verticalScale(16),
        marginHorizontal: -moderateScale(16),
        marginBottom: -moderateScale(16),
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    continueButtonText: {
        color: Colors.textLight,
        fontSize: fontScale(16),
        fontWeight: 'bold',
    },
});

export default Order;