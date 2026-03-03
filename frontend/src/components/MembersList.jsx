import React, { useEffect, useState } from "react";

export default function MembersList({ apiBase, token, onSelectPerson, showFemales }) {
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
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${apiBase}/members?limit=500`, { headers });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const filteredData = !showFemales ? data.filter(m => m.gender !== "female") : data;
      setMembers(filteredData);
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

  const branches = {};
  filtered.forEach(m => {
    const b = m.branch_name || "غير محدد";
    if (!branches[b]) branches[b] = [];
    branches[b].push(m);
  });

  return (
    <div className="mt-6 md:mt-8">
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between px-4 md:px-5 py-3.5 rounded-2xl transition-all duration-200 hover-lift"
        style={{
          background: expanded ? "rgba(45,122,79,0.12)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${expanded ? "rgba(45,122,79,0.3)" : "rgba(255,255,255,0.08)"}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: expanded ? "rgba(45,122,79,0.2)" : "rgba(255,255,255,0.06)", color: expanded ? "#4db878" : "rgba(232,240,235,0.5)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold" style={{ color: "#e8f5ec" }}>
              استعراض جميع الأفراد
            </div>
            {fetched && (
              <div className="text-[11px] md:text-xs" style={{ color: "rgba(232,240,235,0.4)" }}>
                {members.length} شخص مسجّل
              </div>
            )}
          </div>
        </div>
        <svg
          width="18" height="18" fill="none" stroke="rgba(232,240,235,0.35)" strokeWidth="2" viewBox="0 0 24 24"
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)" }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

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
              <div className="mb-4">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <svg width="14" height="14" fill="none" stroke="rgba(232,240,235,0.3)" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text" value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="ابحث في القائمة..."
                    className="bg-transparent outline-none text-sm flex-1 min-w-0"
                    style={{ color: "#e8f0eb" }}
                  />
                </div>
              </div>

              <div className="space-y-5 max-h-[70vh] md:max-h-96 overflow-y-auto pl-1">
                {Object.entries(branches).map(([branch, people]) => (
                  <div key={branch} className="animate-fade-in-up">
                    <div className="text-xs font-bold px-2 py-1 rounded-full inline-flex items-center gap-1.5 mb-2"
                      style={{ background: "rgba(45,122,79,0.14)", color: "#4db878", border: "1px solid rgba(45,122,79,0.2)" }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
                      {branch} ({people.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {people.map(m => (
                        <button key={m.id} onClick={() => onSelectPerson(m)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all w-full hover-lift"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(45,122,79,0.1)"; e.currentTarget.style.borderColor = "rgba(45,122,79,0.2)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                        >
                          <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: m.gender === "female" ? "linear-gradient(135deg,#ec4899,#be185d)" : "linear-gradient(135deg,#2d7a4f,#1a5c36)" }}>
                            {m.full_name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate block" style={{ color: "#e8f5ec" }}>
                              {m.full_name}
                            </span>
                            {m.gender === "female" && (
                              <span className="text-[10px]" style={{ color: "#f472b6" }}>أنثى</span>
                            )}
                          </div>
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
