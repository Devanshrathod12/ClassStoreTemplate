import { StyleSheet, View, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import MainScreen from './MainScreen';
import NavigationString from './NavigationString';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiPost } from '../api/api';

const Stack = createStackNavigator();

const Route = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  const handleLoginSuccess = useCallback(() => {
    setIsTokenValid(true);
  }, []);

  const handleLogout = async () => {
    try {
        await AsyncStorage.removeItem('user_token');
        await AsyncStorage.removeItem('userId');
        setIsTokenValid(false);
    } catch (error) {
        console.error('Failed to log out', error);
    }
};

  useEffect(() => {
    const checkTokenValidity = async () => {
      let token;
      try {
        token = await AsyncStorage.getItem('user_token');
        
        if (!token) {
          setIsTokenValid(false);
          setIsLoading(false);
          return;
        }

        await apiPost('/api/v1/auth/verify', { token: token });
        setIsTokenValid(true);

      } catch (error) {
        console.log('Token is invalid or validation failed, clearing storage');
        if (token) {
            await AsyncStorage.removeItem('user_token');
            await AsyncStorage.removeItem('userId');
        }
        setIsTokenValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkTokenValidity();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        // screenOptions={{
        //   gestureEnabled: true,
        //   gestureDirection: 'horizontal',
        //   cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        // }}
      >
        {MainScreen(Stack, isTokenValid, handleLoginSuccess,handleLogout)}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Route;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});