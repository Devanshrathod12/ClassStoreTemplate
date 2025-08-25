import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { apiGet } from '../../api/api';
import Colors from '../../styles/colors';
import {
  scale,
  fontScale,
  verticalScale,
  moderateScale,
} from '../../styles/stylesconfig';
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) return;
      try {
        setIsLoading(true);
        const detailsPromise = apiGet(`/api/v1/orders/${orderId}`);
        const itemsPromise = apiGet(`/api/v1/orders/${orderId}/items`);
        const [detailsData, itemsData] = await Promise.all([
          detailsPromise,
          itemsPromise,
        ]);
        setOrderDetails(detailsData);
        setOrderItems(itemsData || []);
      } catch (error) {
        console.log(`Failed to fetch data for order ${orderId}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderData();
  }, [orderId]);

  const getStatusStyle = status => {
    switch (status) {
      case 'CONFIRMED':
        return {
          backgroundColor: Colors.backgroundSuccess,
          color: Colors.success,
        };
      case 'SHIPPED':
        return { backgroundColor: Colors.backgroundInfo, color: Colors.info };
      case 'DELIVERED':
        return {
          backgroundColor: Colors.backgroundPrimaryLight,
          color: Colors.primary,
        };
      case 'CANCELLED':
        return {
          backgroundColor: Colors.backgroundDanger,
          color: Colors.danger,
        };
      default:
        return {
          backgroundColor: Colors.background,
          color: Colors.textSecondary,
        };
    }
  };

  const PriceRow = ({ label, value, isNegative = false }) => (
    <View style={styles.priceRow}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={[styles.priceValue, isNegative && { color: Colors.danger }]}>
        {isNegative ? `- ₹${value}` : `₹${value}`}
      </Text>
    </View>
  );

  const renderOrderItem = item => (
    <View key={item.order_item_id} style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.bundle_name}
        </Text>
        <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>₹{parseFloat(item.total).toFixed(2)}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <AdaptiveSafeAreaView style={styles.safeArea}>
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </AdaptiveSafeAreaView>
    );
  }

  if (!orderDetails) {
    return (
      <AdaptiveSafeAreaView style={styles.safeArea}>
        <View style={styles.centeredView}>
          <Text style={styles.emptyText}>Could not load order details.</Text>
        </View>
      </AdaptiveSafeAreaView>
    );
  }

  const statusStyle = getStatusStyle(orderDetails.order_status);

  return (
    <AdaptiveSafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Colors.backgroundLight}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons
              name="arrow-back"
              size={scale(24)}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: scale(24) }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.statusBanner}>
            <Text style={styles.orderNumber}>
              Order #{orderDetails.order_number}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyle.backgroundColor },
              ]}
            >
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {orderDetails.order_status}
              </Text>
            </View>
          </View>

          <View style={styles.mainCard}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="package-variant-closed"
                  size={scale(20)}
                  color={Colors.primary}
                />
                <Text style={styles.sectionTitle}>Items Ordered</Text>
              </View>
              {orderItems.length > 0 ? (
                orderItems.map(renderOrderItem)
              ) : (
                <Text style={styles.emptyText}>
                  No items found for this order.
                </Text>
              )}
            </View>

            <View style={styles.separator} />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="truck-delivery-outline"
                  size={scale(20)}
                  color={Colors.primary}
                />
                <Text style={styles.sectionTitle}>Delivery Information</Text>
              </View>
              <Text style={styles.addressText}>
                {orderDetails.delivery_address}
              </Text>
              <Text style={styles.phoneText}>
                Phone: {orderDetails.delivery_phone}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="credit-card-outline"
                  size={scale(20)}
                  color={Colors.primary}
                />
                <Text style={styles.sectionTitle}>Payment Summary</Text>
              </View>
              <PriceRow
                label="Subtotal"
                value={parseFloat(orderDetails.subtotal || 0).toFixed(2)}
              />
              <PriceRow
                label="Discount"
                value={parseFloat(orderDetails.discount_amount || 0).toFixed(2)}
                isNegative
              />
              <Text style={styles.paymentMethod}>
                Paid via {orderDetails.payment_method}
              </Text>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>
                  ₹{parseFloat(orderDetails.total_amount).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </AdaptiveSafeAreaView>
  );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundLight },
  container: { flex: 1 },
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
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
  },
  content: { padding: scale(16) },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(14),
    backgroundColor: Colors.WhiteBackgroudcolor,
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(16),
    elevation: 2,
  },
  orderNumber: {
    fontSize: fontScale(15),
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statusBadge: {
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(10),
  },
  statusText: {
    fontSize: fontScale(11),
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  mainCard: {
    backgroundColor: Colors.WhiteBackgroudcolor,
    borderRadius: moderateScale(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  section: { padding: moderateScale(14) },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: fontScale(15),
    fontWeight: 'bold',
    color: Colors.textDark,
    marginLeft: scale(10),
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemInfo: { flex: 1, marginRight: scale(10) },
  itemName: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  itemQuantity: {
    fontSize: fontScale(12),
    color: Colors.textSecondary,
    marginTop: verticalScale(2),
  },
  itemPrice: {
    fontSize: fontScale(14),
    fontWeight: '500',
    color: Colors.textDark,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: moderateScale(14),
  },
  addressText: {
    fontSize: fontScale(14),
    color: Colors.textSecondary,
    lineHeight: verticalScale(21),
  },
  phoneText: {
    fontSize: fontScale(14),
    color: Colors.textSecondary,
    marginTop: verticalScale(6),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  priceLabel: { fontSize: fontScale(14), color: Colors.textSecondary },
  priceValue: {
    fontSize: fontScale(14),
    color: Colors.textDark,
    fontWeight: '500',
  },
  paymentMethod: {
    fontSize: fontScale(12),
    color: Colors.textMuted,
    marginTop: verticalScale(8),
    fontStyle: 'italic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(14),
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: verticalScale(12),
  },
  totalLabel: {
    fontSize: fontScale(16),
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  totalValue: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: Colors.success,
  },
  emptyText: {
    fontSize: fontScale(14),
    color: Colors.textMuted,
    alignSelf: 'center',
    paddingVertical: verticalScale(10),
  },
});
