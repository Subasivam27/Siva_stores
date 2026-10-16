const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');
const StoreSettings = require('../models/StoreSettings');
const InventoryTransaction = require('../models/InventoryTransaction');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing old collections...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Supplier.deleteMany({});
    await Order.deleteMany({});
    await StoreSettings.deleteMany({});
    await InventoryTransaction.deleteMany({});

    console.log('[Seeder] Seeding Store Settings...');
    await StoreSettings.create({
      platformName: 'ZYPHOR ZONE',
      storeName: 'Siva Department Store',
      ownerName: 'Sivaji',
      location: 'Somanahalli, Palacode, Dharmapuri, Tamil Nadu',
      pincode: '636808',
      phone: '9786414501',
      email: 'contact@sivastore.zyphor.zone',
      gstin: '33AAAFS1234F1Z9',
      currency: '₹',
      timezone: 'Asia/Kolkata',
      openingTime: '09:00 AM',
      closingTime: '10:00 PM',
      deliveryEnabled: true,
      defaultDeliveryFee: 30,
      freeDeliveryMinOrder: 500
    });

    console.log('[Seeder] Seeding Demo Users...');
    const adminUser = await User.create({
      name: 'Sivaji (Owner)',
      email: 'admin123@gmail.com',
      phone: '9786414501',
      password: 'admin@123',
      role: 'Owner'
    });

    await User.create({
      name: 'Mani (POS Cashier)',
      email: 'cashier@sivastore.com',
      phone: '9786414502',
      password: 'cashier123',
      role: 'Cashier'
    });

    await User.create({
      name: 'Karthik (Delivery Partner)',
      email: 'delivery@sivastore.com',
      phone: '9786414503',
      password: 'delivery123',
      role: 'Delivery Staff'
    });

    const customerUser = await User.create({
      name: 'Ramesh Kumar',
      email: 'customer@sivastore.com',
      phone: '9786414504',
      password: 'customer123',
      role: 'Customer',
      addresses: [{
        id: 'ADDR-1',
        name: 'Ramesh Kumar',
        phone: '9786414504',
        houseFlat: 'No. 14, Main Road',
        street: 'Near Bus Stand',
        areaVillage: 'Somanahalli',
        city: 'Palacode, Dharmapuri',
        state: 'Tamil Nadu',
        pincode: '636808',
        addressType: 'Home',
        isDefault: true
      }]
    });

    console.log('[Seeder] Seeding Categories...');
    const categoriesData = [
      { name: 'Grocery', slug: 'grocery', icon: 'ShoppingBag', subcategories: ['Rice', 'Wheat', 'Atta', 'Oil', 'Ghee', 'Spices'] },
      { name: 'Food', slug: 'food', icon: 'Package', subcategories: ['Biscuits', 'Snacks', 'Chocolates', 'Instant Foods'] },
      { name: 'Beverages', slug: 'beverages', icon: 'Coffee', subcategories: ['Water', 'Juice', 'Tea', 'Coffee', 'Soft Drinks'] },
      { name: 'Fresh', slug: 'fresh', icon: 'Apple', subcategories: ['Fruits', 'Vegetables', 'Dairy', 'Eggs'] },
      { name: 'Personal Care', slug: 'personal-care', icon: 'Heart', subcategories: ['Soap', 'Shampoo', 'Toothpaste', 'Skincare'] },
      { name: 'Home Care', slug: 'home-care', icon: 'Home', subcategories: ['Detergent', 'Dishwash', 'Cleaner'] },
      { name: 'Kitchen', slug: 'kitchen', icon: 'Utensils', subcategories: ['Containers', 'Bottles', 'Utensils'] },
      { name: 'Baby Care', slug: 'baby-care', icon: 'Smile', subcategories: ['Diapers', 'Baby Food'] },
      { name: 'Stationery', slug: 'stationery', icon: 'BookOpen', subcategories: ['Notebooks', 'Pens', 'School Supplies'] },
      { name: 'Electronics', slug: 'electronics', icon: 'Tv', subcategories: ['Accessories', 'Batteries'] }
    ];
    await Category.insertMany(categoriesData);

    console.log('[Seeder] Seeding Products...');
    const productsData = [
      {
        name: 'Ponni Boiled Rice 5kg',
        sku: 'GRO-RICE-5K',
        barcode: '890100100001',
        category: 'Grocery',
        subcategory: 'Rice',
        brand: 'Siva Special',
        description: 'Premium quality aged South Indian Ponni boiled rice.',
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80'],
        mrp: 350,
        sellingPrice: 310,
        gstRate: 5,
        hsnCode: '1006',
        stock: 85,
        minimumStock: 15,
        unit: 5,
        unitType: 'kg',
        batchNumber: 'BT-RICE-2026',
        isBestSeller: true,
        isFeatured: true
      },
      {
        name: 'Gold Winner Sunflower Oil 1L',
        sku: 'GRO-OIL-1L',
        barcode: '890100100002',
        category: 'Grocery',
        subcategory: 'Oil',
        brand: 'Gold Winner',
        description: 'Refined sunflower oil for healthy cooking.',
        images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80'],
        mrp: 160,
        sellingPrice: 145,
        gstRate: 5,
        hsnCode: '1512',
        stock: 60,
        minimumStock: 10,
        unit: 1,
        unitType: 'L',
        batchNumber: 'BT-OIL-2026',
        isBestSeller: true
      },
      {
        name: 'Aashirvaad Whole Wheat Atta 5kg',
        sku: 'GRO-ATTA-5K',
        barcode: '890100100003',
        category: 'Grocery',
        subcategory: 'Atta',
        brand: 'Aashirvaad',
        description: '100% pure whole wheat flour for soft rotis.',
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80'],
        mrp: 290,
        sellingPrice: 265,
        gstRate: 5,
        hsnCode: '1101',
        stock: 40,
        minimumStock: 10,
        unit: 5,
        unitType: 'kg',
        isFeatured: true
      },
      {
        name: 'Tata Salt Iodized 1kg',
        sku: 'GRO-SALT-1K',
        barcode: '890100100004',
        category: 'Grocery',
        subcategory: 'Spices',
        brand: 'Tata',
        description: 'Vacuum evaporated iodized salt for everyday health.',
        images: ['https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=500&q=80'],
        mrp: 28,
        sellingPrice: 25,
        gstRate: 0,
        hsnCode: '2501',
        stock: 120,
        minimumStock: 20,
        unit: 1,
        unitType: 'kg'
      },
      {
        name: 'Aachi Red Chilli Powder 200g',
        sku: 'GRO-SPICE-200G',
        barcode: '890100100005',
        category: 'Grocery',
        subcategory: 'Spices',
        brand: 'Aachi',
        description: 'Pungent and vibrant red chilli powder.',
        images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80'],
        mrp: 65,
        sellingPrice: 58,
        gstRate: 5,
        hsnCode: '0904',
        stock: 50,
        minimumStock: 10,
        unit: 200,
        unitType: 'g'
      },
      {
        name: 'Britannia Good Day Choco Chips 120g',
        sku: 'FOOD-BIS-120G',
        barcode: '890100200001',
        category: 'Food',
        subcategory: 'Biscuits',
        brand: 'Britannia',
        description: 'Crunchy cookies loaded with real chocolate chips.',
        images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=500&q=80'],
        mrp: 40,
        sellingPrice: 35,
        gstRate: 18,
        hsnCode: '1905',
        stock: 90,
        minimumStock: 15,
        unit: 120,
        unitType: 'g',
        isBestSeller: true
      },
      {
        name: 'Mysore Sandal Soap 125g',
        sku: 'PC-SOAP-125G',
        barcode: '890100300001',
        category: 'Personal Care',
        subcategory: 'Soap',
        brand: 'Mysore Sandal',
        description: 'Pure sandalwood oil bath soap.',
        images: ['https://images.unsplash.com/photo-1607006482172-184594c92984?auto=format&fit=crop&w=500&q=80'],
        mrp: 85,
        sellingPrice: 78,
        gstRate: 18,
        hsnCode: '3401',
        stock: 70,
        minimumStock: 12,
        unit: 125,
        unitType: 'g'
      },
      {
        name: 'Surf Excel Easy Wash 1kg',
        sku: 'HC-DET-1KG',
        barcode: '890100400001',
        category: 'Home Care',
        subcategory: 'Detergent',
        brand: 'Surf Excel',
        description: 'Superior stain removal powder detergent.',
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80'],
        mrp: 145,
        sellingPrice: 130,
        gstRate: 18,
        hsnCode: '3402',
        stock: 45,
        minimumStock: 10,
        unit: 1,
        unitType: 'kg'
      },
      {
        name: 'Fresh Shimla Apples 1kg',
        sku: 'FRESH-APP-1KG',
        barcode: '890100700001',
        category: 'Fresh',
        subcategory: 'Fruits',
        brand: 'Farm Fresh',
        description: 'Sweet and crispy farm fresh Shimla red apples.',
        images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80'],
        mrp: 180,
        sellingPrice: 155,
        gstRate: 0,
        hsnCode: '0808',
        stock: 25,
        minimumStock: 5,
        unit: 1,
        unitType: 'kg',
        isFeatured: true
      },
      {
        name: 'Bru Instant Coffee 100g',
        sku: 'BEV-COFF-100G',
        barcode: '890100800001',
        category: 'Beverages',
        subcategory: 'Coffee',
        brand: 'Bru',
        description: 'Rich chicory blend authentic South Indian instant coffee.',
        images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=500&q=80'],
        mrp: 210,
        sellingPrice: 190,
        gstRate: 18,
        hsnCode: '2101',
        stock: 55,
        minimumStock: 10,
        unit: 100,
        unitType: 'g'
      }
    ];

    const createdProducts = await Product.insertMany(productsData);

    console.log('[Seeder] Seeding Suppliers...');
    await Supplier.create({
      supplierCode: 'SUP-001',
      name: 'Lakshmi Agro Trading Co.',
      company: 'Lakshmi Agro Supplies',
      phone: '9842100011',
      email: 'lakshmi@agro.com',
      gstin: '33AAAAA1111A1Z1',
      address: 'Market Yard, Palacode, Dharmapuri',
      categoriesSupplied: ['Grocery', 'Fresh'],
      outstandingAmount: 15000
    });

    await Supplier.create({
      supplierCode: 'SUP-002',
      name: 'Salem Goods Agency',
      company: 'Salem Goods Distributors',
      phone: '9842100022',
      email: 'orders@salemgoods.com',
      gstin: '33BBBBB2222B1Z2',
      address: 'Bazaar Street, Salem, Tamil Nadu',
      categoriesSupplied: ['Food', 'Personal Care', 'Home Care'],
      outstandingAmount: 24000
    });

    console.log('[Seeder] Seeding Initial POS & Online Sales Orders...');
    const riceProd = createdProducts.find(p => p.sku === 'GRO-RICE-5K');
    const oilProd = createdProducts.find(p => p.sku === 'GRO-OIL-1L');
    const biscuitProd = createdProducts.find(p => p.sku === 'FOOD-BIS-120G');

    // POS Sample Sale
    await Order.create({
      orderNumber: 'POS-782910-1049',
      orderType: 'POS',
      customer: { name: 'Walk-in Customer', phone: '9999999999' },
      items: [
        {
          product: riceProd._id,
          productName: riceProd.name,
          sku: riceProd.sku,
          barcode: riceProd.barcode,
          unitPrice: 310,
          mrp: 350,
          quantity: 2,
          discount: 80,
          gstRate: 5,
          total: 620
        },
        {
          product: biscuitProd._id,
          productName: biscuitProd.name,
          sku: biscuitProd.sku,
          barcode: biscuitProd.barcode,
          unitPrice: 35,
          mrp: 40,
          quantity: 3,
          discount: 15,
          gstRate: 18,
          total: 105
        }
      ],
      subtotal: 690,
      discountTotal: 95,
      cgst: 17.5,
      sgst: 17.5,
      gstTotal: 35,
      deliveryFee: 0,
      grandTotal: 725,
      payment: {
        method: 'Cash',
        status: 'Paid',
        transactionId: 'POS-CASH-1001',
        amountPaid: 800,
        changeGiven: 75
      },
      orderStatus: 'Delivered',
      cashierName: 'Mani (Cashier)'
    });

    // Online Sample Order
    await Order.create({
      orderNumber: 'ZYP-992182-4412',
      orderType: 'Online',
      customer: {
        userId: customerUser._id,
        name: 'Ramesh Kumar',
        phone: '9786414504',
        email: 'customer@sivastore.com'
      },
      items: [
        {
          product: oilProd._id,
          productName: oilProd.name,
          sku: oilProd.sku,
          barcode: oilProd.barcode,
          unitPrice: 145,
          mrp: 160,
          quantity: 2,
          discount: 30,
          gstRate: 5,
          total: 290
        }
      ],
      subtotal: 276,
      discountTotal: 30,
      cgst: 7,
      sgst: 7,
      gstTotal: 14,
      deliveryFee: 30,
      grandTotal: 320,
      payment: {
        method: 'COD',
        status: 'Pending',
        transactionId: 'COD-ZYP-1002',
        amountPaid: 320
      },
      orderStatus: 'Out for Delivery',
      deliveryAddress: {
        houseFlat: 'No. 14, Main Road',
        street: 'Near Bus Stand',
        areaVillage: 'Somanahalli',
        city: 'Palacode, Dharmapuri',
        state: 'Tamil Nadu',
        pincode: '636808'
      },
      deliveryStaff: {
        name: 'Karthik (Delivery Partner)',
        phone: '9786414503'
      }
    });

    console.log('✅ [Seeder] Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error(`❌ [Seeder Error] ${err.message}`);
    process.exit(1);
  }
};

seedData();
