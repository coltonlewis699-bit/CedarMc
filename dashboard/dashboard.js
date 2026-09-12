const API = "https://api.cedarmc.org";
const DEFAULTS = {
  title: "CEDARMC SUPPORT",
  description: "**Need help?** Open a ticket below and our staff will be with you as soon as possible.\n\nChoose the option that best matches your request.\n\n**Tickets are private.** Only you, added members, and our staff can see your ticket.",
  footer: "CedarMC Support",
  color: "#0B3D2E",
  imageEnabled: true,
  buttons: [
    { id: "ticket_support", label: "Support", style: "Secondary" },
    { id: "ticket_purchase", label: "Purchase Help", style: "Secondary" },
    { id: "ticket_report", label: "Player Report", style: "Danger" },
    { id: "ticket_other", label: "Other", style: "Secondary" }
  ]
};
const $ = id => document.getElementById(id);
const els = {
  loginScreen:$("loginScreen"), app:$("app"), loginBtn:$("loginBtn"), loginMessage:$("loginMessage"),
  profileBtn:$("profileBtn"), profileMenu:$("profileMenu"), profileAvatar:$("profileAvatar"), profileName:$("profileName"), profileRole:$("profileRole"), menuName:$("menuName"), menuUsername:$("menuUsername"), logoutBtn:$("logoutBtn"),
  ticketsView:$("ticketsView"), auditView:$("auditView"), auditNav:$("auditNav"), refreshAuditBtn:$("refreshAuditBtn"), auditList:$("auditList"),
  title:$("title"), description:$("description"), footer:$("footer"), color:$("color"), colorPicker:$("colorPicker"), imageEnabled:$("imageEnabled"), buttonsEditor:$("buttonsEditor"),
  previewTitle:$("previewTitle"), previewDescription:$("previewDescription"), previewFooter:$("previewFooter"), previewImage:$("previewImage"), previewButtons:$("previewButtons"), previewEmbed:$("previewEmbed"), channelSelect:$("channelSelect"), status:$("statusMessage"), saveBtn:$("saveBtn"), sendBtn:$("sendBtn")
};
let buttonConfig = structuredClone(DEFAULTS.buttons);

function escapeHtml(value=""){ return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]); }
function styleClass(style){ return {Primary:"d-primary",Secondary:"d-secondary",Success:"d-success",Danger:"d-danger"}[style] || "d-secondary"; }
function request(path, options={}){ return fetch(API + path, {credentials:"include", ...options, headers:{"Content-Type":"application/json", ...(options.headers||{})}}); }
function status(message,type=""){ els.status.textContent=message; els.status.className=`status-message ${type}`.trim(); }

