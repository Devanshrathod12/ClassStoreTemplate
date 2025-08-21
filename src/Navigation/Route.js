import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import MainScreen from './MainScreen';
import NavigationString from './NavigationString';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

const Route = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // Check for token on app load
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Check if token exists in AsyncStorage
        const token = await AsyncStorage.getItem('user_token');
        setUserToken(token);
      } catch (error) {
        console.error('Error checking authentication token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  // Render loading screen while checking token
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
        initialRouteName={userToken ? NavigationString.AddChild : NavigationString.WelComeScreen}
      >
        {MainScreen(Stack)}
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