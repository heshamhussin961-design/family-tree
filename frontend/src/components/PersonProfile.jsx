import React, { useRef, useState } from "react";

const GEN_COLORS = [
  { dot: "#C5A059", text: "#C5A059", bg: "rgba(197,160,89,0.08)", border: "rgba(197,160,89,0.2)" },
  { dot: "#10B981", text: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
  { dot: "#8B5CF6", text: "#8B5CF6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)" },
  { dot: "#06B6D4", text: "#06B6D4", bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.2)" },
];

export default function PersonProfile({ data, onSelectPerson, onAddDescendant, apiBase, isAdmin }) {
  const { person, lineage } = data;
  const initial = person.full_name?.charAt(0) || "؟";
  const [localImageUrl, setLocalImageUrl] = useState(person.image_url);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const photoInputRef = useRef(null);
  const imageUrl = localImageUrl ? (localImageUrl.startsWith("http") ? localImageUrl : `${apiBase || "http://localhost:8080"}${localImageUrl}`) : null;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true); setUploadError("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`${apiBase || "http://localhost:8080"}/members/${person.id}/photo`, { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).detail || "فشل رفع الصورة");
      setLocalImageUrl((await res.json()).image_url);
    } catch (e) { setUploadError(e.message); }
    finally { setUploadLoading(false); }
  };

  return (
    <div className="card p-5 md:p-7 animate-fade-in-up">

      <div className="flex flex-col md:flex-row gap-5 items-start mb-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0 mx-auto md:mx-0">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-2xl font-black text-white overflow-hidden cursor-pointer group"
            style={{ background: imageUrl ? "transparent" : "var(--primary)", boxShadow: "0 4px 20px rgba(16,185,129,0.2)" }}
            onClick={() => photoInputRef.current?.click()}>
            {imageUrl ? <img src={imageUrl} alt={person.full_name} className="w-full h-full object-cover" /> : initial}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </div>
          </div>
          {uploadLoading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/></div>}
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap"
            style={{ background: "var(--bg-card)", color: "var(--text-secondary)", boxShadow: "var(--shadow-card)" }}>
            {person.gender === "male" ? "ذكر" : person.gender === "female" ? "أنثى" : "فرد"}
          </span>
        </div>

        {/* Info */}
        <div className="mt-3 md:mt-0 flex-1 text-center md:text-right w-full">
          <h2 className="text-xl font-black mb-1" style={{ color: "var(--text-primary)" }}>{person.full_name}</h2>

          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start mt-2 mb-3">
            {person.branch_name && <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>فرع: {person.branch_name}</span>}
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold"
              style={person.is_alive !== false
                ? { background: "var(--primary-dim)", color: "var(--primary)" }
                : { background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
              {person.is_alive !== false ? "على قيد الحياة" : "المرحوم"}
            </span>
          </div>

          {(person.birth_year || person.death_year || person.blood_type || person.health_notes) && (
            <div className="grid grid-cols-2 gap-2 mb-3 max-w-sm mx-auto md:mx-0">
              {person.birth_year && (
                <div className="card p-3 text-center">
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>سنة الميلاد</div>
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{person.birth_year} م</div>
                </div>
              )}
              {person.death_year && (
                <div className="card p-3 text-center">
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>سنة الوفاة</div>
                  <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{person.death_year} م</div>
                </div>
              )}
              {person.blood_type && (
                <div className="card p-3 text-center" style={{ border: "1px solid rgba(239,68,68,0.15)" }}>
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>فصيلة الدم</div>
                  <div className="text-base font-black" style={{ color: "#ef4444" }}>{person.blood_type}</div>
                </div>
              )}
              {person.health_notes && (
                <div className="card p-3 text-right col-span-2 md:col-span-1">
                  <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>ملاحظات صحية</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{person.health_notes}</div>
                </div>
              )}
            </div>
          )}

          {isAdmin && (person.email || person.phone) && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold" style={{ color: "var(--accent)" }}>بيانات التواصل (للأدمن)</div>
              <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                {person.phone && <a href={`tel:${person.phone}`} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>{person.phone}</a>}
                {person.email && <a href={`mailto:${person.email}`} className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>{person.email}</a>}
              </div>
            </div>
          )}

          {uploadError && <div className="mt-2 text-xs px-3 py-1 rounded-lg inline-block" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>{uploadError}</div>}
          <div className="mt-2 text-[10px]" style={{ color: "var(--text-muted)" }}>اضغط على الصورة لتغييرها</div>
        </div>
      </div>

      {onAddDescendant && (
        <button onClick={() => onAddDescendant(person)}
          className="w-full mb-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
          style={{ background: "var(--primary-dim)", color: "var(--primary)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          إضافة نسل لـ {person.full_name.split(" ")[0]}
        </button>
      )}

      {lineage && lineage.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--accent)" }}>سلسلة النسب — {lineage.length} جيل</div>
          <div className="relative">
            <div className="absolute right-[18px] top-4 bottom-4" style={{ width: "2px", background: "rgba(255,255,255,0.06)" }} />
            <div className="space-y-2">
              {lineage.map((member, idx) => {
                const isCurrent = member.id === person.id;
                const isRoot = idx === 0;
                const c = GEN_COLORS[idx % GEN_COLORS.length];
                const gen = lineage.length - 1 - idx;
                return (
                  <div key={member.id} className="relative flex items-center gap-3 pr-10">
                    <div className="absolute right-0 w-9 h-9 rounded-full flex items-center justify-center z-10 text-xs font-black"
                      style={isCurrent
                        ? { background: "var(--primary)", color: "#fff", boxShadow: "0 0 12px rgba(16,185,129,0.3)" }
                        : { background: "var(--bg-card)", border: `2px solid ${c.dot}`, color: c.dot }}>
                      {isCurrent ? "✓" : isRoot ? "★" : idx + 1}
                    </div>
                    <button type="button" disabled={isCurrent} onClick={() => !isCurrent && onSelectPerson(member)}
                      className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-right"
                      style={isCurrent
                        ? { background: "rgba(16,185,129,0.08)", border: `1px solid rgba(16,185,129,0.2)` }
                        : { background: c.bg, border: `1px solid ${c.border}`, cursor: "pointer" }}>
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate" style={{ color: isCurrent ? "var(--primary)" : c.text }}>{member.full_name}</div>
                        <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{isRoot ? "الجد الأكبر" : `الجد ${gen === 1 ? "المباشر" : `رقم ${gen}`}`}{isCurrent && " · المحدد"}</div>
                      </div>
                      {!isCurrent && <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {(!lineage || lineage.length === 0) && <div className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>لا تتوفر معلومات النسب</div>}
    </div>
  );
}
