const Product = require('../models/Product');
const Order = require('../models/Order');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc Process POS Sale (Instant Billing & Shared Inventory Deduction)
// @route POST /api/pos/checkout
exports.createPosSale = async (req, res) => {
  try {
    const { items, customer, payment, notes, cashierName } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'POS Sale must contain at least one item' });
    }

    let subtotal = 0;
    let discountTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    const processedItems = [];

    // Verify stock and calculate exact totals
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Requested: ${item.quantity}, Available: ${product.stock}`
        });
      }

      const unitPrice = product.sellingPrice;
      const mrp = product.mrp;
      const itemSubtotal = unitPrice * item.quantity;
      const itemDiscount = (mrp - unitPrice) * item.quantity;
      const gstRate = product.gstRate || 5;

      // GST Breakdown (Price inclusive of GST calculation: Tax = (Price * GST%) / (100 + GST%))
      const taxAmount = (itemSubtotal * gstRate) / (100 + gstRate);
      const halfTax = taxAmount / 2;

      subtotal += itemSubtotal;
      discountTotal += Math.max(0, itemDiscount);
      cgstTotal += halfTax;
      sgstTotal += halfTax;

      processedItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        barcode: product.barcode,
        unitPrice,
        mrp,
        quantity: item.quantity,
        discount: Math.max(0, itemDiscount),
        gstRate,
        total: itemSubtotal
      });

      // Instantly deduct from central shared inventory
      const previousStock = product.stock;
      product.stock -= item.quantity;
      await product.save();

      // Log central inventory transaction
      await InventoryTransaction.create({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        type: 'POS Sale',
        quantity: -item.quantity,
        previousStock,
        newStock: product.stock,
        reason: `POS Bill counter sale by ${cashierName || 'Cashier'}`
      });
    }

    const grandTotal = Math.round(subtotal);
    const orderNumber = `POS-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const posOrder = await Order.create({
      orderNumber,
      orderType: 'POS',
      customer: {
        name: customer?.name || 'Walk-in Customer',
        phone: customer?.phone || '9999999999',
        email: customer?.email || ''
      },
      items: processedItems,
      subtotal: Math.round(subtotal - (cgstTotal + sgstTotal)),
      discountTotal: Math.round(discountTotal),
      cgst: Number(cgstTotal.toFixed(2)),
      sgst: Number(sgstTotal.toFixed(2)),
      igst: 0,
      gstTotal: Number((cgstTotal + sgstTotal).toFixed(2)),
      deliveryFee: 0,
      grandTotal,
      payment: {
        method: payment.method || 'Cash',
        status: 'Paid',
        transactionId: payment.transactionId || `POS-PAY-${Date.now()}`,
        amountPaid: payment.amountPaid || grandTotal,
        changeGiven: payment.changeGiven || 0
      },
      orderStatus: 'Delivered', // Immediate hand over at physical counter
      cashierName: cashierName || 'Sivaji (Owner)',
      posTerminalId: 'POS-COUNTER-1',
      notes: notes || 'Counter Sale'
    });

    res.status(201).json({
      message: 'POS Sale processed successfully',
      order: posOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get POS Day Closing Summary
// @route GET /api/pos/day-summary
exports.getPosDaySummary = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const posOrders = await Order.find({
      orderType: 'POS',
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    let totalSales = 0;
    let cashSales = 0;
    let upiSales = 0;
    let cardSales = 0;
    let itemCount = 0;

    posOrders.forEach(ord => {
      totalSales += ord.grandTotal;
      if (ord.payment.method === 'Cash') cashSales += ord.grandTotal;
      if (ord.payment.method === 'UPI') upiSales += ord.grandTotal;
      if (ord.payment.method === 'Card') cardSales += ord.grandTotal;
      ord.items.forEach(i => itemCount += i.quantity);
    });

    res.json({
      date: new Date().toLocaleDateString('en-IN'),
      totalBills: posOrders.length,
      totalItemsSold: itemCount,
      totalSales,
      cashSales,
      upiSales,
      cardSales,
      orders: posOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
