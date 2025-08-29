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
import FlashMessage, { showMessage } from "react-native-flash-message";
import { apiGet, apiPost } from '../../api/api';
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
import moment from 'moment'; // Import moment for date formatting

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isShipping, setIsShipping] = useState(false); // New state for shipping
  const [isDelivering, setIsDelivering] = useState(false); // New state for delivering

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
      showMessage({
        message: "Error Loading Data",
        description: "Could not fetch order details. Please try again.",
        type: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const updatedOrder = await apiPost(`/api/v1/orders/${orderId}/cancel`);
      setOrderDetails(updatedOrder);
      showMessage({
        message: "Order Cancelled",
        description: "Your order has been successfully cancelled.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to cancel order:", error);
      showMessage({
        message: "Cancellation Failed",
        description: "We could not cancel your order. Please try again later.",
        type: "danger",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleShipOrder = async () => {
    setIsShipping(true);
    try {
      const updatedOrder = await apiPost(`/api/v1/orders/${orderId}/ship`);
      setOrderDetails(updatedOrder);
      showMessage({
        message: "Order Shipped",
        description: "The order has been marked as shipped.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to ship order:", error);
      showMessage({
        message: "Shipping Failed",
        description: "Could not mark order as shipped. Please try again.",
        type: "danger",
      });
    } finally {
      setIsShipping(false);
    }
  };

  const handleDeliverOrder = async () => {
    setIsDelivering(true);
    try {
      const updatedOrder = await apiPost(`/api/v1/orders/${orderId}/deliver`);
      setOrderDetails(updatedOrder);
      showMessage({
        message: "Order Delivered",
        description: "The order has been marked as delivered.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to deliver order:", error);
      showMessage({
        message: "Delivery Failed",
        description: "Could not mark order as delivered. Please try again.",
        type: "danger",
      });
    } finally {
      setIsDelivering(false);
    }
  };


  const getStatusStyle = status => {
    switch (status) {
      case 'CONFIRMED':
        return { backgroundColor: Colors.backgroundSuccess, color: Colors.success };
      case 'SHIPPED':
        return { backgroundColor: Colors.backgroundInfo, color: Colors.info };
      case 'DELIVERED':
        return { backgroundColor: Colors.backgroundPrimaryLight, color: Colors.primary };
      case 'CANCELLED':
        return { backgroundColor: Colors.backgroundDanger, color: Colors.danger };
      default:
        return { backgroundColor: Colors.background, color: Colors.textSecondary };
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
      <View style={styles.itemHeader}>
        <Text style={styles.itemName} numberOfLines={2}>{item.bundle_name}</Text>
        <Text style={styles.itemTotal}>₹{parseFloat(item.total).toFixed(2)}</Text>
      </View>
      <Text style={styles.itemBundleId}>Bundle ID: {item.bundle_id}</Text>

      <View style={styles.separator} />

      <View style={styles.itemPricingDetails}>
        <View style={styles.itemPriceRow}>
          <Text style={styles.itemPriceLabel}>Unit Price</Text>
          <Text style={styles.itemPriceValue}>₹{parseFloat(item.unit_price).toFixed(2)}</Text>
        </View>
        <View style={styles.itemPriceRow}>
          <Text style={styles.itemPriceLabel}>Quantity</Text>
          <Text style={styles.itemPriceValue}>{item.quantity}</Text>
        </View>
        {parseFloat(item.discount_amount) > 0 && (
          <View style={styles.itemPriceRow}>
            <Text style={[styles.itemPriceLabel, { color: Colors.success }]}>Discount</Text>
            <Text style={[styles.itemPriceValue, { color: Colors.success }]}>
              - ₹{parseFloat(item.discount_amount).toFixed(2)} ({item.discount_percentage}%)
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // New Tracking Component
  const TrackingStep = ({ label, date, isActive, isCompleted }) => {
    const iconColor = isCompleted ? Colors.primary : Colors.textMuted;
    const circleColor = isCompleted ? Colors.primaryLight : Colors.borderLight;
    const textColor = isCompleted ? Colors.textDark : Colors.textMuted;
    const dotColor = isCompleted ? Colors.primary : Colors.borderLight;

    return (
      <View style={styles.trackingStep}>
        <View style={styles.trackingStepIndicator}>
          <View style={[styles.trackingCircle, { borderColor: circleColor }]}>
            {isCompleted ? (
              <MaterialIcons name="check" size={scale(16)} color={Colors.primary} />
            ) : (
              <View style={[styles.trackingDot, { backgroundColor: dotColor }]} />
            )}
          </View>
          {/* Line connecting steps, if not the last step */}
          {label !== 'Delivered' && <View style={[styles.trackingLine, { backgroundColor: dotColor }]} />}
        </View>
        <Text style={[styles.trackingLabel, { color: textColor }]}>{label}</Text>
        {date && <Text style={[styles.trackingDate, { color: textColor }]}>{moment(date).format('MMM DD, YYYY')}</Text>}
      </View>
    );
  };

  if (isLoading) {
    return (
      <AdaptiveSafeAreaView style={styles.safeArea}>
        <View style={styles.centeredView}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </AdaptiveSafeAreaView>
    );
  }

  if (!orderDetails) {
    return (
      <AdaptiveSafeAreaView style={styles.safeArea}>
        <View style={styles.centeredView}><Text style={styles.emptyText}>Could not load order details.</Text></View>
      </AdaptiveSafeAreaView>
    );
  }

  const statusStyle = getStatusStyle(orderDetails.order_status);

  // Tracking Logic
  const orderPlacedDate = orderDetails.order_date;
  const orderConfirmedDate = orderDetails.confirmed_at;
  const orderShippedDate = orderDetails.shipped_at;
  const orderDeliveredDate = orderDetails.delivered_at;

  const isConfirmed = orderDetails.order_status !== 'PLACED' && orderDetails.order_status !== 'PENDING' && orderDetails.order_status !== 'CANCELLED';
  const isShipped = orderDetails.order_status === 'SHIPPED' || orderDetails.order_status === 'DELIVERED';
  const isDelivered = orderDetails.order_status === 'DELIVERED';


  return (
    <AdaptiveSafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={scale(24)} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitle}>Order Details</Text>
            {orderDetails.order_date && (
              <Text style={styles.orderDateText}>
                Order placed on {moment(orderDetails.order_date).format('MMM DD, YYYY')}
              </Text>
            )}
          </View>
          <View style={{ width: scale(24) }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.statusBanner}>
            <Text style={styles.orderNumber}>Order #{orderDetails.order_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusStyle.color }]}>{orderDetails.order_status}</Text>
            </View>
          </View>

          {/* New Order Tracking Section */}
          <View style={styles.trackingCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="timeline-text-outline" size={scale(20)} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Order Progress</Text>
            </View>
            <View style={styles.trackingTimeline}>
              <TrackingStep
                label="Placed"
                date={orderPlacedDate}
                isCompleted={!!orderPlacedDate}
                isActive={true} // Placed is always active once the order exists
              />
              <TrackingStep
                label="Confirmed"
                date={orderConfirmedDate}
                isCompleted={isConfirmed}
                isActive={orderDetails.order_status === 'CONFIRMED'}
              />
              <TrackingStep
                label="Shipped"
                date={orderShippedDate}
                isCompleted={isShipped}
                isActive={orderDetails.order_status === 'SHIPPED'}
              />
              <TrackingStep
                label="Delivered"
                date={orderDeliveredDate}
                isCompleted={isDelivered}
                isActive={orderDetails.order_status === 'DELIVERED'}
              />
            </View>
          </View>
          {/* End New Order Tracking Section */}

          <View style={styles.mainCard}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="package-variant-closed" size={scale(20)} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Items Ordered</Text>
              </View>
              {orderItems.length > 0 ? (
                orderItems.map(renderOrderItem)
              ) : (
                <Text style={styles.emptyText}>No items found for this order.</Text>
              )}
            </View>

            <View style={styles.separator} />
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="truck-delivery-outline" size={scale(20)} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Delivery Information</Text>
              </View>
              <Text style={styles.addressText}>{orderDetails.delivery_address}</Text>
              <Text style={styles.phoneText}>Phone: {orderDetails.delivery_phone}</Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="credit-card-outline" size={scale(20)} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Payment Summary</Text>
              </View>
              <PriceRow label="Subtotal" value={parseFloat(orderDetails.subtotal || 0).toFixed(2)} />
              <PriceRow label="Discount" value={parseFloat(orderDetails.discount_amount || 0).toFixed(2)} isNegative />
              <Text style={styles.paymentMethod}>Paid via {orderDetails.payment_method}</Text>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>₹{parseFloat(orderDetails.total_amount).toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons based on status */}
          {orderDetails.order_status === 'CONFIRMED' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShipOrder}
                disabled={isShipping}
              >
                {isShipping ? (
                  <ActivityIndicator color={Colors.WhiteBackgroudcolor} />
                ) : (
                  <Text style={styles.actionButtonText}>Mark as Shipped</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelOrder}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator color={Colors.WhiteBackgroudcolor} />
                ) : (
                  <Text style={styles.cancelButtonText}>Cancel Order</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {orderDetails.order_status === 'SHIPPED' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDeliverOrder}
                disabled={isDelivering}
              >
                {isDelivering ? (
                  <ActivityIndicator color={Colors.WhiteBackgroudcolor} />
                ) : (
                  <Text style={styles.actionButtonText}>Mark as Delivered</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* New "Track Order" Button */}
          <TouchableOpacity
            style={styles.trackOrderButton}
            onPress={() => showMessage({
              message: "Tracking In Progress",
              description: "This feature would open a detailed tracking page.",
              type: "info",
            })}
          >
            <MaterialCommunityIcons name="map-marker-path" size={scale(20)} color={Colors.primary} />
            <Text style={styles.trackOrderButtonText}>Track Order</Text>
          </TouchableOpacity>


        </ScrollView>
      </View>
      <FlashMessage position="top" />
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
  orderDateText: {
    fontSize: fontScale(12),
    color: Colors.textMuted,
    marginTop: verticalScale(2),
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
    marginTop: verticalScale(16), // Add margin to separate from tracking
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
    backgroundColor: Colors.backgroundLight,
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    marginBottom: verticalScale(10),
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: Colors.textDark,
    flex: 1,
  },
  itemTotal: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: scale(8),
  },
  itemBundleId: {
    fontSize: fontScale(11),
    color: Colors.textMuted,
    marginTop: verticalScale(2),
  },
  itemPricingDetails: {
    marginTop: verticalScale(8),
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(4),
  },
  itemPriceLabel: {
    fontSize: fontScale(13),
    color: Colors.textSecondary,
  },
  itemPriceValue: {
    fontSize: fontScale(13),
    color: Colors.textDark,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: verticalScale(10),
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(20),
    gap: scale(10), // Space between buttons
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.danger,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  cancelButtonText: {
    color: Colors.WhiteBackgroudcolor,
    fontSize: fontScale(16),
    fontWeight: 'bold',
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary, // Use primary color for "Mark as Shipped/Delivered"
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  actionButtonText: {
    color: Colors.WhiteBackgroudcolor,
    fontSize: fontScale(16),
    fontWeight: 'bold',
  },
  // New Tracking styles
  trackingCard: {
    backgroundColor: Colors.WhiteBackgroudcolor,
    borderRadius: moderateScale(12),
    elevation: 2,
    padding: moderateScale(14),
    marginBottom: verticalScale(16),
  },
  trackingTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: verticalScale(10),
  },
  trackingStep: {
    alignItems: 'center',
    flex: 1,
  },
  trackingStepIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(40),
    position: 'relative',
  },
  trackingCircle: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WhiteBackgroudcolor,
    zIndex: 1, // Ensure the circle is above the line
  },
  trackingDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
  },
  trackingLine: {
    position: 'absolute',
    left: '50%',
    right: '-50%', // Extends to the next step's center
    height: 2,
    top: verticalScale(20),
    zIndex: 0, // Behind the circles
  },
  trackingLabel: {
    fontSize: fontScale(11),
    fontWeight: '600',
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  trackingDate: {
    fontSize: fontScale(10),
    color: Colors.textMuted,
    marginTop: verticalScale(2),
    textAlign: 'center',
  },
  trackOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(20),
    backgroundColor: Colors.backgroundLight,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.borderLight,
    elevation: 1,
  },
  trackOrderButtonText: {
    color: Colors.primary,
    fontSize: fontScale(16),
    fontWeight: 'bold',
    marginLeft: scale(8),
  },
});