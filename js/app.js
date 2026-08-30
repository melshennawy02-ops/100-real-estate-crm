/* =========================================================
   100% Real Estate CRM — App logic
   ========================================================= */

let CURRENT_USER = null;
let LEADS = [];
let TASKS = [];
let currentView = "dashboard";
let leadsUnsub = null, tasksUnsub = null;

const STATUSES = ["new","contacted","qualified","negotiation","won","lost"];
const PIPELINE_STATUSES = ["new","contacted","qualified","negotiation","won"];

/* ---------- Auth guard ---------- */
const authTimeout = setTimeout(() => {
  const fallback = document.getElementById("loadingFallback");
  if (fallback) fallback.style.display = "block";
}, 10000);

auth.onAuthStateChanged(user => {
  clearTimeout(authTimeout);
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  CURRENT_USER = user;
  document.getElementById("userName").textContent = user.email.split("@")[0];
  document.getElementById("userEmail").textContent = user.email;
  document.getElementById("userAvatar").textContent = user.email.charAt(0).toUpperCase();

  document.getElementById("loadingScreen").style.display = "none";
  document.getElementById("appShell").style.display = "flex";

  subscribeData();
  initRouter();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut().then(() => window.location.href = "index.html");
});

document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

/* ---------- Firestore live subscriptions ---------- */
function subscribeData(){
  leadsUnsub = db.collection("leads").orderBy("createdAt","desc")
    .onSnapshot(snap => {
      LEADS = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      renderView();
    }, err => console.error("leads snapshot error", err));

  tasksUnsub = db.collection("tasks").orderBy("due","asc")
    .onSnapshot(snap => {
      TASKS = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      renderView();
    }, err => console.error("tasks snapshot error", err));
}

/* ---------- Router ---------- */
function initRouter(){
  window.addEventListener("hashchange", handleRoute);
  handleRoute();

  document.querySelectorAll(".nav-item").forEach(el => {
    el.addEventListener("click", () => {
      document.getElementById("sidebar").classList.remove("open");
    });
  });
}

function handleRoute(){
  const hash = window.location.hash.replace("#","") || "dashboard";
  currentView = ["dashboard","leads","pipeline","tasks","reports"].includes(hash) ? hash : "dashboard";
  document.querySelectorAll(".nav-item").forEach(el => {
    el.classList.toggle("active", el.dataset.view === currentView);
  });
  renderView();
}

document.addEventListener("langchange", () => renderView());

function renderView(){
  const title = document.getElementById("pageTitle");
  const sub = document.getElementById("pageSub");
  const actions = document.getElementById("topbarActions");
  actions.innerHTML = "";

  if (currentView === "dashboard") {
    title.textContent = t("dash_title"); sub.textContent = t("dash_sub");
    renderDashboard();
  } else if (currentView === "leads") {
    title.textContent = t("leads_title"); sub.textContent = t("leads_sub");
    actions.innerHTML = `<button class="btn-gold" id="btnAddLead">+ <span>${t("add_lead")}</span></button>`;
    document.getElementById("btnAddLead").addEventListener("click", () => openLeadModal());
    renderLeads();
  } else if (currentView === "pipeline") {
    title.textContent = t("pipeline_title"); sub.textContent = t("pipeline_sub");
    renderPipeline();
  } else if (currentView === "tasks") {
    title.textContent = t("tasks_title"); sub.textContent = t("tasks_sub");
    actions.innerHTML = `<button class="btn-gold" id="btnAddTask">+ <span>${t("add_task")}</span></button>`;
    document.getElementById("btnAddTask").addEventListener("click", () => openTaskModal());
    renderTasks();
  } else if (currentView === "reports") {
    title.textContent = t("reports_title"); sub.textContent = t("reports_sub");
    renderReports();
  }
}

/* ---------- Helpers ---------- */
function toast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2400);
}

function fmtDate(v){
  if (!v) return "—";
  const d = v.seconds ? new Date(v.seconds * 1000) : new Date(v);
  return d.toLocaleDateString(getLang() === "ar" ? "ar-EG" : "en-GB", { day:"2-digit", month:"short", year:"numeric" });
}

function isOverdue(dueStr){
  if (!dueStr) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(dueStr) < today;
}
function isToday(dueStr){
  if (!dueStr) return false;
  const today = new Date().toISOString().slice(0,10);
  return dueStr === today;
}

/* =========================================================
   DASHBOARD
   ========================================================= */
function renderDashboard(){
  const totalLeads = LEADS.length;
  const openDeals = LEADS.filter(l => ["contacted","qualified","negotiation"].includes(l.status)).length;
  const now = new Date();
  const wonMonth = LEADS.filter(l => {
    if (l.status !== "won" || !l.createdAt) return false;
    const d = l.createdAt.seconds ? new Date(l.createdAt.seconds*1000) : new Date(l.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const followupsToday = TASKS.filter(tk => isToday(tk.due) && !tk.done).length;

  const recent = LEADS.slice(0,5);
  const todaysTasks = TASKS.filter(tk => !tk.done).slice(0,5);

  document.getElementById("content").innerHTML = `
    <div class="stat-grid">
      ${statCard(t("stat_total_leads"), totalLeads)}
      ${statCard(t("stat_open_deals"), openDeals)}
      ${statCard(t("stat_won_month"), wonMonth)}
      ${statCard(t("stat_followups_today"), followupsToday)}
    </div>
    <div class="panel">
      <div class="panel-head"><h2>${t("recent_leads")}</h2><a href="#leads" style="font-size:12px;color:var(--gold-bright);">${t("view_all")}</a></div>
      ${recent.length ? leadsTable(recent, true) : emptyState(t("empty_leads_title"), t("empty_leads_sub"))}
    </div>
    <div class="panel">
      <div class="panel-head"><h2>${t("today_tasks")}</h2><a href="#tasks" style="font-size:12px;color:var(--gold-bright);">${t("view_all")}</a></div>
      ${todaysTasks.length ? todaysTasks.map(taskItem).join("") : emptyState(t("empty_tasks_title"), t("empty_tasks_sub"))}
    </div>
  `;
}

function statCard(label, value){
  return `<div class="stat-card"><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div>`;
}
function emptyState(title, sub){
  return `<div class="empty-state"><span class="ring-mark" style="display:inline-block;"></span><div style="font-weight:700;color:var(--ivory);">${title}</div><p>${sub}</p></div>`;
}

/* =========================================================
   LEADS
   ========================================================= */
function renderLeads(){
  document.getElementById("content").innerHTML = `
    <div class="panel">
      <div class="panel-head" style="gap:12px; flex-wrap:wrap;">
        <input type="text" id="leadSearch" placeholder="${t('search_placeholder')}"
          style="flex:1; min-width:200px; background:rgba(3,8,20,.55); border:1px solid var(--navy-line); color:var(--ivory); padding:10px 14px; border-radius:8px; font-size:13px; outline:none;">
        <select id="leadFilter" style="background:rgba(3,8,20,.55); border:1px solid var(--navy-line); color:var(--ivory); padding:10px 14px; border-radius:8px; font-size:13px;">
          <option value="all">${t("filter_all")}</option>
          ${STATUSES.map(s => `<option value="${s}">${t('status_'+s)}</option>`).join("")}
        </select>
      </div>
      <div id="leadsTableWrap" style="margin-top:16px;">
        ${LEADS.length ? leadsTable(LEADS) : emptyState(t("empty_leads_title"), t("empty_leads_sub"))}
      </div>
    </div>
  `;

  document.getElementById("leadSearch").addEventListener("input", filterLeadsView);
  document.getElementById("leadFilter").addEventListener("change", filterLeadsView);

  bindLeadRowEvents();
}

function filterLeadsView(){
  const q = document.getElementById("leadSearch").value.trim().toLowerCase();
  const status = document.getElementById("leadFilter").value;
  let filtered = LEADS.filter(l =>
    (!q || (l.name||"").toLowerCase().includes(q) || (l.phone||"").includes(q)) &&
    (status === "all" || l.status === status)
  );
  document.getElementById("leadsTableWrap").innerHTML = filtered.length ? leadsTable(filtered) : emptyState(t("empty_leads_title"), t("empty_leads_sub"));
  bindLeadRowEvents();
}

function leadsTable(list, compact){
  return `
  <table>
    <thead><tr>
      <th>${t("col_name")}</th><th>${t("col_phone")}</th>
      ${compact ? "" : `<th>${t("col_interest")}</th>`}
      <th>${t("col_status")}</th><th>${t("col_rating")}</th>
      ${compact ? "" : `<th>${t("col_actions")}</th>`}
    </tr></thead>
    <tbody>
      ${list.map(l => `
        <tr>
          <td>${escapeHtml(l.name||"")}</td>
          <td>${escapeHtml(l.phone||"")}</td>
          ${compact ? "" : `<td>${escapeHtml(l.interest||"—")}</td>`}
          <td><span class="badge ${l.status}">${t('status_'+l.status)}</span></td>
          <td><span class="badge ${l.rating}">${t('rating_'+l.rating)}</span></td>
          ${compact ? "" : `
          <td class="row-actions">
            <button class="icon-btn" data-edit="${l.id}" title="${t('save')}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
            <button class="icon-btn" data-delete="${l.id}" title="${t('delete')}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
            </button>
          </td>`}
        </tr>
      `).join("")}
    </tbody>
  </table>`;
}

function bindLeadRowEvents(){
  document.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => openLeadModal(btn.dataset.edit));
  });
  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => deleteLead(btn.dataset.delete));
  });
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---- Lead modal ---- */
function openLeadModal(id){
  const modal = document.getElementById("leadModal");
  const form = document.getElementById("leadForm");
  form.reset();
  document.getElementById("leadId").value = id || "";
  document.getElementById("leadModalTitle").textContent = id ? t("modal_edit_lead") : t("modal_add_lead");

  if (id) {
    const lead = LEADS.find(l => l.id === id);
    if (lead) {
      document.getElementById("leadName").value = lead.name || "";
      document.getElementById("leadPhone").value = lead.phone || "";
      document.getElementById("leadEmail").value = lead.email || "";
      document.getElementById("leadInterest").value = lead.interest || "";
      document.getElementById("leadBudget").value = lead.budget || "";
      document.getElementById("leadSource").value = lead.source || "facebook";
      document.getElementById("leadStatus").value = lead.status || "new";
      document.getElementById("leadRating").value = lead.rating || "warm";
      document.getElementById("leadNotes").value = lead.notes || "";
    }
  }
  modal.classList.add("show");
}

