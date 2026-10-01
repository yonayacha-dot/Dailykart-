const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const DB_FILE = path.join(__dirname, 'db.json');

function loadDB(){
  try{
    if(fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE,'utf8'));
  }catch(e){}
  return { products:[], cats:[], banners:[], orders:[] };
}

function saveDB(d){
  try{ fs.writeFileSync(DB_FILE, JSON.stringify(d,null,2)); }catch(e){}
}

let DB = loadDB();

// API
app.get('/api/products', (req,res)=> res.json(DB.products));

app.post('/api/products', (req,res)=>{
  const b=req.body;
  if(b.id){
    let i=DB.products.findIndex(x=>x.id==b.id);
    if(i>=0){
      DB.products[i]={...DB.products[i],...b};
      saveDB(DB);
      return res.json({success:true,data:DB.products});
    }
  }
  DB.products.unshift({id:b.id||Date.now().toString(),...b});
  saveDB(DB);
  res.json({success:true,data:DB.products});
});

app.delete('/api/products/:id', (req,res)=>{
  DB.products=DB.products.filter(x=>x.id!=req.params.id);
  saveDB(DB);
  res.json({success:true,data:DB.products});
});

app.get('/api/cats', (req,res)=> res.json(DB.cats));
app.post('/api/cats', (req,res)=>{ DB.cats.push(req.body); saveDB(DB); res.json(DB.cats); });

app.get('/api/banners', (req,res)=> res.json(DB.banners));
app.post('/api/banners', (req,res)=>{ DB.banners.push(req.body); saveDB(DB); res.json(DB.banners); });

app.post('/api/orders', (req,res)=>{
  DB.orders.unshift(req.body);
  saveDB(DB);
  res.json({success:true});
});

app.get('/api/health', (req,res)=> res.json({status:'ok',products:DB.products.length}));

// Tumare purana line - last t thakibo lage
app.get('*', (req,res)=> res.sendFile(path.join(__dirname,'public','index.html')));

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=>console.log('DailyKart Live on',PORT));
