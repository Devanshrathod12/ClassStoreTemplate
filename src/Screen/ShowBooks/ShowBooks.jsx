import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { showMessage } from 'react-native-flash-message';
import Colors from '../../styles/colors';
import { scale, fontScale, moderateScale, verticalScale } from '../../styles/stylesconfig';
import { apiGet, apiPost } from '../../api/api';
import NavigationString from '../../Navigation/NavigationString';
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';

const ShowBooks = ({ route, navigation }) => {
  const { pkg, child } = route.params;
  const bundleId = pkg.id;
  const bundleName = pkg.title;

  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBundleAdded, setIsBundleAdded] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bundleId) {
        showMessage({ message: "Error", description: "Bundle ID is missing.", type: "danger" });
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const bundleContents = await apiGet(`/api/v1/books-bundle/bundle/${bundleId}`);
        if (!bundleContents || !Array.isArray(bundleContents) || bundleContents.length === 0) {
          setBooks([]);
          setIsLoading(false);
          return;
        }
        const bookDetailPromises = bundleContents.map(item => apiGet(`/api/v1/book/${item.book_id}`));
        const resolvedBookDetails = await Promise.all(bookDetailPromises);
        setBooks(resolvedBookDetails.filter(book => book != null));
      } catch (error) {
        console.error("An error occurred during the fetch process:", error);
        showMessage({ message: "API Error", description: "Could not fetch the book list.", type: "danger" });
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookDetails();
  }, [bundleId]);

  const handleAddToCart = async (bundleId) => {
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
        setIsBundleAdded(true);
        showMessage({ message: "Success!", description: "Bundle added to your cart.", type: "success" });
    } catch (error) {
        console.error("Failed to add to cart:", error.response?.data || error);
        showMessage({ message: "Failed to Add", description: "Could not add the bundle to your cart.", type: "danger" });
    }
  };

  const handleOrderNow = () => {
    navigation.navigate(NavigationString.DeliveryAddress, { child: child, pkg: pkg });
  };
  
  const renderBookItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Image
            source={item.image_url ? { uri: item.image_url } : require('../../assets/book.png')}
            style={styles.bookImage}
          />
          <View style={styles.bookInfo}>
            <Text style={styles.bookName}>{item.book_name}</Text>
            {item.subject && <Text style={styles.bookSubject}>Subject: {item.subject}</Text>}
            <Text style={styles.bookPrice}>Price: ₹{parseFloat(item.price).toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />;
    }
    return (
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.book_id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => <Text style={styles.listHeader}>Books Included in "{bundleName}"</Text>}
        ListEmptyComponent={() => <Text style={styles.emptyText}>No books were found for this bundle.</Text>}
      />
    );
  };

  return (
    <AdaptiveSafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={scale(24)} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{bundleName}</Text>
          <View style={{ width: scale(24) }} />
        </View>
        
        <View style={{flex: 1}}>
            {renderContent()}
        </View>

        {!isLoading && books.length > 0 && (
            <View style={styles.footer}>
                <TouchableOpacity
                    style={isBundleAdded ? styles.addedToCartButton : styles.addToCartButton}
                    onPress={() => handleAddToCart(bundleId)}
                    disabled={isBundleAdded}
                >
                    {isBundleAdded ? (
                    <MaterialIcons name="check" size={scale(18)} color={Colors.success} />
                    ) : (
                    <MaterialCommunityIcons name="cart-plus" size={scale(18)} color={Colors.primary} />
                    )}
                    <Text style={isBundleAdded ? styles.addedToCartButtonText : styles.addToCartButtonText}>
                    {isBundleAdded ? "Added" : "Add To Cart"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.orderButton}
                    onPress={handleOrderNow}
                >
                    <Text style={styles.orderButtonText}>Order Now</Text>
                </TouchableOpacity>
            </View>
        )}
      </View>
    </AdaptiveSafeAreaView>
  );
}

export default ShowBooks;

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
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    headerTitle: {
        fontSize: fontScale(18),
        fontWeight: 'bold',
        color: Colors.textPrimary,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: scale(10),
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        paddingHorizontal: moderateScale(16),
        paddingTop: moderateScale(20),
        paddingBottom: moderateScale(10),
    },
    listHeader: {
        fontSize: fontScale(18),
        fontWeight: '700',
        color: Colors.textDark,
        marginBottom: moderateScale(16),
    },
    card: {
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderRadius: moderateScale(12),
        padding: moderateScale(14),
        marginBottom: verticalScale(20),
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookImage: {
        width: scale(70),
        height: verticalScale(90),
        borderRadius: moderateScale(8),
        marginRight: moderateScale(14),
        backgroundColor: Colors.borderLight,
    },
    bookInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    bookName: {
        fontSize: fontScale(16),
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: verticalScale(4),
    },
    bookSubject: {
        fontSize: fontScale(13),
        color: Colors.textSecondary,
        marginBottom: verticalScale(6),
    },
    bookPrice: {
        fontSize: fontScale(14),
        color: Colors.primary,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: moderateScale(50),
        fontSize: fontScale(14),
        color: Colors.textMuted,
    },
    footer: {
        flexDirection: 'row',
        padding: moderateScale(16),
        backgroundColor: Colors.WhiteBackgroudcolor,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
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
});