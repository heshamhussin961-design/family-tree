import React, { useState, useEffect } from "react";
// Last Update: 2026-03-11 21:30
import {
    TreePine,
    User,
    Users,
    ChevronRight,
    ChevronLeft,
    Plus,
    Info,
    Printer,
    Download,
    LayoutGrid,
    Filter
} from "lucide-react";

const BAKR_NAME = "بكر";

function nodeStyle(person) {
    if (!person.is_alive && person.is_alive !== undefined)
        return { bg: "var(--bg-card-hover)", border: "var(--text-muted)", text: "var(--text-muted)", label: "var(--text-muted)", deceased: true };
    if (person.gender === "female")
        return { bg: "rgba(236,72,153,0.12)", border: "#ec4899", text: "#f472b6", label: "#f472b6", deceased: false };
    return { bg: "var(--primary-dim)", border: "var(--primary)", text: "var(--primary-dark)", label: "#fff", deceased: false };
}

function TreeNode({ person, apiBase, token, isAdmin, showFemales, onAddChild, onViewProfile, depth = 0 }) {
    const [children, setChildren] = useState(null);
    const [loading, setLoading] = useState(true);
    const [localPerson] = useState(person);
    const s = nodeStyle(localPerson);

    useEffect(() => {
        (async () => {
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch(`${apiBase}/children/${localPerson.id}`, { headers });
                if (!res.ok) throw new Error("API Error");
                const data = await res.json();
                setChildren((isAdmin && !showFemales) ? data.filter(c => c.gender !== "female") : data);
            } catch { setChildren([]); }
            finally { setLoading(false); }
        })();
    }, [apiBase, localPerson.id, isAdmin, showFemales, token]);

    const hasKids = children && children.length > 0;

    return (
        <div className="ft-node">
            <div className="ft-person">
                <div onClick={() => onViewProfile && onViewProfile(localPerson)}
                    className="relative w-[52px] h-[52px] rounded-full flex items-center justify-center font-black overflow-hidden cursor-pointer transition-all duration-300 hover:scale-110 z-[2] mx-auto shadow-xl group"
                    style={{
                        background: localPerson.image_url ? "transparent" : s.bg,
                        border: `2.5px solid ${s.border}`,
                        color: s.text,
                    }}
                    title="عرض البروفيل">
                    {localPerson.image_url ? (
                        <img src={localPerson.image_url.startsWith("http") ? localPerson.image_url : `${apiBase}${localPerson.image_url}`}
                            alt={localPerson.full_name} className="w-full h-full object-cover" />
                    ) : (localPerson.full_name?.charAt(0) || "؟")}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <Info size={20} color="#fff" />
                    </div>
                </div>
                <div className="mt-2 text-[11px] font-bold text-center direction-rtl max-w-[110px] mx-auto cursor-pointer text-slate-900 dark:text-white hover:text-primary transition-colors print-text-dark"
                    style={{ color: "var(--text-primary)" }}
                    onClick={() => onViewProfile && onViewProfile(localPerson)}>
                    {localPerson.full_name}
                </div>
                {s.deceased && (
                    <div className="text-[9px] text-gray-500 mt-0.5 font-bold">رحمه الله</div>
                )}
                {isAdmin && (
                    <button onClick={() => onAddChild(localPerson)} className="mt-2 text-[9px] text-primary bg-transparent border-none cursor-pointer opacity-30 hover:opacity-100 flex items-center justify-center gap-1 w-full transition-opacity">
                        <Plus size={10} strokeWidth={3} />
                        إضافة نسل
                    </button>
                )}
                {loading && <div className="text-[10px] text-gray-700 mt-1">…</div>}
            </div>
            {hasKids && (
                <div className="ft-children">
                    {children.map(c => (
                        <TreeNode key={c.id} person={c} apiBase={apiBase} token={token}
                            isAdmin={isAdmin} depth={depth + 1} onAddChild={onAddChild} onViewProfile={onViewProfile} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function TreeView({ apiBase, token, isAdmin, rootPerson, onAddMember, onViewProfile, showFemales, onToggleShowFemales, onBack, onBackToDashboard, path = [], setPath, showTree = false, setShowTree }) {
    const [children, setChildren] = useState(null);
    const [loading, setLoading] = useState(false);
    const [roots, setRoots] = useState(null);
    const [lineageFromProfile, setLineageFromProfile] = useState([]);

    useEffect(() => {
        if (rootPerson) return;
        if (roots !== null) return;
        (async () => {
            setLoading(true);
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch(`${apiBase}/roots?limit=50`, { headers });
                if (!res.ok) throw new Error("API Error");
                setRoots(await res.json());
            } catch { setRoots([]); }
            finally { setLoading(false); }
        })();
    }, [apiBase, rootPerson, roots, token]);

    const bakrPerson = roots && roots.find(r => r.full_name && r.full_name.includes(BAKR_NAME));

    useEffect(() => {
        if (rootPerson) return;
        if (path.length === 0) { setChildren(null); return; }
        const current = path[path.length - 1];
        setChildren(null);
        setShowTree(false);
        (async () => {
            setLoading(true);
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch(`${apiBase}/children/${current.id}`, { headers });
                if (!res.ok) throw new Error("API Error");
                const data = await res.json();
                const filtered = (isAdmin && !showFemales) ? data.filter(c => c.gender !== "female") : data;
                setChildren(filtered);
            } catch { setChildren([]); }
            finally { setLoading(false); }
        })();
    }, [path, apiBase, token, isAdmin, showFemales, rootPerson]);

    useEffect(() => {
        if (!rootPerson || !apiBase) return;
        (async () => {
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch(`${apiBase}/person/${rootPerson.id}`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    setLineageFromProfile(data.lineage || []);
                } else setLineageFromProfile([]);
            } catch { setLineageFromProfile([]); }
        })();
    }, [rootPerson?.id, apiBase, token]);

    const handlePersonClick = (person) => setPath(prev => [...prev, person]);
    const handleBack = () => showTree ? setShowTree(false) : setPath(prev => prev.slice(0, -1));
    const handleShowTree = () => setShowTree(true);

    const currentPerson = path.length > 0 ? path[path.length - 1] : null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                <div className="text-right">
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm">
                        <TreePine size={18} />
                        <span>شجرة آل أبوعلي البيطار</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">تصفح الأجيال والنسب التراكمي</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary" /> ذكر</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-pink-500" /> أنثى</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gray-600" /> متوفي</div>
                    {isAdmin && (
                        <button onClick={onToggleShowFemales} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10 transition">
                            <Filter size={12} />
                            {showFemales ? "إخفاء الإناث" : "إظهار الإناث"}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {!rootPerson && (path.length === 0 ? onBackToDashboard : handleBack) && (
                    <button onClick={path.length === 0 ? onBackToDashboard : handleBack} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-bold hover:text-white transition group">
                        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        رجوع
                    </button>
                )}

                {/* Breadcrumb */}
                {!rootPerson && path.length > 0 && (
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary-dark text-sm font-black overflow-hidden flex-wrap leading-relaxed shadow-sm">
                        {path.map((p, i) => (
                            <React.Fragment key={p.id}>
                                {i > 0 && <ChevronLeft size={16} className="opacity-50 text-primary" />}
                                <span
                                    onClick={() => i < path.length - 1 && (setPath(path.slice(0, i + 1)), setShowTree(false))}
                                    className={`cursor-pointer transition-colors ${i < path.length - 1 ? 'text-primary hover:text-primary-dark' : 'text-primary-dark'}`}
                                >
                                    {p.full_name}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <div className="text-sm font-bold text-gray-500">جاري تحميل الشجرة...</div>
                </div>
            )}

            {!rootPerson && path.length === 0 && !loading && bakrPerson && (
                <div className="flex justify-center py-10">
                    <button onClick={() => handlePersonClick(bakrPerson)} className="group relative p-8 rounded-[2.5rem] bg-gradient-to-br from-bg-card to-bg-main border border-white/5 hover:border-primary/30 transition-all shadow-2xl">
                        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
                                {bakrPerson.image_url ? <img src={bakrPerson.image_url.startsWith("http") ? bakrPerson.image_url : `${apiBase}${bakrPerson.image_url}`} alt="" className="w-full h-full object-cover rounded-3xl" /> : bakrPerson.full_name?.charAt(0)}
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl font-black text-white group-hover:text-primary transition-colors">{bakrPerson.full_name}</div>
                                <div className="text-xs text-gray-500 font-bold">مؤسس الشجرة (الجد الأكبر)</div>
                            </div>
                            <div className="mt-2 px-4 py-2 rounded-xl bg-white/5 text-[10px] text-gray-400 font-black tracking-widest uppercase">اضغط لبدء التصفح</div>
                        </div>
                    </button>
                </div>
            )}

            {!rootPerson && !showTree && path.length > 0 && children !== null && !loading && (
                <div className="space-y-8 animate-fade-in-up">
                    <div className="flex items-center gap-3">
                        <LayoutGrid size={18} className="text-gray-500" />
                        <h3 className="text-sm font-bold text-gray-400">أبناء {currentPerson.full_name} <span className="opacity-40 ml-1">({children.length})</span></h3>
                    </div>

                    {children.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {children.map(child => (
                                <div key={child.id} className="group card p-5 flex flex-col items-center gap-4 text-center border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all">
                                    <div onClick={() => handlePersonClick(child)} className="relative cursor-pointer">
                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500 ${child.is_alive === false ? "bg-gray-800 border-2 border-gray-700 text-white" : (child.gender === "female" ? "bg-pink-500/10 border-2 border-pink-500 text-pink-600" : "bg-primary/10 border-2 border-primary text-primary-dark")}`}>
                                            {child.image_url ? <img src={child.image_url.startsWith("http") ? child.image_url : `${apiBase}${child.image_url}`} alt="" className="w-full h-full object-cover" /> : child.full_name?.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-2 right-0 w-6 h-6 rounded-lg bg-card border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors" style={{ background: "var(--bg-card)" }}>
                                            <ChevronRight size={12} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className={`font-bold text-sm leading-tight transition-colors ${child.is_alive === false ? "text-gray-500" : (child.gender === "female" ? "text-pink-400" : "text-slate-900 dark:text-white group-hover:text-primary")}`} style={{ color: child.is_alive !== false ? "var(--text-primary)" : undefined }}>{child.full_name}</div>
                                        <div className="text-[10px] text-gray-600 font-bold">{child.is_alive === false ? "رحمه الله" : "عرض النسل"}</div>
                                    </div>
                                    <button onClick={() => onViewProfile(child)} className="w-full py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-accent hover:bg-white/10 transition">
                                        البيانات الكاملة
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 rounded-3xl bg-white/[0.02] border border-dashed border-white/5 text-center text-sm text-gray-500 font-bold">لا يوجد أبناء مسجلين لهذا الشخص.</div>
                    )}

                    {children.length > 0 && (
                        <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                            <button onClick={handleShowTree} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold hover:bg-primary/20 transition-all">
                                <TreePine size={18} />
                                عرض الشجرة الكاملة
                            </button>
                            <button onClick={() => window.print()} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-gray-400 text-sm font-bold hover:text-white transition-all">
                                <Printer size={18} />
                                تحميل للطباعة
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!rootPerson && showTree && currentPerson && (
                <div className="relative p-6 rounded-[2.5rem] bg-white/[0.01] border border-white/5 overflow-auto min-h-[400px]">
                    <div className="ft-tree">
                        <TreeNode person={currentPerson} apiBase={apiBase} token={token} isAdmin={isAdmin} showFemales={showFemales} onAddChild={onAddMember} onViewProfile={onViewProfile} />
                    </div>
                </div>
            )}

            {rootPerson && (
                <div className="space-y-6">
                    <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-bold hover:text-white transition">
                        <ChevronLeft size={16} />
                        رجوع للبروفيل
                    </button>
                    {lineageFromProfile.length > 0 && (
                        <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary/5 border border-primary/10 text-primary text-xs font-bold">
                            {lineageFromProfile.map((m, i) => (
                                <React.Fragment key={m.id}>
                                    {i > 0 && <ChevronLeft size={12} className="opacity-30" />}
                                    <span>{m.full_name}</span>
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                    <div className="relative p-6 rounded-[2.5rem] bg-white/[0.01] border border-white/5 overflow-auto min-h-[400px]">
                        <div className="ft-tree">
                            <TreeNode person={rootPerson} apiBase={apiBase} token={token} isAdmin={isAdmin} showFemales={showFemales} onAddChild={onAddMember} onViewProfile={onViewProfile} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
