import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from 'src/screens/HomeScreen';
import ProductListScreen from 'src/screens/ProductListScreen';
import AddProductScreen from 'src/screens/AddProductScreen';
import InvoiceListScreen from 'src/screens/InvoiceListScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                tabBarIcon: ({ color, size }) => {
                let iconName = 'home-outline';

                switch (route.name) {
                    case 'Home':
                    iconName = 'home-outline';
                    break;
                    case 'Inventory':
                    iconName = 'cube-outline';
                    break;
                    case 'Add Product':
                    iconName = 'add-circle-outline';
                    break;
                    case 'Invoices':
                    iconName = 'document-text-outline';
                    break;
                }
                return <Ionicons name={iconName as any} size={size} color={color} />;
            },
        })}
        >
            <Tab.Screen name='Home' component={HomeScreen} />
            <Tab.Screen name='Inventory' component={ProductListScreen} />
            <Tab.Screen name='Add Product' component={AddProductScreen} />
            <Tab.Screen name='Invoices' component={InvoiceListScreen} />
        </Tab.Navigator>
    )
}

export default MainTabs;