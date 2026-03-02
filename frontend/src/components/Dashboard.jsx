import React, { useEffect, useState } from "react";

const STAT_CARDS = [
    { key: "total", label: "إجمالي الأفراد", icon: "👨‍👩‍👦‍👦", color: "#4db878", bg: "rgba(45,122,79,0.12)" },
    { key: "living", label: "الأحياء", icon: "💚", color: "#34d399", bg: "rgba(52,211,153,0.10)" },
    { key: "deceased", label: "المتوفين", icon: "🕊️", color: "#94a3b8", bg: "rgba(148,163,184,0.10)" },
    { key: "generations", label: "عدد الأجيال", icon: "🌿", color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
];

export default function Dashboard({ apiBase, onViewTree, onViewArchive, isAdmin, onLogout }) {
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
        <div className="min-h-screen flex flex-col px-4 py-10 relative overflow-x-hidden">
            {/* Blobs */}
            <div style={{ position: "fixed", top: "-80px", right: "-80px", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(45,122,79,0.16) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "fixed", bottom: "-100px", left: "-80px", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,92,54,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div className="max-w-4xl w-full mx-auto relative z-10">

                {/* Header */}
                <header className="flex items-center justify-between mb-10 animate-fade-in-up">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                            style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)" }}>
                            <span className="text-2xl">🌳</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black" style={{ color: "#e8f5ec" }}>شجرة أنساب آل أبوعلي البيطار</h1>
                            <p className="text-xs" style={{ color: "rgba(232,240,235,0.4)" }}>سجل أنساب آل أبوعلي البيطار الرقمي</p>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full text-xs font-bold"
                                style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                                👑 أدمن
                            </span>
                            <button onClick={onLogout} className="text-xs px-3 py-1 rounded-full transition-opacity hover:opacity-70"
                                style={{ color: "rgba(232,240,235,0.4)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                خروج
                            </button>
                        </div>
                    )}
                </header>

                {/* Hero */}
                <div className="mb-10 animate-fade-in-up">
                    <h2 className="text-4xl font-black mb-2" style={{ color: "#e8f5ec" }}>سجل أنساب آل أبوعلي البيطار</h2>
                    <p className="text-base" style={{ color: "rgba(232,240,235,0.45)" }}>حفظ التراث العائلي عبر الأجيال</p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in-up">
                    {STAT_CARDS.map(card => (
                        <div key={card.key} className="flex items-center gap-4 p-5 rounded-2xl"
                            style={{ background: card.bg, border: `1px solid ${card.color}22` }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                                style={{ background: `${card.color}22` }}>
                                {card.icon}
                            </div>
                            <div>
                                <div className="text-xs font-semibold mb-0.5" style={{ color: "rgba(232,240,235,0.5)" }}>{card.label}</div>
                                <div className="text-3xl font-black" style={{ color: card.color }}>
                                    {loading ? "—" : (stats?.[card.key] ?? 0)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View Tree */}
                <div className="rounded-2xl p-5 flex items-center justify-between animate-fade-in-up mb-4"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🌳</span>
                        <div>
                            <div className="font-bold text-sm" style={{ color: "#e8f5ec" }}>شجرة أنساب آل أبوعلي البيطار</div>
                            <div className="text-xs" style={{ color: "rgba(232,240,235,0.35)" }}>استعراض النسب كاملاً</div>
                        </div>
                    </div>
                    <button onClick={onViewTree}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all hover:opacity-80"
                        style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)", color: "#fff" }}>
                        استعراض <span style={{ fontSize: "16px" }}>→</span>
                    </button>
                </div>

                {/* تراث العائلة */}
                <div className="rounded-2xl p-5 flex items-center justify-between animate-fade-in-up"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📚</span>
                        <div>
                            <div className="font-bold text-sm" style={{ color: "#e8f5ec" }}>تراث العائلة</div>
                            <div className="text-xs" style={{ color: "rgba(232,240,235,0.35)" }}>صور شخصيات · مستندات · رسائل · قصص وروايات</div>
                        </div>
                    </div>
                    <button onClick={onViewArchive}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all hover:opacity-80"
                        style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)", color: "#fff" }}>
                        عرض <span style={{ fontSize: "16px" }}>→</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
