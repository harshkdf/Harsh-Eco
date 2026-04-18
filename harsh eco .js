import React, { useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import confetti from 'canvas-confetti';

type Product = { id:number; name:string; price:number; category:string; emoji:string; description:string };
type CartItem = Product & { qty:number };
type CartStore = {
  items: CartItem[];
  add:(p:Product)=>void;
  inc:(id:number)=>void;
  dec:(id:number)=>void;
  clear:()=>void;
};

const PRODUCTS: Product[] = [
{id:1,name:'Rice',price:60,category:'Grocery',emoji:'🍚',description:'Premium rice'},
{id:2,name:'Milk',price:32,category:'Dairy',emoji:'🥛',description:'Fresh milk'},
{id:3,name:'Bread',price:40,category:'Snacks',emoji:'🍞',description:'Soft bread'},
{id:4,name:'Tea',price:120,category:'Beverages',emoji:'🍵',description:'Strong tea'},
{id:5,name:'Soap',price:35,category:'Household',emoji:'🧼',description:'Bath soap'},
{id:6,name:'Sugar',price:48,category:'Grocery',emoji:'🍬',description:'Fine sugar'},
{id:7,name:'Chips',price:20,category:'Snacks',emoji:'🍟',description:'Crispy chips'},
{id:8,name:'Juice',price:45,category:'Beverages',emoji:'🧃',description:'Fruit juice'}
];

const useCart = create<CartStore>()(persist((set,get)=>(
{
items:[],
add:(p)=>{const f=get().items.find(i=>i.id===p.id); if(f){get().inc(p.id);return;} set({items:[...get().items,{...p,qty:1}]});},
inc:(id)=>set({items:get().items.map(i=>i.id===id?{...i,qty:i.qty+1}:i)}),
dec:(id)=>set({items:get().items.flatMap(i=>i.id===id?(i.qty>1?[{...i,qty:i.qty-1}]:[]):[i])}),
clear:()=>set({items:[]})
}),{name:'harsh-cart'}));

const styles = {
wrap:{padding:16,minHeight:'100vh',background:'#0f1020',color:'white'} as React.CSSProperties,
grid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12} as React.CSSProperties,
card:{background:'rgba(255,255,255,.08)',padding:12,borderRadius:16} as React.CSSProperties,
btn:{background:'#7C6FE9',color:'white',border:0,padding:'8px 12px',borderRadius:10,cursor:'pointer'} as React.CSSProperties,
input:{padding:10,borderRadius:10,border:0,width:'100%',marginBottom:12} as React.CSSProperties,
float:{position:'fixed',right:16,bottom:16,background:'#7C6FE9',color:'white',padding:12,borderRadius:999,textDecoration:'none'} as React.CSSProperties
};

function ItemCard({product}:{product:Product}){
 const {items,add,inc,dec}=useCart();
 const found=items.find(i=>i.id===product.id);
 return <div style={styles.card}><Link to={`/product/${product.id}`} style={{color:'white',textDecoration:'none'}}><div style={{fontSize:38}}>{product.emoji}</div><b>{product.name}</b><div>{product.description}</div><div>₹{product.price}</div></Link>{!found?<button style={styles.btn} onClick={()=>add(product)}>Add</button>:<div style={{display:'flex',gap:8,marginTop:8}}><button style={styles.btn} onClick={()=>dec(product.id)}>-</button><span>{found.qty}</span><button style={styles.btn} onClick={()=>inc(product.id)}>+</button></div>}</div>;
}

function Home(){
 const [q,setQ]=useState(''); const [cat,setCat]=useState('All');
 const cats=['All',...Array.from(new Set(PRODUCTS.map(p=>p.category)))];
 const count=useCart(s=>s.items.reduce((a,b)=>a+b.qty,0));
 const list=PRODUCTS.filter(p=>(cat==='All'||p.category===cat)&&p.name.toLowerCase().includes(q.toLowerCase()));
 return <div style={styles.wrap}><h1>Harsh Eco Store</h1><input style={styles.input} value={q} placeholder='Search' onChange={e=>setQ(e.target.value)}/><div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>{cats.map(c=><button key={c} style={styles.btn} onClick={()=>setCat(c)}>{c}</button>)}</div><div style={styles.grid}>{list.map(p=><ItemCard key={p.id} product={p}/>)}</div><Link to='/checkout' style={styles.float}>🛒 {count}</Link></div>;
}

function Details(){ const {id}=useParams(); const p=PRODUCTS.find(x=>x.id===Number(id)); if(!p) return <div style={styles.wrap}>Not found</div>; const related=PRODUCTS.filter(x=>x.category===p.category&&x.id!==p.id); return <div style={styles.wrap}><ItemCard product={p}/><h3>Related</h3><div style={styles.grid}>{related.map(r=><ItemCard key={r.id} product={r}/>)}</div></div>; }

function Checkout(){ const nav=useNavigate(); const items=useCart(s=>s.items); const subtotal=useMemo(()=>items.reduce((a,b)=>a+b.price*b.qty,0),[items]); const total=subtotal+(items.length?40:0); return <div style={styles.wrap}><h2>Checkout</h2>{items.map(i=><div key={i.id}>{i.name} x {i.qty}</div>)}<p>Subtotal ₹{subtotal}</p><p>Total ₹{total}</p><button style={styles.btn} onClick={()=>nav('/otp/ORDER123')}>Place Order</button></div>; }

function Verify(){ const nav=useNavigate(); const [otp,setOtp]=useState(['','','','','','']); return <div style={styles.wrap}><h2>OTP</h2><div style={{display:'flex',gap:8}}>{otp.map((v,i)=><input key={i} maxLength={1} value={v} style={{...styles.input,width:40}} onChange={e=>{const n=[...otp]; n[i]=e.target.value; setOtp(n);}} />)}</div><button style={styles.btn} onClick={()=>nav('/track/ORDER123')}>Verify</button></div>; }

function Track(){ const [paid,setPaid]=useState(false); return <div style={styles.wrap}><h2>Track Order</h2><div>Verified ✓</div><div>Accepted ✓</div><div>{paid?'Paid ✓':'Pending Payment'}</div>{!paid&&<button style={styles.btn} onClick={()=>{setPaid(true); confetti();}}>Pay Now</button>}</div>; }

export default function StoreFront(){
 return <BrowserRouter><Routes><Route path='/' element={<Home/>}/><Route path='/product/:id' element={<Details/>}/><Route path='/checkout' element={<Checkout/>}/><Route path='/otp/:ref' element={<Verify/>}/><Route path='/track/:ref' element={<Track/>}/></Routes></BrowserRouter>;
}

console.assert(PRODUCTS.length>=8,'must have products');
console.assert(PRODUCTS.some(p=>p.category==='Grocery'),'must include Grocery');
console.assert(PRODUCTS.find(p=>p.id===1)?.name==='Rice','product id 1 should be Rice');
