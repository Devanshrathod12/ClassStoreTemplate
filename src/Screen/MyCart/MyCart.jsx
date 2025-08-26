import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import { apiGet, apiDelete } from '../../api/api';
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';

const ASYNC_STORAGE_KEY = 'childCartData';

const MyCartScreen = ({ navigation }) => {
    const [cartDataByChild, setCartDataByChild] = useState([]);
    const [cartDetails, setCartDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // This function remains correct. It properly reads the API and AsyncStorage.
    const fetchCartData = useCallback(async () => {
        setIsLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                setCartDataByChild([]);
                setCartDetails(null);
                setIsLoading(false);
                return;
            }

            const [cartResponse, childrenResponse, childCartsString] = await Promise.all([
                apiGet('/api/v1/cart').catch(() => null),
                apiGet(`/api/v1/children/user/${userId}`),
                AsyncStorage.getItem(ASYNC_STORAGE_KEY)
            ]);

            const childCarts = childCartsString ? JSON.parse(childCartsString) : {};

            if (cartResponse && cartResponse.cart_id) {
                setCartDetails(cartResponse);
                
                const itemsResponse = await apiGet(`/api/v1/cart/${cartResponse.cart_id}/items`).catch(() => []);

                if (Array.isArray(itemsResponse) && itemsResponse.length > 0) {
                    const enrichedItems = await Promise.all(
                        itemsResponse.map(async (item) => {
                            const bundleDetails = await apiGet(`/api/v1/bundle/${item.bundle_id}`).catch(() => null);
                            return {
                                ...item,
                                bundle_name: bundleDetails?.bundle_name || 'Unknown Bundle',
                            };
                        })
                    );
                    
                    const itemDetailsMap = new Map();
                    enrichedItems.forEach(item => itemDetailsMap.set(String(item.bundle_id), item));

                    const structuredData = childrenResponse
                        .map(child => {
                            const childIdStr = String(child.id);
                            const bundleIdsForChild = childCarts[childIdStr] || [];
                            const itemsForChild = bundleIdsForChild
                                .map(bundleId => itemDetailsMap.get(String(bundleId)))
                                .filter(Boolean);

                            return {
                                childInfo: child,
                                items: itemsForChild,
                            };
                        })
                        .filter(group => group.items.length > 0);

                    setCartDataByChild(structuredData);
                } else {
                    setCartDataByChild([]);
                }
            } else {
                setCartDataByChild([]);
                setCartDetails(null);
            }
        } catch (error) {
            console.error("Failed to fetch cart items:", error);
            showMessage({ message: "Error", description: "Could not load your cart.", type: 'danger' });
            setCartDataByChild([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchCartData();
        }, [fetchCartData])
    );

    // --- LOGIC CORRECTION: This function is now updated ---
    const handleDeleteItem = async (cartItemId, bundleId, childId) => {
        showMessage({ message: "Removing item...", type: "info" });
        try {
            // 1. Delete the item from the API. This removes it from the central cart.
            await apiDelete(`/api/v1/cart/items/${cartItemId}`);
            
            // 2. (THE FIX) Remove the link to this bundle from ALL children in AsyncStorage.
            const childCartsRaw = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
            let childCarts = childCartsRaw ? JSON.parse(childCartsRaw) : {};
            
            console.log(`Deleting bundle ${bundleId} from all children in AsyncStorage.`);

            // Iterate over every child in the storage object
            for (const key in childCarts) {
                // Filter out the deleted bundleId from each child's list
                childCarts[key] = childCarts[key].filter(id => String(id) !== String(bundleId));
            }
            
            // Optional: Clean up any children who now have an empty list
            const cleanedChildCarts = Object.entries(childCarts)
                .filter(([_, bundles]) => bundles.length > 0)
                .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {});

            await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(cleanedChildCarts));
            
            showMessage({ message: "Success", description: "Item removed from your cart.", type: "success" });
            
            // 3. Refresh data from the server. The cart will now be empty.
            fetchCartData();

        } catch (error) {
            console.error("Failed to delete item:", error);
            const errorMessage = error.response?.data?.detail || "Could not remove the item.";
            showMessage({ message: "Error", description: errorMessage, type: "danger" });
        }
    };

    // --- No changes are needed below this line ---

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <MaterialIcons name="arrow-back" size={scale(24)} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Cart</Text>
            <View style={{ width: scale(24) }} />
        </View>
    );

    const renderCartItem = (item, childId) => (
        <View key={`${childId}-${item.cart_item_id}`} style={styles.itemCard}>
            <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.bundle_name}</Text>
                <Text style={styles.itemPrice}>₹{parseFloat(item.unit_price).toFixed(2)}</Text>
            </View>
            <View style={styles.itemActions}>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                <TouchableOpacity onPress={() => handleDeleteItem(item.cart_item_id, item.bundle_id, childId)}>
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
        if (cartDataByChild.length === 0) {
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
                {cartDataByChild.map(childGroup => (
                    <View key={childGroup.childInfo.id} style={styles.childSection}>
                        <Text style={styles.childSectionHeader}>Items for {childGroup.childInfo.name}</Text>
                        {childGroup.items.map(item => renderCartItem(item, childGroup.childInfo.id))}
                    </View>
                ))}
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
                {!isLoading && cartDataByChild.length > 0 && (
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
    childSection: {
        marginBottom: verticalScale(20),
    },
    childSectionHeader: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: verticalScale(10),
        paddingBottom: verticalScale(5),
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: "white",
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
        marginTop: verticalScale(10),
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
        backgroundColor: "blue",
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