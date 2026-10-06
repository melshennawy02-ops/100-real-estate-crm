/**
 * ============================================================================
 *  100% Real Estate CRM — فحص دوري لسحب العملاء المتأخرين (بدون Firebase Blaze)
 * ============================================================================
 *
 *  الملف ده بيشتغل من جوه GitHub Actions (مجاني بالكامل)، مش من Firebase،
 *  فمش محتاج ترقية لخطة Blaze خالص. نفس منطق خاصية "سحب العميل تلقائيًا
 *  لعدم الرد" اللي في التطبيق، بس بيشتغل من سيرفر GitHub على جدول ثابت.
 *
 *  إزاي بيتوصل بقاعدة البيانات؟
 *  -----------------------------
 *  عن طريق "مفتاح خدمة" (Service Account) من Firebase، متخزّن كـ GitHub
 *  Secret باسم FIREBASE_SERVICE_ACCOUNT (شوف تعليمات الإعداد في الرد).
 * ============================================================================
 */

const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

async function run() {
  const configDoc = await db.collection("settings").doc("roundRobin").get();
  const config = configDoc.exists ? configDoc.data() : {};

  if (!config.enabled || !config.slaEnabled) {
    console.log("التوزيع التلقائي أو خاصية السحب لعدم الرد متوقفة من الإعدادات — تم التجاهل.");
    return;
  }

  const slaMinutes = config.slaMinutes || 30;
  const slaMs = slaMinutes * 60000;
  const now = Date.now();

  // 1) هات السيلز المؤهلين (role = sales_agent) وغير المعلّقين
  const agentsSnap = await db.collection("agents").where("role", "==", "sales_agent").get();
  let pool = agentsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((a) => a.disabled !== true);

  if (Array.isArray(config.agentPool) && config.agentPool.length) {
    pool = pool.filter((a) => config.agentPool.includes(a.id));
  }
  if (!pool.length) {
    console.log("مفيش سيلز متاحين في قائمة التوزيع — تم التجاهل.");
    return;
  }
  pool.sort((a, b) => a.id.localeCompare(b.id));

  // 2) هات العملاء المتأخرين (جديد + متخصص لحد + مفيش أول تواصل + عدّى الوقت المسموح)
  const leadsSnap = await db.collection("leads").where("status", "==", "new").get();

  const overdue = leadsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((l) => {
      if (!l.assignedTo || l.firstContactAt) return false;
      const assignedAtMs = l.assignedAt?._seconds
        ? l.assignedAt._seconds * 1000
        : l.createdAt?._seconds
        ? l.createdAt._seconds * 1000
        : null;
      if (!assignedAtMs) return false;
      return now - assignedAtMs > slaMs;
    });

  if (!overdue.length) {
    console.log("مفيش عملاء متأخرين دلوقتي.");
    return;
  }

  let lastAgentId = config.lastAgentId || null;
  let reassignedCount = 0;

  for (const lead of overdue) {
    const eligiblePool = pool.filter((a) => a.id !== lead.assignedTo);
    if (!eligiblePool.length) continue;

    let idx = 0;
    if (lastAgentId) {
      const i = eligiblePool.findIndex((a) => a.id === lastAgentId);
      if (i >= 0) idx = (i + 1) % eligiblePool.length;
    }
    const nextAgent = eligiblePool[idx];
    const prevAgent = pool.find((a) => a.id === lead.assignedTo);

    await db.collection("leads").doc(lead.id).update({
      assignedTo: nextAgent.id,
      assignedAt: FieldValue.serverTimestamp(),
    });

    await db.collection("leads").doc(lead.id).collection("activities").add({
      type: "auto_reassigned",
      text: `سُحب تلقائيًا لعدم الرد وأُعيد توزيعه من ${prevAgent?.name || prevAgent?.email || "—"} → ${nextAgent.name || nextAgent.email}`,
      agentEmail: "system@auto-reassign",
      createdAt: FieldValue.serverTimestamp(),
    });

    lastAgentId = nextAgent.id;
    reassignedCount++;
    console.log(`تم سحب العميل "${lead.name || lead.id}" من ${prevAgent?.name || "—"} وتوزيعه على ${nextAgent.name || nextAgent.email}`);
  }

  if (reassignedCount > 0) {
    await db.collection("settings").doc("roundRobin").set({ lastAgentId }, { merge: true });
    await db.collection("audit_log").add({
      type: "sla_auto_reassign",
      text: `${reassignedCount} عميل اتسحبوا تلقائيًا (عبر GitHub Actions) لعدم الرد وأُعيد توزيعهم`,
      actorId: "system",
      actorName: "GitHub Actions (تلقائي)",
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  console.log(`انتهى الفحص: ${reassignedCount} عميل تم سحبه وإعادة توزيعه.`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("حصل خطأ أثناء الفحص:", err);
    process.exit(1);
  });
