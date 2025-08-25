import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../styles/colors';

const AdaptiveSafeAreaView = ({ children, barStyle = 'dark-content', backgroundColor = colors.WhiteBackground }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: backgroundColor
      }
    ]}>
      <StatusBar
        barStyle={barStyle}
        backgroundColor="transparent"
        translucent={true}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AdaptiveSafeAreaView;