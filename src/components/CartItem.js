import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const formatCurrency = (value) => `₹${value.toFixed(2)}`;

export default function CartItem({ product, onRemove }) {
  return (
    <View style={styles.cartRow}>
      <Image source={{ uri: product.image }} style={styles.cartRowImage} />
      <View style={styles.cartRowInfo}>
        <Text style={styles.cartRowTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.cartRowPrice}>{formatCurrency(product.price)}</Text>
      </View>
      <TouchableOpacity style={styles.cartRowRemoveButton} onPress={onRemove}>
        <Text style={styles.cartRowRemoveText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cartRowImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 10,
  },
  cartRowInfo: {
    flex: 1,
  },
  cartRowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 2,
  },
  cartRowPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#22c55e',
  },
  cartRowRemoveButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
    marginLeft: 8,
  },
  cartRowRemoveText: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '600',
  },
});

