import React, { useState, useEffect, useRef } from "react";

export default function SearchBar({ apiBase, token, onSelectPerson, showFemales }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [lineages, setLineages] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => { const h = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);

  const fetchLineage = async (personId) => {
    if (lineages[personId]) return;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${apiBase}/person/${personId}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setLineages(prev => ({ ...prev, [personId]: data.lineage || [] }));
    } catch {}
  };

  useEffect(() => {
    if (!query.trim()) { setResults([]); setIsOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${apiBase}/search?q=${encodeURIComponent(query)}`, { headers });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const filtered = !showFemales ? data.filter(p => p.gender !== "female") : data;
        setResults(filtered);
        setIsOpen(true);
        filtered.forEach(p => fetchLineage(p.id));
      } catch {} finally { setIsLoading(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, apiBase]);

  const buildLineageText = (personId) => {
    const lin = lineages[personId];
    if (!lin || lin.length <= 1) return null;
    const names = lin.map(m => m.full_name);
    return names.join(" ← ");
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="card flex items-center gap-3 px-4 py-3 transition-all"
        style={{ border: query ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent" }}>
        <svg width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" className="flex-1 bg-transparent outline-none text-sm min-w-0" style={{ color: "var(--text-primary)" }} placeholder="ابحث بالاسم..." value={query} onChange={e => setQuery(e.target.value)} />
        {isLoading && <div className="w-4 h-4 rounded-full border-2 animate-spin flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--primary)" }}/>}
        {query && !isLoading && <button onClick={() => { setQuery(""); setIsOpen(false); }} className="text-lg transition" style={{ color: "var(--text-muted)" }}>×</button>}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full rounded-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto animate-fade-in-up"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card-lg)" }}>
          {results.map((p, i) => {
            const lineageText = buildLineageText(p.id);
            return (
              <button key={p.id} onClick={() => { setQuery(p.full_name); setIsOpen(false); onSelectPerson(p); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-right transition"
                style={{ borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: p.gender === "female" ? "#ec4899" : "var(--primary)" }}>{p.full_name?.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{p.full_name}</div>
                  {p.branch_name && <div className="text-[11px] truncate" style={{ color: "var(--primary)" }}>فرع: {p.branch_name}</div>}
                  {lineageText && (
                    <div className="text-[10px] truncate mt-0.5 flex items-center gap-1" style={{ color: "var(--accent)", direction: "ltr" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0"><path d="M12 22v-7"/><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2"/></svg>
                      {lineageText}
                    </div>
                  )}
                </div>
                <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
            );
          })}
        </div>
      )}
      {isOpen && !isLoading && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full rounded-xl px-4 py-3 text-sm text-center z-50" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>لا توجد نتائج</div>
      )}
    </div>
  );
}
