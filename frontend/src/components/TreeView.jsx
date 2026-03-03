import React, { useState, useEffect } from "react";
import EditMemberModal from "./EditMemberModal.jsx";

function nodeStyle(person) {
    if (!person.is_alive && person.is_alive !== undefined)
        return { bg: "#333", border: "#555", text: "#888", label: "#888" };
    if (person.gender === "female")
        return { bg: "rgba(236,72,153,0.12)", border: "#ec4899", text: "#f472b6", label: "#f472b6" };
    return { bg: "var(--primary-dim)", border: "var(--primary)", text: "var(--primary)", label: "#fff" };
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
                <div onClick={() => { if (isAdmin) setEditing(true); else if (onViewProfile) onViewProfile(localPerson); }}
                    style={{
                        width: 52, height: 52, borderRadius: "50%",
                        background: localPerson.image_url ? "transparent" : s.bg,
                        border: `2.5px solid ${s.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 800, color: s.text,
                        cursor: "pointer", transition: "all .2s ease",
                        userSelect: "none", margin: "0 auto", position: "relative", zIndex: 2, overflow: "hidden",
                        boxShadow: `0 2px 12px rgba(0,0,0,0.3)`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = `0 4px 20px ${s.border}44`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)"; }}
                    title={isAdmin ? "اضغط للتعديل" : "عرض البروفيل"}>
                    {localPerson.image_url ? (
                        <img src={localPerson.image_url.startsWith("http") ? localPerson.image_url : `http://localhost:8080${localPerson.image_url}`}
                            alt={localPerson.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (localPerson.full_name?.charAt(0) || "؟")}
                </div>

                <div style={{ marginTop: 5, fontSize: 11, fontWeight: 700, color: s.label, textAlign: "center", direction: "rtl", maxWidth: 110, lineHeight: "1.4", wordBreak: "break-word", margin: "5px auto 0", cursor: "pointer" }}
                    onClick={() => onViewProfile && onViewProfile(localPerson)}>
                    {localPerson.full_name.split(' ').slice(0, 3).join(' ')}
                </div>

                {localPerson.is_alive === false && (
                    <div style={{ fontSize: 9, color: "#666", marginTop: 2, textAlign: "center" }}>متوفي</div>
                )}

                {isAdmin && (
                    <button onClick={() => onAddChild(localPerson)} style={{ marginTop: 2, fontSize: 9, color: "var(--primary)", background: "transparent", border: "none", cursor: "pointer", opacity: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 2, width: "100%", transition: "opacity 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                        إضافة نسل
                    </button>
                )}
                {loading && <div style={{ fontSize: 10, color: "#444", marginTop: 4, textAlign: "center" }}>…</div>}
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
                setRoots(await res.json());
            } catch { setRoots([]); }
            finally { setLoading(false); }
        })();
    }, []);

    const displayRootsRaw = rootPerson ? [rootPerson] : (roots || []);
    const displayRoots = (isAdmin && !showFemales) ? displayRootsRaw.filter(r => r.gender !== "female") : displayRootsRaw;

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3" style={{ direction: "rtl" }}>
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22v-7"/><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2"/><path d="M7 15l5-5 5 5"/></svg>
                        شجرة آل أبوعلي البيطار
                    </div>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        الشجرة مفتوحة بالكامل — كل الأجيال ظاهرة
                        {isAdmin && " · اضغط على الدايرة للتعديل"}
                    </p>
                </div>
                <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "var(--text-secondary)" }}>
                    <span className="flex items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--primary)", display: "inline-block" }}/> ذكر</span>
                    <span className="flex items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ec4899", display: "inline-block" }}/> أنثى</span>
                    <span className="flex items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#555", display: "inline-block" }}/> متوفي</span>
                    {isAdmin && (
                        <button type="button" onClick={onToggleShowFemales}
                            className="px-3 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all"
                            style={{ background: showFemales ? "var(--primary-dim)" : "rgba(99,102,241,0.12)", border: "1px solid rgba(255,255,255,0.08)", color: showFemales ? "var(--primary)" : "#818cf8" }}>
                            {showFemales ? "إخفاء الإناث" : "إظهار الإناث"}
                        </button>
                    )}
                </div>
            </div>

            {loading && (
                <div className="flex items-center gap-2 py-12 justify-center text-sm" style={{ color: "var(--text-muted)" }}>
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--primary)" }}/>
                    جاري تحميل الشجرة...
                </div>
            )}
            {!loading && displayRoots.length === 0 && (
                <div className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>لا توجد بيانات — أضف أفراداً أولاً</div>
            )}
            <div style={{ overflowX: "auto", overflowY: "auto", padding: "24px 0", minHeight: 300, WebkitOverflowScrolling: "touch" }}>
                <div className="ft-tree">
                    {displayRoots.map(root => (
                        <TreeNode key={root.id} person={root} apiBase={apiBase}
                            token={token} isAdmin={isAdmin} showFemales={showFemales} depth={0}
                            onAddChild={p => onAddMember && onAddMember(p)} onViewProfile={onViewProfile} />
                    ))}
                </div>
            </div>
        </div>
    );
}
