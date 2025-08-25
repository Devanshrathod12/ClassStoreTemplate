import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiGet } from '../../api/api';
import Colors from '../../styles/colors';
import {
  scale,
  fontScale,
  verticalScale,
  moderateScale,
} from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MyOrders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const getOrderData = await apiGet('/api/v1/orders');
      setOrders(getOrderData || []);
    } catch (error) {
      console.log('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, []),
  );

  const getStatusStyle = status => {
    switch (status) {
      case 'CONFIRMED':
        return { color: Colors.success, borderColor: Colors.success };
      case 'SHIPPED':
        return { color: Colors.info, borderColor: Colors.info };
      case 'DELIVERED':
        return { color: Colors.primary, borderColor: Colors.primary };
      case 'CANCELLED':
        return { color: Colors.danger, borderColor: Colors.danger };
      default:
        return {
          color: Colors.textSecondary,
          borderColor: Colors.textSecondary,
        };
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate(NavigationString.OrderDetails, {
          orderId: item.order_id,
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>{item.order_number}</Text>
        <View style={[styles.statusBadge, getStatusStyle(item.order_status)]}>
          <Text style={[styles.statusText, getStatusStyle(item.order_status)]}>
            {item.order_status}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.addressText} numberOfLines={1}>
          {item.delivery_address}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {new Date(item.order_date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.totalAmount}>
            ₹{parseFloat(item.total_amount).toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <AdaptiveSafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Colors.backgroundLight}
        />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        {isLoading ? (
          <View style={styles.centeredView}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={item => item.order_id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <View style={styles.centeredView}>
                <MaterialCommunityIcons
                  name="cart-off"
                  size={scale(50)}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyText}>You have no orders yet.</Text>
              </View>
            )}
          />
        )}
      </View>
    </AdaptiveSafeAreaView>
  );
};

export default MyOrders;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundLight },
  container: { flex: 1 },
  header: {
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.WhiteBackgroudcolor,
  },
  headerTitle: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: scale(16) },
  card: {
    backgroundColor: Colors.WhiteBackgroudcolor,
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    marginBottom: verticalScale(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  orderNumber: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(2),
    paddingHorizontal: scale(8),
  },
  statusText: {
    fontSize: fontScale(10),
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardBody: {},
  addressText: {
    fontSize: fontScale(13),
    color: Colors.textSecondary,
    marginBottom: verticalScale(10),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: verticalScale(8),
  },
  dateText: { fontSize: fontScale(12), color: Colors.textMuted },
  totalAmount: {
    fontSize: fontScale(15),
    fontWeight: 'bold',
    color: Colors.success,
  },
  emptyText: {
    marginTop: verticalScale(10),
    fontSize: fontScale(14),
    color: Colors.textMuted,
  },
});