import React, { useEffect, useState, useRef } from "react";

/* ── SVG Icons ────────────────────────────────────────────── */
const ICONS = {
  tree: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-7" />
      <path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2" />
      <path d="M7 15l5-5 5 5" />
    </svg>
  ),
  generations: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  living: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  deceased: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  ),
  treeView: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="6" height="6" x="2" y="2" rx="1" />
      <rect width="6" height="6" x="16" y="16" rx="1" />
      <rect width="6" height="6" x="2" y="16" rx="1" />
      <path d="M5 8v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
      <path d="M12 12v4" />
    </svg>
  ),
  archive: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6" />
      <path d="M8 11h8" />
    </svg>
  ),
  admin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  logo: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-7" />
      <path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2" />
      <path d="M7 15l5-5 5 5" />
    </svg>
  ),
};

const STAT_CARDS = [
  { key: "total", label: "إجمالي أفراد الشجرة", icon: ICONS.tree, color: "#4db878", bg: "rgba(45,122,79,0.12)", gradBg: "linear-gradient(135deg, rgba(45,122,79,0.18), rgba(45,122,79,0.06))" },
  { key: "generations", label: "عدد الأجيال", icon: ICONS.generations, color: "#f59e0b", bg: "rgba(245,158,11,0.10)", gradBg: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.04))" },
  { key: "living", label: "عدد الأحياء", icon: ICONS.living, color: "#34d399", bg: "rgba(52,211,153,0.10)", gradBg: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.04))" },
  { key: "deceased", label: "عدد المتوفين", icon: ICONS.deceased, color: "#94a3b8", bg: "rgba(148,163,184,0.10)", gradBg: "linear-gradient(135deg, rgba(148,163,184,0.15), rgba(148,163,184,0.04))" },
];

/* ── Animated Counter ─────────────────────────────────────── */
function AnimatedCounter({ value, duration = 1800 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (value === null || value === undefined) return;
    let start = 0;
    const end = value;
    if (end === 0) { setDisplay(0); return; }
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * end));
      if (progress < 1) {
        ref.current = requestAnimationFrame(step);
      }
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return <span>{display}</span>;
}

