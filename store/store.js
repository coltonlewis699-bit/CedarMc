const products=[
{id:'royal',cat:'ranks',name:'Royal Rank',price:19.99,icon:'♛',badge:'BEST VALUE',desc:'Top CedarMC rank with Royal perks, kit access and exclusive benefits.'},
{id:'cosmic',cat:'ranks',name:'Cosmic Rank',price:14.99,icon:'✦',badge:'RANK',desc:'A premium rank packed with useful server perks and Cosmic kit access.'},
{id:'ember',cat:'ranks',name:'Ember Rank',price:9.99,icon:'◆',badge:'RANK',desc:'Upgrade your survival experience with Ember perks and kit access.'},
{id:'shards1',cat:'shards',name:'5,000 Shards',price:4.99,icon:'✧',badge:'SHARDS',desc:'Spend shards in CedarMC custom shops on unlocks and rewards.'},
{id:'shards2',cat:'shards',name:'15,000 Shards',price:9.99,icon:'✧',badge:'POPULAR',desc:'A larger shard bundle for cosmetics, items and custom shop purchases.'},
{id:'cosmetic',cat:'cosmetics',name:'Cosmetic Bundle',price:7.99,icon:'❈',badge:'COSMETICS',desc:'A CedarMC cosmetic bundle for players who want to stand out.'},
{id:'keys',cat:'keys',name:'5 Crate Keys',price:4.99,icon:'⚿',badge:'KEYS',desc:'Five server crate keys for a shot at useful rewards.'}
];
let cart=JSON.parse(localStorage.getItem('cedarmc-cart')||'[]');
const $=s=>document.querySelector(s), productsEl=$('#products'),cartEl=$('#cart'),shade=$('#shade');
function money(n){return '$'+n.toFixed(2)}
function renderProducts(cat='all'){productsEl.innerHTML=products.filter(p=>cat==='all'||p.cat===cat).map(p=>`<article class="product"><span class="badge">${p.badge}</span><div class="icon">${p.icon}</div><h3>${p.name}</h3><p>${p.desc}</p><div class="buyrow"><span class="price">${money(p.price)}</span><button class="add" data-id="${p.id}">Add to Cart</button></div></article>`).join('');document.querySelectorAll('.add').forEach(b=>b.onclick=()=>add(b.dataset.id))}
function add(id){cart.push(id);save();toast('Added to cart');renderCart()}
function removeAt(i){cart.splice(i,1);save();renderCart()}
function save(){localStorage.setItem('cedarmc-cart',JSON.stringify(cart));$('#cartCount').textContent=cart.length}
function renderCart(){save();if(!cart.length){$('#cartItems').innerHTML='<div class="empty">Your cart is empty.<br>Add something from the store.</div>';$('#total').textContent='$0.00';return}let total=0;$('#cartItems').innerHTML=cart.map((id,i)=>{const p=products.find(x=>x.id===id);if(!p)return '';total+=p.price;return `<div class="cart-item"><div><b>${p.name}</b><small>${money(p.price)}</small></div><button class="remove" data-i="${i}">Remove</button></div>`}).join('');$('#total').textContent=money(total);document.querySelectorAll('.remove').forEach(b=>b.onclick=()=>removeAt(+b.dataset.i))}
function openCart(){cartEl.classList.add('open');shade.classList.add('open')}function closeCart(){cartEl.classList.remove('open');shade.classList.remove('open')}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1600)}
$('#tabs').onclick=e=>{if(!e.target.dataset.cat)return;document.querySelectorAll('#tabs button').forEach(x=>x.classList.remove('selected'));e.target.classList.add('selected');renderProducts(e.target.dataset.cat)};
$('#cartBtn').onclick=openCart;$('#closeCart').onclick=closeCart;shade.onclick=closeCart;
$('#checkout').onclick=()=>{const name=$('#username').value.trim();if(!name){closeCart();$('#username').focus();toast('Enter your Minecraft username first');return}if(!cart.length){toast('Your cart is empty');return}toast('Checkout will be connected in Store v2')};
renderProducts();renderCart();
