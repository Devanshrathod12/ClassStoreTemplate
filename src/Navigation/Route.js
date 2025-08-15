import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import MainScreen from "./MainScreen"
import NavigationString from './NavigationString'

const Stack = createStackNavigator()
const Route = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator 
             screenOptions={{
                gestureEnabled:true,
                gestureDirection:"horizontal",
                cardStyleInterpolator:CardStyleInterpolators.forHorizontalIOS
            }}
            >
                {MainScreen(Stack)}
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Route

const styles = StyleSheet.create({})