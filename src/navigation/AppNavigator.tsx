import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types';
import MainTabs from './MainTabs';
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import ProductListScreen from 'src/screens/ProductListScreen';
import AddProductScreen from 'src/screens/AddProductScreen';
import CreateInvoiceScreen from 'src/screens/CreateInvoiceScreen';
import InvoiceListScreen from 'src/screens/InvoiceListScreen';
import InvoiceDetailScreen from 'src/screens/InvoiceDetailScreen';
import EditProductScreen from 'src/screens/EditProductScreen';
import AddStockScreen from 'src/screens/AddStockScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="MainTabs">
      <Stack.Screen name="MainTabs" component={MainTabs} options={{headerShown: false}} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="AllProducts" component={ProductListScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
      <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen} />
      <Stack.Screen name="InvoiceList" component={InvoiceListScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
      <Stack.Screen name="AddStock" component={AddStockScreen} options={{title: 'Add Stock'}}/>
    </Stack.Navigator>
  );
};

export default AppNavigator;