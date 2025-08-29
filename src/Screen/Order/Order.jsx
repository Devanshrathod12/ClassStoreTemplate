// ye final hai abhi to 

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { showMessage } from 'react-native-flash-message';
import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';
import { apiPost, apiDelete } from '../../api/api'; // Import apiDelete
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';

const Order = ({ route, navigation }) => {
    const { orderData, address, total, paymentMethod, orderDetails, deliveryPhoneNumber } = route.params || {};
    const [status, setStatus] = useState('confirming');

    
    const handleConfirmOrder = async () => {
        if (!orderDetails?.order_id) {
            showMessage({ message: "Error", description: "Order ID is missing.", type: "danger" });
            return;
        }
        setStatus('loading');
        try {
            await apiPost(`/api/v1/orders/${orderDetails.order_id}/confirm`, {});
            
            // Delete cart items ONLY if the order was confirmed AND originated from the cart
            if (orderData.isFromCart && orderData.cart && orderData.cart.items && orderData.cart.items.length > 0) {
                try {
                    await Promise.all(orderData.cart.items.map(async (item) => {
                        await apiDelete(`/api/v1/cart/items/${item.cart_item_id}`);
                    }));
                    console.log("Cart items successfully cleared after order confirmation.");
                } catch (cartClearError) {
                    console.error("Failed to clear cart items after order confirmation:", cartClearError);
                    // Decide if you want to show a message or just log on cart clear failure
                }
            }

            setStatus('confirmed');
            showMessage({ message: "Order Confirmed!", type: "success" });
        } catch (error) {
            console.error("Failed to confirm order:", error.response?.data || error);
            showMessage({ message: "Confirmation Failed", description: "Please try again.", type: "danger" });
            setStatus('confirming');
        }
    };

    const handleCancelOrder = () => {
        // Instead of calling a cancel API, just navigate back to the PaymentDetailes screen
        showMessage({ message: "Order not confirmed", description: "You can modify details or place a new order.", type: "info" });
        navigation.goBack(); // Navigate back to PaymentDetailes
    };

    const handleContinueShopping = () => {
        navigation.popToTop();
        navigation.navigate(NavigationString.YourChildrenScreen);
    };

    if (!orderData || !address || !orderDetails) {
        return (
            <AdaptiveSafeAreaView style={styles.centeredContent}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 10 }}>Loading order details...</Text>
            </AdaptiveSafeAreaView>
        );
    }

    if (status === 'confirmed') {
        return (
            <AdaptiveSafeAreaView style={styles.container}>
                <View style={styles.centeredContent}>
                    <View style={styles.successIconContainer}><MaterialCommunityIcons name="check-decagram" size={scale(50)} color={Colors.success} /></View>
                    <Text style={styles.title}>Order Confirmed!</Text>
                    <Text style={styles.subtitle}>Your order has been successfully placed.</Text>
                    <TouchableOpacity style={styles.finalContinueButton} onPress={handleContinueShopping}>
                        <Text style={styles.continueButtonText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>
            </AdaptiveSafeAreaView>
        );
    }
    
    return (
        <AdaptiveSafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Confirm Your Order</Text>
                <Text style={styles.subtitle}>Please review the details below.</Text>
                <View style={styles.card}>
                    <View style={styles.orderInfo}>
                        <Text style={styles.orderNumber}>Order #{orderDetails.order_number}</Text>
                        <Text style={styles.deliveryEstimate}>Status: Pending Confirmation</Text>
                    </View>
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Order Details</Text>
                        {orderData.isFromCart ? (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Items:</Text>
                                <Text style={styles.detailValue}>{orderData.cart.quantity} from Cart</Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.detailRow}><Text style={styles.detailLabel}>Bundle:</Text><Text style={styles.detailValue}>{orderData.pkg.title}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.detailLabel}>For:</Text><Text style={styles.detailValue}>{orderData.child.name}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.detailLabel}>Class:</Text><Text style={styles.detailValue}>{orderData.child.standard}</Text></View>
                            </>
                        )}
                    </View>
                    <View style={styles.detailSection}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        <Text style={styles.addressName}>{address.fullName}</Text>
                        <Text style={styles.addressText}>{address.address_line1}, {address.address_line2}</Text>
                        <Text style={styles.addressText}>{address.city}, {address.state} - {address.pincode}</Text>
                        <Text style={styles.addressText}>Phone: {deliveryPhoneNumber}</Text>
                    </View>
                    <View style={styles.totalSection}>
                        <View><Text style={styles.totalLabel}>Total Paid:</Text><Text style={styles.paymentMethod}>Payment Method: {paymentMethod}</Text></View>
                        <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelOrder} disabled={status === 'loading'}>
                            <Text style={styles.cancelButtonText}>Cancel Order</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.confirmButton]} onPress={handleConfirmOrder} disabled={status === 'loading'}>
                            {status === 'loading' ? <ActivityIndicator color={Colors.textLight} /> : <Text style={styles.continueButtonText}>Confirm Order</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
        </AdaptiveSafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.backgroundLight },
    content: { flexGrow: 1, alignItems: 'center', padding: scale(16) },
    centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: scale(16) },
    successIconContainer: { width: scale(80), height: scale(80), borderRadius: scale(40), backgroundColor: Colors.backgroundSuccess, justifyContent: 'center', alignItems: 'center', marginTop: verticalScale(20) },
    title: { fontSize: fontScale(22), fontWeight: 'bold', color: Colors.textPrimary, marginTop: verticalScale(16), textAlign: 'center' },
    subtitle: { fontSize: fontScale(14), color: Colors.textSecondary, marginBottom: verticalScale(20), textAlign: 'center' },
    card: { width: '100%', backgroundColor: Colors.WhiteBackgroudcolor, borderRadius: moderateScale(12), padding: moderateScale(16), elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    orderInfo: { alignItems: 'center', paddingBottom: verticalScale(12), borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    orderNumber: { fontSize: fontScale(16), fontWeight: 'bold', color: Colors.primary },
    deliveryEstimate: { fontSize: fontScale(12), color: Colors.textMuted, marginTop: verticalScale(4) },
    detailSection: { paddingVertical: verticalScale(12), borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    sectionTitle: { fontSize: fontScale(12), color: Colors.textMuted, marginBottom: verticalScale(8) },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(4) },
    detailLabel: { fontSize: fontScale(14), color: Colors.textSecondary },
    detailValue: { fontSize: fontScale(14), color: Colors.textDark, fontWeight: '500', textAlign: 'right' },
    addressName: { fontSize: fontScale(14), color: Colors.textDark, fontWeight: 'bold', marginBottom: verticalScale(2) },
    addressText: { fontSize: fontScale(14), color: Colors.textSecondary, lineHeight: verticalScale(20) },
    totalSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: verticalScale(12), backgroundColor: Colors.backgroundSuccess, marginHorizontal: -moderateScale(16), paddingHorizontal: moderateScale(16) },
    totalLabel: { fontSize: fontScale(14), color: Colors.textDark, fontWeight: 'bold' },
    paymentMethod: { fontSize: fontScale(12), color: Colors.success },
    totalValue: { fontSize: fontScale(20), fontWeight: 'bold', color: Colors.success },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: verticalScale(20), marginHorizontal: -moderateScale(16), marginBottom: -moderateScale(16) },
    actionButton: { flex: 1, paddingVertical: verticalScale(14), alignItems: 'center' },
    cancelButton: { backgroundColor: Colors.background, borderBottomLeftRadius: moderateScale(12) },
    cancelButtonText: { color: Colors.textSecondary, fontSize: fontScale(16), fontWeight: 'bold' },
    confirmButton: { backgroundColor: Colors.primary, borderBottomRightRadius: moderateScale(12) },
    continueButtonText: { color: Colors.textLight, fontSize: fontScale(16), fontWeight: 'bold' },
    finalContinueButton: { backgroundColor: Colors.primary, borderRadius: moderateScale(8), paddingVertical: verticalScale(14), alignItems: 'center', marginTop: verticalScale(30), width: '90%' },
});

export default Order;