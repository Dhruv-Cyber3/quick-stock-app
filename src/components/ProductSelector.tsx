import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { getAllProducts } from '../services/db';
import { Product } from '../types/products';

type ProductSelectorProps = {
  onSelect: (product: Product) => void;
};

const ProductSelector: React.FC<ProductSelectorProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const result = await getAllProducts();
      setProducts(result);
      setItems(
        result.map((product) => ({
          label: product.name,
          value: product.id,
        }))
      );
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (value !== null) {
      const selected = products.find((p) => p.id === value);
      if (selected) onSelect(selected);
    }
  }, [value]);

  return (
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
      placeholder="Select a product"
      searchable={true}
      style={{
        backgroundColor: '#f0f8ff',
        borderColor: '#007bff',
        borderWidth: 2,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 10,
      }}
      dropDownContainerStyle={{
        backgroundColor: '#ffffff',
        borderColor: '#007bff',
        borderWidth: 1,
        borderRadius: 10,
        maxHeight: 300,
      }}
      listItemContainerStyle={{
        height: 50,
        justifyContent: 'center',
      }}
      textStyle={{
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
      }}
      placeholderStyle={{
        color: '#999',
        fontSize: 16,
      }}
      selectedItemLabelStyle={{
        color: '#007bff',
        fontWeight: 'bold',
      }}
      searchContainerStyle={{
        borderBottomColor: '#007bff',
        borderBottomWidth: 1,
      }}
      searchTextInputStyle={{
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
        height: 40,
        fontSize: 15,
        paddingHorizontal: 10,
      }}
    />
  );
};

export default ProductSelector;
