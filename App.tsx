import 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/Redux/store';
import Route from "./src/Navigation/Route";

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" />
          </View>
        }
        persistor={persistor}
      >
        <Route />
      </PersistGate>
    </Provider>
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