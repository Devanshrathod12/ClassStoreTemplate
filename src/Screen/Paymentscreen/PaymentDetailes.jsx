import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../../styles/colors';
import {
  scale,
  fontScale,
  verticalScale,
  moderateScale,
} from '../../styles/stylesconfig';
import NavigationString from '../../Navigation/NavigationString';
import { apiGet, apiPost, apiDelete } from '../../api/api';
import AdaptiveSafeAreaView from '../AdaptiveSafeAreaView';

const PaymentDetailes = ({ route, navigation }) => {
  const { orderData, address: initialAddress } = route.params || {};

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(initialAddress || null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const getSubtotal = () => {
    if (!orderData) return 0;
    if (orderData.isFromCart) {
      return parseFloat(orderData.cart?.total_amount || 0);
    } else {
      return parseFloat(orderData.pkg?.price || 0);
    }
  };

  const subtotal = getSubtotal();
  const total = subtotal;

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsDataLoading(true);
        try {
          const userId = await AsyncStorage.getItem('userId');
          if (!userId) {
            throw new Error('User ID not found');
          }
          const response = await apiGet(`/api/v1/address/user/${userId}`);
          if (response && Array.isArray(response) && response.length > 0) {
            setSavedAddresses(response);
            if (selectedSavedAddress) {
              const stillExists = response.some(a => a.address_id === selectedSavedAddress.address_id);
              if (!stillExists) {
                setSelectedSavedAddress(response[0]);
              }
            } else {
              setSelectedSavedAddress(response[0]);
            }
          } else {
            setSavedAddresses([]);
            setSelectedSavedAddress(null);
            showMessage({
              message: 'No Address Found',
              description: 'Please add a delivery address to continue.',
              type: 'warning',
            });
            navigation.navigate(NavigationString.DeliveryAddress, { orderData });
          }
        } catch (error) {
          console.error('Failed to fetch addresses:', error);
          showMessage({
            message: 'Error',
            description: 'Could not fetch addresses.',
            type: 'danger',
          });
          navigation.goBack();
        } finally {
          setIsDataLoading(false);
        }
      };

      if (orderData) {
        fetchData();
      } else {
        setIsDataLoading(false);
      }
    }, [orderData])
  );

  const getInitials = name => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  const handleDeleteAddress = async addressIdToDelete => {
    try {
      await apiDelete(`/api/v1/address/${addressIdToDelete}`);
      showMessage({ message: 'Address Deleted', type: 'success' });
      const updatedAddresses = savedAddresses.filter(addr => addr.address_id !== addressIdToDelete);
      setSavedAddresses(updatedAddresses);

      if (selectedSavedAddress?.address_id === addressIdToDelete) {
        const newSelected = updatedAddresses.length > 0 ? updatedAddresses[0] : null;
        setSelectedSavedAddress(newSelected);
        if (!newSelected) {
          showMessage({
            message: 'No Addresses Left',
            description: 'Please add a new address.',
            type: 'warning',
          });
          navigation.navigate(NavigationString.DeliveryAddress, { orderData });
        }
      }
    } catch (error) {
      showMessage({
        message: 'Could not delete address.',
        type: 'danger',
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedSavedAddress) {
      showMessage({ message: 'Missing Information', description: 'Please select a delivery address.', type: 'warning' });
      return;
    }
    
    setIsLoading(true);
    try {
      const userPhoneNumber = await AsyncStorage.getItem('mobile_number');
      if (!userPhoneNumber) {
        showMessage({
          message: 'Authentication Error',
          description: 'Your phone number could not be found. Please log in again.',
          type: 'danger',
        });
        setIsLoading(false);
        return;
      }
      const payload = {
        delivery_address: `${selectedSavedAddress.address_line1}, ${selectedSavedAddress.city}, ${selectedSavedAddress.state} - ${selectedSavedAddress.pincode}`,
        delivery_phone: userPhoneNumber,
        delivery_notes: deliveryNotes.trim(),
        payment_method: paymentMethod,
      };
      const createdOrder = await apiPost('/api/v1/orders', payload);
      showMessage({ message: 'Order Placed Successfully!', type: 'success' });
      navigation.navigate(NavigationString.Order, {
        orderData,
        total,
        paymentMethod,
        address: selectedSavedAddress,
        orderDetails: createdOrder,
        deliveryPhoneNumber: userPhoneNumber,
      });
    } catch (error) {
      console.error('Failed to place order:', error.response?.data || error);
      showMessage({
        message: 'Order Failed',
        description: 'Please try again.',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = addr => {
    return `${addr.address_line1}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
  };

  const getOrderDisplayInfo = () => {
    if (!orderData) return { name: '', subtitle: '', quantity: 0 };
    
    if (orderData.isFromCart) {
      return {
        name: 'Items from Cart',
        subtitle: `Total Items: ${orderData.cart?.quantity || 0}`,
        quantity: orderData.cart?.quantity || 0
      };
    } else {
      return {
        name: orderData.pkg?.title || orderData.pkg?.bundle_name || 'Package',
        subtitle: `For ${orderData.child?.name || ''} • Class ${orderData.child?.standard || ''}`,
        quantity: 1
      };
    }
  };

  if (isDataLoading || !orderData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Payment Details...</Text>
      </View>
    );
  }

  const orderDisplayInfo = getOrderDisplayInfo();

  return (
    <AdaptiveSafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons
              name="arrow-back"
              size={scale(24)}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: scale(24) }} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.itemRow}>
              <View style={styles.itemDetails}>
                <View style={styles.itemAvatar}>
                  {orderData.isFromCart ? (
                    <MaterialCommunityIcons
                      name="cart"
                      size={scale(20)}
                      color={Colors.primary}
                    />
                  ) : (
                    <Text style={styles.itemAvatarText}>
                      {getInitials(orderData.child?.name || 'P')}
                    </Text>
                  )}
                </View>
                <View>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {orderDisplayInfo.name}
                  </Text>
                  <Text style={styles.itemFor}>
                    {orderDisplayInfo.subtitle}
                  </Text>
                </View>
              </View>
              <Text style={styles.itemPrice}>₹{subtotal.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Shipping Address</Text>
            {savedAddresses.map(addr => (
              <View key={addr.address_id} style={styles.addressOptionContainer}>
                <TouchableOpacity
                  style={styles.addressOption}
                  onPress={() => setSelectedSavedAddress(addr)}
                >
                  <MaterialCommunityIcons
                    name={
                      selectedSavedAddress?.address_id === addr.address_id
                        ? 'radiobox-marked'
                        : 'radiobox-blank'
                    }
                    size={scale(20)}
                    color={Colors.primary}
                  />
                  <View style={{ marginLeft: scale(10), flex: 1 }}>
                    <Text style={styles.addressOptionName}>
                      {addr.fullName}
                    </Text>
                    <Text style={styles.addressOptionText}>
                      {formatAddress(addr)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteAddress(addr.address_id)}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={scale(22)}
                    color={Colors.danger}
                  />
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={styles.notesInput}
              placeholder="Delivery Notes (Optional)"
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
            />
          </View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setPaymentMethod('COD')}
            >
              <MaterialCommunityIcons
                name={
                  paymentMethod === 'COD' ? 'radiobox-marked' : 'radiobox-blank'
                }
                size={scale(20)}
                color={Colors.primary}
              />
              <Text style={styles.paymentTitle}>Cash on Delivery</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <View style={styles.totalRowFooter}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.placeOrderButton,
              isLoading && styles.disabledButton,
            ]}
            onPress={handlePlaceOrder}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textLight} />
            ) : (
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </AdaptiveSafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
  },
  loadingText: {
    marginTop: 15,
    fontSize: fontScale(14),
    color: Colors.textSecondary,
  },
  container: { flex: 1, backgroundColor: Colors.background },
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
  },
  content: {
    flexGrow: 1,
    padding: scale(16),
  },
  card: {
    backgroundColor: 'white',
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    marginBottom: verticalScale(20),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: fontScale(15),
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: verticalScale(12),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetails: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemAvatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(8),
    backgroundColor: Colors.backgroundPrimaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  itemAvatarText: {
    fontSize: fontScale(16),
    fontWeight: 'bold',
    color: Colors.primary,
  },
  itemName: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: Colors.textDark,
    flexShrink: 1,
  },
  itemFor: { fontSize: fontScale(12), color: Colors.textSecondary },
  itemPrice: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  addressOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingVertical: verticalScale(8),
  },
  addressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: scale(10),
  },
  addressOptionName: {
    fontSize: fontScale(13),
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  addressOptionText: { fontSize: fontScale(13), color: Colors.textSecondary },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    backgroundColor: Colors.backgroundFaded,
    fontSize: fontScale(14),
    color: Colors.textDark,
    height: verticalScale(45),
    marginTop: verticalScale(15),
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
  },
  paymentTitle: {
    fontSize: fontScale(14),
    fontWeight: '500',
    color: Colors.textDark,
    marginLeft: scale(12),
  },
  footer: {
    padding: moderateScale(16),
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  totalRowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  totalLabel: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  totalValue: {
    fontSize: fontScale(16),
    fontWeight: 'bold',
    color: Colors.success,
  },
  placeOrderButton: {
    backgroundColor: Colors.primary,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: Colors.primary, opacity: 0.7 },
  placeOrderButtonText: {
    color: Colors.textLight,
    fontSize: fontScale(16),
    fontWeight: 'bold',
  },
});

export default PaymentDetailes;