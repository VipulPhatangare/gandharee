/**
 * Maps all GLB files in /uploads/models to their matching menu items by name similarity.
 * Run: node mapAllARModels.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MenuItem = require('./models/MenuItem');

/**
 * Smart name-match table:
 * GLB filename (without extension) → keywords to search in MenuItem.name
 */
const MODEL_MAP = [
  { file: 'burger.glb',                       keywords: ['burger'] },
  { file: 'chicken_fry.glb',                  keywords: ['chicken', 'fry', 'fried chicken'] },
  { file: 'chocolate_brownie.glb',             keywords: ['brownie'] },
  { file: 'chocolate_ice_cream.glb',           keywords: ['ice cream', 'ice-cream', 'kulfi'] },
  { file: 'chocolate_lava_cherry_cupcake.glb', keywords: ['lava', 'cupcake', 'chocolate'] },
  { file: 'coffee.glb',                        keywords: ['coffee', 'cappuccino', 'espresso', 'latte'] },
  { file: 'day_226_samosa.glb',                keywords: ['samosa'] },
  { file: 'french_coke_can.glb',               keywords: ['coke', 'cola', 'soft drink', 'cold drink', 'pepsi', 'soda'] },
  { file: 'gulab_jamun.glb',                   keywords: ['gulab', 'jamun'] },
  { file: 'mango_shake_bottle_l_baked.glb',    keywords: ['mango', 'shake', 'lassi', 'smoothie'] },
  { file: 'momo_food.glb',                     keywords: ['momo', 'dumpling'] },
  { file: 'pizza__tray.glb',                   keywords: ['pizza', 'margherita', 'bbq chicken pizza'] },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // First: clear all arModelFile values
  await MenuItem.updateMany({}, { $set: { arModelFile: '' } });
  console.log('🗑️  Cleared existing arModelFile values\n');

  let totalUpdated = 0;

  for (const { file, keywords } of MODEL_MAP) {
    // Build a regex that matches any of the keywords
    const regexParts = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(regexParts.join('|'), 'i');

    const result = await MenuItem.updateMany(
      { name: { $regex: regex } },
      { $set: { arModelFile: `/uploads/models/${file}` } }
    );

    if (result.modifiedCount > 0) {
      console.log(`🔗  ${file}`);
      console.log(`    → matched ${result.modifiedCount} item(s) using: [${keywords.join(', ')}]`);
      totalUpdated += result.modifiedCount;
    }
  }

  console.log(`\n✅ Done! ${totalUpdated} menu items now have AR models assigned.`);

  // Print summary of all assigned items
  const assigned = await MenuItem.find(
    { arModelFile: { $ne: '' } },
    { name: 1, arModelFile: 1 }
  ).lean();

  console.log('\n📋 AR-enabled dishes:');
  assigned.forEach((item) => {
    console.log(`   • ${item.name}  →  ${item.arModelFile}`);
  });

  const total = await MenuItem.countDocuments();
  const notAssigned = await MenuItem.find(
    { arModelFile: '' },
    { name: 1 }
  ).lean();

  console.log(`\n⚪ Dishes WITHOUT AR model (${notAssigned.length}/${total}):`);
  notAssigned.forEach((item) => console.log(`   - ${item.name}`));

  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
