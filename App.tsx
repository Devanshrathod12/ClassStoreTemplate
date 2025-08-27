import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/Redux/store';
import Route from "./src/Navigation/Route";
import FlashMessage from "react-native-flash-message";
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets

const RootApp = () => {
  const insets = useSafeAreaInsets(); 

  return (
    <>
      <Route />
      <FlashMessage
        position="top"
        floating={true}
        statusBarHeight={insets.top}
      />
    </>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate
          loading={
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" />
            </View>
          }
          persistor={persistor}
        >
         
          <RootApp /> 
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});