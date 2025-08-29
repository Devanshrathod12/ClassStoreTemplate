import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import { apiGet, apiDelete, apiPut } from '../../api/api';
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';
import NavigationString from '../../Navigation/NavigationString';



const MyCartScreen = ({ navigation }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartDetails, setCartDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCartData = useCallback(async () => {
        setIsLoading(true);
        try {
            const cartResponse = await apiGet('/api/v1/cart').catch(() => null);

            if (cartResponse && cartResponse.cart_id) {
                setCartDetails(cartResponse);

                const itemsResponse = await apiGet(`/api/v1/cart/${cartResponse.cart_id}/items`).catch(() => []);

                if (Array.isArray(itemsResponse) && itemsResponse.length > 0) {
                    const enrichedItems = await Promise.all(
                        itemsResponse.map(async (item) => {
                            const bundleDetails = await apiGet(`/api/v1/bundle/${item.bundle_id}`).catch(() => null);
                            const unitPrice = parseFloat(item.unit_price);
                            const discount = parseFloat(bundleDetails?.discount || 0);
                            const originalPrice = unitPrice + discount;

                            return {
                                ...item,
                                bundle_name: bundleDetails?.bundle_name || 'Unknown Bundle',
                                original_price: originalPrice,
                                discount_amount: discount,
                            };
                        })
                    );
                    setCartItems(enrichedItems);
                } else {
                    setCartItems([]);
                }
            } else {
                setCartItems([]);
                setCartDetails(null);
            }
        } catch (error) {
            console.error("Failed to fetch cart items:", error);
            showMessage({ message: "Error", description: "Could not load your cart.", type: 'danger' });
            setCartItems([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchCartData();
        }, [fetchCartData])
    );

    const handleDeleteItem = async (cartItemId) => {
        showMessage({ message: "Removing item...", type: "info" });
        try {
            await apiDelete(`/api/v1/cart/items/${cartItemId}`);
            showMessage({ message: "Success", description: "Item removed from your cart.", type: "success" });
            fetchCartData();
        } catch (error) {
            console.error("Failed to delete item:", error);
            showMessage({ message: "Error", description: "Could not remove the item.", type: "danger" });
        }
    };

    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
            handleDeleteItem(cartItemId);
            return;
        }
        const originalItems = [...cartItems];
        setCartItems(prev => prev.map(item => item.cart_item_id === cartItemId ? { ...item, quantity: newQuantity } : item));

        try {
            await apiPut(`/api/v1/cart/items/${cartItemId}`, { quantity: newQuantity });
            fetchCartData();
        } catch (error) {
            console.error("Failed to update quantity:", error);
            showMessage({ message: "Error", description: "Could not update quantity.", type: "danger" });
            setCartItems(originalItems);
        }
    };
    
    const handleProceedToCheckout = () => {
        const orderData = {
            isFromCart: true,
            cart: {
                items: cartItems,
                quantity: cartDetails?.quantity || 0,
                total_amount: cartDetails?.total || 0,
            }
        };
        navigation.navigate(NavigationString.PaymentDetailes, { orderData });
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={scale(24)} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Cart</Text>
            <View style={{ width: scale(24) }} />
        </View>
    );

    const renderCartItem = (item) => (
        <View key={item.cart_item_id} style={styles.itemCard}>
            <View style={styles.itemDetailsSection}>
                <Text style={styles.itemName} numberOfLines={2}>{item.bundle_name}</Text>
                
                <View style={styles.priceBreakdown}>
                    <Text style={styles.itemOriginalPrice}>MRP: ₹{(item.original_price || 0).toFixed(2)}</Text>
                    <Text style={styles.itemDiscount}>Discount: - ₹{(item.discount_amount || 0).toFixed(2)}</Text>
                    <Text style={styles.itemPricePerUnit}>Price / item: ₹{(parseFloat(item.unit_price) || 0).toFixed(2)}</Text>
                </View>

                <View style={styles.quantityControl}>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}>
                        <MaterialCommunityIcons name="minus" size={scale(18)} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.itemQuantityValue}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}>
                        <MaterialCommunityIcons name="plus" size={scale(18)} color={Colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.itemTotalSection}>
                 <TouchableOpacity onPress={() => handleDeleteItem(item.cart_item_id)}>
                    <MaterialCommunityIcons name="delete-outline" size={scale(24)} color={Colors.danger} />
                </TouchableOpacity>
                <Text style={styles.itemTotalPriceLabel}>Total</Text>
                <Text style={styles.itemTotalPrice}>₹{(parseFloat(item.total) || 0).toFixed(2)}</Text>
            </View>
        </View>
    );

    const renderSummary = () => {
        const finalTotal = parseFloat(cartDetails?.total || 0);
        
        return (
            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                <View style={styles.grandTotalRow}>
                    <Text style={styles.grandTotalLabel}>Grand Total ({cartDetails?.quantity || 0} items)</Text>
                    <Text style={styles.grandTotalValue}>₹{finalTotal.toFixed(2)}</Text>
                </View>
            </View>
        );
    };

    const renderContent = () => {
        if (isLoading) return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />;
        if (!cartItems || cartItems.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="cart-off" size={scale(60)} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>Your Cart is Empty</Text>
                    <Text style={styles.emptySubText}>Looks like you haven't added anything yet.</Text>
                </View>
            );
        }
        return (
            <>
                {cartItems.map(item => renderCartItem(item))}
                {renderSummary()}
            </>
        );
    };

    return (
        <AdaptiveSafeAreaView>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
                {renderHeader()}
                <ScrollView contentContainerStyle={styles.content}>
                    {renderContent()}
                </ScrollView>
                {!isLoading && cartItems.length > 0 && (
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={handleProceedToCheckout} style={styles.checkoutButton}>
                            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </AdaptiveSafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.backgroundLight },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: moderateScale(16), borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    headerTitle: { fontSize: fontScale(18), fontWeight: 'bold', color: Colors.textPrimary },
    content: { flexGrow: 1, padding: scale(16) },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: verticalScale(100) },
    emptyText: { fontSize: fontScale(18), fontWeight: 'bold', color: Colors.textPrimary, marginTop: verticalScale(15) },
    emptySubText: { fontSize: fontScale(14), color: Colors.textMuted, marginTop: verticalScale(5), textAlign: 'center', paddingHorizontal: scale(20) },
    
    itemCard: {
        flexDirection: 'row',
        backgroundColor: "white",
        borderRadius: moderateScale(12),
        padding: moderateScale(12),
        marginBottom: verticalScale(16),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    itemDetailsSection: {
        flex: 1,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: verticalScale(8),
    },
    priceBreakdown: {
        marginBottom: verticalScale(10),
    },
    itemOriginalPrice: {
        fontSize: fontScale(13),
        color: Colors.textMuted,
        textDecorationLine: 'line-through',
    },
    itemDiscount: {
        fontSize: fontScale(13),
        color: Colors.success,
        fontWeight: '500',
    },
    itemPricePerUnit: {
        fontSize: fontScale(13),
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: moderateScale(8),
        alignSelf: 'flex-start',
    },
    quantityButton: {
        padding: scale(8),
    },
    itemQuantityValue: {
        fontSize: fontScale(16),
        fontWeight: '600',
        color: Colors.textPrimary,
        marginHorizontal: scale(12),
    },
    itemTotalSection: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingLeft: scale(10),
    },
    itemTotalPriceLabel: {
        fontSize: fontScale(12),
        color: Colors.textSecondary,
    },
    itemTotalPrice: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },

    summaryCard: {
        backgroundColor: "white",
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        marginTop: verticalScale(10),
        elevation: 1,
    },
    summaryTitle: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: verticalScale(15),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    summaryLabel: {
        fontSize: fontScale(14),
        color: Colors.textSecondary,
    },
    summaryValue: {
        fontSize: fontScale(14),
        fontWeight: '500',
        color: Colors.textDark,
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(10),
        paddingTop: verticalScale(10),
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight
    },
    grandTotalLabel: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    grandTotalValue: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    
    footer: {
        padding: moderateScale(16),
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        backgroundColor: Colors.backgroundLight,
    },
    checkoutButton: {
        backgroundColor: Colors.primary,
        paddingVertical: verticalScale(14),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkoutButtonText: {
        color: Colors.textLight,
        fontSize: fontScale(16),
        fontWeight: 'bold',
    },
});

export default MyCartScreen;