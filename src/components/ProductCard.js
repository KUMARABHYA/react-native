import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const formatCurrency = (value) => `₹${value.toFixed(2)}`;

export default function ProductCard({ product, inCart, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image source={{ uri: product.image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {product.name}
          </Text>
          {product.tag ? (
            <View style={styles.tagChip}>
              <Text style={styles.tagChipText}>{product.tag}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.cardPrice}>{formatCurrency(product.price)}</Text>
        <View style={styles.cardFooterRow}>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            Tap to see details
          </Text>
          {inCart ? (
            <View style={styles.inCartPill}>
              <Text style={styles.inCartPillText}>In Cart</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#020617',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardImage: {
    width: '100%',
    height: 190,
  },
  cardBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#e5e7eb',
    marginRight: 6,
  },
  tagChip: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagChipText: {
    color: '#e0f2fe',
    fontSize: 11,
    fontWeight: '600',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22c55e',
    marginBottom: 4,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  inCartPill: {
    backgroundColor: '#16a34a33',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  inCartPillText: {
    color: '#4ade80',
    fontSize: 11,
    fontWeight: '600',
  },
});

