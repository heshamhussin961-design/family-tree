import React, { useEffect, useState, useRef } from "react";

const STAT_CARDS = [
  {
    key: "total", label: "إجمالي أفراد الشجرة",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22v-7"/><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2"/><path d="M7 15l5-5 5 5"/></svg>,
    accent: "var(--primary)",
  },
  {
    key: "generations", label: "عدد الأجيال",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    accent: "var(--primary)",
  },
  {
    key: "living", label: "عدد الأحياء",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
    accent: "var(--primary)",
  },
  {
    key: "deceased", label: "عدد المتوفين",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
    accent: "var(--text-secondary)",
  },
];

const ACTION_ITEMS = [
  {
    key: "tree",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="6" height="6" x="2" y="2" rx="1"/><rect width="6" height="6" x="16" y="16" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><path d="M5 8v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M12 12v4"/></svg>,
    title: "شجرة العائلة",
    desc: "استعراض النسب كاملاً",
  },
  {
    key: "archive",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>,
    title: "تراث العائلة",
    desc: "صور · مستندات · قصص",
  },
  {
    key: "search",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    title: "بحث عن أفراد",
    desc: "ابحث عن أي فرد بسرعة",
  },
  {
    key: "add",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>,
    title: "إضافة فرد جديد",
    desc: "سجّل نفسك أو أحد أفراد العائلة",
  },
];

function AnimatedCounter({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (value == null) return;
    if (value === 0) { setDisplay(0); return; }
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);
  return <span>{display}</span>;
}

export default function Dashboard({ apiBase, onViewTree, onViewArchive, isAdmin, onLogout, onAdminLogin, onViewSearch, onAddMember }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const r = await fetch(`${apiBase}/stats`); setStats(await r.json()); }
      catch {}
      finally { setLoading(false); }
    })();
  }, [apiBase]);

  const actionMap = { tree: onViewTree, archive: onViewArchive, search: onViewSearch, add: onAddMember };

  return (
    <div className="animate-fade-in-up">
      {/* Hero */}
      <div className="mb-8 text-center md:text-right">
        <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
          سجل أنساب آل أبوعلي البيطار
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>حفظ التراث العائلي عبر الأجيال</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {STAT_CARDS.map((c, i) => (
          <div key={c.key} className={`card p-5 animate-fade-in-up stagger-${i + 1}`}>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                {c.icon}
              </div>
              <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{c.label}</div>
              <div className="text-3xl font-black" style={{ color: c.accent }}>
                {loading ? "—" : <AnimatedCounter value={stats?.[c.key] ?? 0} duration={1000 + i * 200} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action List */}
      <div className="space-y-3">
        {ACTION_ITEMS.map((item, i) => (
          <button key={item.key} onClick={actionMap[item.key]}
            className={`card w-full p-4 flex items-center justify-between text-right transition-all cursor-pointer animate-fade-in-up stagger-${i + 5}`}
            style={{ border: "1px solid transparent" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                {item.icon}
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{item.title}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{item.desc}</div>
              </div>
            </div>
            <svg width="20" height="20" fill="none" stroke="var(--text-secondary)" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        ))}
      </div>

      {isAdmin && (
        <div className="card mt-6 p-4 animate-fade-in-up" style={{ border: "1px solid rgba(197,160,89,0.15)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <div className="text-xs font-bold" style={{ color: "var(--accent)" }}>سجل التواصل (للأدمن)</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>أرقام الهواتف والإيميلات مسجلة عند كل فرد — ادخل بروفيل أي شخص لرؤية بيانات التواصل</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
