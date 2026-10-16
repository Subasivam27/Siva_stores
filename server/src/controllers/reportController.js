const Order = require('../models/Order');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc Get Executive Business Dashboard Overview
// @route GET /api/reports/dashboard
exports.getDashboardMetrics = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayOrders = await Order.find({ createdAt: { $gte: startOfDay } });
    const allOrders = await Order.find();

    let todayRevenue = 0;
    let todayOnlineSales = 0;
    let todayPosSales = 0;
    let todayOnlineCount = 0;
    let todayPosCount = 0;

    todayOrders.forEach(ord => {
      todayRevenue += ord.grandTotal;
      if (ord.orderType === 'Online') {
        todayOnlineSales += ord.grandTotal;
        todayOnlineCount++;
      } else {
        todayPosSales += ord.grandTotal;
        todayPosCount++;
      }
    });

    const pendingOrdersCount = await Order.countDocuments({
      orderStatus: { $in: ['Pending', 'Confirmed', 'Processing', 'Picking', 'Packed'] }
    });

    // Count low stock products
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$minimumStock'] }
    });

    const outOfStockCount = await Product.countDocuments({ stock: 0 });
    const totalProductsCount = await Product.countDocuments({ status: { $ne: 'Discontinued' } });

    // Outstanding supplier payment summary
    const suppliers = await Supplier.find();
    let totalSupplierOutstanding = 0;
    suppliers.forEach(s => totalSupplierOutstanding += s.outstandingAmount);

    res.json({
      todayRevenue,
      todayOrdersCount: todayOrders.length,
      todayOnlineSales,
      todayPosSales,
      todayOnlineCount,
      todayPosCount,
      totalOrdersCount: allOrders.length,
      pendingOrdersCount,
      totalProductsCount,
      lowStockCount,
      outOfStockCount,
      totalSupplierOutstanding
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get GST Billing Report
// @route GET /api/reports/gst
exports.getGstReport = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    let totalTaxableValue = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalGstCollected = 0;
    let totalGrossSales = 0;

    const reportRows = orders.map(ord => {
      totalTaxableValue += ord.subtotal;
      totalCgst += ord.cgst;
      totalSgst += ord.sgst;
      totalGstCollected += ord.gstTotal;
      totalGrossSales += ord.grandTotal;

      return {
        invoiceNumber: ord.orderNumber,
        date: ord.createdAt.toLocaleDateString('en-IN'),
        orderType: ord.orderType,
        customerName: ord.customer.name,
        gstin: 'URP (Unregistered)',
        taxableValue: ord.subtotal,
        cgst: ord.cgst,
        sgst: ord.sgst,
        gstTotal: ord.gstTotal,
        grandTotal: ord.grandTotal
      };
    });

    res.json({
      summary: {
        totalTaxableValue: Math.round(totalTaxableValue),
        totalCgst: Math.round(totalCgst),
        totalSgst: Math.round(totalSgst),
        totalGstCollected: Math.round(totalGstCollected),
        totalGrossSales: Math.round(totalGrossSales)
      },
      invoices: reportRows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
