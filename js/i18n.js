/* =========================================================
   i18n — Arabic (RTL) / English (LTR) toggle
   ========================================================= */
const I18N = {
  ar: {
    dir: "rtl",
    brand: "100%",
    brandSub: "ريل استيت",
    login_title: "تسجيل الدخول",
    login_email: "البريد الإلكتروني",
    login_password: "كلمة المرور",
    login_btn: "دخول",
    login_error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    login_foot: "نظام إدارة علاقات العملاء — 100% ريل إستيت",

    nav_dashboard: "الرئيسية",
    nav_leads: "العملاء المحتملين",
    nav_pipeline: "مسار الصفقات",
    nav_tasks: "المهام والمتابعات",
    nav_reports: "التقارير",
    logout: "تسجيل الخروج",

    dash_title: "الرئيسية",
    dash_sub: "نظرة عامة على أداء اليوم",
    stat_total_leads: "إجمالي العملاء المحتملين",
    stat_open_deals: "صفقات مفتوحة",
    stat_won_month: "صفقات مغلقة هذا الشهر",
    stat_followups_today: "متابعات اليوم",
    recent_leads: "أحدث العملاء المحتملين",
    today_tasks: "مهام اليوم",
    view_all: "عرض الكل",

    leads_title: "العملاء المحتملين",
    leads_sub: "إدارة جهات الاتصال والعملاء المحتملين",
    add_lead: "إضافة عميل محتمل",
    search_placeholder: "ابحث بالاسم أو رقم الهاتف...",
    filter_all: "الكل",
    col_name: "الاسم",
    col_phone: "الهاتف",
    col_interest: "الاهتمام",
    col_status: "الحالة",
    col_rating: "التقييم",
    col_agent: "الموظف المسؤول",
    col_actions: "إجراءات",
    empty_leads_title: "لا يوجد عملاء محتملين بعد",
    empty_leads_sub: "ابدأ بإضافة أول عميل محتمل لمتابعته",

    status_new: "جديد",
    status_contacted: "تم التواصل",
    status_qualified: "مؤهل",
    status_negotiation: "تفاوض",
    status_won: "تم الإغلاق",
    status_lost: "خسارة",

    rating_hot: "ساخن",
    rating_warm: "دافئ",
    rating_cold: "بارد",

    modal_add_lead: "إضافة عميل محتمل",
    modal_edit_lead: "تعديل بيانات العميل",
    f_name: "الاسم الكامل",
    f_phone: "رقم الهاتف",
    f_email: "البريد الإلكتروني",
    f_interest: "نوع العقار / الاهتمام",
    f_budget: "الميزانية",
    f_source: "مصدر العميل",
    f_status: "الحالة",
    f_rating: "التقييم",
    f_notes: "ملاحظات",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",

    source_facebook: "فيسبوك",
    source_website: "الموقع الإلكتروني",
    source_referral: "توصية",
    source_walkin: "زيارة مباشرة",
    source_call: "مكالمة",
    source_other: "أخرى",

    pipeline_title: "مسار الصفقات",
    pipeline_sub: "اسحب البطاقات بين المراحل لتحديث حالة الصفقة",

    tasks_title: "المهام والمتابعات",
    tasks_sub: "لا تفوت متابعة أي عميل",
    add_task: "إضافة مهمة",
    modal_add_task: "إضافة مهمة متابعة",
    f_task_title: "عنوان المهمة",
    f_task_lead: "متعلقة بالعميل",
    f_task_due: "تاريخ الاستحقاق",
    f_task_type: "نوع المهمة",
    type_call: "مكالمة",
    type_visit: "زيارة",
    type_email: "بريد إلكتروني",
    type_meeting: "اجتماع",
    empty_tasks_title: "لا توجد مهام",
    empty_tasks_sub: "أضف مهمة متابعة جديدة",
    overdue: "متأخرة",
    due_today: "اليوم",

    reports_title: "التقارير",
    reports_sub: "أداء المبيعات والفريق",
    by_status: "توزيع العملاء حسب الحالة",
    by_source: "توزيع العملاء حسب المصدر",
    by_agent: "أداء الموظفين",

    confirm_delete: "هل أنت متأكد من الحذف؟",
    toast_saved: "تم الحفظ بنجاح",
    toast_deleted: "تم الحذف",
    toast_updated: "تم التحديث",
  },

  en: {
    dir: "ltr",
    brand: "100%",
    brandSub: "REAL ESTATE",
    login_title: "Sign In",
    login_email: "Email",
    login_password: "Password",
    login_btn: "Sign In",
    login_error: "Invalid email or password",
    login_foot: "Customer Relationship System — 100% Real Estate",

    nav_dashboard: "Dashboard",
    nav_leads: "Leads",
    nav_pipeline: "Pipeline",
    nav_tasks: "Tasks & Follow-ups",
    nav_reports: "Reports",
    logout: "Logout",

    dash_title: "Dashboard",
    dash_sub: "Today's performance overview",
    stat_total_leads: "Total Leads",
    stat_open_deals: "Open Deals",
    stat_won_month: "Closed This Month",
    stat_followups_today: "Follow-ups Today",
    recent_leads: "Recent Leads",
    today_tasks: "Today's Tasks",
    view_all: "View all",

    leads_title: "Leads",
    leads_sub: "Manage contacts and leads",
    add_lead: "Add Lead",
    search_placeholder: "Search by name or phone...",
    filter_all: "All",
    col_name: "Name",
    col_phone: "Phone",
    col_interest: "Interest",
    col_status: "Status",
    col_rating: "Rating",
    col_agent: "Agent",
    col_actions: "Actions",
    empty_leads_title: "No leads yet",
    empty_leads_sub: "Start by adding your first lead to follow up on",

    status_new: "New",
    status_contacted: "Contacted",
    status_qualified: "Qualified",
    status_negotiation: "Negotiation",
    status_won: "Won",
    status_lost: "Lost",

    rating_hot: "Hot",
    rating_warm: "Warm",
    rating_cold: "Cold",

    modal_add_lead: "Add Lead",
    modal_edit_lead: "Edit Lead",
    f_name: "Full Name",
    f_phone: "Phone Number",
    f_email: "Email",
    f_interest: "Property Type / Interest",
    f_budget: "Budget",
    f_source: "Lead Source",
    f_status: "Status",
    f_rating: "Rating",
    f_notes: "Notes",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",

    source_facebook: "Facebook",
    source_website: "Website",
    source_referral: "Referral",
    source_walkin: "Walk-in",
    source_call: "Phone Call",
    source_other: "Other",

    pipeline_title: "Pipeline",
    pipeline_sub: "Drag cards between stages to update deal status",

    tasks_title: "Tasks & Follow-ups",
    tasks_sub: "Never miss a follow-up",
    add_task: "Add Task",
    modal_add_task: "Add Follow-up Task",
    f_task_title: "Task Title",
    f_task_lead: "Related Lead",
    f_task_due: "Due Date",
    f_task_type: "Task Type",
    type_call: "Call",
    type_visit: "Visit",
    type_email: "Email",
    type_meeting: "Meeting",
    empty_tasks_title: "No tasks",
    empty_tasks_sub: "Add a new follow-up task",
    overdue: "Overdue",
    due_today: "Today",

    reports_title: "Reports",
    reports_sub: "Sales & team performance",
    by_status: "Leads by Status",
    by_source: "Leads by Source",
    by_agent: "Agent Performance",

    confirm_delete: "Are you sure you want to delete this?",
    toast_saved: "Saved successfully",
    toast_deleted: "Deleted",
    toast_updated: "Updated",
  }
};

function getLang(){
  return localStorage.getItem("crm_lang") || "ar";
}

function setLang(lang){
  localStorage.setItem("crm_lang", lang);
  applyLang(lang);
}

function t(key){
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || key;
}

function applyLang(lang){
  const dict = I18N[lang] || I18N.ar;
  document.documentElement.lang = lang;
  document.documentElement.dir = dict.dir;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) el.placeholder = dict[key];
  });

  document.querySelectorAll(".lang-toggle button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // Let page-specific scripts re-render dynamic content (tables, cards)
  document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
}

document.addEventListener("DOMContentLoaded", () => {
  applyLang(getLang());
  document.querySelectorAll(".lang-toggle button").forEach(btn => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });
});
