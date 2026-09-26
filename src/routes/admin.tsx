import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
export const Route = createFileRoute('/admin')({ component: AdminPage })
function AdminPage(){
const [logged,setLogged]=useState(false);const [pass,setPass]=useState('')
const [products,setProducts]=useState<any[]>([]);const [orders,setOrders]=useState<any[]>([])
const [name,setName]=useState('');const [price,setPrice]=useState('');const [mrp,setMrp]=useState('');const [cat,setCat]=useState('Grocery');const [img,setImg]=useState('');const [stock,setStock]=useState(true)
const [dt,setDt]=useState('10 min');const [w1,setW1]=useState('');const [w2,setW2]=useState('');const [w3,setW3]=useState('')
const [admins,setAdmins]=useState<any[]>([{u:'admin',p:'admin123'}]);const [newU,setNewU]=useState('');const [newP,setNewP]=useState('')
const [np,setNp]=useState('');const [gt,setGt]=useState('');const [gr,setGr]=useState('yonayacha-dot/Dailykart-');const [gf,setGf]=useState('products.json');const [gs,setGs]=useState('');const [edit,setEdit]=useState(-1)
useEffect(()=>{
setProducts(JSON.parse(localStorage.getItem('dk_products_v2')||'[]'))
setOrders(JSON.parse(localStorage.getItem('dk_orders')||'[]'))
const s=JSON.parse(localStorage.getItem('dk_settings')||'{"dt":"10 min","wa":[]}');setDt(s.dt);setW1(s.wa?.[0]||'');setW2(s.wa?.[1]||'');setW3(s.wa?.[2]||'')
setAdmins(JSON.parse(localStorage.getItem('dk_admins')||'[{"u":"admin","p":"admin123"}]'))
const g=JSON.parse(localStorage.getItem('dk_git')||'{}');setGt(g.token||'');setGr(g.repo||'yonayacha-dot/Dailykart-');setGf(g.file||'products.json')
},[])
const saveP=(p:any[])=>{setProducts(p);localStorage.setItem('dk_products_v2',JSON.stringify(p))}
const login=()=>{
const all=JSON.parse(localStorage.getItem('dk_admins')||'[{"u":"admin","p":"admin123"}]');const master=localStorage.getItem('dk_p')||'admin123'
if(pass===master||all.find((a:any)=>a.p===pass||a.u===pass)) setLogged(true); else alert('Wrong Password')
}
const addProduct=()=>{
if(!name||!price) return alert('Name Price diba')
const obj={id:edit>=0?products[edit].id:Date.now(),name,price:+price,mrp:mrp?+mrp:+price,category:cat,img:img||'https://via.placeholder.com/200?text='+encodeURIComponent(name),stock}
let n=[...products];if(edit>=0){n[edit]=obj;setEdit(-1)}else n.unshift(obj);saveP(n);setName('');setPrice('');setMrp('');setImg('');setStock(true)
}
const onFile=(e:any)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setImg(ev.target?.result as string);r.readAsDataURL(f)}
if(!logged) return <div style={{maxWidth:360,margin:'80px auto',background:'#1e1e1e',padding:20,borderRadius:14,color:'#fff'}}><h2 style={{color:'#ff6b00'}}>DailyKart Admin</h2><input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Password" style={inp} /><button onClick={login} style={btn}>Login</button><p style={{fontSize:11,color:'#666'}}>Default: admin123</p></div>
const todaySale=orders.filter((o:any)=>new Date().toDateString()===new Date(o.date||Date.now()).toDateString()).reduce((a:any,b:any)=>a+(b.total||0),0)
const customers:any={};orders.forEach((o:any)=>{const k=o.customer||o.name||o.phone||'Unknown';customers[k]=(customers[k]||0)+(o.total||0)})
return <div style={{background:'#0f0f0f',minHeight:'100vh',color:'#eee'}}>
<div style={{background:'#ff6b00',padding:12,display:'flex',justifyContent:'space-between'}}><b>DailyKart Super Admin</b><button onClick={()=>setLogged(false)} style={{...sbtn,background:'#000'}}>Logout</button></div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))'}}>
<div style={card}><h4>Product Add / Gallery Image Change</h4>
<input value={name} onChange={e=>setName(e.target.value)} placeholder="Product Name" style={inp} />
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><input value={price} onChange={e=>setPrice(e.target.value)} type="number" placeholder="Price" style={inp}/><input value={mrp} onChange={e=>setMrp(e.target.value)} type="number" placeholder="MRP" style={inp}/></div>
<select value={cat} onChange={e=>setCat(e.target.value)} style={inp}><option>Vegetables</option><option>Fruits</option><option>Grocery</option><option>Dairy</option><option>Snacks</option></select>
<p style={{fontSize:12}}>Gallery Upload:</p><input type="file" accept="image/*" onChange={onFile} style={inp} />
{img && <img src={img} style={{width:'100%',height:120,objectFit:'cover',borderRadius:10}}/>}
<input value={img} onChange={e=>setImg(e.target.value)} placeholder="Or Image Link" style={inp} />
<label><input type="checkbox" checked={stock} onChange={e=>setStock(e.target.checked)} /> In Stock</label>
<button onClick={addProduct} style={btn}>{edit>=0?'Update':'Save'}</button>
</div>
<div style={card}><h4>Settings - Delivery / WhatsApp / Admin / GitHub</h4>
<label style={lab}>Delivery Time Management</label><input value={dt} onChange={e=>setDt(e.target.value)} style={inp} />
<label style={lab}>WhatsApp Order</label>
<input value={w1} onChange={e=>setW1(e.target.value)} style={inp} placeholder="WA 1" />
<input value={w2} onChange={e=>setW2(e.target.value)} style={inp} placeholder="WA 2" />
<input value={w3} onChange={e=>setW3(e.target.value)} style={inp} placeholder="WA 3" />
<hr style={{borderColor:'#333',margin:'10px 0'}}/>
<label style={lab}>Add Multiple Admin</label>
{admins.map((a:any,i:number)=><div key={i} style={{display:'flex',justifyContent:'space-between',background:'#252525',padding:6,borderRadius:8,margin:'4px 0'}}><span>{a.u} - {a.p}</span><button style={{...sbtn,background:'#d32f2f'}} onClick={()=>{const n=[...admins];n.splice(i,1);setAdmins(n);localStorage.setItem('dk_admins',JSON.stringify(n))}}>X</button></div>)}
<input value={newU} onChange={e=>setNewU(e.target.value)} placeholder="New Username" style={inp}/><input value={newP} onChange={e=>setNewP(e.target.value)} placeholder="New Password" style={inp}/><button style={{...sbtn,background:'#333'}} onClick={()=>{if(!newU||!newP)return;const n=[...admins,{u:newU,p:newP}];setAdmins(n);localStorage.setItem('dk_admins',JSON.stringify(n));setNewU('');setNewP('')}}>+ Add Admin</button>
<hr style={{borderColor:'#333',margin:'10px 0'}}/>
<label style={lab}>Login Password Change</label><input value={np} onChange={e=>setNp(e.target.value)} placeholder="New Password" style={inp}/><button style={{...sbtn,background:'#333'}} onClick={()=>{if(!np)return;localStorage.setItem('dk_p',np);alert('Updated')}}>Update</button>
<hr style={{borderColor:'#333',margin:'10px 0'}}/>
<label style={lab}>GitHub Token Place</label><input value={gt} onChange={e=>setGt(e.target.value)} type="password" placeholder="ghp_xxx" style={inp}/><input value={gr} onChange={e=>setGr(e.target.value)} style={inp}/><input value={gf} onChange={e=>setGf(e.target.value)} style={inp}/>
<button style={{...sbtn,background:'#2e7d32'}} onClick={()=>{localStorage.setItem('dk_git',JSON.stringify({token:gt,repo:gr,file:gf}));localStorage.setItem('dk_settings',JSON.stringify({dt,wa:[w1,w2,w3].filter(Boolean)}));setGs('Saved')}}>Save Settings + Git</button>
<button style={{...sbtn,background:'#111'}} onClick={async()=>{if(!gt)return alert('Token diya');setGs('Uploading...');const content=btoa(unescape(encodeURIComponent(JSON.stringify(products,null,2))));const url='https://api.github.com/repos/'+gr+'/contents/'+gf;let sha='';try{const r=await fetch(url,{headers:{Authorization:'token '+gt}});if(r.ok){const j=await r.json();sha=j.sha}}catch{}const res=await fetch(url,{method:'PUT',headers:{Authorization:'token '+gt,'Content-Type':'application/json'},body:JSON.stringify({message:'update',content,sha:sha||undefined})});setGs(res.ok?'Push OK':'Error '+res.status)}}>Push to GitHub</button><p style={{fontSize:12}}>{gs}</p>
</div>
</div>
<div style={card}><h4>Products - Edit/Delete/Stock ({products.length})</h4>
{products.map((p:any,i:number)=><div key={p.id} style={{display:'flex',gap:10,background:'#252525',padding:10,borderRadius:12,margin:'7px 0',alignItems:'center'}}><img src={p.img} style={{width:55,height:55,borderRadius:10,objectFit:'cover'}}/><div style={{flex:1}}><b>{p.name}</b><br/><small>Rs.{p.price} {p.stock?'✅':'❌'}</small></div><div><button style={sbtn} onClick={()=>{setName(p.name);setPrice(String(p.price));setMrp(String(p.mrp||''));setCat(p.category);setImg(p.img);setStock(p.stock);setEdit(i);window.scrollTo(0,0)}}>Edit</button><button style={{...sbtn,background:'#333'}} onClick={()=>{const n=[...products];n[i].stock=!n[i].stock;saveP(n)}}>Stock</button><button style={{...sbtn,background:'#d32f2f'}} onClick={()=>{const n=[...products];n.splice(i,1);saveP(n)}}>Del</button></div></div>)}
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))'}}>
<div style={card}><h4>Order Dekha - Customer Order</h4>{orders.map((o:any,i:number)=><div key={i} style={{background:'#252525',padding:8,borderRadius:10,margin:'6px 0',fontSize:13}}><b>#{o.id||i}</b> Rs.{o.total} <small>{o.customer||''} {o.phone||''}</small><br/><select value={o.status||'Pending'} onChange={e=>{const n=[...orders];n[i].status=e.target.value;setOrders(n);localStorage.setItem('dk_orders',JSON.stringify(n))}} style={{...inp,padding:5}}><option>Pending</option><option>Delivered</option><option>Cancelled</option></select></div>)}</div>
<div style={card}><h4>Today Sale Rs.{todaySale} | Orders {orders.length}</h4><h4>Customer List</h4>{Object.entries(customers).map(([k,v]:any)=><div key={k} style={{display:'flex',justifyContent:'space-between',background:'#252525',padding:6,borderRadius:8,margin:'4px 0'}}><span>{k}</span><b>Rs.{v as any}</b></div>)}<h4 style={{marginTop:10}}>Delivery Status</h4>{orders.map((o:any,i:number)=><div key={i} style={{fontSize:12}}>{o.id||i} - {o.status||'Pending'}</div>)}</div>
</div>
</div>
}
const card:any={background:'#1e1e1e',border:'1px solid #333',borderRadius:14,padding:14,margin:12}
const inp:any={width:'100%',padding:11,margin:'6px 0',background:'#2a2a2a',border:'1px solid #444',borderRadius:10,color:'#fff',fontSize:14}
const btn:any={width:'100%',padding:11,background:'#ff6b00',color:'#fff',border:'none',borderRadius:10,fontWeight:700,margin:'6px 0'}
const sbtn:any={padding:'6px 10px',background:'#ff6b00',color:'#fff',border:'none',borderRadius:8,fontSize:12,margin:2}
const lab:any={fontSize:12,color:'#aaa'}
