require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

const app = express();

// ✅ SPEED: Gzip 70% compress
app.use(compression({ level: 6 }));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ MONGO - Fast Mumbai Atlas
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://dailykart:DailyKart123@cluster0.mongodb.net/dailykart?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI, {
  maxPoolSize: 20,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 3000,
}).then(()=>console.log('✅ Mongo FAST Connected ⚡ - Mumbai')).catch(e=>console.error('Mongo Error:', e.message));

// ✅ MEMORY CACHE - No Redis needed, 2 min cache
let cache = {
  products: { data: null, time: 0 },
  areas: { data: null, time: 0 },
  banners: { data: null, time: 0 }
};
const isValid = (key, mins) => Date.now() - cache[key].time < mins*60*1000;

// Models
const Product = require('./models/Product');
const Order = require('./models/Order');
const Area = require('./models/Area');
const Banner = require('./models/Banner');

// ✅ API 1: Products - FASTEST with lean() + cache
app.get('/api/products', async (req, res) => {
  try {
    if (isValid('products', 2) && cache.products.data) {
      return res.set('Cache-Control','public, s-maxage=120, stale-while-revalidate=300').json(cache.products.data);
    }
    const products = await Product.find({ active: true }).select('name price mrp image category stock active').lean().limit(100).sort({ createdAt: -1 });
    const optimized = products.map(p => ({
     ...p,
      image: p.image?.includes('cloudinary')? p.image.replace('/upload/','/upload/w_400,q_auto,f_auto/') : p.image
    }));
    cache.products = { data: optimized, time: Date.now() };
    res.set('Cache-Control','public, s-maxage=120, stale-while-revalidate=300').json(optimized);
  } catch(e){ res.status(500).json({ error: e.message }); }
});

// ✅ API 2: Areas
app.get('/api/areas', async (req,res)=>{
  try{
    if(isValid('areas', 10) && cache.areas.data) return res.set('Cache-Control','public, s-maxage=600').json(cache.areas.data);
    const areas = await Area.find({ active: true }).lean();
    cache.areas = { data: areas, time: Date.now() };
    res.set('Cache-Control','public, s-maxage=600').json(areas);
  }catch(e){ res.status(500).json([]); }
});

// ✅ API 3: Banners
app.get('/api/banners', async (req,res)=>{
  try{
    if(isValid('banners', 5) && cache.banners.data) return res.set('Cache-Control','public, s-maxage=300').json(cache.banners.data);
    const banners = await Banner.find({ active: true }).lean();
    cache.banners = { data: banners, time: Date.now() };
    res.set('Cache-Control','public, s-maxage=300').json(banners);
  }catch(e){ res.status(500).json([]); }
});

// ✅ API 4: Orders GET - by phone - FAST with index
app.get('/api/orders', async (req,res)=>{
  try{
    const phone = req.query.phone;
    if(!phone) return res.status(400).json({ error: 'phone required?phone=+91...' });
    const orders = await Order.find({ 'customer.phone': phone }).sort({ createdAt: -1 }).lean().limit(30);
    res.set('Cache-Control','public, s-maxage=10').json(orders);
  }catch(e){ res.status(500).json({ error: e.message }); }
});

// ✅ API 5: Place Order - POST
app.post('/api/orders', async (req,res)=>{
  try{
    const body = req.body;
    const orderId = 'DK' + Date.now().toString().slice(-6);
    const orderData = {...body, orderId, createdAt: Date.now(), status: body.status || 'NEW' };
    const order = await Order.create(orderData);
    // Update stock fast
    if(body.items){
      for(const item of body.items){
        await Product.updateOne({ _id: item.id }, { $inc: { stock: -item.qty } });
      }
    }
    cache.products.data = null; // clear cache
    res.json({ success: true, orderId, order });
  }catch(e){ res.status(500).json({ error: e.message }); }
});

// ✅ API 6: Settings + WA Admins (for frontend)
app.get('/api/settings', async (req,res)=>{
  try{
    const settings = await mongoose.connection.db.collection('dk_v3_settings').findOne({});
    const waAdmins = await mongoose.connection.db.collection('dk_wa_admins').find().toArray();
    res.set('Cache-Control','public, s-maxage=60').json({...settings, waAdmins });
  }catch(e){ res.json({ storeName: 'DailyKart', whatsapp: '918761958928', freeDeliveryMin: 299 }); }
});

// ✅ Static - 1 year cache for assets, no cache for html
app.use(express.static(path.join(__dirname,'public'),{
  maxAge: '1y',
  etag: true,
  setHeaders: (res, filePath) => {
    if(filePath.endsWith('.html')) res.setHeader('Cache-Control','public, max-age=0, must-revalidate');
  }
}));

app.get('*', (req,res)=> res.sendFile(path.join(__dirname,'public','index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`🚀 DailyKart FAST server running on ${PORT} ⚡`));
module.exports = app;
