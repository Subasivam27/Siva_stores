const Category = require('../models/Category');

// @desc Get all categories
// @route GET /api/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create category
// @route POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon, subcategories } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    
    const category = await Category.create({
      name,
      slug,
      description,
      icon,
      subcategories: subcategories || []
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
