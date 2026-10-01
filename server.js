import dotenv from 'dotenv'; dotenv.config();
import express from 'express'; import cors from 'cors'; import mongoose from 'mongoose'; import jwt from 'jsonwebtoken'; import bcrypt from 'bcryptjs';
const app = express(); app.use(cors()); app.use(express.json());

mongoose.connect(process.env.MONGO_URL).then(()=>console.log("✅ DB Connected"));

// ===== MASTER DATA =====
const AREAS = ["Dirak Charali","Aamguri","Bordirak","Khatua","Hunjan","Navajyoti","Simoluguri","Uttar Bisrampur","Dakhin Bisrampur","Kailashpur","Dimbujora","Tongona","Gutibari","Tongona-Nagaon","Dirakgate","Modarkhat","Digholi-pothar","Huwonipothar","Namhullung","Tiniali Nagaon","Betoni","Wathoi","Litong","Talpothar","Hatigarh","Dumsi","Sitpani"];
const CATEGORIES = ["Fast Food","Grocery","Vegetable","Cosmetics","Hardware","Fish/Meat","Work/Workers"];

// ===== SCHEMAS =====
const userSchema = new mongoose.Schema({
  name: String, phone: {type:String, unique:true, required:true}, role: {type:String, enum:["customer","delivery","staff","manager","admin"], default:"customer"}, address: String, isBlocked: {type:Boolean, default:false}
},{timestamps:true});

const productSchema = new mongoose.Schema({
  name: String, price: Number, offerPrice: Number, category: {type:String, enum:CATEGORIES}, stock: {type:Boolean, default:true}, images: [String], description: String, rating: {type:Number, default:0}
},{timestamps:true});

const bannerSchema = new mongoose.Schema({ title: String, image: String, type: {type:String, enum:["main","offer","discount"]}, link: String, isActive: Boolean},{timestamps:true});

const settingSchema = new mongoose.Schema({
  logo: String, minOrderAmount: {type:Number, default:100}, deliveryCharges: {type:Map, of:Number}, contactPhone: String, helpText: String, notificationNumbers: [String] // Fastfood chief, grocery wholesaler
});

const orderSchema = new mongoose.Schema({
  customer: {type:mongoose.Schema.Types.ObjectId, ref:'User'}, customerName: String, customerPhone: String,
  area: {type:String, enum:AREAS, required:true}, fullAddress: String,
  items: [{ product: {type:mongoose.Schema.Types.ObjectId, ref:'Product'}, name:String, price:Number, qty:Number }],
  totalAmount: Number, deliveryCharge: Number, paymentMethod: {type:String, enum:["COD","UPI"], default:"COD"}, paymentStatus: {type:String, default:"Pending"},
  status: {type:String, enum:["Pending","Accepted","Packing","On the way","Delivered","Cancelled"], default:"Pending"},
  deliveryBoy: {type:mongoose.Schema.Types.ObjectId, ref:'User', default:null}, // Lock system
  deliveryOtp: String, isOtpVerified: {type:Boolean, default:false}
},{timestamps:true});

const otpSchema = new mongoose.Schema({ phone: String, otp: String, purpose: String, expiresAt: {type:Date, default:()=>new Date(Date.now()+5*60*1000)} });

const User = mongoose.model('User', userSchema); const Product = mongoose.model('Product', productSchema); const Banner = mongoose.model('Banner', bannerSchema); const Setting = mongoose.model('Setting', settingSchema); const Order = mongoose.model('Order', orderSchema); const Otp = mongoose.model('Otp', otpSchema);

// ===== HELPERS =====
const generateOtp = ()=> Math.floor(100000+Math.random()*900000).toString();
const auth = (roles=[])=> (req,res,next)=>{
  const token = req.headers.authorization?.split(" ")[1]; if(!token) return res.status(401).json({error:"Login lage"});
  try{ const d=jwt.verify(token,process.env.JWT_SECRET); req.user=d; if(roles.length &&!roles.includes(d.role)) return res.status(403).json({error:"Access nai"}); next(); }catch{ res.status(401).json({error:"Token beya"})}
};

// ===== AUTH - OTP LOGIN (Customer, Delivery, Admin) =====
app.post('/api/auth/send-otp', async(req,res)=>{
  const {phone, purpose} = req.body; const otp = generateOtp();
  await Otp.deleteMany({phone}); await new Otp({phone, otp, purpose}).save();
  console.log(`🔐 OTP for ${phone} is ${otp}`); // Eta SMS API t replace koriba
  // Yate Fast2SMS / Twilio API lagabo pariba
  res.json({message:`OTP sent to ${phone}`, otp_for_test: otp}); // Production t otp_for_test remove koribo
});
app.post('/api/auth/verify-otp', async(req,res)=>{
  const {phone, otp} = req.body; const record = await Otp.findOne({phone, otp}); if(!record || record.expiresAt < new Date()) return res.status(400).json({error:"OTP beya ba expire"});
  let user = await User.findOne({phone}); if(!user){ user = await new User({phone, name:"User "+phone.slice(-4)}).save(); }
  await Otp.deleteMany({phone});
  const token = jwt.sign({id:user._id, phone:user.phone, role:user.role}, process.env.JWT_SECRET);
  res.json({token, user});
});
app.post('/api/auth/admin-reset', async(req,res)=>{
  const {phone, otp, newPassword} = req.body; // Admin phone = 919365822867
  if(phone!== process.env.ADMIN_PHONE) return res.status(403).json({error:"Only default admin"});
  const record = await Otp.findOne({phone, otp}); if(!record) return res.status(400).json({error:"OTP beya"});
  // Admin password reset logic (jodi admin user thake)
  res.json({message:"Admin verified, token diya hol"});
});

