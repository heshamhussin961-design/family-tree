import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Layers,
  Heart,
  XOctagon,
  TreePine,
  Library,
  Search,
  UserPlus,
  Download,
  Lock,
  Globe,
  Trophy,
  History
} from "lucide-react";

const STAT_CARDS = [
  {
    key: "total", label: "إجمالي أفراد الشجرة",
    icon: <Users size={22} />,
    accent: "var(--primary)",
  },
  {
    key: "generations", label: "عدد الأجيال",
    icon: <Layers size={22} />,
    accent: "var(--primary)",
  },
  {
    key: "living", label: "عدد الأحياء",
    icon: <Heart size={22} />,
    accent: "var(--primary)",
  },
  {
    key: "deceased", label: "عدد المتوفين",
    icon: <XOctagon size={22} />,
    accent: "var(--text-secondary)",
  },
];

const ACTION_ITEMS = [
  {
    path: "/tree",
    icon: <TreePine size={20} />,
    title: "شجرة العائلة",
    desc: "استعراض النسب كاملاً",
  },
  {
    path: "/archive",
    icon: <Library size={20} />,
    title: "تراث العائلة",
    desc: "صور · مستندات · قصص",
  },
  {
    path: "/history",
    icon: <History size={20} />,
    title: "تاريخ العائلة",
    desc: "الجذور · الفوائد · الأهداف",
  },
  {
    path: "/search",
    icon: <Search size={20} />,
    title: "بحث عن أفراد",
    desc: "ابحث عن أي فرد بسرعة",
  },
  {
    path: "/add",
    icon: <UserPlus size={20} />,
    title: "إضافة فرد جديد",
    desc: "سجّل نفسك أو أحد أفراد العائلة",
  },
  {
    path: "/ambassadors",
    icon: <Globe size={20} />,
    title: "سفراء العائلة في الخارج",
    desc: "تواصل مع سفراء العائلة في العالم",
  },
  {
    path: "/competitions",
    icon: <Trophy size={20} />,
    title: "مسابقات وجوائز",
    desc: "مسابقات علمية, دينية, رياضية",
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

export default function Dashboard({ apiBase, isAdmin, onExportGedcom }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${apiBase}/stats`);
        setStats(await r.json());
      } catch (e) {
        console.error("Stats fetch failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiBase]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2rem] p-8 md:p-12 bg-gradient-to-br from-bg-card to-bg-main border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 blur-[100px] -ml-32 -mb-32 rounded-full" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-right space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>
              <span className="block mb-5">سجل عائلة</span>
              <span className="text-gradient">آل أبوعلي البيطار</span>
            </h2>
            <p className="text-lg text-gray-400 font-medium max-w-xl">
              منصة رقمية لتوثيق الأنساب، حفظ التاريخ، وربط أجيال العائلة ببعضها البعض في مكان واحد آمن.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <button
                onClick={() => navigate("/tree")}
                className="btn-primary"
              >
                <TreePine size={20} />
                تصفح الشجرة الآن
              </button>
              <button
                onClick={() => navigate("/add")}
                className="px-6 py-3 rounded-2xl font-bold text-sm border border-white/5 hover:bg-white/5 transition-all"
              >
                إضافة فرد جديد
              </button>
            </div>
          </div>
          <div className="hidden lg:block w-48 h-48 opacity-20">
            <TreePine size={192} strokeWidth={1} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {STAT_CARDS.map((c, i) => (
          <div key={c.key} className="card p-6 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 text-primary shadow-inner">
              {c.icon}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">{c.label}</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white" style={{ color: "var(--text-primary)" }}>
                {loading ? (
                  <div className="w-12 h-8 bg-white/5 animate-pulse rounded-md mx-auto" />
                ) : (
                  <AnimatedCounter value={stats?.[c.key] ?? 0} duration={1000 + i * 200} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ACTION_ITEMS.map((item, i) => (
          <Link
            key={item.path}
            to={item.path}
            className="group card p-6 flex items-center gap-5 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent-dim text-accent group-hover:bg-accent group-hover:text-white transition-all">
              {item.icon}
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors" style={{ color: "var(--text-primary)" }}>{item.title}</div>
              <div className="text-xs text-gray-500 font-medium">{item.desc}</div>
            </div>
          </Link>
        ))}

        {/* Export Action */}
        <button
          onClick={onExportGedcom}
          className="group card p-6 flex items-center gap-5 hover:scale-[1.02] active:scale-[0.98] text-right"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 text-gray-400 group-hover:bg-white group-hover:text-black transition-all">
            <Download size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white group-hover:text-gray-200 transition-colors" style={{ color: "var(--text-primary)" }}>تحميل الشجرة</div>
            <div className="text-xs text-gray-500 font-medium">تصدير بصيغة GEDCOM</div>
          </div>
        </button>
      </div>

      {isAdmin && (
        <div className="rounded-[2rem] p-6 bg-accent-dim border border-accent/10 flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-accent text-white shadow-lg shadow-accent/20">
            <Lock size={20} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-accent">سجل التواصل العائلي (أدمن)</div>
            <div className="text-xs text-accent/70 font-medium mt-1">أرقام الهواتف والإيميلات مسجلة عند كل فرد — ادخل بروفيل أي شخص لرؤية بيانات التواصل</div>
          </div>
          <Link to="/admin" className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:opacity-90 transition">
            لوحة التحكم
          </Link>
        </div>
      )}
    </div>
  );
}