/* ── Floating Particles ───────────────────────────────────── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: 4 + (i % 3) * 3,
            height: 4 + (i % 3) * 3,
            background: `rgba(77, 184, 120, ${0.08 + (i % 3) * 0.05})`,
            top: `${15 + i * 14}%`,
            left: `${10 + i * 15}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Dashboard({ apiBase, onViewTree, onViewArchive, isAdmin, onLogout, onAdminLogin, onViewSearch, onAddMember }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/stats`);
        const data = await res.json();
        setStats(data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, [apiBase]);

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 md:py-10 relative overflow-x-hidden">
      <FloatingParticles />

      {/* Animated background blobs */}
      <div className="animate-blob" style={{ position: "fixed", top: "-100px", right: "-100px", width: "450px", height: "450px", background: "radial-gradient(circle, rgba(45,122,79,0.18) 0%, transparent 70%)", pointerEvents: "none", filter: "blur(2px)" }} />
      <div className="animate-blob" style={{ position: "fixed", bottom: "-120px", left: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(26,92,54,0.14) 0%, transparent 70%)", pointerEvents: "none", animationDelay: "4s", filter: "blur(2px)" }} />
      <div className="animate-blob" style={{ position: "fixed", top: "40%", left: "50%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(45,122,79,0.07) 0%, transparent 70%)", pointerEvents: "none", animationDelay: "2s" }} />

      <div className="max-w-4xl w-full mx-auto relative z-10">

        {/* Header */}
        <header className="flex items-center justify-between mb-8 md:mb-10 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-xl animate-glow-pulse"
                style={{ background: "radial-gradient(circle, rgba(45,122,79,0.35) 0%, transparent 70%)", filter: "blur(4px)" }} />
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)", color: "#fff" }}>
                {ICONS.logo}
              </div>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black" style={{ color: "#e8f5ec" }}>شجرة آل أبوعلي البيطار</h1>
              <p className="text-[11px] md:text-xs" style={{ color: "rgba(232,240,235,0.4)" }}>سجل أنساب آل أبوعلي البيطار الرقمي</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5"
                  style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                  {ICONS.admin} أدمن
                </span>
                <button onClick={onLogout} className="text-xs px-3 py-1 rounded-full transition-opacity hover:opacity-70"
                  style={{ color: "rgba(232,240,235,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  خروج
                </button>
              </>
            ) : (
              <button onClick={onAdminLogin}
                className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(232,240,235,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="flex items-center gap-1.5">{ICONS.admin} أدمن</span>
              </button>
            )}
          </div>
        </header>

        {/* Hero with animated gradient text */}
        <div className="mb-8 md:mb-10 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-black mb-2" style={{
            background: "linear-gradient(135deg, #e8f5ec 0%, #4db878 50%, #e8f5ec 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradient-shift 4s ease infinite",
          }}>
            سجل أنساب آل أبوعلي البيطار
          </h2>
          <p className="text-sm md:text-base" style={{ color: "rgba(232,240,235,0.45)" }}>حفظ التراث العائلي عبر الأجيال</p>
        </div>

        {/* Stats grid with animated counters */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
          {STAT_CARDS.map((card, idx) => (
            <div
              key={card.key}
              className={`animate-fade-in-up stagger-${idx + 1} hover-lift card-shine flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl cursor-default`}
              style={{ background: card.gradBg, border: `1px solid ${card.color}22` }}
            >
              <div
                className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300"
                style={{ background: `${card.color}18`, color: card.color }}
              >
                {card.icon}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] md:text-xs font-semibold mb-0.5 truncate" style={{ color: "rgba(232,240,235,0.5)" }}>
                  {card.label}
                </div>
                <div className="text-2xl md:text-3xl font-black tabular-nums" style={{ color: card.color }}>
                  {loading ? (
                    <div className="w-12 h-7 rounded-lg" style={{ background: `${card.color}15`, animation: "shimmer 1.5s infinite", backgroundSize: "200% 100%", backgroundImage: `linear-gradient(90deg, ${card.color}08 0%, ${card.color}18 50%, ${card.color}08 100%)` }} />
                  ) : (
                    <AnimatedCounter value={stats?.[card.key] ?? 0} duration={1200 + idx * 300} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 md:space-y-4">
          {/* View Tree */}
          <button
            onClick={onViewTree}
            className="w-full rounded-2xl p-4 md:p-5 flex items-center justify-between animate-fade-in-up stagger-5 hover-lift card-shine text-right transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,rgba(45,122,79,0.25),rgba(26,92,54,0.15))", color: "#4db878" }}>
                {ICONS.treeView}
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: "#e8f5ec" }}>شجرة أنساب آل أبوعلي البيطار</div>
                <div className="text-[11px] md:text-xs" style={{ color: "rgba(232,240,235,0.35)" }}>استعراض النسب كاملاً</div>
              </div>
            </div>
            <svg width="20" height="20" fill="none" stroke="rgba(232,240,235,0.3)" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Archive */}
          <button
            onClick={onViewArchive}
            className="w-full rounded-2xl p-4 md:p-5 flex items-center justify-between animate-fade-in-up stagger-6 hover-lift card-shine text-right transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa" }}>
                {ICONS.archive}
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: "#e8f5ec" }}>تراث العائلة</div>
                <div className="text-[11px] md:text-xs" style={{ color: "rgba(232,240,235,0.35)" }}>صور شخصيات · مستندات · رسائل · قصص وروايات</div>
              </div>
            </div>
            <svg width="20" height="20" fill="none" stroke="rgba(232,240,235,0.3)" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Search */}
          <button
            onClick={onViewSearch}
            className="w-full rounded-2xl p-4 md:p-5 flex items-center justify-between animate-fade-in-up stagger-7 hover-lift card-shine text-right transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(6,182,212,0.12)", color: "#22d3ee" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: "#e8f5ec" }}>بحث في الأفراد</div>
                <div className="text-[11px] md:text-xs" style={{ color: "rgba(232,240,235,0.35)" }}>ابحث عن أي فرد من العائلة بسرعة</div>
              </div>
            </div>
            <svg width="20" height="20" fill="none" stroke="rgba(232,240,235,0.3)" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Add Member */}
          <button
            onClick={onAddMember}
            className="w-full rounded-2xl p-4 md:p-5 flex items-center justify-between animate-fade-in-up stagger-8 hover-lift card-shine text-right transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: "#e8f5ec" }}>إضافة فرد جديد</div>
                <div className="text-[11px] md:text-xs" style={{ color: "rgba(232,240,235,0.35)" }}>سجّل نفسك أو أحد أفراد العائلة</div>
              </div>
            </div>
            <svg width="20" height="20" fill="none" stroke="rgba(232,240,235,0.3)" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* Admin: Contact Records */}
        {isAdmin && (
          <div className="mt-6 md:mt-8 animate-fade-in-up">
            <div className="rounded-2xl p-4 md:p-5"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13.5 19.79 19.79 0 0 1 1.08 4.92 2 2 0 0 1 3.06 2.75h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: "#fbbf24" }}>سجل التواصل (للأدمن)</div>
                  <div className="text-[11px]" style={{ color: "rgba(232,240,235,0.4)" }}>أرقام الهواتف والإيميلات مسجلة عند كل فرد — ادخل بروفيل أي شخص لرؤية بيانات التواصل</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-12 md:mt-14 text-center text-xs animate-fade-in-up" style={{ color: "rgba(232,240,235,0.12)" }}>
          سجل أنساب آل أبوعلي البيطار الرقمي · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
