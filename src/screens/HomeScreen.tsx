import React, {useLayoutEffect } from 'react';
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = ({navigation}: any) =>{
    useLayoutEffect(() =>{
        navigation.setOptions({
            title: 'Quick Stock',
            headerRight: () =>{
                return (
                    <View style={styles.headerIcons}>
                        <TouchableOpacity onPress={() => navigation.navigate('AddProduct')} style={styles.iconButton}>
                            <Ionicons name="scan-outline" size={24} color="#007bff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('CreateInvoice')} style={styles.iconButton}>
                            <Ionicons name="add-circle-outline" size={24} color="#007bff" />
                        </TouchableOpacity>
                    </View>
                )
            }
        })
    }, [navigation])
    return (
        <View style={styles.container}>
        <Text style={styles.title}>Welcome to Quick Stock!</Text>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AllProducts')}>
            <Text style={styles.buttonText}>View All Products</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreateInvoice')}>
            <Text style={styles.buttonText}>Create Invoice</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('InvoiceList')}>
            <Text style={styles.buttonText}>View All Invoices</Text>
        </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { color: 'white', fontSize: 16 },
  headerIcons: {
    flexDirection: 'row',
    marginRight: 10,
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
})

export default HomeScreen;
// This is the HomeScreen component for the Quick Stock app. It serves as the main screen where users can navigate to the Scan screen. The screen includes a welcome message and a button that, when pressed, navigates to the Scan screen. The styles are defined using StyleSheet for better organization and readability.