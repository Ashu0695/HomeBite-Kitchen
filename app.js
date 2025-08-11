
// Simple static app script for multi-page food app
const PRODUCTS = [
  { id: "p1", name: "Chole Bhature", price: 120, img: "chole-bhature.jpg", desc: "Fluffy bhature served with spicy chole and pickle. Hot and tasty!" },
  { id: "p2", name: "Chinese Special", price: 150, img: "chinese.jpg", desc: "Hakka noodles with veg Manchurian. Perfect spice balance." },
  { id: "p3", name: "North Indian Thali", price: 180, img: "north-indian.jpg", desc: "Complete thali with dal, sabzi, rice, roti and raita." },
  { id: "p4", name: "Paneer Butter Masala", price: 200, img: "paneer.jpg", desc: "Creamy paneer butter masala with soft rotis." },
  { id: "p5", name: "Gulab Jamun (2 pcs)", price: 60, img: "gulab-jamun.jpg", desc: "Sweet gulab jamun to finish your meal." }
];

function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return document.querySelectorAll(sel); }

// Cart stored in localStorage as array of {id, qty}
function getCart(){ return JSON.parse(localStorage.getItem('hb_cart')||'[]'); }
function saveCart(c){ localStorage.setItem('hb_cart', JSON.stringify(c)); }
function addToCart(id, qty=1){
  const cart = getCart();
  const found = cart.find(i=>i.id===id);
  if(found) found.qty += qty; else cart.push({id, qty});
  saveCart(cart);
  updateCartBadge();
}
function removeFromCart(id){
  let cart = getCart().filter(i=>i.id!==id);
  saveCart(cart); updateCartBadge();
}
function changeQty(id, qty){
  let cart = getCart();
  const it = cart.find(i=>i.id===id);
  if(!it) return;
  it.qty = qty;
  if(it.qty<=0) cart = cart.filter(i=>i.id!==id);
  saveCart(cart); renderCart(); updateCartBadge();
}
function updateCartBadge(){
  const c = getCart().reduce((s,i)=>s+i.qty,0);
  const el = qs('#cart-count'); if(el) el.textContent = c;
}

// INDEX - render products grid
function renderIndex(){
  const wrap = qs('#products');
  if(!wrap) return;
  wrap.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${p.img}" alt="${p.name}"/>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="price">₹${p.price}</p>
        <p class="short">${p.desc}</p>
        <div class="card-actions">
          <a class="btn" href="product.html?id=${p.id}">View</a>
          <button class="btn primary" data-id="${p.id}">Add</button>
        </div>
      </div>`;
    wrap.appendChild(div);
  });
  qsa('.card .btn.primary').forEach(b=> b.addEventListener('click', e=>{
    addToCart(e.currentTarget.dataset.id, 1);
    alert('Added to cart');
  }));
}

// PRODUCT PAGE - render product by id from query
function renderProduct(){
  const qsParams = new URLSearchParams(location.search);
  const id = qsParams.get('id');
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p){ qs('#product-root').innerHTML = '<p>Product not found</p>'; return; }
  qs('#product-root').innerHTML = `
    <div class="product-detail">
      <img src="${p.img}" alt="${p.name}"/>
      <div class="pd-body">
        <h2>${p.name}</h2>
        <p class="price">₹${p.price}</p>
        <p>${p.desc}</p>
        <div class="qty-row">
          <label>Qty</label>
          <input type="number" id="qty" value="1" min="1" />
        </div>
        <button id="add-btn" class="btn primary">Add to Cart</button>
      </div>
    </div>`;
  qs('#add-btn').addEventListener('click', ()=>{
    const qty = parseInt(qs('#qty').value||1);
    addToCart(p.id, qty);
    alert('Added to cart');
    updateCartBadge();
  });
}

// CART PAGE - list items
function renderCart(){
  const wrap = qs('#cart-root');
  if(!wrap) return;
  const cart = getCart();
  if(cart.length===0){ wrap.innerHTML = '<p>Your cart is empty.</p>'; updateCartBadge(); return; }
  let html = '<div class="cart-list">';
  let total = 0;
  cart.forEach(it=>{
    const p = PRODUCTS.find(x=>x.id===it.id);
    const line = p.price * it.qty;
    total += line;
    html += `<div class="cart-item">
      <img src="${p.img}" alt="${p.name}"/>
      <div class="ci-body">
        <h4>${p.name}</h4>
        <p>₹${p.price} x <input class="qty-input" data-id="${it.id}" type="number" value="${it.qty}" min="1" /></p>
        <p class="line">₹${line}</p>
        <button class="btn danger" data-id="${it.id}">Remove</button>
      </div>
    </div>`;
  });
  html += `</div><div class="cart-summary"><h3>Total: ₹${total}</h3><button id="checkout" class="btn primary">Place Order</button></div>`;
  wrap.innerHTML = html;
  qsa('.qty-input').forEach(i=> i.addEventListener('change', e=> changeQty(e.currentTarget.dataset.id, parseInt(e.currentTarget.value))));
  qsa('.btn.danger').forEach(b=> b.addEventListener('click', e=> { removeFromCart(e.currentTarget.dataset.id); renderCart(); }));
  qs('#checkout').addEventListener('click', ()=>{ alert('Order placed! (demo)'); localStorage.removeItem('hb_cart'); renderCart(); updateCartBadge(); });
  updateCartBadge();
}

// Initialize app based on page
document.addEventListener('DOMContentLoaded', ()=>{
  updateCartBadge();
  if(qs('#products')) renderIndex();
  if(qs('#product-root')) renderProduct();
  if(qs('#cart-root')) renderCart();
});
