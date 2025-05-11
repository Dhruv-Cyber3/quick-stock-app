import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { CameraView } from 'expo-camera';
import { getProductByBarcode, updateProductStock } from '../services/db';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
    
const AddStockScreen = () => {
    // const navigation = useNavigation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [scannedProduct, setScannedProduct] = useState<any>(null);
    const [quantity, setQuantity] = useState<string>('');
    const [scanning, setScanning] = useState<boolean>(false);

    const handleBarcodeScanned = async ({ data }: any) => {
        setScanning(false);
        console.log('data', data);
        const existingProduct = await getProductByBarcode(data);
        if(existingProduct){
            setScannedProduct(existingProduct);
        } else {
            Alert.alert(
                "Product Not Found",
                "This product is not in your inventory. Add it now?",
                [
                    {text: 'Cancel', style: 'cancel'},
                    {
                        text: 'Add Product',
                        onPress: () => navigation.navigate('AddProduct')
                    }
                ]
            )
        }
    }

    const handleUpdateStock = async () => {
        if(!quantity){
            Alert.alert('Missing Quantity', 'Please enter the quantity to add.')
            return;
        }
        updateProductStock(scannedProduct.barcode, parseInt(quantity), () => {
            Alert.alert("Success", "Stock updated successfully");
            navigation.goBack();
        })
        
    }

    return (
        <View style={styles.container}>
        {scannedProduct ? (
            <View>
                <Text style={styles.label}>Product: {scannedProduct.name}</Text>
                <Text style={styles.label}>Barcode: {scannedProduct.barcode}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter quantity to add"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                />
                <TouchableOpacity style={styles.button} onPress={handleUpdateStock}>
                    <Text style={styles.buttonText}>Update Stock</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <View>
                <Text style={styles.label}>To add stock, scan the product barcode:</Text>
                <TouchableOpacity style={styles.button} onPress={() => setScanning(true)}>
                    <Text style={styles.buttonText}>Scan Barcode</Text>
                </TouchableOpacity>
            </View>
        )}

        <Modal visible={scanning} animationType="slide">
            <CameraView
                style={{ flex: 1 }}
                barcodeScannerSettings={{
                barcodeTypes: ['ean13', 'ean8', 'upc_e', 'code39', 'code128', 'qr'],
                }}
                onBarcodeScanned={handleBarcodeScanned}
            >
                <View style={styles.closeScannerButton}>
                <TouchableOpacity onPress={() => setScanning(false)}>
                    <Text style={{ color: 'white', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
                </View>
            </CameraView>
        </Modal>
        </View>
    );
}

export default AddStockScreen;


const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
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