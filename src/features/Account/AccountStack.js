import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AccountScreen from './screens/AccountScreen';
import LoginScreen from 'auth/screens/LoginScreen';
import CreateAccountScreen from 'auth/screens/CreateAccountScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import OrderScreen from 'shared/OrderScreen';

const MainStack = createStackNavigator();
const RootStack = createStackNavigator();

const MainStackScreen = ({ route }) => {
    return (
        <MainStack.Navigator>
            <MainStack.Screen name="AccountScreen" component={AccountScreen} options={{ headerShown: false }} />
        </MainStack.Navigator>
    );
};

const AccountStack = ({ route }) => {
    return (
        <SafeAreaProvider>
            <RootStack.Navigator screenOptions={{ presentation: 'modal' }}>
                <RootStack.Screen name="AccountStack" component={MainStackScreen} options={{ headerShown: false }} />
                <RootStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <RootStack.Screen name="CreateAccount" component={CreateAccountScreen} options={{ headerShown: false }} />
                <RootStack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
                <RootStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
                <RootStack.Screen name="Order" component={OrderScreen} options={{ headerShown: false }} />
            </RootStack.Navigator>
        </SafeAreaProvider>
    );
};

export default AccountStack;