// ===== PRODUCT & BANNER =====
app.get('/api/products', async(req,res)=>{ const {search, category} = req.query; let q={}; if(search) q.name={$regex:search,$options:'i'}; if(category) q.category=category; res.json(await Product.find(q).sort({createdAt:-1})); });
app.get('/api/banners', async(req,res)=> res.json(await Banner.find({isActive:true})));
app.get('/api/settings', async(req,res)=> res.json(await Setting.findOne() || {}));
app.get('/api/areas', (req,res)=> res.json(AREAS));

// ===== ADMIN - FULL CONTROL =====
app.post('/api/admin/product', auth(['admin','manager','staff']), async(req,res)=>{ const p = await new Product(req.body).save(); res.json(p); });
app.put('/api/admin/product/:id', auth(['admin','manager']), async(req,res)=> res.json(await Product.findByIdAndUpdate(req.params.id, req.body, {new:true})));
app.delete('/api/admin/product/:id', auth(['admin']), async(req,res)=>{ await Product.findByIdAndDelete(req.params.id); res.json({message:"Deleted"}); });

app.post('/api/admin/banner', auth(['admin']), async(req,res)=> res.json(await new Banner(req.body).save()));
app.put('/api/admin/settings', auth(['admin']), async(req,res)=>{ let s = await Setting.findOne(); if(!s) s = new Setting(req.body); else Object.assign(s, req.body); await s.save(); res.json(s); });

app.post('/api/admin/staff', auth(['admin']), async(req,res)=>{
  const {name, phone, role} = req.body; // role: delivery, staff, manager
  const user = await new User({name, phone, role}).save(); res.json(user);
});
app.get('/api/admin/users', auth(['admin','manager']), async(req,res)=> res.json(await User.find().sort({createdAt:-1})));
app.get('/api/admin/orders', auth(['admin','manager','staff']), async(req,res)=> res.json(await Order.find().populate('customer deliveryBoy').sort({createdAt:-1})));
app.get('/api/admin/sales-report', auth(['admin','manager']), async(req,res)=>{
  const today = new Date(); today.setHours(0,0,0,0);
  const todayOrders = await Order.find({createdAt:{$gte:today}, status:"Delivered"}); const total = todayOrders.reduce((s,o)=>s+o.totalAmount,0);
  res.json({todaySale:total, todayCount:todayOrders.length});
});

// ===== ORDER FLOW =====
app.post('/api/orders', auth(), async(req,res)=>{
  const {area, fullAddress, items, totalAmount, paymentMethod} = req.body;
  const settings = await Setting.findOne(); const min = settings?.minOrderAmount || 99;
  if(totalAmount < min) return res.status(400).json({error:`Minimum order ₹${min} lage`});
  const deliveryCharge = settings?.deliveryCharges?.get(area) || 30;
  const order = await new Order({
    customer:req.user.id, customerName:req.user.name, customerPhone:req.user.phone,
    area, fullAddress, items, totalAmount: totalAmount+deliveryCharge, deliveryCharge, paymentMethod,
    deliveryOtp: generateOtp()
  }).save();
  // Push Notification Logic - yate notificationNumbers loike SMS jabo
  console.log(`🔔 New Order ${order._id} for ${area}. OTP: ${order.deliveryOtp}`);
  res.json({message:"Order Placed", order});
});

app.get('/api/my-orders', auth(), async(req,res)=> res.json(await Order.find({customer:req.user.id}).sort({createdAt:-1})));

// Delivery Boy Lock System
app.put('/api/delivery/pick/:orderId', auth(['delivery','admin']), async(req,res)=>{
  const order = await Order.findById(req.params.orderId);
  if(order.deliveryBoy) return res.status(400).json({error:"Already picked by another boy"});
  order.deliveryBoy = req.user.id; order.status = "On the way"; await order.save();
  res.json({message:"Order picked", deliveryOtp: order.deliveryOtp});
});
app.post('/api/delivery/verify-delivery', auth(['delivery','admin']), async(req,res)=>{
  const {orderId, otp} = req.body; const order = await Order.findById(orderId);
  if(order.deliveryOtp!== otp) return res.status(400).json({error:"Customer phone OTP beya"});
  order.isOtpVerified=true; order.status="Delivered"; order.paymentStatus="Paid"; await order.save();
  res.json({message:"✅ Delivered successfully"});
});

app.put('/api/admin/order-status/:id', auth(['admin','manager','staff']), async(req,res)=>{
  res.json(await Order.findByIdAndUpdate(req.params.id, {status:req.body.status}, {new:true}));
});

app.get('/', (req,res)=>res.send("🚀 DailyKart Pro Live - 27 Areas Covered | COD+UPI | OTP Delivery"));
app.listen(process.env.PORT, ()=>console.log(`Server ${process.env.PORT}`));
