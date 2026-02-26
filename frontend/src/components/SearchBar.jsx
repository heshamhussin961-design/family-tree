import React, { useState, useEffect, useRef } from "react";

export default function SearchBar({ apiBase, onSelectPerson }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setIsOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${apiBase}/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, apiBase]);

  const handleSelect = (person) => {
    setQuery(person.full_name);
    setIsOpen(false);
    onSelectPerson(person);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Search Input */}
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: query ? "0 0 0 3px rgba(45,122,79,0.3)" : "none",
        }}
      >
        {/* Search icon */}
        <svg width="18" height="18" fill="none" stroke="rgba(232,240,235,0.4)" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="flex-1 bg-transparent outline-none text-sm font-medium"
          style={{ color: "#e8f0eb" }}
          placeholder="ابحث بالاسم الكامل أو جزء منه..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isLoading && (
          <div
            className="w-4 h-4 rounded-full border-2 animate-spin"
            style={{ borderColor: "rgba(45,122,79,0.3)", borderTopColor: "#2d7a4f" }}
          />
        )}
        {query && !isLoading && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); }}
            style={{ color: "rgba(232,240,235,0.35)" }}
            className="hover:text-white transition-colors text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div
          className="absolute top-full mt-2 w-full rounded-2xl overflow-hidden shadow-2xl z-50"
          style={{
            background: "rgba(12,27,17,0.97)",
            border: "1px solid rgba(45,122,79,0.3)",
            backdropFilter: "blur(24px)",
          }}
        >
          {results.map((person, idx) => (
            <button
              key={person.id}
              onClick={() => handleSelect(person)}
              className="w-full flex items-center gap-3 px-4 py-3 text-right transition-all duration-150"
              style={{
                borderBottom: idx < results.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(45,122,79,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white shadow"
                style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)" }}
              >
                {person.full_name?.charAt(0) || "؟"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: "#e8f5ec" }}>
                  {person.full_name}
                </div>
                {person.branch_name && (
                  <div className="text-xs mt-0.5 truncate" style={{ color: "rgba(77,184,120,0.7)" }}>
                    فرع: {person.branch_name}
                  </div>
                )}
              </div>
              <svg width="14" height="14" fill="none" stroke="rgba(232,240,235,0.2)" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && !isLoading && results.length === 0 && (
        <div
          className="absolute top-full mt-2 w-full rounded-2xl px-5 py-4 text-sm text-center z-50"
          style={{
            background: "rgba(12,27,17,0.97)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(232,240,235,0.4)",
          }}
        >
          لا توجد نتائج مطابقة
        </div>
      )}
    </div>
  );
}
