import React, { useState, useEffect, useCallback } from 'react';
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
import NavigationString from '../../Navigation/NavigationString';
import { apiGet, apiPost } from '../../api/api';
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';

const SelectPackageScreen = ({ route, navigation }) => {
    const { child } = route.params;
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [AddedToCartIds, setAddedToCartIds] = useState([]);

    useFocusEffect(
        useCallback(() => {
            const fetchPackagesAndBookOverviews = async () => {
                if (!child?.classId) {
                    showMessage({
                        message: "Error",
                        description: "Could not find class information for this child.",
                        type: "danger",
                    });
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);
                try {
                    const bundleResponse = await apiGet(`/api/v1/bundle/class/${child.classId}`);
                    if (bundleResponse && Array.isArray(bundleResponse)) {
                        const enhancedPackagesPromises = bundleResponse.map(async (pkg) => {
                            const price = parseFloat(pkg.price);
                            const discount = parseFloat(pkg.discount);
                            const originalPrice = price + discount;
                            let bookOverviews = [];
                            let totalBookCount = 0;

                            try {
                                const bundleContents = await apiGet(`/api/v1/books-bundle/bundle/${pkg.bundle_id}`);
                                if (bundleContents && Array.isArray(bundleContents) && bundleContents.length > 0) {
                                    totalBookCount = bundleContents.length;
                                    const previewItems = bundleContents.slice(0, 4);
                                    const bookDetailPromises = previewItems.map(item => apiGet(`/api/v1/book/${item.book_id}`));
                                    const resolvedBookDetails = await Promise.all(bookDetailPromises);
                                    bookOverviews = resolvedBookDetails
                                        .filter(book => book)
                                        .map(book => book.book_name);
                                }
                            } catch (error) {
                                console.error(`Failed to fetch book overview for bundle ${pkg.bundle_id}:`, error);
                            }

                            return {
                                ...pkg,
                                id: pkg.bundle_id,
                                title: pkg.bundle_name,
                                price: price,
                                originalPrice: originalPrice,
                                description: `A curated educational package for Class ${child.standard}.`,
                                bookNames: bookOverviews,
                                totalBooks: totalBookCount
                            };
                        });
                        
                        const finalPackages = await Promise.all(enhancedPackagesPromises);
                        setPackages(finalPackages);
                    } else {
                        setPackages([]);
                    }
                } catch (error) {
                    console.error("Failed to fetch packages:", error);
                    showMessage({
                        message: "API Error",
                        description: "Could not fetch available bundles.",
                        type: "danger",
                    });
                } finally {
                    setIsLoading(false);
                }
            };

            fetchPackagesAndBookOverviews();
        }, [child])
    );
    
    if (!child) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: Could not load child details.</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.goBackText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    /*  AAPKA PURANA CODE COMMENT MEIN WAISA HI HAI
    const HandleAddToCart = async (bundleId) => {
        showMessage({ message: "Adding To Cart", type: "info" });
        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 1);
            const payload = {
                bundle_id: String(bundleId),
                quantity: 1,
                expires_at: expiresAt.toISOString(),
            };
            await apiPost('/api/v1/cart', payload);
            setAddedToCartIds(prevIds => [...prevIds, bundleId]);
            showMessage({ message: "Success!", description: "Bundle added to your cart.", type: "success" });
        } catch (error) {
            console.error("Failed to add to cart:", error.response?.data || error);
            showMessage({ message: "Failed to Add", description: "Could not add the bundle to your cart.", type: "danger" });
        }
    };
    */
    
    const renderPackage = (pkg) => {
        const savedAmount = pkg.originalPrice - pkg.price;
        const isAdded = AddedToCartIds.includes(pkg.id);
        
        return (
            <TouchableOpacity
                key={pkg.id}
                style={styles.packageCard}
                activeOpacity={0.9}
                // SIRF YEH LINE UPDATE KI GAYI HAI
                onPress={() => navigation.navigate(NavigationString.ShowBooks, { 
                    pkg: pkg,
                    child: child
                })}
            >
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

                {pkg.bookNames && pkg.bookNames.length > 0 && (
                    <View style={styles.detailsSection}>
                        <Text style={styles.detailTitle}><MaterialCommunityIcons name="bookshelf" /> Books Included ({pkg.totalBooks})</Text>
                        {pkg.bookNames.map((bookName, index) => (
                            <Text key={index} style={styles.detailItem} numberOfLines={1}>• {bookName}</Text>
                        ))}
                        {pkg.totalBooks > pkg.bookNames.length && (
                             <Text style={styles.detailItem}>• and {pkg.totalBooks - pkg.bookNames.length} more...</Text>
                        )}
                    </View>
                )}

                {/* AAPKA PURANA BUTTONS WALA CODE COMMENT MEIN WAISA HI HAI */}
                {/* <View style={styles.buttonRow}>
                    <TouchableOpacity 
                        style={isAdded ? styles.addedToCartButton : styles.addToCartButton}
                        onPress={() => HandleAddToCart(pkg.id)}
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
                        style={styles.orderButton}
                        onPress={() => navigation.navigate(NavigationString.DeliveryAddress, { child: child, pkg: pkg })}
                    >
                        <Text style={styles.orderButtonText}>Order Now</Text>
                    </TouchableOpacity>
                </View> */}
            </TouchableOpacity>
        );
    };

    const renderContent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />;
        }
        if (packages.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No bundles available for this class right now.</Text>
                    <Text style={styles.emptySubText}>Please check back later.</Text>
                </View>
            );
        }
        return packages.map(pkg => renderPackage(pkg));
    };

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
                        <Text style={styles.childDetails}>{child.age} years • {child.school_name}</Text>
                    </View>
                </View>
                {renderContent()}
            </ScrollView>
        </View>
        </AdaptiveSafeAreaView>
    );
};

// ...AAPKE SAARE STYLES BINA KISI BADLAV KE...
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
        marginBottom: verticalScale(20),
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
    packageCard: {
        backgroundColor: Colors.WhiteBackgroudcolor,
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
    detailsSection: {
        marginTop: verticalScale(12),
        paddingTop: verticalScale(12),
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    detailTitle: {
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: verticalScale(8),
    },
    detailItem: {
        fontSize: fontScale(13),
        color: Colors.textSecondary,
        marginBottom: verticalScale(4),
        marginLeft: scale(8),
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(15),
    },
    addToCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.backgroundLight,
        borderWidth: 1,
        borderColor: Colors.primary,
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(8),
        flex: 1,
        marginRight: scale(10),
    },
    addToCartButtonText: {
        color: Colors.primary,
        fontSize: fontScale(16),
        fontWeight: 'bold',
        marginLeft: scale(8),
    },
    orderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.button,
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(8),
        flex: 1,
    },
    orderButtonText: {
        color: Colors.textLight,
        fontSize: fontScale(16),
        fontWeight: 'bold',
    },
     addedToCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: Colors.success,
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(8),
        flex: 1,
        marginRight: scale(10),
    },
    addedToCartButtonText: {
        color: Colors.success,
        fontSize: fontScale(16),
        fontWeight: 'bold',
        marginLeft: scale(8),
    },
});

export default SelectPackageScreen;