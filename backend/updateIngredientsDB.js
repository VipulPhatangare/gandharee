const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MenuItem = require('./models/MenuItem');

dotenv.config();

const INGREDIENTS_MAP = {
  'Chicken Tandoor': ['Chicken', 'Yogurt', 'Lemon Juice', 'Kashmiri Chilli', 'Ginger', 'Garlic', 'Garam Masala', 'Kasoori Methi'],
  'Chocolate Brownie': ['Dark Chocolate', 'Butter', 'Flour', 'Sugar', 'Cocoa Powder', 'Vanilla'],
  'Chocolate Ice Cream': ['Milk', 'Cream', 'Cocoa', 'Sugar', 'Vanilla'],
  'Chocolate Lava Cake': ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour', 'Vanilla Ice Cream', 'Berry Coulis'],
  'Coke': ['Carbonated Water', 'Cola Flavor', 'Sugar', 'Lemon', 'Ice'],
  'Cold Coffee': ['Single Origin Coffee', 'Cold Water', 'Oat Milk', 'Vanilla', 'Ice'],
  'Gulab Jamun': ['Khoya', 'All-Purpose Flour', 'Sugar Syrup', 'Rose Water', 'Cardamom', 'Vanilla Ice Cream'],
  'Mango Lassi': ['Alphonso Mango', 'Yogurt', 'Milk', 'Sugar', 'Cardamom', 'Rose Water', 'Ice'],
  'Margherita Pizza': ['Pizza Dough', 'San Marzano Tomatoes', 'Buffalo Mozzarella', 'Fresh Basil', 'Olive Oil', 'Sea Salt'],
  'Samosa': ['Refined Flour', 'Potato', 'Green Peas', 'Cumin', 'Coriander', 'Mint Chutney', 'Tamarind Chutney'],
  'Veg Burger': ['Veg Patty', 'Cheese', 'Burger Bun', 'Lettuce', 'Tomato', 'Onion', 'Pickles', 'House Sauce'],
  'Veg Momos': ['Flour', 'Cabbage', 'Carrot', 'Onion', 'Garlic', 'Ginger', 'Pepper', 'Chilli Dip'],
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let updated = 0;
    for (const [name, ingredients] of Object.entries(INGREDIENTS_MAP)) {
      const res = await MenuItem.updateOne({ name }, { $set: { ingredients } });
      if (res.modifiedCount > 0 || res.matchedCount > 0) {
        updated += 1;
        console.log(`• Updated ingredients: ${name}`);
      } else {
        console.log(`• Skipped (not found): ${name}`);
      }
    }

    console.log(`\n✅ Ingredients update completed. Processed: ${updated} items.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update ingredients:', err.message);
    process.exit(1);
  }
}

run();
