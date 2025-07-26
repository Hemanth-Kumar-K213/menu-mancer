const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },         // Product name
  price: { type: Number, required: true },        // Product price
  expiresAt: { type: Date, default: null },       // Expiry date (null = not limited-time)
  region: { type: String, required: true },       // Region where the product is available
  shop: { type: String, required: true }          // Shop name
});

module.exports = mongoose.model('Product', productSchema);
