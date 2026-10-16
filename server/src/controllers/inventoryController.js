const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc Get current stock audit report & history
// @route GET /api/inventory/transactions
exports.getInventoryTransactions = async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find().sort({ createdAt: -1 }).limit(100);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Perform Stock In / Stock Adjustment
// @route POST /api/inventory/adjust
exports.adjustStock = async (req, res) => {
  try {
    const { productId, type, quantity, reason, performedBy } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const previousStock = product.stock;
    const qtyChange = Number(quantity);

    if (type === 'Stock In') {
      product.stock += Math.abs(qtyChange);
    } else if (type === 'Stock Out') {
      product.stock = Math.max(0, product.stock - Math.abs(qtyChange));
    } else {
      product.stock = Math.max(0, product.stock + qtyChange);
    }

    await product.save();

    const transaction = await InventoryTransaction.create({
      product: product._id,
      productName: product.name,
      sku: product.sku,
      type: type || 'Adjustment',
      quantity: product.stock - previousStock,
      previousStock,
      newStock: product.stock,
      reason: reason || 'Manual Stock Adjustment',
      performedBy: performedBy || 'Admin'
    });

    res.json({ message: 'Stock updated successfully', product, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
