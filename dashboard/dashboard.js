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
  title:$("title"), description:$("description"), footer:$("footer"), color:$("color"),
  colorPicker:$("colorPicker"), imageEnabled:$("imageEnabled"), buttonsEditor:$("buttonsEditor"),
  previewTitle:$("previewTitle"), previewDescription:$("previewDescription"),
  previewFooter:$("previewFooter"), previewImage:$("previewImage"), previewButtons:$("previewButtons"),
  previewEmbed:$("previewEmbed"), channelSelect:$("channelSelect"), status:$("statusMessage"),
  settingsDialog:$("settingsDialog"), settingsBtn:$("settingsBtn"), apiUrl:$("apiUrl"),
  dashboardKey:$("dashboardKey"), connectBtn:$("connectBtn"), saveBtn:$("saveBtn"),
  sendBtn:$("sendBtn"), connectionLabel:$("connectionLabel")
};

let buttonConfig = structuredClone(DEFAULTS.buttons);

function styleClass(style){
  return {
    Primary:"d-primary",
    Secondary:"d-secondary",
    Success:"d-success",
    Danger:"d-danger"
  }[style] || "d-secondary";
}

function renderButtonEditor(){
  els.buttonsEditor.innerHTML = "";
  buttonConfig.forEach((button, index) => {
    const row = document.createElement("div");
    row.className = "button-row";
    row.innerHTML = `
      <label>Button ${index + 1}
        <input data-index="${index}" data-field="label" maxlength="80" value="${escapeHtml(button.label)}">
      </label>
      <label>Color
        <select data-index="${index}" data-field="style">
          ${["Secondary","Primary","Success","Danger"].map(s => `<option ${s===button.style?"selected":""}>${s}</option>`).join("")}
        </select>
      </label>`;
    els.buttonsEditor.appendChild(row);
  });

  els.buttonsEditor.querySelectorAll("input,select").forEach(el => {
    el.addEventListener("input", () => {
      const i = Number(el.dataset.index);
      buttonConfig[i][el.dataset.field] = el.value;
      renderPreview();
    });
  });
}

function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
}

function getConfig(){
  return {
    title: els.title.value.trim() || DEFAULTS.title,
    description: els.description.value,
    footer: els.footer.value.trim(),
    color: /^#[0-9a-f]{6}$/i.test(els.color.value.trim()) ? els.color.value.trim() : DEFAULTS.color,
    imageEnabled: els.imageEnabled.checked,
    buttons: buttonConfig.map(x => ({...x}))
  };
}

function renderPreview(){
  const cfg = getConfig();
  els.previewTitle.textContent = cfg.title;
  els.previewDescription.textContent = cfg.description.replace(/\*\*/g,"");
  els.previewFooter.textContent = cfg.footer;
  els.previewEmbed.style.borderLeftColor = cfg.color;
  els.previewImage.style.display = cfg.imageEnabled ? "grid" : "none";
  els.previewButtons.innerHTML = "";
  cfg.buttons.forEach(b => {
    const btn = document.createElement("button");
    btn.className = `d-btn ${styleClass(b.style)}`;
    btn.textContent = b.label || "Button";
    els.previewButtons.appendChild(btn);
  });
}

["input","change"].forEach(eventName => {
  [els.title,els.description,els.footer,els.color,els.imageEnabled].forEach(el => el.addEventListener(eventName, renderPreview));
});

els.colorPicker.addEventListener("input", () => {
  els.color.value = els.colorPicker.value.toUpperCase();
  renderPreview();
});
els.color.addEventListener("input", () => {
  if(/^#[0-9a-f]{6}$/i.test(els.color.value.trim())) els.colorPicker.value = els.color.value.trim();
});

function savedConnection(){
  return {
    apiUrl: sessionStorage.getItem("cedarApiUrl") || "",
    key: sessionStorage.getItem("cedarDashboardKey") || ""
  };
}
function headers(){
  const {key} = savedConnection();
  return {"Content-Type":"application/json","X-CedarMC-Dashboard-Key":key};
}
function api(path){
  const {apiUrl} = savedConnection();
  return apiUrl.replace(/\/+$/,"") + path;
}
function status(message,type=""){
  els.status.textContent = message;
  els.status.className = `status-message ${type}`.trim();
}
function setConnected(on){
  const dot = document.querySelector(".sidebar-foot .dot");
  dot.classList.toggle("online",on);
  els.connectionLabel.textContent = on ? "Connected to bot" : "Not connected";
}

async function loadFromBot(){
  const res = await fetch(api("/api/tickets/config"), {headers:headers()});
  if(!res.ok) throw new Error((await res.json().catch(()=>({}))).error || `HTTP ${res.status}`);
  const cfg = await res.json();
  els.title.value = cfg.title ?? DEFAULTS.title;
  els.description.value = cfg.description ?? DEFAULTS.description;
  els.footer.value = cfg.footer ?? DEFAULTS.footer;
  els.color.value = cfg.color ?? DEFAULTS.color;
  els.colorPicker.value = els.color.value;
  els.imageEnabled.checked = cfg.imageEnabled !== false;
  buttonConfig = Array.isArray(cfg.buttons) ? cfg.buttons : structuredClone(DEFAULTS.buttons);
  renderButtonEditor();
  renderPreview();
}

async function loadChannels(){
  const res = await fetch(api("/api/discord/channels"), {headers:headers()});
  if(!res.ok) throw new Error("Could not load Discord channels.");
  const channels = await res.json();
  els.channelSelect.innerHTML = `<option value="">Choose a channel…</option>` +
    channels.map(c => `<option value="${c.id}">#${escapeHtml(c.name)}</option>`).join("");
}

els.settingsBtn.addEventListener("click", () => {
  const c = savedConnection();
  els.apiUrl.value = c.apiUrl;
  els.dashboardKey.value = c.key;
  els.settingsDialog.showModal();
});

els.connectBtn.addEventListener("click", async e => {
  e.preventDefault();
  const url = els.apiUrl.value.trim();
  const key = els.dashboardKey.value.trim();
  if(!url || !key){ status("Enter the API URL and dashboard key.","error"); return; }
  sessionStorage.setItem("cedarApiUrl", url);
  sessionStorage.setItem("cedarDashboardKey", key);
  try{
    status("Connecting…");
    await Promise.all([loadFromBot(),loadChannels()]);
    setConnected(true);
    status("Connected. Ticket settings loaded.","ok");
    els.settingsDialog.close();
  }catch(err){
    setConnected(false);
    status(`Connection failed: ${err.message}`,"error");
  }
});

els.saveBtn.addEventListener("click", async () => {
  try{
    status("Saving…");
    const res = await fetch(api("/api/tickets/config"), {
      method:"POST", headers:headers(), body:JSON.stringify(getConfig())
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    status("Ticket panel settings saved.","ok");
  }catch(err){ status(`Save failed: ${err.message}`,"error"); }
});

els.sendBtn.addEventListener("click", async () => {
  const channelId = els.channelSelect.value;
  if(!channelId){ status("Choose the Discord channel first.","error"); return; }
  try{
    status("Sending panel to Discord…");
    const res = await fetch(api("/api/tickets/send"), {
      method:"POST", headers:headers(), body:JSON.stringify({channelId})
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    status("Ticket panel sent to Discord.","ok");
  }catch(err){ status(`Send failed: ${err.message}`,"error"); }
});

renderButtonEditor();
renderPreview();
