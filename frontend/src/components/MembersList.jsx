import React, { useState, useMemo } from "react";

export default function MembersList({ apiBase, token, onSelectPerson, showFemales }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const fetchMembers = async () => {
    if (fetched) return;
    setLoading(true); setError(null);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${apiBase}/members?limit=500`, { headers });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMembers(!showFemales ? data.filter(m => m.gender !== "female") : data);
      setFetched(true);
    } catch { setError("حدث خطأ"); } finally { setLoading(false); }
  };

  // Build a lookup map: id -> full_name for showing parent names
  const memberMap = useMemo(() => {
    const map = {};
    members.forEach(m => { map[m.id] = m.full_name; });
    return map;
  }, [members]);

  const getParentLabel = (member) => {
    if (!member.parent_id) return null;
    const parentName = memberMap[member.parent_id];
    if (!parentName) return null;
    const prefix = member.gender === "female" ? "ابنة" : "ابن";
    return `${prefix} ${parentName}`;
  };

  const filtered = members.filter(m => !search.trim() || m.full_name?.includes(search) || m.branch_name?.includes(search));
  const branches = {};
  filtered.forEach(m => { const b = m.branch_name || "غير محدد"; if (!branches[b]) branches[b] = []; branches[b].push(m); });

  return (
    <div className="mt-4">
      <button onClick={() => { setExpanded(v => !v); fetchMembers(); }}
        className="card w-full flex items-center justify-between px-4 py-3 transition-all cursor-pointer"
        style={{ border: expanded ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: expanded ? "var(--primary-dim)" : "rgba(255,255,255,0.04)", color: expanded ? "var(--primary)" : "var(--text-muted)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>استعراض جميع الأفراد</div>
            {fetched && <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{members.length} شخص</div>}
          </div>
        </div>
        <svg width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24"
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {expanded && (
        <div className="mt-3 animate-fade-in-up">
          {loading && <div className="flex items-center gap-2 px-4 py-6 text-sm" style={{ color: "var(--text-muted)" }}><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--primary)" }}/>جاري التحميل...</div>}
          {error && <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>{error}</div>}
          {!loading && !error && fetched && (
            <>
              <div className="mb-3">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث في القائمة..." className="input-field text-sm" />
              </div>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {Object.entries(branches).map(([branch, people]) => (
                  <div key={branch}>
                    <div className="text-xs font-bold px-2 py-1 rounded-md inline-block mb-2" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>{branch} ({people.length})</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {people.map(m => {
                        const parentLabel = getParentLabel(m);
                        return (
                          <button key={m.id} onClick={() => onSelectPerson(m)}
                            className="card flex items-center gap-3 px-3 py-2 text-right cursor-pointer w-full transition"
                            style={{ border: "1px solid transparent" }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
                            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                              style={{ background: m.gender === "female" ? "#ec4899" : "var(--primary)" }}>{m.full_name?.charAt(0)}</div>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate block" style={{ color: "var(--text-secondary)" }}>{m.full_name}</span>
                              {parentLabel && (
                                <span className="text-[10px] font-medium truncate block mt-0.5" style={{ color: "var(--accent)" }}>
                                  {parentLabel}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <div className="text-center py-6 text-sm" style={{ color: "var(--text-muted)" }}>لا توجد نتائج</div>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

