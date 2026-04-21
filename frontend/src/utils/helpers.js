// Format currency
export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const MENU_IMAGE_MAP = {
  'Chicken Tandoor': new URL('../assets/menu-imges/chicken-tandoor.jpg', import.meta.url).href,
  'Chocolate Brownie': new URL('../assets/menu-imges/Chocolate Brownie.jpg', import.meta.url).href,
  'Chocolate Ice Cream': new URL('../assets/menu-imges/Chocolate Ice Cream.jpg', import.meta.url).href,
  'Chocolate Lava Cake': new URL('../assets/menu-imges/Chocolate Lava Cake.avif', import.meta.url).href,
  Coke: new URL('../assets/menu-imges/Coke.jpg', import.meta.url).href,
  'Cold Coffee': new URL('../assets/menu-imges/Cold Coffee.avif', import.meta.url).href,
  'Gulab Jamun': new URL('../assets/menu-imges/Gulab Jamun.webp', import.meta.url).href,
  'Mango Lassi': new URL('../assets/menu-imges/Mango Lassi.jpg', import.meta.url).href,
  'Margherita Pizza': new URL('../assets/menu-imges/Margherita Pizza.webp', import.meta.url).href,
  Samosa: new URL('../assets/menu-imges/Samosa.jpg', import.meta.url).href,
  'Veg Burger': new URL('../assets/menu-imges/Veg Burger.jpg', import.meta.url).href,
  'Veg Momos': new URL('../assets/menu-imges/Veg Momos.jpg', import.meta.url).href,
};

// Get image URL
export const getImageUrl = (path, itemName = '') => {
  if (itemName && MENU_IMAGE_MAP[itemName]) return MENU_IMAGE_MAP[itemName];
  if (!path) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format';
  if (path.startsWith('http')) return path;
  return path;
};

// Food type dot color
export const getFoodTypeDot = (type) => {
  const colors = {
    veg: '#2ECC71',
    nonveg: '#E8453C',
    jain: '#F39C12',
    vegan: '#27AE60',
  };
  return colors[type] || '#2ECC71';
};

// Spice level label
export const getSpiceLabel = (level) => {
  const labels = {
    mild: '🌶️ Mild',
    medium: '🌶️🌶️ Medium',
    hot: '🌶️🌶️🌶️ Hot',
    'extra-hot': '🌶️🌶️🌶️🌶️ Extra Hot',
  };
  return labels[level] || level;
};

// Star rating display
export const getStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return { full, half, empty: 5 - full - (half ? 1 : 0) };
};

// Time ago
export const timeAgo = (date) => {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
};

// Order status config
export const ORDER_STATUSES = [
  { key: 'received', label: 'Order Received', icon: '📋', color: '#3498DB' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', color: '#F39C12' },
  { key: 'ready', label: 'Ready to Serve', icon: '✅', color: '#2ECC71' },
  { key: 'served', label: 'Served', icon: '🍽️', color: '#D4AF37' },
];

export const getStatusIndex = (status) =>
  ORDER_STATUSES.findIndex((s) => s.key === status);
