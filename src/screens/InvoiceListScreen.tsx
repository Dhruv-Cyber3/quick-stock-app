import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { getAllInvoices } from 'src/services/db';
import { Invoice } from 'src/types/invoices';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types';

const InvoiceListScreen = () => {
    type Nav = NativeStackNavigationProp<RootStackParamList, 'InvoiceList'>;
    const navigation = useNavigation<Nav>();
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        const fetchInvoices = async () => {
            const result = await getAllInvoices();
            setInvoices(result);
        };
        fetchInvoices();
    }, []);

    const handleInvoicePress = (invoiceId: number) => {
        navigation.navigate('InvoiceDetail', { invoiceId });
    }

    const renderItem = ({ item }: any) => (
        <TouchableOpacity style={styles.invoiceItem} onPress={() => handleInvoicePress(item.id)}>
          <Text style={styles.invoiceText}>Customer: {item.customer_name}</Text>
          <Text style={styles.invoiceText}>Date: {item.date}</Text>
          <Text style={styles.invoiceText}>Total: Rs. {item.total.toFixed(2)}</Text>
        </TouchableOpacity>
    );
    return (
        <View style={styles.container}>
          <Text style={styles.header}>Past Invoices</Text>
          <FlatList
            data={invoices}
            renderItem={renderItem}
            keyExtractor={(item) => (item.id ?? '').toString()}
          />
        </View>
    );
}
export default InvoiceListScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    invoiceItem: {
      padding: 16,
      marginBottom: 12,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
    },
    invoiceText: {
      fontSize: 16,
    },
});