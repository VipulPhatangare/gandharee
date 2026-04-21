/**
 * AR Hotel Menu Platform — Seed Data
 * Run: node seedData.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await MenuItem.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Create Admin User
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@arhotel.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`👤 Admin created: ${admin.email}`);

    // Create Categories one by one to trigger pre-save slug generation
    const catData = [
      { name: 'Starters', description: 'Appetizers and small bites', sortOrder: 1 },
      { name: 'Main Course', description: 'Hearty main dishes', sortOrder: 2 },
      { name: 'Breads', description: 'Fresh baked breads and rotis', sortOrder: 3 },
      { name: 'Desserts', description: 'Sweet treats and desserts', sortOrder: 4 },
      { name: 'Drinks', description: 'Refreshing beverages', sortOrder: 5 },
      { name: 'Pizza', description: 'Wood-fired gourmet pizzas', sortOrder: 6 },
      { name: 'Burgers', description: 'Gourmet craft burgers', sortOrder: 7 },
    ];
    const categories = [];
    for (const c of catData) {
      const cat = await Category.create(c);
      categories.push(cat);
    }
    console.log(`📁 Categories created: ${categories.length}`);

    const getCat = (name) => categories.find((c) => c.name === name)._id;

    // Create Menu Items
    const menuItems = [
      // ── Starters ──
      {
        name: 'Paneer Tikka',
        description: 'Succulent cottage cheese cubes marinated in yogurt and spices, grilled to perfection in tandoor. A classic North Indian appetizer that melts in your mouth.',
        shortDescription: 'Tandoor grilled cottage cheese with spiced marinade',
        price: 280,
        category: getCat('Starters'),
        foodType: 'veg',
        spiceLevel: 'medium',
        ingredients: ['Paneer', 'Yogurt', 'Bell Peppers', 'Onion', 'Tandoori Masala', 'Ginger', 'Garlic', 'Lemon Juice', 'Cumin'],
        nutrition: { calories: 320, protein: 18, carbs: 12, fat: 22 },
        portionSize: '250g (8 pieces)',
        rating: 4.8,
        reviewCount: 124,
        bestseller: true,
        featured: true,
        preparationTime: 20,
        tags: ['tandoor', 'vegetarian', 'starter', 'popular'],
        arModelFile: '',
      },
      {
        name: 'Chicken Tandoor',
        description: 'Authentic tandoor-roasted chicken marinated overnight in yogurt, lemon juice, and aromatic Indian spices. Smoky, juicy, and full of bold flavor.',
        shortDescription: 'Tandoor-roasted chicken with classic Indian marinade',
        price: 340,
        category: getCat('Starters'),
        foodType: 'nonveg',
        spiceLevel: 'medium',
        ingredients: ['Chicken', 'Yogurt', 'Lemon Juice', 'Kashmiri Chilli', 'Ginger', 'Garlic', 'Garam Masala', 'Kasoori Methi'],
        nutrition: { calories: 460, protein: 34, carbs: 10, fat: 32 },
        portionSize: '6 pieces',
        rating: 4.7,
        reviewCount: 98,
        bestseller: true,
        preparationTime: 20,
        tags: ['chicken', 'tandoor', 'smoky'],
        arModelFile: '/uploads/models/chicken_fry.glb',
      },
      {
        name: 'Mushroom Bruschetta',
        description: 'Toasted artisan bread topped with sautéed garlic mushrooms, cherry tomatoes, fresh basil and a drizzle of truffle oil.',
        shortDescription: 'Garlic mushrooms on toasted artisan bread',
        price: 220,
        category: getCat('Starters'),
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Sourdough Bread', 'Mushrooms', 'Cherry Tomatoes', 'Basil', 'Garlic', 'Truffle Oil', 'Parmesan'],
        nutrition: { calories: 240, protein: 8, carbs: 30, fat: 10 },
        portionSize: '2 pieces',
        rating: 4.5,
        reviewCount: 67,
        preparationTime: 12,
        tags: ['italian', 'vegetarian', 'truffle'],
      },
      {
        name: 'Samosa',
        description: 'Crispy pastry pockets stuffed with spiced potatoes and peas, served hot with mint and tamarind chutney. A timeless favorite.',
        shortDescription: 'Crispy stuffed samosa with mint and tamarind chutney',
        price: 180,
        category: getCat('Starters'),
        foodType: 'jain',
        spiceLevel: 'medium',
        ingredients: ['Refined Flour', 'Potato', 'Green Peas', 'Cumin', 'Coriander', 'Mint Chutney', 'Tamarind Chutney'],
        nutrition: { calories: 360, protein: 7, carbs: 50, fat: 15 },
        portionSize: '2 pieces',
        rating: 4.6,
        reviewCount: 89,
        preparationTime: 10,
        tags: ['street-food', 'jain', 'snack'],
        arModelFile: '/uploads/models/day_226_samosa.glb',
      },
      {
        name: 'Veg Momos',
        description: 'Soft steamed dumplings filled with finely chopped vegetables, herbs, and spices. Served with spicy red chilli dip.',
        shortDescription: 'Steamed vegetable dumplings with spicy dip',
        price: 210,
        category: getCat('Starters'),
        foodType: 'veg',
        spiceLevel: 'medium',
        ingredients: ['Flour', 'Cabbage', 'Carrot', 'Onion', 'Garlic', 'Ginger', 'Pepper', 'Chilli Dip'],
        nutrition: { calories: 290, protein: 10, carbs: 48, fat: 7 },
        portionSize: '8 pieces',
        rating: 4.5,
        reviewCount: 64,
        preparationTime: 15,
        tags: ['momos', 'dumplings', 'steamed'],
        arModelFile: '/uploads/models/momo_food.glb',
      },

      // ── Main Course ──
      {
        name: 'Butter Chicken',
        description: 'Tender chicken pieces cooked in a rich, creamy tomato-based sauce with aromatic spices. This iconic dish is the crown jewel of Indian cuisine — silky, velvety, and utterly irresistible.',
        shortDescription: 'Creamy tomato-based chicken curry, restaurant signature',
        price: 380,
        category: getCat('Main Course'),
        foodType: 'nonveg',
        spiceLevel: 'mild',
        ingredients: ['Chicken', 'Tomatoes', 'Cream', 'Butter', 'Cashews', 'Ginger', 'Garlic', 'Kashmiri Chilli', 'Fenugreek', 'Cardamom'],
        nutrition: { calories: 520, protein: 38, carbs: 18, fat: 34 },
        portionSize: '300g with gravy',
        rating: 4.9,
        reviewCount: 245,
        bestseller: true,
        featured: true,
        preparationTime: 25,
        tags: ['chicken', 'curry', 'popular', 'signature'],
        arModelFile: '',
      },
      {
        name: 'Dal Makhani',
        description: 'Black lentils slow-cooked overnight with butter, cream, and a symphony of spices. This Delhi-style dal is the ultimate comfort food, rich and deeply flavorful.',
        shortDescription: 'Overnight slow-cooked black lentils with butter and cream',
        price: 260,
        category: getCat('Main Course'),
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Black Lentils', 'Kidney Beans', 'Butter', 'Cream', 'Tomatoes', 'Ginger', 'Garlic', 'Garam Masala'],
        nutrition: { calories: 420, protein: 16, carbs: 45, fat: 20 },
        portionSize: '350ml',
        rating: 4.8,
        reviewCount: 178,
        bestseller: true,
        preparationTime: 30,
        tags: ['dal', 'vegetarian', 'comfort-food'],
      },
      {
        name: 'Grilled Lamb Chops',
        description: 'Prime lamb chops marinated in rosemary, garlic, and herbs, grilled to medium-rare perfection. Served with roasted vegetables and mint jus.',
        shortDescription: 'Herb-crusted lamb chops with roasted vegetables',
        price: 680,
        category: getCat('Main Course'),
        foodType: 'nonveg',
        spiceLevel: 'mild',
        ingredients: ['Lamb Chops', 'Rosemary', 'Garlic', 'Thyme', 'Olive Oil', 'Seasonal Vegetables', 'Mint', 'Red Wine'],
        nutrition: { calories: 620, protein: 48, carbs: 12, fat: 42 },
        portionSize: '3 chops + sides',
        rating: 4.7,
        reviewCount: 56,
        preparationTime: 35,
        tags: ['lamb', 'grilled', 'premium', 'continental'],
      },
      {
        name: 'Paneer Lababdar',
        description: 'Soft paneer in a rich, tangy onion-tomato gravy with cashew paste, cream, and aromatic spices. A Punjabi indulgence you cannot resist.',
        shortDescription: 'Paneer in rich onion-tomato-cashew gravy',
        price: 320,
        category: getCat('Main Course'),
        foodType: 'veg',
        spiceLevel: 'medium',
        ingredients: ['Paneer', 'Onions', 'Tomatoes', 'Cashews', 'Cream', 'Butter', 'Coriander', 'Garam Masala', 'Kasoori Methi'],
        nutrition: { calories: 480, protein: 22, carbs: 20, fat: 36 },
        portionSize: '280g',
        rating: 4.6,
        reviewCount: 134,
        featured: true,
        preparationTime: 22,
        tags: ['paneer', 'vegetarian', 'punjabi'],
      },

      // ── Pizza ──
      {
        name: 'Margherita Pizza',
        description: 'Classic Neapolitan-style pizza with San Marzano tomato sauce, fresh buffalo mozzarella, and fragrant basil leaves on a hand-tossed thin crust baked in stone oven.',
        shortDescription: 'Classic thin crust with tomato, mozzarella, basil',
        price: 380,
        category: getCat('Pizza'),
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Pizza Dough', 'San Marzano Tomatoes', 'Buffalo Mozzarella', 'Fresh Basil', 'Olive Oil', 'Sea Salt'],
        nutrition: { calories: 580, protein: 22, carbs: 72, fat: 24 },
        portionSize: '10 inch / 6 slices',
        rating: 4.7,
        reviewCount: 203,
        bestseller: true,
        featured: true,
        preparationTime: 20,
        tags: ['pizza', 'italian', 'vegetarian', 'popular'],
        arModelFile: '/uploads/models/pizza__tray.glb',
      },
      {
        name: 'BBQ Chicken Pizza',
        description: 'Smoky BBQ sauce base with shredded chicken, caramelized onions, jalapeños, and a blend of cheddar and mozzarella cheese. Finished with ranch drizzle.',
        shortDescription: 'BBQ base, chicken, jalapeños, cheddar mozzarella',
        price: 460,
        category: getCat('Pizza'),
        foodType: 'nonveg',
        spiceLevel: 'medium',
        ingredients: ['Pizza Dough', 'BBQ Sauce', 'Chicken', 'Cheddar', 'Mozzarella', 'Jalapenos', 'Onions', 'Ranch'],
        nutrition: { calories: 680, protein: 36, carbs: 78, fat: 28 },
        portionSize: '10 inch / 6 slices',
        rating: 4.8,
        reviewCount: 167,
        bestseller: true,
        preparationTime: 22,
        tags: ['pizza', 'chicken', 'BBQ', 'spicy'],
      },

      // ── Burgers ──
      {
        name: 'Veg Burger',
        description: 'A delicious crispy vegetable patty burger layered with lettuce, tomato, onion, cheese, and creamy house sauce in a toasted bun.',
        shortDescription: 'Crispy veg patty burger with fresh toppings',
        price: 340,
        category: getCat('Burgers'),
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Veg Patty', 'Cheese', 'Burger Bun', 'Lettuce', 'Tomato', 'Onion', 'Pickles', 'House Sauce'],
        nutrition: { calories: 620, protein: 20, carbs: 70, fat: 28 },
        portionSize: 'Single patty + fries',
        rating: 4.9,
        reviewCount: 312,
        bestseller: true,
        featured: true,
        preparationTime: 15,
        tags: ['burger', 'veg', 'popular'],
        arModelFile: '/uploads/models/burger.glb',
      },
      {
        name: 'Mushroom Swiss Burger',
        description: 'Juicy beef patty topped with sautéed mushrooms, Swiss cheese, caramelized onions, and garlic aioli on a sesame bun.',
        shortDescription: 'Beef patty with sautéed mushrooms and Swiss cheese',
        price: 360,
        category: getCat('Burgers'),
        foodType: 'nonveg',
        spiceLevel: 'mild',
        ingredients: ['Beef Patty', 'Swiss Cheese', 'Mushrooms', 'Sesame Bun', 'Caramelized Onion', 'Garlic Aioli', 'Arugula'],
        nutrition: { calories: 680, protein: 38, carbs: 52, fat: 40 },
        portionSize: 'Single patty + fries',
        rating: 4.7,
        reviewCount: 89,
        preparationTime: 15,
        tags: ['burger', 'beef', 'mushroom'],
      },

      // ── Desserts ──
      {
        name: 'Gulab Jamun',
        description: 'Soft khoya dumplings soaked in rose-scented cardamom sugar syrup, served warm with a scoop of vanilla ice cream. Pure indulgence in every bite.',
        shortDescription: 'Warm khoya dumplings in rose syrup with ice cream',
        price: 160,
        category: getCat('Desserts'),
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Khoya', 'All-Purpose Flour', 'Sugar Syrup', 'Rose Water', 'Cardamom', 'Vanilla Ice Cream'],
        nutrition: { calories: 420, protein: 8, carbs: 65, fat: 16 },
        portionSize: '3 pieces + ice cream',
        rating: 4.9,
        reviewCount: 198,
        bestseller: true,
        preparationTime: 10,
        tags: ['dessert', 'indian', 'sweet', 'popular'],
        arModelFile: '/uploads/models/gulab_jamun.glb',
      },
      {
        name: 'Chocolate Brownie',
        description: 'Rich and fudgy dark chocolate brownie served warm with chocolate drizzle and a dusting of cocoa.',
        shortDescription: 'Warm fudgy brownie with chocolate drizzle',
        price: 220,
        category: getCat('Desserts'),
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Dark Chocolate', 'Butter', 'Flour', 'Sugar', 'Cocoa Powder', 'Vanilla'],
        nutrition: { calories: 460, protein: 6, carbs: 54, fat: 24 },
        portionSize: '1 brownie',
        rating: 4.7,
        reviewCount: 102,
        preparationTime: 12,
        tags: ['dessert', 'chocolate', 'brownie'],
        arModelFile: '/uploads/models/chocolate_brownie.glb',
      },
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm dark chocolate cake with a molten flowing center, dusted with powdered sugar and served with fresh vanilla bean ice cream and berry coulis.',
        shortDescription: 'Warm chocolate cake with flowing molten center',
        price: 240,
        category: getCat('Desserts'),
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour', 'Vanilla Ice Cream', 'Berry Coulis'],
        nutrition: { calories: 520, protein: 8, carbs: 58, fat: 28 },
        portionSize: '1 cake + ice cream',
        rating: 4.8,
        reviewCount: 145,
        bestseller: true,
        featured: true,
        preparationTime: 15,
        tags: ['dessert', 'chocolate', 'warm', 'premium'],
        arModelFile: '/uploads/models/chocolate_lava_cherry_cupcake.glb',
      },
      {
        name: 'Chocolate Ice Cream',
        description: 'Creamy premium chocolate ice cream with deep cocoa flavor, served chilled and silky smooth.',
        shortDescription: 'Creamy premium chocolate ice cream scoop',
        price: 170,
        category: getCat('Desserts'),
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Milk', 'Cream', 'Cocoa', 'Sugar', 'Vanilla'],
        nutrition: { calories: 280, protein: 5, carbs: 30, fat: 15 },
        portionSize: '2 scoops',
        rating: 4.6,
        reviewCount: 76,
        preparationTime: 5,
        tags: ['dessert', 'ice cream', 'chocolate'],
        arModelFile: '/uploads/models/chocolate_ice_cream.glb',
      },

      // ── Drinks ──
      {
        name: 'Mango Lassi',
        description: 'Thick and creamy blended yogurt drink with Alphonso mango pulp, a pinch of cardamom and rose water. Chilled to perfection.',
        shortDescription: 'Thick Alphonso mango yogurt drink with cardamom',
        price: 120,
        category: getCat('Drinks'),
        foodType: 'veg',
        spiceLevel: 'mild',
        ingredients: ['Alphonso Mango', 'Yogurt', 'Milk', 'Sugar', 'Cardamom', 'Rose Water', 'Ice'],
        nutrition: { calories: 260, protein: 8, carbs: 48, fat: 6 },
        portionSize: '350ml',
        rating: 4.8,
        reviewCount: 234,
        bestseller: true,
        preparationTime: 5,
        tags: ['drink', 'mango', 'lassi', 'vegetarian', 'popular'],
        arModelFile: '/uploads/models/mango_shake_bottle_l_baked.glb',
      },
      {
        name: 'Cold Coffee',
        description: '18-hour steeped specialty cold brew concentrate served over ice with oat milk and a hint of vanilla. Smooth, bold, and refreshing.',
        shortDescription: '18-hour steeped cold brew with oat milk',
        price: 180,
        category: getCat('Drinks'),
        foodType: 'vegan',
        spiceLevel: 'mild',
        ingredients: ['Single Origin Coffee', 'Cold Water', 'Oat Milk', 'Vanilla', 'Ice'],
        nutrition: { calories: 80, protein: 2, carbs: 12, fat: 3 },
        portionSize: '400ml',
        rating: 4.7,
        reviewCount: 112,
        preparationTime: 5,
        tags: ['coffee', 'cold brew', 'vegan'],
        arModelFile: '/uploads/models/coffee.glb',
      },
      {
        name: 'Coke',
        description: 'Chilled fizzy cola served over ice with lemon wedge for a refreshing sparkle.',
        shortDescription: 'Refreshing chilled cola with lemon',
        price: 110,
        category: getCat('Drinks'),
        foodType: 'vegan',
        spiceLevel: 'mild',
        ingredients: ['Carbonated Water', 'Cola Flavor', 'Sugar', 'Lemon', 'Ice'],
        nutrition: { calories: 140, protein: 0, carbs: 35, fat: 0 },
        portionSize: '300ml',
        rating: 4.4,
        reviewCount: 58,
        preparationTime: 2,
        tags: ['drink', 'cola', 'cold drink'],
        arModelFile: '/uploads/models/french_coke_can.glb',
      },
    ];

    // Keep ONLY menu items that have a valid existing AR model file
    const modelsDir = path.join(__dirname, 'uploads', 'models');
    const availableModelFiles = new Set(
      fs
        .readdirSync(modelsDir)
        .filter((f) => f.toLowerCase().endsWith('.glb'))
        .map((f) => `/uploads/models/${f}`)
    );

    const arOnlyMenuItems = menuItems.filter(
      (item) => item.arModelFile && availableModelFiles.has(item.arModelFile)
    );

    const excludedItems = menuItems.filter(
      (item) => !item.arModelFile || !availableModelFiles.has(item.arModelFile)
    );

    if (excludedItems.length > 0) {
      console.log(`⚪ Skipped non-AR menu items: ${excludedItems.length}`);
      excludedItems.forEach((item) => console.log(`   - ${item.name}`));
    }

    // Insert AR-only items one by one to trigger pre-save middleware (slug generation)
    for (const item of arOnlyMenuItems) {
      await MenuItem.create(item);
    }

    console.log(`🍽️  AR-only menu items created: ${arOnlyMenuItems.length}`);
    console.log('\n✅ Seed completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Admin Email: admin@arhotel.com');
    console.log('🔑 Admin Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
