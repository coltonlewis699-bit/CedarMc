const API='https://api.cedarmc.org',$=s=>document.querySelector(s);let products=[],users=[],me=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(p,o={}){const r=await fetch(API+p,{credentials:'include',headers:{'Content-Type':'application/json'},...o});let d={};try{d=await r.json()}catch{}if(!r.ok){const e=new Error(d.error||'Request failed');e.status=r.status;throw e}return d}
function toast(t){const x=$('#toast');x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2200)}
function renderProducts(){
 $('#rows').innerHTML=products.map((p,i)=>`<div class="editrow" data-i="${i}"><input data-k="name" value="${esc(p.name)}" placeholder="Name"><select data-k="category"><option ${p.category==='ranks'?'selected':''}>ranks</option><option ${p.category==='shards'?'selected':''}>shards</option><option ${p.category==='cosmetics'?'selected':''}>cosmetics</option><option ${p.category==='keys'?'selected':''}>keys</option><option ${p.category==='pets'?'selected':''}>pets</option></select><input data-k="price" type="number" step="0.01" value="${Number(p.price||0)}"><input data-k="description" value="${esc(p.description)}" placeholder="Description"><label><input data-k="enabled" type="checkbox" ${p.enabled!==false?'checked':''}> Live</label><input data-k="badge" value="${esc(p.badge)}" placeholder="Badge"><input data-k="icon" value="${esc(p.icon)}" placeholder="Icon"><input data-k="sort" type="number" value="${Number(p.sort||0)}"><button class="account-btn del">Delete</button></div>`).join('');
 document.querySelectorAll('.editrow').forEach(row=>row.querySelectorAll('input,select').forEach(x=>x.oninput=()=>{const i=+row.dataset.i,k=x.dataset.k;products[i][k]=x.type==='checkbox'?x.checked:x.type==='number'?Number(x.value):x.value}));
 document.querySelectorAll('.del').forEach((b,i)=>b.onclick=()=>{products.splice(i,1);renderProducts()});
}
function renderUsers(filter=''){
 const q=filter.trim().toLowerCase(),list=users.filter(u=>!q||String(u.email).toLowerCase().includes(q)||String(u.minecraftUsername||'').toLowerCase().includes(q));
 $('#usersBox').innerHTML=list.map(u=>`<div class="editrow userrow"><div><strong>${esc(u.minecraftUsername||'No Minecraft name')}</strong><br><small>${esc(u.email)}</small></div><select data-user="${esc(u.id)}"><option value="customer" ${u.role==='customer'?'selected':''}>Customer</option><option value="editor" ${u.role==='editor'?'selected':''}>Store Editor</option><option value="manager" ${u.role==='manager'?'selected':''}>Store Manager</option><option value="owner" ${u.role==='owner'?'selected':''}>Owner</option></select><button class="account-btn save-role" data-user="${esc(u.id)}">Save Role</button></div>`).join('');
 document.querySelectorAll('.save-role').forEach(b=>b.onclick=async()=>{try{const id=b.dataset.user,sel=document.querySelector(`select[data-user="${id}"]`);await api('/api/store/admin/users/role',{method:'POST',body:JSON.stringify({accountId:id,role:sel.value})});toast('User role updated');await loadUsers()}catch(e){toast(e.message)}});
}
async function loadUsers(){users=await api('/api/store/admin/users');renderUsers($('#userSearch')?.value||'')}
async function start(){
 try{
   // This is the ONLY login check. No management login form exists.
   const d=await api('/api/store/me'); me=d.account;
   if(!me){location.replace('/store/?login=1');return}
   const role=String(me.role||'customer').toLowerCase();
   if(!['editor','manager','owner'].includes(role)){
     $('#statusCard').innerHTML='<h2>Store Management</h2><p>Your CedarMC account does not have store management permission.</p><a class="account-btn" href="/store/">Return to Store</a>';return;
   }
   products=await api('/api/store/admin/products');
   $('#statusCard').classList.add('hidden');$('#editor').classList.remove('hidden');renderProducts();
   if(role==='owner'){$('#usersSection').classList.remove('hidden');await loadUsers();$('#userSearch').oninput=e=>renderUsers(e.target.value)}
 }catch(e){
   if(e.status===401){location.replace('/store/?login=1&return=manage');return}
   $('#statusCard').innerHTML='<h2>Could not open Store Management</h2><p>'+esc(e.message)+'</p><a class="account-btn" href="/store/">Return to Store</a>';
 }
}
$('#add').onclick=()=>{products.push({id:'product-'+Date.now(),category:'ranks',name:'New Product',price:0,icon:'✦',badge:'NEW',description:'',enabled:false,sort:products.length*10});renderProducts()};
$('#save').onclick=async()=>{try{products=await api('/api/store/admin/products',{method:'POST',body:JSON.stringify({products})});renderProducts();toast('Store saved')}catch(e){if(e.status===401){location.replace('/store/?login=1&return=manage');return}toast(e.message)}};
start();
