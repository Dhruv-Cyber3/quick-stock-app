import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import { Product } from 'src/types/products';
import { getProductByBarcode, addInvoiceToDB, getAllProducts } from 'src/services/db';
import { InvoiceItem } from 'src/types/invoiceItems';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView } from 'expo-camera';
// import { Picker } from '@react-native-picker/picker';
// import DropDownPicker from 'react-native-dropdown-picker';
import ProductSelector from 'src/components/ProductSelector';



const CreateInvoiceScreen = () => {
    const [scanning, setScanning] = useState(false);
    const [invoiceItems, setInvoiceItems] = useState<{ product: Product, quantity: number }[]>([]);
    const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState('');
    const [customerName, setCustomerName] = useState('');

    const handleBarcodeScanned = async ({ data}: any) => {
        setScanning(false);
        const product = await getProductByBarcode(data);
        console.log('product', product);
        if(product){
            setScannedProduct(product);
        } else {
            Alert.alert('Product Not Found', 'This prodcut does not exist in your inventory.');
        }
    }

    const addToInvoice = () => {
        if(!scannedProduct || !quantity) return;

        const quantityNumber = parseInt(quantity);
        if(quantityNumber > scannedProduct.stock_quantity) {
            Alert.alert('Stock Error', `Only ${scannedProduct.stock_quantity} units available.`);
            return;
        }
        const updatedItems = [...invoiceItems, {product: scannedProduct, quantity: quantityNumber}];
        setInvoiceItems(updatedItems);
        resetForm();
    }

    const resetForm = () => {
        setScannedProduct(null);
        setQuantity('');
    }

    const calculateTotal = () => {
        return invoiceItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2);
    }

    const finalizeInvoice = async () => {
        try {
            const total = invoiceItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
            const now = new Date().toISOString();

            if (!customerName.trim()) {
                Alert.alert('Missing Info', 'Please enter a customer or company name.');
                return;
            }

            const invoice = {
            customer_name: customerName.trim() || 'Walk-in Customer',
            date: now,
            total: total,
            items: invoiceItems.map(item => {
                if (item.product.id === undefined) {
                    throw new Error('Product id is undefined');
                }
                return {
                    product_id: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price,
                    invoice_id: 0
                };
            })
            };
            console.log(invoice)

            await addInvoiceToDB(invoice);

            Alert.alert('Success', 'Invoice saved successfully!');
            setInvoiceItems([]);     // clear the form
            setScannedProduct(null); // reset scanning state if needed
            setQuantity('');         // reset quantity input
            setCustomerName('');
        } catch (error) {
            Alert.alert('Error', 'Could not update stock');
        }
    }

    return (
        <View style={styles.container}>
            {!scannedProduct && (
                <>
                    <TouchableOpacity style={styles.scanButton} onPress={() => setScanning(true)}>
                        <Text>Scan Product</Text>
                    </TouchableOpacity>

                    <ProductSelector onSelect={setScannedProduct} />

                </>
            )}

            {scannedProduct && (
                <View style={styles.form}>
                    <Text style={styles.label}>Product: {scannedProduct.name}</Text>
                    <Text style={styles.label}>Available: {scannedProduct.stock_quantity}</Text>
                    <TextInput
                        style={styles.input}
                        value={quantity}
                        onChangeText={setQuantity}
                        placeholder='Quantity'
                        keyboardType='numeric'
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addToInvoice}>
                        <Text style={styles.buttonText}>Add to Invoice</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}

            {invoiceItems.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.label}>Customer/Company Name</Text>
                    <TextInput
                    style={styles.input}
                    placeholder="Enter customer name"
                    value={customerName}
                    onChangeText={setCustomerName}
                    />
                </View>
            )}

            <FlatList
                data={invoiceItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemRow}>
                        <Text>{item.product.name} x {item.quantity} = ₹{(item.product.price * item.quantity).toFixed(2)}</Text>
                    </View>
                )}
                ListFooterComponent={() => (
                    invoiceItems.length > 0 && (
                        <View style={styles.summary}>
                            <Text style={styles.totalText}>Total: ₹{calculateTotal()}</Text>
                            <TouchableOpacity style={styles.finalizeButton} onPress={finalizeInvoice}>
                                <Text style={styles.buttonText}>Finalize Invoice</Text>
                            </TouchableOpacity>
                        </View>
                    )
                )}
            />

            {/* Scanner Modal */}
            <Modal visible={scanning} animationType="slide">
                <CameraView
                style={{ flex: 1 }}
                onBarcodeScanned={handleBarcodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['ean13', 'ean8', 'upc_e', 'code39', 'code128']
                }}
                >
                <TouchableOpacity onPress={() => setScanning(false)} style={styles.closeScanner}>
                    <Text style={{ color: '#fff' }}>Cancel</Text>
                </TouchableOpacity>
                </CameraView>
            </Modal>
        </View>
    )
}

export default CreateInvoiceScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    scanButton: {
        backgroundColor: '#007bff',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20
    },
    addButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center'
    },
    finalizeButton: {
        backgroundColor: '#6f42c1',
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center'
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        padding: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center'
    },
    cancelText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    form: {
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        marginBottom: 6
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff'
    },
    itemRow: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    summary: {
        marginTop: 20
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600'
    },
    closeScanner: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 8
    },
    picker: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginVertical: 10
    }
});