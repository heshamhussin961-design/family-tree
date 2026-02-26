import React, { useState, useEffect } from "react";
import EditMemberModal from "./EditMemberModal.jsx";

/* ── Node colour by gender / is_alive ──────────────────── */
function nodeStyle(person) {
    if (!person.is_alive && person.is_alive !== undefined)
        return { bg: "#374151", border: "#6b7280", text: "#9ca3af", label: "#d1d5db" };
    if (person.gender === "female")
        return { bg: "#fbcfe8", border: "#f472b6", text: "#9d174d", label: "#e8f5ec" };
    return { bg: "linear-gradient(135deg,#2d7a4f,#1a5c36)", border: "#2d7a4f", text: "#fff", label: "#e8f5ec" };
}

/* ── Single Node ───────────────────────────────────────── */
function TreeNode({ person, apiBase, token, isAdmin, onAddChild, onViewProfile, depth = 0 }) {
    const [children, setChildren] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [localPerson, setLocal] = useState(person);
    const s = nodeStyle(localPerson);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${apiBase}/children/${localPerson.id}`);
                setChildren(await res.json());
            } catch { setChildren([]); }
            finally { setLoading(false); }
        })();
    }, [apiBase, localPerson.id]);

    const hasKids = children && children.length > 0;

    return (
        <div className="ft-node">
            {/* Person info */}
            <div className="ft-person">
                <div
                    onClick={() => {
                        if (isAdmin) setEditing(true);
                        else if (onViewProfile) onViewProfile(localPerson);
                    }}
                    style={{
                        width: 60, height: 60, borderRadius: "50%",
                        background: localPerson.image_url ? "transparent" : s.bg,
                        border: `3px solid ${s.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, fontWeight: 900, color: s.text,
                        cursor: "pointer",
                        boxShadow: `0 4px 20px ${s.border}55`,
                        transition: "transform .15s", userSelect: "none",
                        margin: "0 auto", position: "relative", zIndex: 2,
                        overflow: "hidden",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
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
                    marginTop: 8, fontSize: 14, fontWeight: 700,
                    color: s.label, textAlign: "center", direction: "rtl",
                    maxWidth: 140, lineHeight: "1.4", wordBreak: "break-word",
                    margin: "8px auto 0", cursor: "pointer",
                }}
                    onClick={() => onViewProfile && onViewProfile(localPerson)}
                >
                    {localPerson.full_name.split(' ').slice(0, 3).join(' ')}
                </div>

                {localPerson.is_alive === false && (
                    <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2, textAlign: "center" }}>🕊️ توفي</div>
                )}

                <button onClick={() => onAddChild(localPerson)} style={{
                    marginTop: 4, fontSize: 10, color: "#4db878",
                    background: "transparent", border: "none", cursor: "pointer",
                    opacity: 0.7, display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 3, width: "100%",
                }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "0.7"}>
                    👤+ إضافة نسل
                </button>

                {loading && <div style={{ fontSize: 10, color: "rgba(232,240,235,0.3)", marginTop: 4, textAlign: "center" }}>…</div>}
            </div>

            {/* Children */}
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


/* ── Main TreeView ─────────────────────────────────────── */
export default function TreeView({ apiBase, token, isAdmin, rootPerson, onAddMember, onViewProfile }) {
    const [roots, setRoots] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (rootPerson || roots !== null) return;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`${apiBase}/roots?limit=50`);
                setRoots(await res.json());
            } catch { setRoots([]); }
            finally { setLoading(false); }
        })();
    }, []);

    const displayRoots = rootPerson ? [rootPerson] : (roots || []);

    return (
        <div>
            <div className="flex items-center justify-between mb-5" style={{ direction: "rtl" }}>
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#4db878" }}>🌳 شجرة عائلة البيطار</div>
                    <p className="text-xs" style={{ color: "rgba(232,240,235,0.35)" }}>
                        الشجرة مفتوحة بالكامل — كل الأجيال ظاهرة
                        {isAdmin && " · اضغط على الدايرة للتعديل"}
                    </p>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(232,240,235,0.4)" }}>
                    <span><span style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)", borderRadius: "50%", display: "inline-block", width: 12, height: 12, verticalAlign: "middle" }} /> ذكر</span>
                    <span><span style={{ background: "#fbcfe8", borderRadius: "50%", display: "inline-block", width: 12, height: 12, verticalAlign: "middle" }} /> أنثى</span>
                    <span><span style={{ background: "#374151", borderRadius: "50%", display: "inline-block", width: 12, height: 12, verticalAlign: "middle" }} /> توفي</span>
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

            {/* Scrollable tree — FORCED LTR so CSS lines work */}
            <div style={{ overflowX: "auto", overflowY: "auto", padding: "24px 0", minHeight: 300 }}>
                <div className="ft-tree">
                    {displayRoots.map(root => (
                        <TreeNode key={root.id} person={root} apiBase={apiBase}
                            token={token} isAdmin={isAdmin} depth={0}
                            onAddChild={p => onAddMember && onAddMember(p)}
                            onViewProfile={onViewProfile} />
                    ))}
                </div>
            </div>
        </div>
    );
}
