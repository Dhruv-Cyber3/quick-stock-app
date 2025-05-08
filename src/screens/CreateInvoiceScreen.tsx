import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Product } from 'src/types/products';
import { getAllProducts } from 'src/services/db';
import { addInvoiceToDB } from 'src/services/db';
import { InvoiceItem } from 'src/types/invoiceItems';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CreateInvoiceScreen = () => {
    const [customerName, setCustomerName] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);

    const insets = useSafeAreaInsets();

    useEffect(() =>{
        const fetchProducts = async () =>{
            const result = await getAllProducts();
            setProducts(result);
        }
        fetchProducts();
    }, [])

    const toggleProduct = (product: Product) =>{
        const existing = selectedItems.find(item => item.product_id === product.id);
        if(existing){
            setSelectedItems(selectedItems.filter(item => item.product_id !== product.id));
        } else{
            setSelectedItems([...selectedItems, { product_id: product.id!, quantity: 1, price: product.price, invoice_id: 0 }]);
        }
    }

    const updateQuantity = (productId: number, quantity: number) => {
        setSelectedItems(items => items.map(item =>
            item.product_id === productId ? { ...item, quantity } : item
        ));
    };

    const handleSubmit = async () =>{
        if (!customerName || selectedItems.length === 0) {
            Alert.alert('Missing Information', 'Please enter a customer name and select at least one product.');
            return;
        }
        const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const invoice = {
            customer_name: customerName,
            date: new Date().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' }),
            total,
            items: selectedItems,
        };
        await addInvoiceToDB(invoice);
        Alert.alert('Success', 'Invoice created successfully!');
        setCustomerName('');
        setSelectedItems([]);
    }

    return (
        <View style={[styles.container, {paddingBottom: insets.bottom +16 }]}>
            <Text style={styles.label}>Customer Name:</Text>
            <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Enter customer name"
            />

            <Text style={styles.label}>Select Products:</Text>
            <FlatList
            data={products}
            keyExtractor={(item) => item.id?.toString() ?? ''}
            renderItem={({ item }) => {
                const selected = selectedItems.find(i => i.product_id === item.id);
                return (
                <TouchableOpacity
                    style={[styles.productItem, selected && styles.selectedItem]}
                    onPress={() => toggleProduct(item)}
                >
                    <Text>{item.name} - Rs. {item.price}</Text>
                    {selected && (
                    <TextInput
                        style={styles.quantityInput}
                        keyboardType="numeric"
                        value={selected.quantity?.toString()}
                        onChangeText={text => updateQuantity(item.id!, parseInt(text) || 1)}
                    />
                    )}
                </TouchableOpacity>
                );
            }}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Create Invoice</Text>
            </TouchableOpacity>
        </View>
    );
}

export default CreateInvoiceScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    label: { fontWeight: 'bold', marginTop: 10 },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      marginTop: 4,
    },
    productItem: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      marginTop: 8,
    },
    selectedItem: {
      backgroundColor: '#e6f7ff',
    },
    quantityInput: {
      borderWidth: 1,
      borderColor: '#888',
      padding: 5,
      borderRadius: 6,
      width: 60,
      marginTop: 5,
    },
    button: {
      backgroundColor: '#007bff',
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: { color: 'white', fontSize: 16 },
});
  