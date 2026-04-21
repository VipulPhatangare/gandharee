/**
 * Update AR model file paths in database for existing dishes
 * Run: node updateARModels.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MenuItem = require('./models/MenuItem');

const updates = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Map dish name keywords -> model file path
  const modelMap = [
    { keyword: 'Coffee', file: '/uploads/models/coffee.glb' },
    { keyword: 'Margherita', file: '/uploads/models/pizza__tray.glb' },
    { keyword: 'BBQ Chicken Pizza', file: '/uploads/models/pizza__tray.glb' },
  ];

  for (const { keyword, file } of modelMap) {
    const result = await MenuItem.updateMany(
      { name: { $regex: keyword, $options: 'i' } },
      { $set: { arModelFile: file } }
    );
    console.log(`🔗 "${keyword}" → ${file} (${result.modifiedCount} updated)`);
  }

  console.log('\n✅ AR model paths updated successfully!');
  process.exit(0);
};

updates().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
