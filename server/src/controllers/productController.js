const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc Get all products with filtering & search
// @route GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { category, brand, search, lowStock, limit = 100, sort } = req.query;
    let query = { status: { $ne: 'Discontinued' } };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (brand) {
      query.brand = brand;
    }
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$minimumStock'] };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_low') sortOptions = { sellingPrice: 1 };
    if (sort === 'price_high') sortOptions = { sellingPrice: -1 };
    if (sort === 'popularity') sortOptions = { isBestSeller: -1 };

    const products = await Product.find(query).sort(sortOptions).limit(Number(limit));
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single product by Barcode (For POS & Scanner)
// @route GET /api/products/barcode/:barcode
exports.getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const product = await Product.findOne({ barcode: barcode.trim() });
    if (!product) {
      return res.status(404).json({ message: `No product found with barcode: ${barcode}` });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get product by ID
// @route GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create new product
// @route POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Check barcode/sku uniqueness
    const existingBarcode = await Product.findOne({ barcode: productData.barcode });
    if (existingBarcode) {
      return res.status(400).json({ message: 'A product with this Barcode already exists' });
    }

    const existingSku = await Product.findOne({ sku: productData.sku });
    if (existingSku) {
      return res.status(400).json({ message: 'A product with this SKU already exists' });
    }

    const product = await Product.create(productData);

    // Record initial inventory transaction if stock > 0
    if (product.stock > 0) {
      await InventoryTransaction.create({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        type: 'Stock In',
        quantity: product.stock,
        previousStock: 0,
        newStock: product.stock,
        reason: 'Initial Product Registration'
      });
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update product
// @route PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const oldStock = product.stock;
    Object.assign(product, req.body);
    const updatedProduct = await product.save();

    // Log stock adjustment if stock was manually altered
    if (req.body.stock !== undefined && req.body.stock !== oldStock) {
      const stockDiff = req.body.stock - oldStock;
      await InventoryTransaction.create({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        type: 'Adjustment',
        quantity: stockDiff,
        previousStock: oldStock,
        newStock: req.body.stock,
        reason: 'Manual Admin Adjustment'
      });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete product
// @route DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    product.status = 'Discontinued';
    await product.save();
    res.json({ message: 'Product marked as discontinued' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
