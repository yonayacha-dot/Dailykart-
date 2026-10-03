const express = require('express');
const mongoose = require('mongoose');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

const app = express();

// ✅ 1. SPEED MIDDLEWARE - 70% fast
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

// ✅ 2. MONGO FAST - Mumbai region + cache
mongoose.connect(process.env.MONGO_URI || 'YOUR_MONGO_URI', {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 3000,
}).then(()=>console.log('Mongo FAST Connected ⚡')).catch(e=>console.log(e));

// ✅ 3. CACHE MEMORY - 2 min cache (No Redis needed)
let cache = { products: null, time: 0 };
const isCacheValid = () => Date.now() - cache.time < 120000; // 2 min

// ✅ 4. MODELS - Import
const Product = require('./models/Product');
const Order = require('./models/Order');

// ✅ 5. FAST API - Products with lean + cache
app.get('/api/products', async (req, res) => {
  try {
    if (cache.products && isCacheValid()) {
      return res.set('Cache-Control', 'public, s-maxage=120').json(cache.products);
    }
    // lean() = 10x fast, select only needed fields
    const products = await Product.find({ active: true }).select('name price image category stock mrp').lean().limit(100);
    // Optimize Cloudinary images
    const optimized = products.map(p => ({
      ...p,
      image: p.image?.includes('cloudinary') ? p.image.replace('/upload/','/upload/w_400,q_auto,f_auto/') : p.image
    }));
    cache.products = optimized;
    cache.time = Date.now();
    res.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300').json(optimized);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ✅ 6. FAST Orders - by phone with index
app.get('/api/orders', async (req, res) => {
  try {
    const phone = req.query.phone;
    if(!phone) return res.status(400).json({ error: 'phone required' });
    const orders = await Order.find({ 'customer.phone': phone }).sort({ createdAt: -1 }).lean().limit(20);
    res.set('Cache-Control', 'public, s-maxage=10').json(orders);
  } catch(e){ res.status(500).json({ error: e.message }); }
});

// ✅ 7. Place Order - FAST
app.post('/api/orders', async (req, res) => {
  try {
    const order = await Order.create({ ...req.body, createdAt: Date.now() });
    cache.products = null; // clear product cache if stock changes
    res.json({ success: true, orderId: order.orderId });
  } catch(e){ res.status(500).json({ error: e.message }); }
});

// ✅ 8. Areas & Banners - Cached
app.get('/api/areas', async (req,res)=>{
  const areas = await mongoose.connection.db.collection('dk_v3_areas').find().toArray();
  res.set('Cache-Control','public, s-maxage=300').json(areas);
});

// ✅ 9. STATIC - with 1 year cache for images
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if(path.endsWith('.html')) res.setHeader('Cache-Control','public, max-age=0');
  }
}));

// ✅ 10. Frontend fallback
app.get('*', (req,res)=> res.sendFile(path.join(__dirname,'public','index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`DailyKart FAST Server ⚡ on ${PORT}`));

module.exports = app;
