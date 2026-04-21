const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items (with search + filters)
// @route   GET /api/menu
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    const {
      search,
      category,
      foodType,
      bestseller,
      minPrice,
      maxPrice,
      available,
      featured,
      sortBy,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Filters
    if (category) query.category = category;
    if (foodType) query.foodType = foodType;
    if (bestseller === 'true') query.bestseller = true;
    if (featured === 'true') query.featured = true;
    if (available !== undefined) query.available = available === 'true';

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sort
    let sort = { createdAt: -1 };
    if (sortBy === 'price-asc') sort = { price: 1 };
    else if (sortBy === 'price-desc') sort = { price: -1 };
    else if (sortBy === 'rating') sort = { rating: -1 };
    else if (sortBy === 'popular') sort = { reviewCount: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await MenuItem.countDocuments(query);
    const items = await MenuItem.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: items.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single menu item by slug
// @route   GET /api/menu/:slug
// @access  Public
const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOne({ slug: req.params.slug }).populate('category', 'name slug');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Dish not found.' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single menu item by ID
// @route   GET /api/menu/id/:id
// @access  Admin
const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category', 'name slug');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Dish not found.' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Admin
const createMenuItem = async (req, res) => {
  try {
    const {
      name, description, shortDescription, price, category, foodType,
      spiceLevel, ingredients, nutrition, portionSize, rating, available,
      bestseller, featured, preparationTime, tags,
    } = req.body;

    const itemData = {
      name, description, shortDescription, price: Number(price), category,
      foodType, spiceLevel, portionSize, available: available !== 'false',
      bestseller: bestseller === 'true', featured: featured === 'true',
      preparationTime: Number(preparationTime) || 15,
      rating: Number(rating) || 4.0,
    };

    // Parse JSON arrays safely
    if (ingredients) {
      itemData.ingredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    }
    if (tags) {
      itemData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }
    if (nutrition) {
      itemData.nutrition = typeof nutrition === 'string' ? JSON.parse(nutrition) : nutrition;
    }

    // Handle uploaded files
    if (req.files) {
      if (req.files.image) itemData.image = `/uploads/images/${req.files.image[0].filename}`;
      if (req.files.arModel) itemData.arModelFile = `/uploads/models/${req.files.arModel[0].filename}`;
    } else if (req.file) {
      itemData.image = `/uploads/images/${req.file.filename}`;
    }

    const item = await MenuItem.create(itemData);
    await item.populate('category', 'name slug');

    res.status(201).json({ success: true, message: 'Dish created successfully', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Admin
const updateMenuItem = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.preparationTime) updateData.preparationTime = Number(updateData.preparationTime);
    if (updateData.rating) updateData.rating = Number(updateData.rating);
    if (updateData.available !== undefined) updateData.available = updateData.available !== 'false';
    if (updateData.bestseller !== undefined) updateData.bestseller = updateData.bestseller === 'true';
    if (updateData.featured !== undefined) updateData.featured = updateData.featured === 'true';

    if (typeof updateData.ingredients === 'string') {
      updateData.ingredients = JSON.parse(updateData.ingredients);
    }
    if (typeof updateData.tags === 'string') {
      updateData.tags = JSON.parse(updateData.tags);
    }
    if (typeof updateData.nutrition === 'string') {
      updateData.nutrition = JSON.parse(updateData.nutrition);
    }

    if (req.files) {
      if (req.files.image) updateData.image = `/uploads/images/${req.files.image[0].filename}`;
      if (req.files.arModel) updateData.arModelFile = `/uploads/models/${req.files.arModel[0].filename}`;
    } else if (req.file) {
      updateData.image = `/uploads/images/${req.file.filename}`;
    }

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Dish not found.' });
    }

    res.json({ success: true, message: 'Dish updated successfully', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Admin
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Dish not found.' });
    }
    res.json({ success: true, message: 'Dish deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMenuItems, getMenuItem, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem };
