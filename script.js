const PRODUCTS = [{"name": "iPhone 15 Pro", "price": 980, "brand": "iPhone", "img": "iphone15pro.jpg", "desc": "Premium iPhone 15 Pro \u2014 flagship."}, {"name": "iPhone 15", "price": 650, "brand": "iPhone", "img": "iphone15.jpg", "desc": "iPhone 15 \u2014 modern design."}, {"name": "iPhone 14", "price": 520, "brand": "iPhone", "img": "iphone14.jpg", "desc": "iPhone 14 \u2014 great value."}, {"name": "Samsung Galaxy S25", "price": 750, "brand": "Samsung", "img": "s25.svg", "desc": "Samsung S25 \u2014 cutting edge."}, {"name": "Samsung Galaxy A15", "price": 160, "brand": "Samsung", "img": "a15.svg", "desc": "Affordable A15."}, {"name": "Samsung Galaxy A07", "price": 110, "brand": "Samsung", "img": "a07.svg", "desc": "Budget A07."}, {"name": "Google Pixel 9 Pro XL", "price": 1125, "brand": "Pixel", "img": "pixel9pro.svg", "desc": "Pixel 9 Pro XL \u2014 camera AI."}, {"name": "Google Pixel 8a", "price": 420, "brand": "Pixel", "img": "pixel8a.svg", "desc": "Pixel 8a \u2014 midrange."}, {"name": "Google Pixel 7a", "price": 365, "brand": "Pixel", "img": "pixel7a.svg", "desc": "Pixel 7a \u2014 value."}];
const ECOCASH = '0785436552';
const WA_NUMBER = '263777045219';
let cart = JSON.parse(localStorage.getItem('starry_cart')||'[]');
const listRoot = document.getElementById('phoneList');

function render(list){
  listRoot.innerHTML = '';
  list.forEach(function(p){
    var el = document.createElement('div'); el.className='product-card';
    var img = document.createElement('img'); img.src = p.img; img.className='p-img'; img.alt = p.name;
    var h = document.createElement('h3'); h.textContent = p.name;
    var lead = document.createElement('p'); lead.className='lead'; lead.textContent = p.desc || '';
    var price = document.createElement('p'); price.innerHTML = '<strong>US $' + p.price + '</strong>';
    var details = document.createElement('a'); details.className='btn'; details.href = 'details/' + p.name.replace(/\s+/g,'_').toLowerCase() + '.html'; details.textContent = 'Details';
    var add = document.createElement('button'); add.className='btn primary'; add.textContent = 'Add to Cart';
    add.addEventListener('click', function(){ addToCart(p.name); });
    el.appendChild(img); el.appendChild(h); el.appendChild(lead); el.appendChild(price); el.appendChild(details); el.appendChild(add);
    listRoot.appendChild(el);
  });
}
render(PRODUCTS);


document.getElementById('searchBox').addEventListener('input', function(e){ var q = e.target.value.toLowerCase(); render(PRODUCTS.filter(function(p){ return p.name.toLowerCase().includes(q); })); });
function filterCategory(cat){ if(cat==='all') return render(PRODUCTS); render(PRODUCTS.filter(function(p){ return p.brand.toLowerCase()===cat.toLowerCase(); })); }
function saveCart(){ localStorage.setItem('starry_cart', JSON.stringify(cart)); document.getElementById('cartCount').textContent = cart.reduce(function(s,i){ return s + i.qty; },0); }
function addToCart(name){ var item = PRODUCTS.find(function(p){ return p.name===name; }); if(!item) return; var ex = cart.find(function(c){ return c.name===name; }); if(ex) ex.qty++; else cart.push({name:item.name, price:item.price, qty:1}); saveCart(); alert(item.name + ' added to cart'); }
document.getElementById('viewCart').addEventListener('click', function(){ openCart(); });
document.getElementById('closeCart') && document.getElementById('closeCart').addEventListener('click', function(){ document.getElementById('cartModal').classList.add('hidden'); });
function openCart(){ var box = document.getElementById('cartItems'); box.innerHTML=''; var total=0; cart.forEach(function(i){ total += i.price * i.qty; box.innerHTML += '<p>' + i.name + ' × ' + i.qty + ' — US $' + (i.price * i.qty) + '</p>'; }); var d = Number(document.getElementById('deliverySelect').value); total += d; document.getElementById('cartTotal').textContent = 'US $' + total; document.getElementById('cartModal').classList.remove('hidden'); }
document.getElementById('checkoutUSD').addEventListener('click', function(){ if(cart.length===0) return alert('Cart is empty'); var d = Number(document.getElementById('deliverySelect').value); var total = cart.reduce(function(s,i){ return s + i.price * i.qty; },0) + d; alert('Order recorded. Customer will pay USD on delivery/pickup. Total US $' + total); cart = []; saveCart(); document.getElementById('cartModal').classList.add('hidden'); window.location='confirmation.html'; });
document.getElementById('checkoutEco').addEventListener('click', function(){ if(cart.length===0) return alert('Cart is empty'); var d = Number(document.getElementById('deliverySelect').value); var total = cart.reduce(function(s,i){ return s + i.price * i.qty; },0) + d; alert('Please send US $' + total + ' equivalent via EcoCash to ' + ECOCASH + '. Then send proof via WhatsApp.'); cart = []; saveCart(); document.getElementById('cartModal').classList.add('hidden'); window.location='confirmation.html'; });
document.getElementById('checkoutWa').addEventListener('click', function(){ document.getElementById('waModal').classList.remove('hidden'); });
document.getElementById('waForm').addEventListener('submit', function(e){ e.preventDefault(); var form = e.target; var name = form.elements['name'].value; var contact = form.elements['contact'].value; var email = form.elements['email'].value || ''; var notes = form.elements['notes'].value || ''; var items = cart.map(function(i){ return i.name + ' x' + i.qty; }).join('; '); var total = cart.reduce(function(s,i){ return s + i.price * i.qty; },0); var msg = 'Hello, I would like to order: ' + items + '. Total US $' + total + '. Name: ' + name + '. Contact: ' + contact + '. Email: ' + email + '. Notes: ' + notes; window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank'); cart = []; saveCart(); closeWaModal(); window.location='confirmation.html'; });
document.getElementById('modeToggle').addEventListener('click', function(){ document.body.classList.toggle('dark'); document.body.classList.toggle('light'); if(document.body.classList.contains('dark')) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); });
function closeWaModal(){ document.getElementById('waModal').classList.add('hidden'); }
var pending = localStorage.getItem('addItem'); if(pending){ addToCart(pending); localStorage.removeItem('addItem'); }
document.getElementById('cartCount').textContent = cart.reduce(function(s,i){ return s + i.qty; },0);



// --- Payments integration (Netlify Functions) ---
async function checkoutWithStripe() {
  const items = cart.map(i => ({ name: i.name, price: i.price, qty: i.qty }));
  if (items.length === 0) return alert('Cart is empty');
  const res = await fetch('/.netlify/functions/create-stripe-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  const data = await res.json();
  if (data && data.url) {
    window.location.href = data.url;
  } else {
    alert('Stripe session creation failed');
  }
}

async function checkoutWithPaynow() {
  const total = cart.reduce((s,i)=>s + i.price*i.qty,0) + Number(document.getElementById('deliverySelect').value || 0);
  const payload = { amount: total, reference: 'ORDER-' + Date.now() };
  const res = await fetch('/.netlify/functions/create-paynow-transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data && data.url) window.open(data.url, '_blank');
  else alert('Paynow init failed');
}

async function recordOrderServer(name, contact, email, notes, payment_method) {
  const items = cart.map(i => ({ name: i.name, price: i.price, qty: i.qty }));
  const total = cart.reduce((s,i)=>s + i.price*i.qty,0) + Number(document.getElementById('deliverySelect').value || 0);
  const body = { items, total, name, contact, email, notes, payment_method };
  await fetch('/.netlify/functions/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

document.addEventListener('DOMContentLoaded', function(){
  const stripeBtn = document.getElementById('stripeCheckoutBtn');
  if (stripeBtn) stripeBtn.addEventListener('click', checkoutWithStripe);
  const paynowBtn = document.getElementById('paynowBtn');
  if (paynowBtn) paynowBtn.addEventListener('click', checkoutWithPaynow);
});
