import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { updateProductInDB } from '../services/db';

const EditProductScreen = ({ route, navigation }: any) => {
    const { product } = route.params;

    const [name, setName] = useState(product.name);
    const [barcode, setBarcode] = useState(product.barcode);
    const [price, setPrice] = useState(product.price.toString());
    const [unit, setUnit] = useState(product.unit);
    const [category, setCategory] = useState(product.category);
    const [stockQuantity, setStockQuantity] = useState(product.stock_quantity.toString());
    const [minStock, setMinStock] = useState(product.min_stock ? product.min_stock.toString() : 0);

    const handleUpdate = async () => {
        await updateProductInDB({
            ...product,
            name,
            barcode,
            price: parseFloat(price),
            unit,
            category,
            stock_quantity: parseInt(stockQuantity),
            min_stock: parseInt(minStock)
        })
        Alert.alert('Success', 'Product updated successfully!');
        navigation.goBack();
    }

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.container}>
                    {/* <Text style={styles.title}>Edit Product</Text> */}
                    <View style={styles.readOnlyField}>
                        <Text style={styles.readOnlyLabel}>Barcode:</Text>
                        <Text style={styles.readOnlyValue}>{barcode}</Text>
                    </View>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Product Name"/>
                    <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Price" keyboardType='numeric'/>
                    <TextInput style={styles.input} value={unit} onChangeText={setUnit} placeholder="Unit"/>
                    <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Category"/>
                    <TextInput style={styles.input} value={stockQuantity} onChangeText={setStockQuantity} placeholder="Stock Quantity" keyboardType='numeric'/>
                    <TextInput style={styles.input} value={minStock} onChangeText={setMinStock} placeholder="Minimum Stock" keyboardType='numeric'/>
                    <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                        <Text style={styles.buttonText}>Update Product</Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        
    )
}

export default EditProductScreen;

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
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: '#fff'
    },
    readOnlyField: {
        marginBottom: 16,
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 8
    },
    readOnlyLabel: {
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#555'
    },
    readOnlyValue: {
        fontSize: 16,
        color: '#333'
    },
    button: {
        backgroundColor: '#28a745',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    }
});