function renderButtonEditor(){
  els.buttonsEditor.innerHTML="";
  buttonConfig.forEach((button,index)=>{
    const row=document.createElement("div"); row.className="button-row";
    row.innerHTML=`<label>Button ${index+1}<input data-index="${index}" data-field="label" maxlength="80" value="${escapeHtml(button.label)}"></label><label>Color<select data-index="${index}" data-field="style">${["Secondary","Primary","Success","Danger"].map(s=>`<option ${s===button.style?"selected":""}>${s}</option>`).join("")}</select></label>`;
    els.buttonsEditor.appendChild(row);
  });
  els.buttonsEditor.querySelectorAll("input,select").forEach(el=>el.addEventListener("input",()=>{ const i=Number(el.dataset.index); buttonConfig[i][el.dataset.field]=el.value; renderPreview(); }));
}
function getConfig(){ return {title:els.title.value.trim()||DEFAULTS.title,description:els.description.value,footer:els.footer.value.trim(),color:/^#[0-9a-f]{6}$/i.test(els.color.value.trim())?els.color.value.trim():DEFAULTS.color,imageEnabled:els.imageEnabled.checked,buttons:buttonConfig.map(x=>({...x}))}; }
function renderPreview(){ const cfg=getConfig(); els.previewTitle.textContent=cfg.title; els.previewDescription.textContent=cfg.description.replace(/\*\*/g,""); els.previewFooter.textContent=cfg.footer; els.previewEmbed.style.borderLeftColor=cfg.color; els.previewImage.style.display=cfg.imageEnabled?"grid":"none"; els.previewButtons.innerHTML=""; cfg.buttons.forEach(b=>{const btn=document.createElement("button");btn.className=`d-btn ${styleClass(b.style)}`;btn.textContent=b.label||"Button";els.previewButtons.appendChild(btn);}); }

async function loadConfig(){ const res=await request("/api/tickets/config"); if(!res.ok) throw new Error((await res.json().catch(()=>({}))).error||`HTTP ${res.status}`); const cfg=await res.json(); els.title.value=cfg.title??DEFAULTS.title; els.description.value=cfg.description??DEFAULTS.description; els.footer.value=cfg.footer??DEFAULTS.footer; els.color.value=cfg.color??DEFAULTS.color; els.colorPicker.value=els.color.value; els.imageEnabled.checked=cfg.imageEnabled!==false; buttonConfig=Array.isArray(cfg.buttons)?cfg.buttons:structuredClone(DEFAULTS.buttons); renderButtonEditor();renderPreview(); }
async function loadChannels(){ const res=await request("/api/discord/channels"); if(!res.ok) throw new Error("Could not load Discord channels."); const channels=await res.json(); els.channelSelect.innerHTML=`<option value="">Choose a channel…</option>`+channels.map(c=>`<option value="${c.id}">#${escapeHtml(c.name)}</option>`).join(""); }

function setProfile(user){ els.profileAvatar.src=user.avatarUrl||""; els.profileName.textContent=user.displayName||user.username; els.profileRole.textContent=user.permissions?.guildOwner?"Server Owner":(user.roles?.[0]||"CedarMC Staff"); els.menuName.textContent=user.displayName||user.username; els.menuUsername.textContent=`@${user.username}`; }
async function initAuth(){
  const params=new URLSearchParams(location.search); const auth=params.get("auth"); const reason=params.get("reason");
  if(auth){ history.replaceState({},"",location.pathname+location.hash); if(auth==="denied") els.loginMessage.textContent=reason||"Your Discord account does not have dashboard access."; else if(auth==="failed") els.loginMessage.textContent="Discord login failed. Please try again."; }
  try{
    const res=await request("/api/auth/me");
    if(!res.ok) throw new Error("Not signed in");
    const data=await res.json(); setProfile(data.user); els.loginScreen.classList.add("hidden"); els.app.classList.remove("hidden"); await Promise.all([loadConfig(),loadChannels()]);
  }catch{ els.loginScreen.classList.remove("hidden"); els.app.classList.add("hidden"); }
}

async function loadAudit(){
  els.auditList.innerHTML='<div class="audit-empty">Loading audit log…</div>';
  const res=await request("/api/audit?limit=75");
  if(!res.ok){ els.auditList.innerHTML='<div class="audit-empty">Could not load audit log.</div>'; return; }
  const entries=await res.json();
  if(!entries.length){ els.auditList.innerHTML='<div class="audit-empty">No dashboard actions logged yet.</div>'; return; }
  els.auditList.innerHTML=entries.map(entry=>{
    const when=new Date(entry.timestamp).toLocaleString();
    const avatar=entry.actor?.avatarUrl?`<img src="${escapeHtml(entry.actor.avatarUrl)}" alt="">`:'<div class="audit-avatar-fallback">▲</div>';
    return `<div class="audit-row">${avatar}<div><strong>${escapeHtml(entry.actor?.displayName||entry.actor?.username||"System")}</strong><span>${escapeHtml(entry.action)}</span><small>${escapeHtml(when)}</small></div></div>`;
  }).join("");
}

["input","change"].forEach(ev=>[els.title,els.description,els.footer,els.color,els.imageEnabled].forEach(el=>el.addEventListener(ev,renderPreview)));
els.colorPicker.addEventListener("input",()=>{els.color.value=els.colorPicker.value.toUpperCase();renderPreview();});
els.color.addEventListener("input",()=>{if(/^#[0-9a-f]{6}$/i.test(els.color.value.trim()))els.colorPicker.value=els.color.value.trim();});
els.loginBtn.addEventListener("click",()=>{location.href=API+"/auth/discord/login";});
els.profileBtn.addEventListener("click",()=>els.profileMenu.classList.toggle("hidden"));
document.addEventListener("click",e=>{if(!e.target.closest(".profile-wrap"))els.profileMenu.classList.add("hidden");});
els.logoutBtn.addEventListener("click",async()=>{await request("/auth/logout",{method:"POST",body:"{}"}).catch(()=>{});location.reload();});
els.auditNav.addEventListener("click",async e=>{e.preventDefault();document.querySelectorAll(".nav-link").forEach(x=>x.classList.remove("active"));els.auditNav.classList.add("active");els.ticketsView.classList.add("hidden");els.auditView.classList.remove("hidden");await loadAudit();});
document.querySelector('a[href="#tickets"]').addEventListener("click",e=>{e.preventDefault();document.querySelectorAll(".nav-link").forEach(x=>x.classList.remove("active"));e.currentTarget.classList.add("active");els.auditView.classList.add("hidden");els.ticketsView.classList.remove("hidden");});
els.refreshAuditBtn.addEventListener("click",loadAudit);
els.saveBtn.addEventListener("click",async()=>{try{status("Saving…");const res=await request("/api/tickets/config",{method:"POST",body:JSON.stringify(getConfig())});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||`HTTP ${res.status}`);status("Ticket panel settings saved.","ok");}catch(err){status(`Save failed: ${err.message}`,"error");}});
els.sendBtn.addEventListener("click",async()=>{const channelId=els.channelSelect.value;if(!channelId){status("Choose the Discord channel first.","error");return;}try{status("Sending panel to Discord…");const res=await request("/api/tickets/send",{method:"POST",body:JSON.stringify({channelId})});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||`HTTP ${res.status}`);status("Ticket panel sent to Discord.","ok");}catch(err){status(`Send failed: ${err.message}`,"error");}});
renderButtonEditor();renderPreview();initAuth();
