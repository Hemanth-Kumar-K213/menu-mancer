const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Regular Product Route
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, region, shop } = req.body;

    if (!name || !price || !region || !shop) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const product = new Product({
      name,
      price,
      region,
      shop,
      expiresAt: null
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Limited-Time Product Route
app.post('/api/products/limited', async (req, res) => {
  try {
    const { name, price, shop, expiresAt, region } = req.body;

    if (!name || !price || !shop || !expiresAt) {
      return res.status(400).json({ error: 'All fields (name, price, shop, expiresAt) are required.' });
    }

    const expiryDate = new Date(expiresAt);
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      return res.status(400).json({ error: 'Expiration date must be a valid future date.' });
    }

    const product = new Product({
      name,
      price,
      shop,
      region: region || 'Unknown',
      expiresAt: expiryDate
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search Products Route (excludes expired)
app.get('/api/products', async (req, res) => {
  try {
    const query = req.query.q || '';
    const location = req.query.location || '';
    const shop = req.query.shop || '';

    const filter = {
      name: { $regex: query, $options: 'i' },
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    if (location) {
      filter.region = location;
    }

    if (shop) {
      filter.shop = shop;
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Product Route
app.put('/api/products/update', async (req, res) => {
  try {
    const { name, price, shop } = req.body;

    if (!name || !shop) {
      return res.status(400).json({ error: "Product name and shop are required." });
    }

    const product = await Product.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      shop: { $regex: new RegExp(`^${shop}$`, 'i') }
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    if (price !== undefined) {
      product.price = price;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cleanup expired products every 10 minutes
const deleteExpiredProducts = async () => {
  try {
    const result = await Product.deleteMany({ expiresAt: { $lte: new Date() } });
    if (result.deletedCount > 0) {
      console.log(`🧹 Deleted ${result.deletedCount} expired product(s)`);
    }
  } catch (err) {
    console.error('❌ Error deleting expired products:', err.message);
  }
};

// Run cleanup every 10 minutes (600,000 ms)
setInterval(deleteExpiredProducts, 10 * 60 * 1000);

// Also run it once on server start
deleteExpiredProducts();

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
