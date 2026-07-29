import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import BookingScreen from '../screens/BookingScreen';
import ScheduleScreen from '../screens/ScheduleScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, booting } = useAuth();

  if (booting) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isAuthenticated ? 'Home' : 'Welcome'}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
