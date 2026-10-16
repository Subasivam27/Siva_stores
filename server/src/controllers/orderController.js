const Order = require('../models/Order');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc Create online customer order
// @route POST /api/orders
exports.createOnlineOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, couponCode, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items specified' });
    }

    let subtotal = 0;
    let discountTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    const processedItems = [];

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

      // Deduct stock from central inventory
      const previousStock = product.stock;
      product.stock -= item.quantity;
      await product.save();

      await InventoryTransaction.create({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        type: 'Online Sale',
        quantity: -item.quantity,
        previousStock,
        newStock: product.stock,
        reason: 'Online Store Customer Order'
      });
    }

    const deliveryFee = subtotal >= 500 ? 0 : 30;
    const couponDiscount = couponCode === 'WELCOME10' ? Math.round(subtotal * 0.1) : 0;
    const grandTotal = Math.round(subtotal + deliveryFee - couponDiscount);

    const orderNumber = `ZYP-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await Order.create({
      orderNumber,
      orderType: 'Online',
      customer: {
        userId: req.user ? req.user._id : null,
        name: req.body.customerName || (req.user ? req.user.name : 'Valued Customer'),
        phone: req.body.customerPhone || (req.user ? req.user.phone : '9786414501'),
        email: req.body.customerEmail || (req.user ? req.user.email : '')
      },
      items: processedItems,
      subtotal: Math.round(subtotal - (cgstTotal + sgstTotal)),
      discountTotal: Math.round(discountTotal),
      cgst: Number(cgstTotal.toFixed(2)),
      sgst: Number(sgstTotal.toFixed(2)),
      igst: 0,
      gstTotal: Number((cgstTotal + sgstTotal).toFixed(2)),
      deliveryFee,
      couponDiscount,
      couponCode: couponCode || '',
      grandTotal,
      payment: {
        method: paymentMethod || 'COD',
        status: paymentMethod === 'COD' ? 'Pending' : 'Paid',
        transactionId: `ONLINE-PAY-${Date.now()}`,
        amountPaid: grandTotal
      },
      orderStatus: 'Confirmed',
      deliveryAddress: deliveryAddress || {
        houseFlat: 'No. 14, Main Road',
        street: 'Near Bus Stand',
        areaVillage: 'Somanahalli',
        city: 'Palacode, Dharmapuri',
        state: 'Tamil Nadu',
        pincode: '636808'
      },
      notes: notes || ''
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get customer order history
// @route GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all orders
// @route GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    let query = {};

    if (status && status !== 'All') query.orderStatus = status;
    if (type) query.orderType = type;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get order details
// @route GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderNumber: req.params.id }]
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update order status
// @route PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryStaffName, deliveryStaffPhone } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status) order.orderStatus = status;
    if (deliveryStaffName) {
      order.deliveryStaff = {
        name: deliveryStaffName,
        phone: deliveryStaffPhone || '9876543210'
      };
    }

    if (status === 'Delivered' && order.payment.method === 'COD') {
      order.payment.status = 'Paid';
    }

    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Cancel Order (Restores product stock back to central inventory)
// @route PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
      return res.status(400).json({ message: `Cannot cancel order with status: ${order.orderStatus}` });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    // Restore product stock back to central inventory
    for (const item of order.items) {
      if (item.product) {
        const product = await Product.findById(item.product);
        if (product) {
          const previousStock = product.stock;
          product.stock += item.quantity;
          await product.save();

          await InventoryTransaction.create({
            product: product._id,
            productName: product.name,
            sku: product.sku,
            type: 'Customer Return',
            quantity: item.quantity,
            previousStock,
            newStock: product.stock,
            reason: `Order Cancellation #${order.orderNumber}`
          });
        }
      }
    }

    res.json({ message: 'Order cancelled successfully and stock restored to inventory', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete Order (Restores stock if active & removes order)
// @route DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // If order was not delivered or already cancelled, restore stock before deletion
    if (!['Delivered', 'Cancelled'].includes(order.orderStatus)) {
      for (const item of order.items) {
        if (item.product) {
          const product = await Product.findById(item.product);
          if (product) {
            const previousStock = product.stock;
            product.stock += item.quantity;
            await product.save();

            await InventoryTransaction.create({
              product: product._id,
              productName: product.name,
              sku: product.sku,
              type: 'Customer Return',
              quantity: item.quantity,
              previousStock,
              newStock: product.stock,
              reason: `Order Deletion & Cancellation #${order.orderNumber}`
            });
          }
        }
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted and stock updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
