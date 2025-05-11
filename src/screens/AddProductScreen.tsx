import React, { useState, useEffect } from 'react';
import { View , Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { addProductToDB, getProductByBarcode } from '../services/db';
import { Product } from '../types/products';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { CameraView, useCameraPermissions } from 'expo-camera'

const AddProductScreen = () =>{
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [permission, requestPermission ] = useCameraPermissions();
    const [scanning, setScanning] = useState(false);

    const [product, setProduct] = useState<Product>({
        name: '',
        barcode: '',
        price: 0,
        unit: '',
        category: '',
        stock_quantity: 0,
        min_stock: 0
    });
    const handleChange = (field: keyof Product, value: string) =>{
        const numericFields = ['price', 'stock_quantity', 'min_stock'];
        setProduct({...product, [field]: numericFields.includes(field) ? parseFloat(value) || 0 : value});
    };

    const handelSave = () => {
        if(!product.name || !product.barcode || !product.unit){
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        addProductToDB(product, () => {
            Alert.alert('Success', 'Product added successfully!');
            navigation.goBack();
        });
    }

    const handleBarCodeScanned = async (scanned: any) => {
        setScanning(false);
        console.log('scanned ',scanned);
        if(scanned?.data){
            const existingProduct = await getProductByBarcode(scanned?.data);
            if(existingProduct){
                Alert.alert(
                    "Duplicate Product",
                    "This product already exists in your inventory. Do you want to add stock instead?",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Add Stock",
                            onPress: () => navigation.navigate("AddStock")
                        }
                    ]
                );
            } else {
                handleChange('barcode', scanned.data);
            }
        }
    }

    useEffect(() => {
        if(!permission?.granted){
            requestPermission()
        }
    },[])


    return (
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
        >
            <ScrollView contentContainerStyle={styles.container}>
                {/* <Text style={styles.title}>Add Product</Text>` */}

                <Text style={styles.label}>Barcode</Text>
                <View style={styles.barcodeContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginRight: 10 }]}
                        value={product.barcode}
                        onChangeText={(text) => handleChange('barcode', text)}
                        placeholder="Enter barcode"
                    />
                    <TouchableOpacity style={styles.scanButton} onPress={() => setScanning(true)}>
                        <Text style={{ color: '#fff' }}>Scan</Text>
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.label}>Product Name</Text>
                <TextInput
                    style={styles.input}
                    value={product.name}
                    onChangeText={(text) => handleChange('name', text)}
                    placeholder="Enter product name"
                />

                

                <Text style={styles.label}>Price</Text>
                <TextInput
                    style={styles.input}
                    value={product.price.toString()}
                    onChangeText={(text) => handleChange('price', text)}
                    placeholder="Enter price"
                    keyboardType="decimal-pad"
                />

                <Text style={styles.label}>Unit</Text>
                <TextInput
                    style={styles.input}
                    value={product.unit}
                    onChangeText={(text) => handleChange('unit', text)}
                    placeholder="Enter unit"
                />

                <Text style={styles.label}>Category</Text>
                <TextInput
                    style={styles.input}
                    value={product.category}
                    onChangeText={(text) => handleChange('category', text)}
                    placeholder="Enter category"
                />

                <Text style={styles.label}>Stock Quantity</Text>
                <TextInput
                    style={styles.input}
                    value={product.stock_quantity.toString()}
                    onChangeText={(text) => handleChange('stock_quantity', text)}
                    placeholder="Enter stock quantity"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Minimum Stock</Text>
                <TextInput
                    style={styles.input}
                    value={product.min_stock.toString()}
                    onChangeText={(text) => handleChange('min_stock', text)}
                    placeholder="Enter minimum stock"
                    keyboardType="number-pad"
                />

                <TouchableOpacity style={styles.button} onPress={handelSave}>
                    <Text style={styles.buttonText}>Save Product</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Barcode Scanner Modal */}
            <Modal visible={scanning} animationType="slide">
                <CameraView
                style={{ flex: 1 }}
                barcodeScannerSettings={{
                    barcodeTypes: ['ean13', 'ean8', 'upc_e', 'code39', 'code128', 'qr'],
                }}
                onBarcodeScanned={handleBarCodeScanned}
                >
                <View style={styles.closeScannerButton}>
                    <TouchableOpacity onPress={() => setScanning(false)}>
                    <Text style={{ color: 'white', fontSize: 16 }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
                </CameraView>
            </Modal>
        </KeyboardAvoidingView>
    )
}

export default AddProductScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    label: {
        marginTop: 12,
        fontWeight: 'bold',
        fontSize: 16
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginTop: 6,
        fontSize: 16,
        backgroundColor: '#fff'
    },
    barcodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6
    },
    scanButton: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8
    },
    button: {
        backgroundColor: '#28a745',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    closeScannerButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 8
    }
});