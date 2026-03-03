import React, { useState, useEffect } from "react";
import EditMemberModal from "./EditMemberModal.jsx";

function nodeStyle(person) {
    if (!person.is_alive && person.is_alive !== undefined)
        return { bg: "#374151", border: "#6b7280", text: "#9ca3af", label: "#d1d5db" };
    if (person.gender === "female")
        return { bg: "#fbcfe8", border: "#f472b6", text: "#9d174d", label: "#e8f5ec" };
    return { bg: "linear-gradient(135deg,#2d7a4f,#1a5c36)", border: "#2d7a4f", text: "#fff", label: "#e8f5ec" };
}

function TreeNode({ person, apiBase, token, isAdmin, showFemales, onAddChild, onViewProfile, depth = 0 }) {
    const [children, setChildren] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [localPerson, setLocal] = useState(person);
    const s = nodeStyle(localPerson);

    useEffect(() => {
        (async () => {
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch(`${apiBase}/children/${localPerson.id}`, { headers });
                const data = await res.json();
                setChildren((isAdmin && !showFemales) ? data.filter(c => c.gender !== "female") : data);
            } catch { setChildren([]); }
            finally { setLoading(false); }
        })();
    }, [apiBase, localPerson.id]);

    const hasKids = children && children.length > 0;

    return (
        <div className="ft-node">
            <div className="ft-person">
                <div
                    onClick={() => {
                        if (isAdmin) setEditing(true);
                        else if (onViewProfile) onViewProfile(localPerson);
                    }}
                    style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: localPerson.image_url ? "transparent" : s.bg,
                        border: `3px solid ${s.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, fontWeight: 900, color: s.text,
                        cursor: "pointer",
                        boxShadow: `0 4px 20px ${s.border}55`,
                        transition: "transform .2s cubic-bezier(0.22,1,0.36,1)", userSelect: "none",
                        margin: "0 auto", position: "relative", zIndex: 2,
                        overflow: "hidden",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                    title={isAdmin ? "اضغط للتعديل" : "عرض البروفيل"}
                >
                    {localPerson.image_url ? (
                        <img
                            src={localPerson.image_url.startsWith("http") ? localPerson.image_url : `http://localhost:8080${localPerson.image_url}`}
                            alt={localPerson.full_name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (localPerson.full_name?.charAt(0) || "؟")}
                </div>

                <div style={{
                    marginTop: 6, fontSize: 12, fontWeight: 700,
                    color: s.label, textAlign: "center", direction: "rtl",
                    maxWidth: 120, lineHeight: "1.4", wordBreak: "break-word",
                    margin: "6px auto 0", cursor: "pointer",
                }}
                    onClick={() => onViewProfile && onViewProfile(localPerson)}
                >
                    {localPerson.full_name.split(' ').slice(0, 3).join(' ')}
                </div>

                {localPerson.is_alive === false && (
                    <div style={{ fontSize: 9, color: "#6b7280", marginTop: 2, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>
                        توفي
                    </div>
                )}

                {isAdmin && (
                    <button onClick={() => onAddChild(localPerson)} style={{
                        marginTop: 3, fontSize: 9, color: "#4db878",
                        background: "transparent", border: "none", cursor: "pointer",
                        opacity: 0.7, display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 2, width: "100%",
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                        إضافة نسل
                    </button>
                )}

                {loading && <div style={{ fontSize: 10, color: "rgba(232,240,235,0.3)", marginTop: 4, textAlign: "center" }}>…</div>}
            </div>

            {hasKids && (
                <div className="ft-children">
                    {children.map(c => (
                        <TreeNode key={c.id} person={c} apiBase={apiBase} token={token}
                            isAdmin={isAdmin} depth={depth + 1} onAddChild={onAddChild} onViewProfile={onViewProfile} />
                    ))}
                </div>
            )}

            {editing && (
                <EditMemberModal member={localPerson} apiBase={apiBase} token={token}
                    onSave={u => setLocal(u)} onDelete={() => { }} onClose={() => setEditing(false)} />
            )}
        </div>
    );
}


export default function TreeView({ apiBase, token, isAdmin, rootPerson, onAddMember, onViewProfile, showFemales, onToggleShowFemales }) {
    const [roots, setRoots] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (rootPerson || roots !== null) return;
        (async () => {
            setLoading(true);
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch(`${apiBase}/roots?limit=50`, { headers });
                const data = await res.json();
                setRoots(data);
            } catch { setRoots([]); }
            finally { setLoading(false); }
        })();
    }, []);

    const displayRootsRaw = rootPerson ? [rootPerson] : (roots || []);
    const displayRoots = (isAdmin && !showFemales)
        ? displayRootsRaw.filter(r => r.gender !== "female")
        : displayRootsRaw;

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3" style={{ direction: "rtl" }}>
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5" style={{ color: "#4db878" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22v-7" /><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2" /><path d="M7 15l5-5 5 5" />
                        </svg>
                        شجرة آل أبوعلي البيطار
                    </div>
                    <p className="text-[11px] md:text-xs" style={{ color: "rgba(232,240,235,0.35)" }}>
                        الشجرة مفتوحة بالكامل — كل الأجيال ظاهرة
                        {isAdmin && " · اضغط على الدايرة للتعديل"}
                    </p>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-xs flex-wrap" style={{ color: "rgba(232,240,235,0.4)" }}>
                    <span className="flex items-center gap-1"><span style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)", borderRadius: "50%", display: "inline-block", width: 10, height: 10 }} /> ذكر</span>
                    <span className="flex items-center gap-1"><span style={{ background: "#fbcfe8", borderRadius: "50%", display: "inline-block", width: 10, height: 10 }} /> أنثى</span>
                    <span className="flex items-center gap-1"><span style={{ background: "#374151", borderRadius: "50%", display: "inline-block", width: 10, height: 10 }} /> توفي</span>
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={onToggleShowFemales}
                            className="px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all"
                            style={{
                                background: showFemales ? "rgba(248,250,252,0.06)" : "rgba(30,64,175,0.25)",
                                border: "1px solid rgba(148,163,184,0.4)",
                                color: "rgba(226,232,240,0.9)",
                            }}
                        >
                            {showFemales ? (
                                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" x2="23" y1="1" y2="23" /></svg> إخفاء الإناث</>
                            ) : (
                                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg> إظهار الإناث</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {loading && (
                <div className="flex items-center gap-2 py-12 justify-center text-sm" style={{ color: "rgba(232,240,235,0.4)" }}>
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(45,122,79,0.3)", borderTopColor: "#2d7a4f" }} />
                    جاري تحميل الشجرة...
                </div>
            )}

            {!loading && displayRoots.length === 0 && (
                <div className="text-sm text-center py-12" style={{ color: "rgba(232,240,235,0.3)" }}>
                    لا توجد بيانات — أضف أفراداً أولاً
                </div>
            )}

            <div style={{ overflowX: "auto", overflowY: "auto", padding: "24px 0", minHeight: 300, WebkitOverflowScrolling: "touch" }}>
                <div className="ft-tree">
                    {displayRoots.map(root => (
                        <TreeNode key={root.id} person={root} apiBase={apiBase}
                            token={token} isAdmin={isAdmin} showFemales={showFemales} depth={0}
                            onAddChild={p => onAddMember && onAddMember(p)}
                            onViewProfile={onViewProfile} />
                    ))}
                </div>
            </div>
        </div>
    );
}
