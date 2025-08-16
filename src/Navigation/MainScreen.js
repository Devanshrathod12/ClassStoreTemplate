import NavigationString from './NavigationString';
import * as Screen from '../Screen';
export default function (Stack) {
  return (
    <>
      {/* <Stack.Screen
        name={NavigationString.WelComeScreen}
        component={Screen.WelComeScreen}
        options={{ headerShown: false }}
      /> */}
      <Stack.Screen
        name={NavigationString.AddChild}
        component={Screen.AddChild}
        options={{ headerShown: false }}
      />
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
    </>
  );
}