document.getElementById("leadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("leadId").value;
  const data = {
    name: document.getElementById("leadName").value.trim(),
    phone: document.getElementById("leadPhone").value.trim(),
    email: document.getElementById("leadEmail").value.trim(),
    interest: document.getElementById("leadInterest").value.trim(),
    budget: document.getElementById("leadBudget").value.trim(),
    source: document.getElementById("leadSource").value,
    status: document.getElementById("leadStatus").value,
    rating: document.getElementById("leadRating").value,
    notes: document.getElementById("leadNotes").value.trim(),
    agentId: CURRENT_USER.uid,
    agentEmail: CURRENT_USER.email,
  };

  try {
    if (id) {
      await db.collection("leads").doc(id).update(data);
      toast(t("toast_updated"));
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection("leads").add(data);
      toast(t("toast_saved"));
    }
    closeModal("leadModal");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
});

async function deleteLead(id){
  if (!confirm(t("confirm_delete"))) return;
  await db.collection("leads").doc(id).delete();
  toast(t("toast_deleted"));
}

/* =========================================================
   PIPELINE
   ========================================================= */
function renderPipeline(){
  const cols = PIPELINE_STATUSES.map(status => {
    const items = LEADS.filter(l => l.status === status);
    return `
      <div class="pipe-col" data-status="${status}">
        <div class="pipe-col-head"><span>${t('status_'+status)}</span><span class="count">${items.length}</span></div>
        <div class="pipe-col-body" data-status="${status}">
          ${items.map(l => `
            <div class="pipe-card" draggable="true" data-id="${l.id}">
              <div class="pipe-card-name">${escapeHtml(l.name||"")}</div>
              <div class="pipe-card-meta">${escapeHtml(l.interest||"—")} · ${escapeHtml(l.phone||"")}</div>
              <div class="pipe-card-value">${escapeHtml(l.budget||"—")}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");

  document.getElementById("content").innerHTML = `<div class="pipeline-board">${cols}</div>`;
  bindPipelineDrag();
}

function bindPipelineDrag(){
  let draggedId = null;

  document.querySelectorAll(".pipe-card").forEach(card => {
    card.addEventListener("dragstart", () => {
      draggedId = card.dataset.id;
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
  });

  document.querySelectorAll(".pipe-col").forEach(col => {
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      col.classList.add("drag-over");
    });
    col.addEventListener("dragleave", () => col.classList.remove("drag-over"));
    col.addEventListener("drop", async (e) => {
      e.preventDefault();
      col.classList.remove("drag-over");
      const newStatus = col.dataset.status;
      if (draggedId && newStatus) {
        await db.collection("leads").doc(draggedId).update({ status:newStatus });
        toast(t("toast_updated"));
      }
    });
  });
}

/* =========================================================
   TASKS
   ========================================================= */
function renderTasks(){
  const sorted = [...TASKS].sort((a,b) => (a.done - b.done) || (new Date(a.due) - new Date(b.due)));
  document.getElementById("content").innerHTML = `
    <div class="panel">
      ${sorted.length ? sorted.map(taskItem).join("") : emptyState(t("empty_tasks_title"), t("empty_tasks_sub"))}
    </div>
  `;
  bindTaskEvents();
}

function taskItem(tk){
  const lead = LEADS.find(l => l.id === tk.leadId);
  const overdue = !tk.done && isOverdue(tk.due);
  return `
    <div class="task-item">
      <div class="task-check ${tk.done ? 'done':''}" data-toggle="${tk.id}" data-done="${tk.done}">
        ${tk.done ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>' : ''}
      </div>
      <div class="task-body">
        <div class="task-title ${tk.done ? 'done':''}">${escapeHtml(tk.title||"")}</div>
        <div class="task-meta ${overdue ? 'overdue':''}">
          ${lead ? escapeHtml(lead.name)+" · " : ""}${t('type_'+(tk.type||'call'))} · ${overdue ? t('overdue')+" · " : ""}${fmtDate(tk.due)}
        </div>
      </div>
      <button class="icon-btn" data-delete-task="${tk.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
      </button>
    </div>
  `;
}

function bindTaskEvents(){
  document.querySelectorAll("[data-toggle]").forEach(el => {
    el.addEventListener("click", async () => {
      const done = el.dataset.done === "true";
      await db.collection("tasks").doc(el.dataset.toggle).update({ done: !done });
    });
  });
  document.querySelectorAll("[data-delete-task]").forEach(el => {
    el.addEventListener("click", async () => {
      if (!confirm(t("confirm_delete"))) return;
      await db.collection("tasks").doc(el.dataset.deleteTask).delete();
      toast(t("toast_deleted"));
    });
  });
}

function openTaskModal(){
  const select = document.getElementById("taskLead");
  select.innerHTML = LEADS.map(l => `<option value="${l.id}">${escapeHtml(l.name)}</option>`).join("");
  document.getElementById("taskForm").reset();
  document.getElementById("taskDue").value = new Date().toISOString().slice(0,10);
  document.getElementById("taskModal").classList.add("show");
}

document.getElementById("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    title: document.getElementById("taskTitle").value.trim(),
    leadId: document.getElementById("taskLead").value || null,
    type: document.getElementById("taskType").value,
    due: document.getElementById("taskDue").value,
    done: false,
    agentId: CURRENT_USER.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  await db.collection("tasks").add(data);
  toast(t("toast_saved"));
  closeModal("taskModal");
});

/* =========================================================
   REPORTS
   ========================================================= */
function renderReports(){
  const byStatus = {};
  STATUSES.forEach(s => byStatus[s] = 0);
  LEADS.forEach(l => { if (byStatus[l.status] !== undefined) byStatus[l.status]++; });

  const bySource = {};
  LEADS.forEach(l => { const s = l.source || "other"; bySource[s] = (bySource[s]||0)+1; });

  const byAgent = {};
  LEADS.forEach(l => { const a = l.agentEmail || "—"; byAgent[a] = (byAgent[a]||0)+1; });

  document.getElementById("content").innerHTML = `
    <div class="panel">
      <div class="panel-head"><h2>${t("by_status")}</h2></div>
      ${barList(Object.entries(byStatus).map(([k,v]) => [t('status_'+k), v]))}
    </div>
    <div class="panel">
      <div class="panel-head"><h2>${t("by_source")}</h2></div>
      ${barList(Object.entries(bySource).map(([k,v]) => [t('source_'+k) || k, v]))}
    </div>
    <div class="panel">
      <div class="panel-head"><h2>${t("by_agent")}</h2></div>
      ${barList(Object.entries(byAgent))}
    </div>
  `;
}

function barList(pairs){
  const max = Math.max(1, ...pairs.map(p => p[1]));
  if (!pairs.length || pairs.every(p => p[1] === 0)) return emptyState(t("empty_leads_title"), t("empty_leads_sub"));
  return pairs.map(([label,val]) => `
    <div style="margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:6px;">
        <span style="color:var(--ivory); font-weight:600;">${escapeHtml(label)}</span>
        <span style="color:var(--gold-bright); font-weight:800;">${val}</span>
      </div>
      <div style="height:8px; background:rgba(255,255,255,.06); border-radius:6px; overflow:hidden;">
        <div style="height:100%; width:${(val/max*100)}%; background:linear-gradient(90deg, var(--gold), var(--gold-bright)); border-radius:6px;"></div>
      </div>
    </div>
  `).join("");
}

/* =========================================================
   MODAL utility
   ========================================================= */
function closeModal(id){
  document.getElementById(id).classList.remove("show");
}
document.querySelectorAll("[data-close-modal]").forEach(btn => {
  btn.addEventListener("click", () => closeModal(btn.dataset.closeModal));
});
document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) backdrop.classList.remove("show");
  });
});
