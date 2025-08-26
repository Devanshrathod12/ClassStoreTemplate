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
    Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../styles/colors';
import { scale, fontScale, verticalScale, moderateScale } from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';
import { apiGet, apiPost } from '../../api/api';
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';

const ASYNC_STORAGE_KEY = 'childCartData';
const BOOKS_TO_PREVIEW = 3; // You can change this number to show more/less books in the preview

const SelectPackageScreen = ({ route, navigation }) => {
    const { child } = route.params;
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [childCarts, setChildCarts] = useState({});
    const [apiCartItems, setApiCartItems] = useState([]);

    useFocusEffect(
        useCallback(() => {
            const loadInitialData = async () => {
                setIsLoading(true);
                try {
                    // --- STEP 1: Fetch all data concurrently ---
                    const [storedCartsRaw, cartResponse, bundleResponse] = await Promise.all([
                        AsyncStorage.getItem(ASYNC_STORAGE_KEY),
                        apiGet('/api/v1/cart').catch(() => null),
                        child.classId ? apiGet(`/api/v1/bundle/class/${child.classId}`) : Promise.resolve([])
                    ]);
                    
                    let localChildCarts = storedCartsRaw ? JSON.parse(storedCartsRaw) : {};
                    let currentApiItems = [];

                    // --- STEP 2: Get the TRUE state of the cart from the API ---
                    if (cartResponse && cartResponse.cart_id) {
                        currentApiItems = await apiGet(`/api/v1/cart/${cartResponse.cart_id}/items`).catch(() => []);
                        setApiCartItems(currentApiItems);
                    }

                    // --- STEP 3 (THE FIX): Synchronize AsyncStorage with the API cart ---
                    const apiBundleIds = new Set(currentApiItems.map(item => String(item.bundle_id)));
                    let isStorageDirty = false; // Flag to check if we need to update storage
                    
                    Object.keys(localChildCarts).forEach(childId => {
                        const originalCount = localChildCarts[childId].length;
                        // For each child, keep only the bundle IDs that actually exist in the API cart
                        localChildCarts[childId] = localChildCarts[childId].filter(bundleId => apiBundleIds.has(String(bundleId)));
                        
                        if (localChildCarts[childId].length !== originalCount) {
                            isStorageDirty = true;
                        }
                        // Clean up empty entries
                        if (localChildCarts[childId].length === 0) {
                            delete localChildCarts[childId];
                        }
                    });

                    if (isStorageDirty) {
                        console.log("SYNC: Discrepancy found. Cleaning AsyncStorage...");
                        await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(localChildCarts));
                    }
                    
                    // Use the cleaned, synchronized data for the UI state
                    setChildCarts(localChildCarts);

                    // --- STEP 4: Process and display bundles ---
                    if (Array.isArray(bundleResponse)) {
                        const enhancedPackagesPromises = bundleResponse.map(async (pkg) => {
                            const price = parseFloat(pkg.price);
                            const discount = parseFloat(pkg.discount);
                            const originalPrice = price + discount;
                            let booksPreview = [];
                            let totalBookCount = 0;
                            try {
                                const bundleContents = await apiGet(`/api/v1/books-bundle/bundle/${pkg.bundle_id}`);
                                if (Array.isArray(bundleContents) && bundleContents.length > 0) {
                                    totalBookCount = bundleContents.length;
                                    const bookDetailPromises = bundleContents.slice(0, BOOKS_TO_PREVIEW).map(item => apiGet(`/api/v1/book/${item.book_id}`));
                                    booksPreview = await Promise.all(bookDetailPromises);
                                }
                            } catch (error) {}
                            return {
                                ...pkg, id: pkg.bundle_id, title: pkg.bundle_name, price, originalPrice,
                                description: `A curated package for Class ${child.standard}.`,
                                booksPreview: booksPreview.filter(Boolean), totalBooks: totalBookCount
                            };
                        });
                        setPackages(await Promise.all(enhancedPackagesPromises));
                    } else {
                        setPackages([]);
                    }
                } catch (error) {
                    console.error("Failed to load screen data:", error);
                    showMessage({ message: "Error", description: "Could not load page data.", type: "danger" });
                } finally {
                    setIsLoading(false);
                }
            };

            loadInitialData();
        }, [child])
    );
    
    const handleAddToCart = async (bundleId) => {
        showMessage({ message: "Adding To Cart...", type: "info" });
        try {
            const bundleIdStr = String(bundleId);
            const isAlreadyInApiCart = apiCartItems.some(item => String(item.bundle_id) === bundleIdStr);

            if (!isAlreadyInApiCart) {
                const cart = await apiGet('/api/v1/cart');
                if (!cart || !cart.cart_id) {
                    showMessage({ message: "Error", description: "Could not find your cart.", type: "danger" });
                    return;
                }
                const payload = { bundle_id: bundleIdStr, quantity: 1 };
                await apiPost(`/api/v1/cart/${cart.cart_id}/items`, payload);
            }
            
            const childIdStr = String(child.id);
            const currentChildBundleIds = childCarts[childIdStr] || [];
            if (currentChildBundleIds.includes(bundleIdStr)) {
                showMessage({ message: "Already Added", type: "warning" });
                return;
            }

            const newIdsForChild = [...currentChildBundleIds, bundleIdStr];
            const newChildCartsState = { ...childCarts, [childIdStr]: newIdsForChild };

            await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(newChildCartsState));
            setChildCarts(newChildCartsState);

            showMessage({ message: "Success!", description: "Bundle added to cart.", type: "success" });
        } catch (error) {
            console.error("Failed to add to cart:", error);
            showMessage({ message: "Failed to Add", description: "Could not add bundle to cart.", type: "danger" });
        }
    };
    
    // The render logic below remains the same as it correctly uses the synchronized state
    const renderPackage = (pkg) => {
        const savedAmount = pkg.originalPrice - pkg.price;
        const isAdded = (childCarts[String(child.id)] || []).includes(String(pkg.id));
        
        return (
            <View key={pkg.id} style={styles.packageCard}>
                 <View style={styles.packageHeader}>
                    <View style={styles.packageInfo}>
                        <Text style={styles.packageTitle}>{pkg.title}</Text>
                        <Text style={styles.packageDescription}>{pkg.description}</Text>
                    </View>
                    <View style={styles.priceContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Text style={styles.originalPrice}>₹{pkg.originalPrice.toFixed(2)}</Text>
                            <Text style={styles.finalPrice}>₹{pkg.price.toFixed(2)}</Text>
                        </View>
                        {savedAmount > 0 && (
                             <View style={styles.saveTag}><Text style={styles.saveText}>Save ₹{savedAmount.toFixed(2)}</Text></View>
                        )}
                    </View>
                </View>

                {pkg.booksPreview && pkg.booksPreview.length > 0 && (
                    <View style={styles.booksListSection}>
                        <Text style={styles.detailTitle}>
                            <MaterialCommunityIcons name="bookshelf" size={scale(16)} color={Colors.textDark} /> What's Inside? ({pkg.totalBooks} Items)
                        </Text>
                        {pkg.booksPreview.map(book => (
                            <View key={book.book_id} style={styles.bookListItem}>
                                <Image 
                                    source={book.image_url ? { uri: book.image_url } : require('../../assets/book.png')}
                                    style={styles.bookListImage}
                                />
                                <View style={styles.bookListInfo}>
                                    <Text style={styles.bookListName} numberOfLines={1}>{book.book_name}</Text>
                                    <View style={styles.subjectTag}>
                                        <Text style={styles.subjectTagText}>{book.subject}</Text>
                                    </View>
                                </View>
                                <Text style={styles.bookListPrice}>₹{parseFloat(book.price).toFixed(2)}</Text>
                            </View>
                        ))}
                        {pkg.totalBooks > BOOKS_TO_PREVIEW && (
                            <Text style={styles.moreBooksText}>and {pkg.totalBooks - BOOKS_TO_PREVIEW} more items...</Text>
                        )}
                    </View>
                )}

                <View style={styles.actionButtonContainer}>
                    <TouchableOpacity 
                        style={[styles.buttonBase, isAdded ? styles.addedToCartButton : styles.addToCartButton]}
                        onPress={() => handleAddToCart(pkg.id)}
                        disabled={isAdded}
                    >
                        {isAdded ? (
                            <MaterialIcons name="check" size={scale(18)} color={Colors.success} />
                        ) : (
                            <MaterialCommunityIcons name="cart-plus" size={scale(18)} color={Colors.primary} />
                        )}
                        <Text style={isAdded ? styles.addedToCartButtonText : styles.addToCartButtonText}>{isAdded ? "Added" : "Add To Cart"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.buttonBase, styles.orderButton]}
                        onPress={() => navigation.navigate(NavigationString.DeliveryAddress, { child: child, pkg: pkg })}
                    >
                        <Text style={styles.orderButtonText}>Order Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderContent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />;
        }
        if (packages.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No bundles available for this class.</Text>
                    <Text style={styles.emptySubText}>Please check back later.</Text>
                </View>
            );
        }
        return packages.map(pkg => renderPackage(pkg));
    };

    if (!child) { return null; }

    return (
        <AdaptiveSafeAreaView>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={scale(24)} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Select Bundle</Text>
                        <Text style={styles.headerSubtitle}>For {child.name} • Class {child.standard}</Text>
                    </View>
                    <View style={{ width: scale(24) }} />
                </View>
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.childBanner}>
                         <View style={styles.childIconCircle} />
                        <View>
                            <Text style={styles.childName}>{child.name}</Text>
                            <Text style={styles.childDetails}>Class {child.standard} • {child.school_name}</Text>
                        </View>
                    </View>

                    <View>
                        <Text style={styles.sectionHeader}>Available Learning Bundles</Text>
                        <Text style={styles.sectionSubheader}>Choose the perfect set of books for {child.name}.</Text>
                    </View>

                    {renderContent()}
                </ScrollView>
            </View>
        </AdaptiveSafeAreaView>
    );
};
// --- STYLES (No changes needed) ---
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
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
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
        paddingHorizontal: scale(16),
        paddingBottom: verticalScale(30),
        backgroundColor: Colors.backgroundLight,
    },
    errorContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    errorText: {
        fontSize: 18, 
        color: 'red', 
        textAlign: 'center'
    },
    goBackText: {
        color: Colors.primary, 
        marginTop: 15, 
        fontSize: 16 
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: fontScale(14),
        color: Colors.textMuted,
        marginTop: verticalScale(5),
        textAlign: 'center',
    },
    childBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        width: '100%',
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(16),
        borderRadius: moderateScale(12),
        marginTop: verticalScale(20),
        marginBottom: verticalScale(10),
    },
    childIconCircle: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: Colors.textLight,
        marginRight: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    childName: {
        color: Colors.textLight,
        fontSize: fontScale(14),
        fontWeight: 'bold',
    },
    childDetails: {
        color: Colors.textLight,
        fontSize: fontScale(12),
    },
    sectionHeader: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: Colors.textDark,
        marginTop: verticalScale(15),
    },
    sectionSubheader: {
        fontSize: fontScale(13),
        color: Colors.textSecondary,
        marginBottom: verticalScale(20),
    },
    packageCard: {
        backgroundColor: "white",
        borderRadius: moderateScale(12),
        padding: moderateScale(14),
        marginBottom: verticalScale(20),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: verticalScale(10),
    },
    packageInfo: {
        flex: 1,
        marginRight: scale(8),
    },
    packageTitle: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    packageDescription: {
        fontSize: fontScale(12),
        color: Colors.textMuted,
        marginTop: verticalScale(4),
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    originalPrice: {
        textDecorationLine: 'line-through',
        color: Colors.textMuted,
        fontSize: fontScale(12),
        marginRight: scale(6),
    },
    finalPrice: {
        color: Colors.success,
        fontSize: fontScale(18),
        fontWeight: 'bold',
    },
    saveTag: {
        backgroundColor: '#E8F5E9',
        borderRadius: moderateScale(6),
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(3),
        marginTop: verticalScale(4),
    },
    saveText: {
        color: Colors.success,
        fontSize: fontScale(11),
        fontWeight: 'bold',
    },
    booksListSection: {
        marginTop: verticalScale(12),
        paddingTop: verticalScale(12),
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    detailTitle: {
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: verticalScale(15),
    },
    bookListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    bookListImage: {
        width: scale(50),
        height: verticalScale(65),
        borderRadius: moderateScale(6),
        backgroundColor: Colors.borderLight,
        marginRight: scale(12),
    },
    bookListInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    bookListName: {
        fontSize: fontScale(14),
        fontWeight: '600',
        color: Colors.textDark,
    },
    subjectTag: {
        backgroundColor: Colors.backgroundPrimaryLight,
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(3),
        borderRadius: moderateScale(10),
        alignSelf: 'flex-start',
        marginTop: verticalScale(4),
    },
    subjectTagText: {
        color: Colors.primary,
        fontSize: fontScale(10),
        fontWeight: '600',
    },
    bookListPrice: {
        fontSize: fontScale(13),
        fontWeight: 'bold',
        color: Colors.primary,
    },
    moreBooksText: {
        fontSize: fontScale(12),
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: verticalScale(5),
        fontStyle: 'italic',
    },
    actionButtonContainer: {
        marginTop: verticalScale(15),
        paddingTop: verticalScale(15),
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    buttonBase: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(8),
        width: '100%',
    },
    addToCartButton: {
        backgroundColor: Colors.backgroundLight,
        borderWidth: 1,
        borderColor: Colors.primary,
        marginBottom: verticalScale(10),
        
    },
    addedToCartButton: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: Colors.success,
        marginBottom: verticalScale(10),
    },
    orderButton: {
        backgroundColor: "blue",
    },
    addToCartButtonText: {
        color: Colors.primary,
        fontSize: fontScale(16),
        fontWeight: 'bold',
        marginLeft: scale(8),
    },
    addedToCartButtonText: {
        color: Colors.success,
        fontSize: fontScale(16),
        fontWeight: 'bold',
        marginLeft: scale(8),
    },
    orderButtonText: {
        color: Colors.textLight,
        fontSize: fontScale(16),
        fontWeight: 'bold',
    },
});

export default SelectPackageScreen;