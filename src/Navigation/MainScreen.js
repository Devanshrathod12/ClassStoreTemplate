import NavigationString from "./NavigationString";
import * as Screen from "../Screen"

export default function(Stack){
    return (
        <>
        <Stack.Screen   
            name={NavigationString.WelComeScreen}
            component={Screen.WelComeScreen}
            options={{headerShown:false}}
        />
        </>
    )
}