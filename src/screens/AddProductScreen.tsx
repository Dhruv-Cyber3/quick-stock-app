import React, { useState, useEffect } from 'react';
import { View , Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { addProductToDB, setupDatabase } from '../services/db';
import { Product } from '../types/products';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera'

const AddProductScreen = () =>{
    const navigation = useNavigation();
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

    const handleBarCodeScanned = (scanned: any) => {
        setScanning(false);
        console.log('scanned ',scanned);
        if(scanned?.data){
            handleChange('barcode', scanned.data);
        }
    }

    useEffect(() => {
        if(!permission?.granted){
            requestPermission()
        }
    },[])


    return (
        <View style={styles.container}>
            <Text style={styles.label}>Name</Text>
            <TextInput
                style={styles.input}
                value={product.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Enter product name"
            />

            <View >
                <Text style={styles.label}>Barcode</Text>
                <TextInput
                    style={styles.input}
                    value={product.barcode}
                    onChangeText={(text) => handleChange('barcode', text)}
                    placeholder="Enter barcode"
                />
                <TouchableOpacity style={styles.scanButton} onPress={() => setScanning(true)}>
                    <Text style={{ color: '#fff' }}>Scan</Text>
                </TouchableOpacity>
            </View>
            

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
            value={product.stock_quantity?.toString()}
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

            <Modal visible={scanning} animationType="slide">
                <CameraView
                    style={{ flex: 1 }}
                    barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_e', 'code39', 'code128', 'qr'] }}
                    onBarcodeScanned={handleBarCodeScanned}
                    >
                    <View style={styles.closeScannerButton}>
                        <TouchableOpacity onPress={() => setScanning(false)}>
                        <Text style={{ color: 'white', fontSize: 16 }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    </CameraView>
            </Modal>
        </View>
    )
}

export default AddProductScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    label: { marginTop: 10, fontWeight: 'bold' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginTop: 4,
    },
    button: {
        backgroundColor: '#28a745',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: { color: 'white', fontSize: 16 },
    scanButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeScannerButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 8,
    },
});