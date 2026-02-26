import React, { useEffect, useState } from "react";

export default function MembersList({ apiBase, onSelectPerson }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);

  const fetchMembers = async () => {
    if (fetched) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/members?limit=500`);
      if (!res.ok) throw new Error();
      setMembers(await res.json());
      setFetched(true);
    } catch {
      setError("حدث خطأ في تحميل الأفراد");
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = () => {
    setExpanded(v => !v);
    fetchMembers();
  };

  const filtered = members.filter(m =>
    !search.trim() ||
    m.full_name?.includes(search) ||
    m.branch_name?.includes(search)
  );

  // Group by branch
  const branches = {};
  filtered.forEach(m => {
    const b = m.branch_name || "غير محدد";
    if (!branches[b]) branches[b] = [];
    branches[b].push(m);
  });

  return (
    <div className="mt-8">
      {/* Toggle button */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-200"
        style={{
          background: expanded ? "rgba(45,122,79,0.12)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${expanded ? "rgba(45,122,79,0.3)" : "rgba(255,255,255,0.08)"}`,
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{expanded ? "🌿" : "📋"}</span>
          <div className="text-right">
            <div className="text-sm font-bold" style={{ color: "#e8f5ec" }}>
              استعراض جميع الأفراد
            </div>
            {fetched && (
              <div className="text-xs" style={{ color: "rgba(232,240,235,0.4)" }}>
                {members.length} شخص مسجّل
              </div>
            )}
          </div>
        </div>
        <svg
          width="18" height="18" fill="none" stroke="rgba(232,240,235,0.35)" strokeWidth="2" viewBox="0 0 24 24"
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-3 animate-fade-in-up">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-6 text-sm" style={{ color: "rgba(232,240,235,0.4)" }}>
              <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(45,122,79,0.3)", borderTopColor: "#2d7a4f" }} />
              جاري التحميل...
            </div>
          )}
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(200,50,50,0.12)", color: "#f87171" }}>
              {error}
            </div>
          )}
          {!loading && !error && fetched && (
            <>
              {/* Search filter */}
              <div className="mb-4">
                <input
                  type="text" value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="🔍 ابحث في القائمة..."
                  className="input-field text-sm"
                />
              </div>

              {/* Results grouped by branch */}
              <div className="space-y-5 max-h-96 overflow-y-auto pl-1">
                {Object.entries(branches).map(([branch, people]) => (
                  <div key={branch}>
                    <div className="text-xs font-bold px-2 py-1 rounded-full inline-block mb-2"
                      style={{ background: "rgba(45,122,79,0.14)", color: "#4db878", border: "1px solid rgba(45,122,79,0.2)" }}>
                      🌿 {branch} ({people.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {people.map(m => (
                        <button key={m.id} onClick={() => onSelectPerson(m)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all w-full"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(45,122,79,0.1)"; e.currentTarget.style.borderColor = "rgba(45,122,79,0.2)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                        >
                          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)" }}>
                            {m.full_name?.charAt(0)}
                          </div>
                          <span className="text-sm font-medium truncate" style={{ color: "#e8f5ec" }}>
                            {m.full_name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-6 text-sm" style={{ color: "rgba(232,240,235,0.3)" }}>
                    لا توجد نتائج
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
