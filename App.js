import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMixpanel,
  trackAddToCart,
  trackProductViewed,
  trackRemoveFromCart,
} from './analytics';
import ProductCard from './src/components/ProductCard';
import CartItem from './src/components/CartItem';
import { getProducts } from './src/api/products';

const Stack = createNativeStackNavigator();

// Fallback when backend is not running (e.g. ERR_CONNECTION_REFUSED)
const FALLBACK_PRODUCTS = [
  { id: '1', name: 'Wireless Headphones', price: 59.99, packName: 'Standard Pack', image: 'https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg?auto=compress&cs=tinysrgb&w=800', description: 'Comfortable over‑ear wireless headphones with deep bass and up to 30 hours of battery life.', tag: 'Best seller' },
  { id: '2', name: 'Smart Watch', price: 129, packName: 'Single Unit', image: 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=800', description: 'Track your health, receive notifications, and control music directly from your wrist.', tag: 'New' },
  { id: '3', name: 'Minimal Chair', price: 89.5, packName: '1 Piece', image: 'https://images.pexels.com/photos/116910/pexels-photo-116910.jpeg?auto=compress&cs=tinysrgb&w=800', description: 'Scandinavian‑inspired wooden chair with a comfortable cushion and clean modern lines.', tag: 'Home' },
  { id: '4', name: 'Desk Lamp', price: 39.99, packName: 'Box Pack', image: 'https://images.pexels.com/photos/112811/pexels-photo-112811.jpeg?auto=compress&cs=tinysrgb&w=800', description: 'LED desk lamp with adjustable arm and three color temperatures for focused work.', tag: 'Workspace' },
];

const formatCurrency = (value) => `₹${value.toFixed(2)}`;

const STORAGE_KEY_PHONE = '@logged_in_phone';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('enterPhone'); // 'enterPhone' | 'enterOtp'
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    const trimmed = phone.replace(/\D/g, '');
    if (trimmed.length !== 10) {
      setError('Please enter a valid 10 digit mobile number.');
      return;
    }
    const code = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit OTP
    setGeneratedOtp(code);
    setStep('enterOtp');
    setError('');
    // Demo-only: show OTP in console so you can test without SMS backend.
    console.log('[OTP DEMO]', code);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.trim() !== generatedOtp) {
      setError('Incorrect OTP. Please try again.');
      return;
    }
    setError('');
    AsyncStorage.setItem(STORAGE_KEY_PHONE, phone).catch(() => {});
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home', params: { cart: [], phone } }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenContainer}>
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.brand}>ShopNow</Text>
          <Text style={styles.loginSubtitle}>Sign in with your mobile number</Text>
        </View>

        {step === 'enterPhone' ? (
          <>
            <Text style={styles.sectionTitle}>Enter mobile number</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputPrefix}>+91</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholder="98765 43210"
                placeholderTextColor="#6b7280"
                maxLength={10}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity style={styles.primaryButton} onPress={handleSendOtp}>
              <Text style={styles.primaryButtonText}>Send OTP</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Enter OTP</Text>
            <Text style={styles.otpInfoText}>
              We have sent a 5 digit code to {phone}. (For demo, check console log.)
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                keyboardType="number-pad"
                value={enteredOtp}
                onChangeText={setEnteredOtp}
                placeholder="Enter OTP"
                placeholderTextColor="#6b7280"
                maxLength={5}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOtp}>
              <Text style={styles.primaryButtonText}>Verify & Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ghostButton}
              onPress={() => {
                setStep('enterPhone');
                setEnteredOtp('');
                setGeneratedOtp('');
              }}
            >
              <Text style={styles.ghostButtonText}>Change number</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const HomeScreen = ({ navigation, route }) => {
  const cart = route.params?.cart ?? [];
  const phone = route.params?.phone;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    getMixpanel().catch(() => {});
  }, []);

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setError(null);
        setUsingFallback(false);
      })
      .catch(() => {
        setProducts(FALLBACK_PRODUCTS);
        setError(null);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    AsyncStorage.removeItem(STORAGE_KEY_PHONE).catch(() => {});
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderItem = ({ item }) => {
    const inCart = cart.some((c) => c.id === item.id);
    return (
      <ProductCard
        product={item}
        inCart={inCart}
        onPress={async () => {
          await trackProductViewed(item);
          navigation.navigate('Product', { product: item, cart, phone });
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>ShopNow</Text>
            {phone ? (
              <Text style={styles.userPhoneText}>+91 {phone.replace(/\D/g, '')}</Text>
            ) : null}
          </View>
          <View style={styles.headerRightRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Cart', { cart, phone })}
              style={styles.cartButton}
            >
              <Text style={styles.cartIcon}>🛒</Text>
              {cart.length > 0 ? (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.length}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Featured products</Text>
        {usingFallback ? (
          <Text style={styles.fallbackHint}>Backend offline — showing demo products. Run: cd backend && npm start</Text>
        ) : null}

        {loading ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No products. Start the backend: cd backend && npm start</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const ProductScreen = ({ navigation, route }) => {
  const { product, cart, phone } = route.params;
  const inCart = cart.some((c) => c.id === product.id);

  const handleToggleCart = async () => {
    const nextCart = inCart
      ? cart.filter((c) => c.id !== product.id)
      : [...cart, product];

    if (inCart) {
      await trackRemoveFromCart(product);
    } else {
      await trackAddToCart(product);
    }

    navigation.navigate('Home', { cart: nextCart, phone });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screenContainer}>
        <View style={styles.backRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>{'←'}</Text>
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>
        </View>
        <Image source={{ uri: product.image }} style={styles.detailImage} />
        <View style={styles.detailHeaderRow}>
          <Text style={styles.detailTitle}>{product.name}</Text>
          <Text style={styles.detailPrice}>{formatCurrency(product.price)}</Text>
        </View>
        <Text style={styles.detailDescription}>{product.description}</Text>

        <TouchableOpacity
          style={[styles.primaryButton, inCart && styles.secondaryButton]}
          onPress={handleToggleCart}
        >
          <Text
            style={[
              styles.primaryButtonText,
              inCart && styles.secondaryButtonText,
            ]}
          >
            {inCart ? 'Remove from cart' : 'Add to cart'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.ghostButton}
          onPress={() => navigation.navigate('Cart', { cart, phone })}
        >
          <Text style={styles.ghostButtonText}>View cart</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const CartScreen = ({ navigation, route }) => {
  const cart = route.params?.cart ?? [];
  const phone = route.params?.phone;

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price, 0),
    [cart],
  );

  const handleRemoveFromCart = async (product) => {
    const nextCart = cart.filter((item) => item.id !== product.id);
    await trackRemoveFromCart(product);
    navigation.replace('Cart', { cart: nextCart, phone });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screenContainer}>
        <View style={styles.backRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>{'←'}</Text>
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Your cart</Text>
        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyCartText}>
              Your cart is empty. Add some products from the home screen.
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={cart}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CartItem product={item} onRemove={() => handleRemoveFromCart(item)} />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.cartSummary}>
              <Text style={styles.cartSummaryLabel}>Total</Text>
              <Text style={styles.cartSummaryValue}>
                {formatCurrency(total)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                alert('Checkout flow not implemented (demo only).');
              }}
            >
              <Text style={styles.primaryButtonText}>Proceed to checkout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [initialParams, setInitialParams] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const savedPhone = await AsyncStorage.getItem(STORAGE_KEY_PHONE);
        if (savedPhone) {
          setInitialRoute('Home');
          setInitialParams({ cart: [], phone: savedPhone });
        } else {
          setInitialRoute('Login');
          setInitialParams({});
        }
      } catch {
        setInitialRoute('Login');
      }
    })();
  }, []);

  if (!initialRoute) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.screenContainer, { alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={styles.sectionTitle}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#020617' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          initialParams={initialRoute === 'Home' ? initialParams : undefined}
        />
        <Stack.Screen name="Product" component={ProductScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 12,
    borderRadius: 999,
  },
  backIcon: {
    color: '#e5e7eb',
    fontSize: 18,
    marginRight: 4,
  },
  backLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: '#e5e7eb',
    letterSpacing: 0.5,
  },
  userPhoneText: {
    marginTop: 2,
    fontSize: 12,
    color: '#9ca3af',
  },
  loginSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#9ca3af',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#22c55e',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cartBadgeText: {
    color: '#022c22',
    fontSize: 11,
    fontWeight: '700',
  },
  logoutButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  logoutText: {
    color: '#f97373',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 12,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 15,
  },
  fallbackHint: {
    color: '#f59e0b',
    fontSize: 12,
    marginBottom: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 8,
  },
  inputPrefix: {
    color: '#9ca3af',
    marginRight: 8,
    fontSize: 15,
  },
  textInput: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 16,
  },
  errorText: {
    color: '#fca5a5',
    marginBottom: 8,
    fontSize: 13,
  },
  otpInfoText: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
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
  detailImage: {
    width: '100%',
    height: 260,
    borderRadius: 20,
    marginBottom: 16,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#e5e7eb',
    marginRight: 8,
  },
  detailPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22c55e',
  },
  detailDescription: {
    fontSize: 15,
    color: '#9ca3af',
    lineHeight: 22,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#22c55e',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#022c22',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  secondaryButtonText: {
    color: '#e0f2fe',
  },
  ghostButton: {
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  emptyCartText: {
    color: '#9ca3af',
    fontSize: 15,
    textAlign: 'center',
  },
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
  cartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 10,
  },
  cartSummaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  cartSummaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22c55e',
  },
});
