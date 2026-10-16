const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to Database
connectDB().then(async () => {
  // Auto-seed if database has no products
  const Product = require('./models/Product');
  const count = await Product.countDocuments();
  if (count === 0) {
    console.log('[Server] Database is empty! Auto-triggering database seeder...');
    const seedProcess = require('child_process').fork(path.join(__dirname, 'seeders', 'seed.js'));
    seedProcess.on('exit', (code) => {
      console.log(`[Server] Auto-seeder finished with code ${code}`);
    });
  }
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/pos', require('./routes/posRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'ZYPHOR ZONE — Siva Department Store API',
    store: 'Somanahalli, Palacode, Dharmapuri, Tamil Nadu',
    time: new Date().toISOString()
  });
});

// Serve frontend build if exists
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API Route Not Found' });
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      res.send('ZYPHOR ZONE — Siva Department Store Server Active');
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 [ZYPHOR ZONE] Siva Department Store Server running on port ${PORT}`);
});
