const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MenuItem = require('./models/MenuItem');

const EXACT_MAP = {
  'Chicken Tandoor': '/uploads/models/chicken_fry.glb',
  'Butter Chicken': '/uploads/models/chicken_fry.glb',
  'Samosa': '/uploads/models/day_226_samosa.glb',
  'Margherita Pizza': '/uploads/models/pizza__tray.glb',
  'BBQ Chicken Pizza': '/uploads/models/pizza__tray.glb',
  'Veg Burger': '/uploads/models/burger.glb',
  'Mushroom Swiss Burger': '/uploads/models/burger.glb',
  'Gulab Jamun': '/uploads/models/gulab_jamun.glb',
  'Chocolate Brownie': '/uploads/models/chocolate_brownie.glb',
  'Chocolate Ice Cream': '/uploads/models/chocolate_ice_cream.glb',
  'Chocolate Lava Cake': '/uploads/models/chocolate_lava_cherry_cupcake.glb',
  'Mango Lassi': '/uploads/models/mango_shake_bottle_l_baked.glb',
  'Cold Coffee': '/uploads/models/coffee.glb',
  'French Coke': '/uploads/models/french_coke_can.glb',
  'Veg Momos': '/uploads/models/momo_food.glb',
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Reset all
  await MenuItem.updateMany({}, { $set: { arModelFile: '' } });

  // Update exact matches
  for (const [name, file] of Object.entries(EXACT_MAP)) {
    await MenuItem.updateOne({ name }, { $set: { arModelFile: file } });
  }

  const withAR = await MenuItem.find({ arModelFile: { $ne: '' } }, { name: 1, arModelFile: 1 }).lean();
  const withoutAR = await MenuItem.find({ arModelFile: '' }, { name: 1 }).lean();

  console.log('\n📋 Menu items with AR models:');
  withAR.forEach((item) => {
    console.log(`   • ${item.name}  →  ${item.arModelFile}`);
  });

  console.log(`\n⚪ Menu items without AR models: ${withoutAR.length}`);

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
