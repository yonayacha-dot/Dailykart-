const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// IMPORTANT - Public folder serve
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log('MongoDB Connected'))
  .catch(err=>console.log(err));

// Routes
const Product = require('./models/Product');
const Order = require('./models/Order');
const Config = require('./models/Config');

app.get('/api/config', async (req,res)=>{
  let cfg = await Config.findOne();
  if(!cfg) cfg = await Config.create({appName:'DailyKart- LocalDelivery', minOrder:200, extraCharge:30, deliveryCharge:0});
  res.json(cfg);
});

app.post('/api/config', async (req,res)=>{
  let cfg = await Config.findOne();
  if(!cfg) cfg = new Config(req.body);
  else Object.assign(cfg, req.body);
  await cfg.save();
  res.json(cfg);
});

app.get('/api/products', async (req,res)=>{
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', async (req,res)=>{
  const p = await Product.create(req.body);
  res.json(p);
});

app.delete('/api/products/:id', async (req,res)=>{
  await Product.findByIdAndDelete(req.params.id);
  res.json({ok:true});
});

app.get('/api/orders', async (req,res)=>{
  const orders = await Order.find().sort({createdAt:-1});
  res.json(orders);
});

app.post('/api/orders', async (req,res)=>{
  const order = await Order.create(req.body);
  res.json(order);
});

// For Admin & Index
app.get('/admin.html', (req,res)=>{
  res.sendFile(path.join(__dirname,'public','admin.html'));
});

app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname,'public','index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>console.log('Running on '+PORT));
