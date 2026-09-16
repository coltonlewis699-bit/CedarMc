const API='https://api.cedarmc.org',$=s=>document.querySelector(s);let products=[],users=[],orders=[],me=null,editing=-1,imageData='';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(p,o={}){const r=await fetch(API+p,{credentials:'include',headers:{'Content-Type':'application/json'},...o});let d={};try{d=await r.json()}catch{}if(!r.ok){let e=new Error(d.error||'Request failed');e.status=r.status;throw e}return d}
function toast(t){let x=$('#toast');x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2200)}
function card(p,i){let img=p.image?`<img src="${p.image}" alt="">`:`<div class="m-fallback">${esc(p.icon||'✦')}</div>`;return `<article class="m-card"><div class="m-img">${img}<span class="m-live ${p.enabled===false?'m-draft':''}">${p.enabled===false?'Draft':'● Live'}</span></div><div class="m-cardbody"><h3>${esc(p.name)}</h3><span class="m-price">$${Number(p.price||0).toFixed(2)}</span><span class="m-cat">${esc(p.category)}</span><div class="m-desc">${esc(p.description||'')}</div><div class="m-actions"><button class="m-btn edit" data-i="${i}">✎ Edit</button><button class="m-btn duplicate" data-i="${i}">▣ Duplicate</button></div></div></article>`}
function render(){let q=$('#search').value.toLowerCase(),cat=$('#categoryFilter').value,st=$('#statusFilter').value;let indexed=products.map((p,i)=>({p,i})).filter(x=>(!q||(x.p.name||'').toLowerCase().includes(q))&&(!cat||x.p.category===cat)&&(!st||(st==='live'?x.p.enabled!==false:x.p.enabled===false)));$('#productGrid').innerHTML=indexed.map(x=>card(x.p,x.i)).join('')+`<div id="quickAdd" class="m-addcard"><div><b>＋</b><strong>Add New Product</strong><p>Create a new product to sell.</p></div></div>`;document.querySelectorAll('.edit').forEach(b=>b.onclick=()=>openModal(+b.dataset.i));document.querySelectorAll('.duplicate').forEach(b=>b.onclick=()=>{let p=structuredClone(products[+b.dataset.i]);p.id='product-'+Date.now();p.name+=' Copy';p.enabled=false;products.push(p);render();saveAll()});$('#quickAdd').onclick=()=>openModal(-1);let live=products.filter(p=>p.enabled!==false).length;$('#stats').innerHTML=`<div class="m-stat"><strong>${products.length}</strong><small>Total Products</small></div><div class="m-stat"><strong>${live}</strong><small>Live Products</small></div><div class="m-stat"><strong>${products.length-live}</strong><small>Draft Products</small></div><div class="m-stat"><strong>$0.00</strong><small>Total Revenue (Test Mode)</small></div>`}
function preview(){let p={name:$('#fName').value||'Product Name',price:+$('#fPrice').value||0,category:$('#fCategory').value,description:$('#fDescription').value,icon:$('#fIcon').value,image:imageData,enabled:$('#fStatus').value==='live'};$('#storePreview').innerHTML=card(p,0).replace(/<div class="m-actions">[\s\S]*?<\/div><\/div><\/article>$/,'</div></article>');$('#imagePreview').src=imageData||'';$('#imagePreview').style.display=imageData?'block':'none'}
function openModal(i){editing=i;let p=i>=0?products[i]:{name:'',description:'',price:0,category:'ranks',enabled:false,sort:(products.length+1)*10,badge:'',icon:'✦',image:''};imageData=p.image||'';$('#modalTitle').textContent=i>=0?'Edit Product':'Add Product';$('#fName').value=p.name||'';$('#fDescription').value=p.description||'';$('#fPrice').value=p.price||0;$('#fCategory').value=p.category||'ranks';$('#fStatus').value=p.enabled===false?'draft':'live';$('#fSort').value=p.sort||0;$('#fBadge').value=p.badge||'';$('#fIcon').value=p.icon||'';$('#modalBack').classList.remove('hidden');preview()}
async function saveAll(){try{products=await api('/api/store/admin/products',{method:'POST',body:JSON.stringify({products})});render();toast('Store saved')}catch(e){toast(e.message)}}
$('#fImage').onchange=e=>{let f=e.target.files[0];if(!f)return;if(f.size>1572864){toast('Image must be 1.5 MB or smaller');e.target.value='';return}let r=new FileReader;r.onload=()=>{imageData=r.result;preview()};r.readAsDataURL(f)}
;['fName','fDescription','fPrice','fCategory','fStatus','fIcon'].forEach(id=>$('#'+id).oninput=preview);
$('#saveProduct').onclick=async()=>{let p={id:editing>=0?products[editing].id:'product-'+Date.now(),name:$('#fName').value.trim(),description:$('#fDescription').value.trim(),price:+$('#fPrice').value||0,category:$('#fCategory').value,enabled:$('#fStatus').value==='live',sort:+$('#fSort').value||0,badge:$('#fBadge').value.trim(),icon:$('#fIcon').value.trim()||'✦',image:imageData};if(!p.name)return toast('Product name is required');if(editing>=0)products[editing]=p;else products.push(p);await saveAll();closeModal()}
function closeModal(){$('#modalBack').classList.add('hidden');$('#fImage').value=''}$('#closeModal').onclick=$('#cancelModal').onclick=closeModal;$('#addProduct').onclick=()=>openModal(-1);$('#search').oninput=$('#categoryFilter').onchange=$('#statusFilter').onchange=render;
async function loadUsers(){try{users=await api('/api/store/admin/users');$('#usersBox').innerHTML=users.map(u=>`<div class="m-userrow"><div><strong>${esc(u.minecraftUsername||'No Minecraft name')}</strong><br><small>${esc(u.email)}</small></div><select class="m-btn roleSel" data-id="${esc(u.id)}"><option value="customer" ${u.role==='customer'?'selected':''}>Customer</option><option value="editor" ${u.role==='editor'?'selected':''}>Editor</option><option value="manager" ${u.role==='manager'?'selected':''}>Manager</option><option value="owner" ${u.role==='owner'?'selected':''}>Owner</option></select><button class="m-btn saveRole" data-id="${esc(u.id)}">Save</button></div>`).join('');document.querySelectorAll('.saveRole').forEach(b=>b.onclick=async()=>{let s=document.querySelector(`.roleSel[data-id="${b.dataset.id}"]`);await api('/api/store/admin/users/role',{method:'POST',body:JSON.stringify({accountId:b.dataset.id,role:s.value})});toast('Role updated')})}catch(e){$('#usersBox').innerHTML='<p>'+esc(e.message)+'</p>'}}

function orderMoney(n){return '$'+Number(n||0).toFixed(2)}
function orderDate(v){if(!v)return 'Unknown';let d=new Date(v);return isNaN(d)?'Unknown':d.toLocaleString()}
function orderStatus(v,fallback='pending'){return String(v||fallback).toLowerCase()}
function renderOrders(){
  const box=$('#ordersBox'); if(!box)return;
  const q=String($('#orderSearch')?.value||'').trim().toLowerCase();
  const pf=$('#paymentFilter')?.value||'', df=$('#deliveryFilter')?.value||'';
  const list=orders.filter(o=>{
    const hay=[o.id,o.email,o.minecraftUsername,o.productName,o.productNames?.join?.(' ')].join(' ').toLowerCase();
    return (!q||hay.includes(q))&&(!pf||orderStatus(o.paymentStatus)===pf)&&(!df||orderStatus(o.deliveryStatus)===df);
  });
  const paid=orders.filter(o=>orderStatus(o.paymentStatus)==='paid');
  const delivered=orders.filter(o=>orderStatus(o.deliveryStatus)==='delivered').length;
  const pending=orders.filter(o=>orderStatus(o.deliveryStatus)==='pending').length;
  const revenue=paid.reduce((s,o)=>s+Number(o.amount||o.total||0),0);
  $('#orderStats').innerHTML=`<div class="m-stat"><strong>${orders.length}</strong><small>Total Orders</small></div><div class="m-stat"><strong>${pending}</strong><small>Awaiting Delivery</small></div><div class="m-stat"><strong>${delivered}</strong><small>Delivered</small></div><div class="m-stat"><strong>${orderMoney(revenue)}</strong><small>Paid Revenue</small></div>`;
  if(!list.length){box.innerHTML='<div class="m-order-empty">No orders match these filters.</div>';return}
  box.innerHTML=list.map(o=>{
    const products=(o.productNames&&o.productNames.length?o.productNames:[o.productName||'Unknown product']).map(esc).join(', ');
    const pay=orderStatus(o.paymentStatus), del=orderStatus(o.deliveryStatus);
    return `<article class="m-order">
      <div class="m-order-main"><div class="m-order-id"><strong>#${esc(String(o.id||'').slice(0,12))}</strong><small>${esc(orderDate(o.createdAt))}</small></div>
      <div><strong>${esc(o.minecraftUsername||'No Minecraft name')}</strong><small>${esc(o.email||'No email')}</small></div>
      <div><strong>${products}</strong><small>${esc(o.edition||'java').toUpperCase()}</small></div>
      <div class="m-order-total">${orderMoney(o.amount||o.total||0)}</div></div>
      <div class="m-order-controls">
        <label>Payment<select class="m-btn orderPay" data-id="${esc(o.id)}">
          ${['pending','paid','refunded','failed'].map(x=>`<option value="${x}" ${pay===x?'selected':''}>${x[0].toUpperCase()+x.slice(1)}</option>`).join('')}
        </select></label>
        <label>Delivery<select class="m-btn orderDelivery" data-id="${esc(o.id)}">
          ${['pending','delivered','failed'].map(x=>`<option value="${x}" ${del===x?'selected':''}>${x[0].toUpperCase()+x.slice(1)}</option>`).join('')}
        </select></label>
        <button class="m-btn saveOrder" data-id="${esc(o.id)}">Save Status</button>
      </div>
    </article>`;
  }).join('');
  document.querySelectorAll('.saveOrder').forEach(b=>b.onclick=async()=>{
    const id=b.dataset.id;
    const paymentStatus=document.querySelector(`.orderPay[data-id="${CSS.escape(id)}"]`).value;
    const deliveryStatus=document.querySelector(`.orderDelivery[data-id="${CSS.escape(id)}"]`).value;
    try{await api('/api/store/admin/orders/status',{method:'POST',body:JSON.stringify({orderId:id,paymentStatus,deliveryStatus})});toast('Order updated');await loadOrders()}catch(e){toast(e.message)}
  });
}
async function loadOrders(){
  try{orders=await api('/api/store/admin/orders');renderOrders()}
  catch(e){$('#ordersBox').innerHTML='<div class="m-order-empty">'+esc(e.message)+'</div>'}
}

document.querySelectorAll('.m-nav button[data-view]').forEach(b=>b.onclick=async()=>{document.querySelectorAll('.m-nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');let view=b.dataset.view;$('#productsView').classList.toggle('hidden',view!=='products');$('#usersView').classList.toggle('hidden',view!=='users');$('#ordersView').classList.toggle('hidden',view!=='orders');if(view==='users')await loadUsers();if(view==='orders')await loadOrders()});
(async()=>{try{let d=await api('/api/store/me');me=d.account;if(!me){location.replace('/store/?login=1&return=manage');return}let role=(me.role||'customer').toLowerCase();if(!['editor','manager','owner'].includes(role)){location.replace('/store/');return};document.querySelector('[data-view="users"]').style.display=role==='owner'?'':'none';document.querySelector('[data-view="orders"]').style.display=['manager','owner'].includes(role)?'':'none';$('#who').textContent=me.minecraftUsername||me.email;$('#role').textContent=role.toUpperCase();let mcName=String(me.minecraftUsername||'').trim();let head=$('#playerHead');if(mcName){head.src='https://mc-heads.net/avatar/'+encodeURIComponent(mcName)+'/64';head.onerror=()=>{head.style.display='none'}}else{head.style.display='none'};products=await api('/api/store/admin/products');$('#loading').classList.add('hidden');$('#productsView').classList.remove('hidden');render()}catch(e){if(e.status===401)location.replace('/store/?login=1&return=manage');else $('#loading').innerHTML='<h2>'+esc(e.message)+'</h2>'}})();