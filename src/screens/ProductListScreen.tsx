import React, { useEffect, useState} from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getAllProducts } from '../services/db';
import { Product } from '../types/products';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteProductFromDB } from '../services/db';

const ProductListScreen = ({ navigation }: any) =>{
    const [products, setProducts] = useState<Product[]>([]);
    const insets = useSafeAreaInsets();

    useEffect(()=> {
        const unsubsscribe = navigation.addListener('focus', loadProducts);
        return unsubsscribe;
    },[navigation]);

    const loadProducts = async () => {
        const result = await getAllProducts();
        setProducts(result);
    }

    const handleDelete = async (id: number) => {
        if(!id) return;
        await deleteProductFromDB(id);
        loadProducts();
    }

    const renderItem = ({ item }: { item: Product }) => {
        const isLowStock = item.stock_quantity !== undefined && item.min_stock !== undefined && item.stock_quantity <= item.min_stock;
        return (
            <View style={[styles.card, isLowStock && styles.lowStockCard]}>
                <Text style={styles.name}>{item.name}</Text>
                <Text>Barcode: {item.barcode}</Text>
                <Text>Price: Rs. {item.price}</Text>
                <Text>Unit: {item.unit}</Text>
                <Text>category: {item.category}</Text>
                <Text>Stock Quantity: {item.stock_quantity}</Text>
                {isLowStock && <Text style={styles.lowStockText}>⚠ Low Stock</Text>}

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditProduct', { product: item })}
                    >
                        <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => item.id !== undefined && handleDelete(item.id)}
                    >
                        <Text style={styles.actionText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={[styles.container, {paddingBottom: insets.bottom }]}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.barcode}
                renderItem={renderItem}
                ListEmptyComponent={<Text>No products yet</Text>}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('AddProduct')}
            >
                <Text>+ Add Product</Text>
            </TouchableOpacity>
        </View>
    )
}
export default ProductListScreen;


const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: { flex: 1, padding: 16 },
    card: {
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 10,
    },
    name: { fontWeight: 'bold', fontSize: 16 },
    button: {
        backgroundColor: '#007bff',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: { color: 'white', fontSize: 16 },
    lowStockCard: {
        backgroundColor: '#ffe6e6',
        borderColor: '#ff4d4d',
        borderWidth: 1,
    },
    lowStockText: {
        color: '#d32f2f',
        fontWeight: 'bold',
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 10,
    },
    editButton: {
        backgroundColor: '#ffc107',
        padding: 8,
        borderRadius: 6,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        padding: 8,
        borderRadius: 6,
    },
    actionText: {
        color: 'white',
        fontWeight: 'bold',
    },
});