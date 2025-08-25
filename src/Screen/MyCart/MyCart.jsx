import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
// Step 1: apiDelete ko import karein
import { apiGet, apiDelete } from '../../api/api'; 
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';

const MyCartScreen = ({ navigation }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartDetails, setCartDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCartData = useCallback(async () => {
        try {
            const cartResponse = await apiGet('/api/v1/cart');
            if (cartResponse && cartResponse.cart_id) {
                setCartDetails(cartResponse);
                const cartId = cartResponse.cart_id;
                
                const itemsResponse = await apiGet(`/api/v1/cart/${cartId}/items`);
                
                if (itemsResponse && Array.isArray(itemsResponse) && itemsResponse.length > 0) {
                    const enrichedItems = await Promise.all(
                        itemsResponse.map(async (item) => {
                            const bundleDetails = await apiGet(`/api/v1/bundle/${item.bundle_id}`);
                            return {
                                ...item,
                                bundle_name: bundleDetails?.bundle_name || 'Unknown Bundle',
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
            if (isLoading) {
                showMessage({ message: "Error", description: "Could not load your cart.", type: 'danger' });
            }
            setCartItems([]);
        } finally {
            if (isLoading) setIsLoading(false);
        }
    }, [isLoading]);

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);
            fetchCartData();
        }, [])
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

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={scale(24)} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Cart</Text>
            <View style={{ width: scale(24) }} />
        </View>
    );

    const renderCartItem = (item, index) => (
        <View key={item.cart_item_id} style={styles.itemCard}>
            <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.bundle_name}</Text>
                <Text style={styles.itemPrice}>₹{parseFloat(item.unit_price).toFixed(2)}</Text>
            </View>
            <View style={styles.itemActions}>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                <TouchableOpacity onPress={() => handleDeleteItem(item.cart_item_id)}>
                    <MaterialCommunityIcons name="delete-outline" size={scale(22)} color={Colors.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSummary = () => (
        <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Items</Text>
                <Text style={styles.summaryValue}>{cartDetails?.quantity || 0}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>₹{parseFloat(cartDetails?.total_amount || 0).toFixed(2)}</Text>
            </View>
        </View>
    );

    const renderContent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />;
        }
        if (cartItems.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="cart-off" size={scale(60)} color={Colors.textMuted} />
                    <Text style={styles.emptyText}>Your Cart is Empty</Text>
                    <Text style={styles.emptySubText}>Looks like you haven't added anything to your cart yet.</Text>
                </View>
            );
        }
        return (
            <>
                {cartItems.map((item, index) => renderCartItem(item, index))}
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
                    <TouchableOpacity onPress={() => navigation.navigate("Delivery")} style={styles.checkoutButton}>
                        <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
        </AdaptiveSafeAreaView>
    );
};

// ...AAPKE SAARE STYLES BINA KISI BADLAV KE...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: moderateScale(16),
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    headerTitle: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: Colors.textPrimary,
    },
    content: {
        flexGrow: 1,
        padding: scale(16),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: verticalScale(100),
    },
    emptyText: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginTop: verticalScale(15),
    },
    emptySubText: {
        fontSize: fontScale(14),
        color: Colors.textMuted,
        marginTop: verticalScale(5),
        textAlign: 'center',
        paddingHorizontal: scale(20),
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderRadius: moderateScale(12),
        padding: moderateScale(14),
        marginBottom: verticalScale(12),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    itemDetails: {
        flex: 1,
        marginRight: scale(10),
    },
    itemName: {
        fontSize: fontScale(15),
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    itemPrice: {
        fontSize: fontScale(14),
        color: Colors.textSecondary,
        marginTop: verticalScale(4),
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemQuantity: {
        fontSize: fontScale(14),
        fontWeight: '500',
        color: Colors.textPrimary,
        marginRight: scale(15),
    },
    summaryCard: {
        backgroundColor: Colors.backgroundFaded,
        borderRadius: moderateScale(12),
        padding: moderateScale(16),
        marginTop: verticalScale(20),
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    summaryTitle: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: verticalScale(12),
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
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    footer: {
        padding: moderateScale(16),
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        backgroundColor: Colors.backgroundLight,
    },
    checkoutButton: {
        backgroundColor: Colors.button,
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