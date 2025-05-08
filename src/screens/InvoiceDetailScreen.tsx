import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { getInvoiceById, getInvoiceItemsByInvoiceId } from 'src/services/db';

const InvoiceDetailScreen = ({ route }: any) => {
  const { invoiceId } = route.params;
  const [invoice, setInvoice] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const fetchInvoiceDetails = async () => {
    try {
        // Fetch invoice details
        const invoiceResult = await getInvoiceById(invoiceId);
        if (!invoiceResult) {
            Alert.alert('Error', 'Invoice not found.');
            return;
        }
        setInvoice(invoiceResult);

        // Fetch invoice items
        const itemsResult = await getInvoiceItemsByInvoiceId(invoiceId);
        if (!itemsResult) {
            Alert.alert('Error', 'No items found for this invoice.');
            return;
        }
        setItems(itemsResult);
    } catch (error) {
        console.error('Error fetching invoice details:', error);
        Alert.alert('Error', 'Could not fetch invoice details.');
    }
  };

  useEffect(() => {
    fetchInvoiceDetails();
  }, [invoiceId]);

  if (!invoice) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Invoice Details</Text>
      <Text style={styles.invoiceText}>Customer: {invoice.customer_name}</Text>
      <Text style={styles.invoiceText}>Date: {invoice.date}</Text>
      <Text style={styles.invoiceText}>Total: Rs. {invoice.total.toFixed(2)}</Text>

      <FlatList
        data={items}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>Product: {item.product_name}</Text>
            <Text style={styles.itemText}>Quantity: {item.quantity}</Text>
            <Text style={styles.itemText}>Price: Rs. {item.price.toFixed(2)}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};
export default InvoiceDetailScreen;

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
  invoiceText: {
    fontSize: 18,
    marginBottom: 10,
  },
  item: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
  },
  itemText: {
    fontSize: 16,
  },
});


