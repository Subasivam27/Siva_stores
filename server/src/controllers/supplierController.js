const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc Get all suppliers
// @route GET /api/suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create new supplier
// @route POST /api/suppliers
exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all Purchase Orders
// @route GET /api/purchases
exports.getPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find().sort({ createdAt: -1 });
    res.json(pos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create Purchase Order
// @route POST /api/purchases
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, items } = req.body;
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    let subtotal = 0;
    let gstTotal = 0;
    const poItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      const purchasePrice = item.purchasePrice || (product ? product.sellingPrice * 0.8 : 100);
      const gstRate = product ? product.gstRate : 5;
      const itemTotal = purchasePrice * item.orderedQty;
      const itemGst = (itemTotal * gstRate) / 100;

      subtotal += itemTotal;
      gstTotal += itemGst;

      poItems.push({
        product: product ? product._id : null,
        productName: item.productName || (product ? product.name : 'Supply Product'),
        sku: product ? product.sku : 'SKU-SUPPLY',
        orderedQty: item.orderedQty,
        receivedQty: 0,
        purchasePrice,
        gstRate,
        total: itemTotal
      });
    }

    const grandTotal = Math.round(subtotal + gstTotal);
    const poNumber = `PO-${Date.now().toString().slice(-6)}`;

    const po = await PurchaseOrder.create({
      poNumber,
      supplier: supplier._id,
      supplierName: supplier.company || supplier.name,
      items: poItems,
      subtotal,
      gstTotal,
      grandTotal,
      status: 'Sent',
      paymentStatus: 'Unpaid'
    });

    res.status(201).json(po);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Receive Stock from Purchase Order (Increments product stock)
// @route PUT /api/purchases/:id/receive
exports.receivePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ message: 'Purchase order not found' });

    for (const item of po.items) {
      if (item.product) {
        const product = await Product.findById(item.product);
        if (product) {
          const previousStock = product.stock;
          product.stock += item.orderedQty;
          await product.save();

          await InventoryTransaction.create({
            product: product._id,
            productName: product.name,
            sku: product.sku,
            type: 'Supplier Purchase',
            quantity: item.orderedQty,
            previousStock,
            newStock: product.stock,
            reason: `Stock received via PO: ${po.poNumber}`
          });
        }
      }
      item.receivedQty = item.orderedQty;
    }

    po.status = 'Received';
    po.receivedDate = new Date();
    await po.save();

    res.json({ message: 'Stock received and inventory updated', po });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
