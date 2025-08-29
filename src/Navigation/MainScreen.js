import React from 'react';
import NavigationString from './NavigationString';
import * as Screen from '../Screen';

export default function (Stack, isTokenValid, onLoginSuccess,onLogout) {

  if (!isTokenValid) {
    return (
      <Stack.Screen
        name={NavigationString.WelComeScreen}
        options={{ headerShown: false }}
      >
        {(props) => <Screen.WelComeScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </Stack.Screen>
    );
  }

  return (
    <>
      <Stack.Screen
        name={NavigationString.AddChild}
        options={{ headerShown: false }}
      >
        {(props) => <Screen.AddChild {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen
        name={NavigationString.YourChildrenScreen}
        component={Screen.YourChildern}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationString.SelectPackage}
        component={Screen.SelectPackage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationString.DeliveryAddress}
        component={Screen.Delivery}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationString.PaymentDetailes}
        component={Screen.Payment}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationString.Order}
        component={Screen.Order}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationString.MyCart}
        component={Screen.MyCart}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationString.ShowBooks}
        component={Screen.ShowBooks}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationString.MyOrders}
        component={Screen.MyOrders}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationString.OrderDetails}
        component={Screen.OrderDetails}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={NavigationString.AddAddress}
        component={Screen.AddAddress}
        options={{ headerShown: false }}
      />
     <Stack.Screen
  name={NavigationString.AccountSetting}
  options={{ headerShown: false }}
>
  {(props) => <Screen.AccountSetting {...props} onLogout={onLogout} />}
</Stack.Screen>
    </>
  );
}