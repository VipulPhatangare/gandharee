const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MenuItem = require('./models/MenuItem');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Deletions
  const deleted = await MenuItem.deleteMany({
    name: { $in: ['Chicken Wings', 'BBQ Chicken Pizza', 'Classic Smash Burger'] }
  });
  console.log(`🗑️ Deleted ${deleted.deletedCount} requested items.`);

  // Renames
  await MenuItem.updateOne(
    { name: 'Cold Brew Coffee' },
    { $set: { name: 'Cold Coffee', description: 'Chilled iced coffee perfect for refreshing yourself.' } }
  );

  await MenuItem.updateOne(
    { name: 'Mushroom Swiss Burger' },
    { $set: { name: 'Veg Burger', description: 'Delicious plant-based patty with fresh lettuce, tomatoes, and cheese on a toasted bun.' } }
  );

  await MenuItem.updateOne(
    { name: 'Butter Chicken' },
    { $set: { name: 'Tandoor Chicken', description: 'Authentic clay oven roasted chicken marinated in yogurt and traditional aromatic spices.' } }
  );

  await MenuItem.updateOne(
    { name: 'Samosa Chaat' },
    { $set: { name: 'Samosa', description: 'Crispy pastry filled with spiced potatoes and peas.' } }
  );

  console.log('🏷️ Renamed and updated descriptions for requested items.');

  const remaining = await MenuItem.find({}, { name: 1, arModelFile: 1 }).lean();
  console.log('\n📋 Menu items currently on website:');
  remaining.forEach((item) => {
    console.log(`   • ${item.name}`);
  });

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
