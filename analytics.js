import { Mixpanel } from 'mixpanel-react-native';
import { Platform } from 'react-native';

const MIXPANEL_TOKEN = 'YOUR_MIXPANEL_TOKEN_HERE';

let client;

function logEvent(name, props) {
  // This will show up in Metro console, Xcode/Android Studio logs, and browser console on web.
  console.log('[Mixpanel]', name, props);
}

export async function getMixpanel() {
  // On web, mixpanel-react-native is not supported; log only.
  if (Platform.OS === 'web') {
    return {
      track: (name, props) => logEvent(name, props),
    };
  }

  if (!client) {
    // Second argument trackAutomaticEvents is required (true/false).
    client = new Mixpanel(MIXPANEL_TOKEN, false);
    await client.init();
  }
  return client;
}

export async function trackProductViewed(product) {
  const payload = {
    product_id: product.id,
    name: product.name,
    price: product.price,
  };
  logEvent('Product Viewed', payload);
  const mp = await getMixpanel();
  mp.track('Product Viewed', payload);
}

export async function trackAddToCart(product) {
  const payload = {
    product_id: product.id,
    name: product.name,
    price: product.price,
  };
  logEvent('Add To Cart', payload);
  const mp = await getMixpanel();
  mp.track('Add To Cart', payload);
}

export async function trackRemoveFromCart(product) {
  const payload = {
    product_id: product.id,
    name: product.name,
    price: product.price,
  };
  logEvent('Remove From Cart', payload);
  const mp = await getMixpanel();
  mp.track('Remove From Cart', payload);
}

