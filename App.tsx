import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { dropInvoiceTables, dropProductTable, setupDatabase, setupInvoiceTables } from './src/services/db';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  useEffect(() => {
    const initialize = async () => {
      await setupDatabase();        // for products
      await setupInvoiceTables();   // for invoices and invoice_items
      // await dropInvoiceTables();
      // await dropProductTable();
      // console.log('Database initialized');
    };
  
    initialize();
  }, []);
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
