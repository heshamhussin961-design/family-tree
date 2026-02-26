import React, { useRef, useState } from "react";

const INFO_ICON = {
  email: (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  phone: (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13.5 19.79 19.79 0 0 1 1.08 4.92 2 2 0 0 1 3.06 2.75h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
};

const GEN_COLORS = [
  { dot: "#f59e0b", text: "#fbbf24", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  { dot: "#2d7a4f", text: "#4db878", bg: "rgba(45,122,79,0.12)", border: "rgba(45,122,79,0.3)" },
  { dot: "#6366f1", text: "#818cf8", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.3)" },
  { dot: "#ec4899", text: "#f472b6", bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.3)" },
];

export default function PersonProfile({ data, onSelectPerson, onAddDescendant, apiBase }) {
  const { person, lineage } = data;
  const initial = person.full_name?.charAt(0) || "؟";

  // Photo upload state
  const [localImageUrl, setLocalImageUrl] = useState(person.image_url);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const photoInputRef = useRef(null);

  const imageUrl = localImageUrl
    ? (localImageUrl.startsWith("http") ? localImageUrl : `${apiBase || "http://localhost:8080"}${localImageUrl}`)
    : null;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${apiBase || "http://localhost:8080"}/members/${person.id}/photo`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "فشل رفع الصورة");
      }
      const updated = await res.json();
      setLocalImageUrl(updated.image_url);
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-6 md:p-7 animate-fade-in-up"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* ══ TOP: Avatar + Name block ══════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
        {/* Avatar — clickable to upload */}
        <div className="relative flex-shrink-0 mx-auto md:mx-0">
          <div
            className="w-28 h-28 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl overflow-hidden cursor-pointer group"
            style={{ background: imageUrl ? "transparent" : "linear-gradient(135deg,#2d7a4f,#0f4d28)" }}
            onClick={() => photoInputRef.current?.click()}
            title="اضغط لتغيير الصورة"
          >
            {imageUrl ? (
              <img src={imageUrl} alt={person.full_name} className="w-full h-full object-cover" />
            ) : initial}
            {/* overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.45)" }}>
              <span className="text-white text-2xl">📷</span>
            </div>
          </div>

          {uploadLoading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl"
              style={{ background: "rgba(0,0,0,0.6)" }}>
              <div className="w-6 h-6 border-2 rounded-full animate-spin"
                style={{ borderColor: "rgba(45,122,79,0.3)", borderTopColor: "#4db878" }} />
            </div>
          )}

          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

          {/* Gender badge */}
          <span
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
            style={{ background: "rgba(12,27,17,0.95)", border: "1px solid rgba(45,122,79,0.4)", color: "#4db878" }}
          >
            {person.gender === "male" ? "👨 ذكر" : person.gender === "female" ? "👩 أنثى" : "👤 فرد"}
          </span>
        </div>

        {/* Info */}
        <div className="mt-5 md:mt-0 flex-1 text-center md:text-right">
          <h2 className="text-2xl font-black mb-1" style={{ color: "#e8f5ec" }}>
            {person.full_name}
          </h2>

          <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2 mb-3">
            {person.branch_name && (
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(45,122,79,0.18)", color: "#4db878", border: "1px solid rgba(45,122,79,0.3)" }}>
                🌿 فرع: {person.branch_name}
              </span>
            )}
            <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold"
              style={person.is_alive !== false
                ? { background: "rgba(45,122,79,0.1)", color: "#4db878", border: "1px solid rgba(45,122,79,0.2)" }
                : { background: "rgba(100,100,100,0.12)", color: "#6b7280", border: "1px solid rgba(100,100,100,0.2)" }}>
              {person.is_alive !== false ? "💚 على قيد الحياة" : "🕊️ المرحوم"}
            </span>
          </div>

          {/* Dates */}
          {(person.birth_year || person.death_year) && (
            <div className="grid grid-cols-2 gap-2 mb-3 max-w-xs mx-auto md:mx-0">
              {person.birth_year && (
                <div className="px-3 py-2 rounded-xl text-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-[10px] mb-0.5" style={{ color: "rgba(232,240,235,0.35)" }}>سنة الميلاد</div>
                  <div className="text-sm font-bold" style={{ color: "#e8f5ec" }}>{person.birth_year} م</div>
                </div>
              )}
              {person.death_year && (
                <div className="px-3 py-2 rounded-xl text-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-[10px] mb-0.5" style={{ color: "rgba(232,240,235,0.35)" }}>سنة الوفاة</div>
                  <div className="text-sm font-bold" style={{ color: "#e8f5ec" }}>{person.death_year} م</div>
                </div>
              )}
            </div>
          )}

          {/* Contact chips */}
          {(person.email || person.phone) && (
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {person.email && (
                <a href={`mailto:${person.email}`}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(45,122,79,0.13)", color: "#4db878", border: "1px solid rgba(45,122,79,0.22)" }}>
                  {INFO_ICON.email} {person.email}
                </a>
              )}
              {person.phone && (
                <a href={`tel:${person.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(180,130,40,0.12)", color: "#d4a93a", border: "1px solid rgba(180,130,40,0.22)" }}>
                  {INFO_ICON.phone} {person.phone}
                </a>
              )}
            </div>
          )}

          {/* Upload error */}
          {uploadError && (
            <div className="mt-2 text-xs px-3 py-1.5 rounded-xl inline-block"
              style={{ background: "rgba(200,50,50,0.12)", color: "#f87171", border: "1px solid rgba(200,50,50,0.2)" }}>
              ❌ {uploadError}
            </div>
          )}

          {/* Photo hint */}
          <div className="mt-2 text-[11px]" style={{ color: "rgba(232,240,235,0.25)" }}>
            📷 اضغط على الصورة لتغييرها
          </div>
        </div>
      </div>

      {/* ══ Add Descendant CTA ════════════════════════════════════════════ */}
      {onAddDescendant && (
        <div className="mb-6">
          <button
            onClick={() => onAddDescendant(person)}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(45,122,79,0.3), rgba(26,92,54,0.2))",
              border: "1px solid rgba(45,122,79,0.4)",
              color: "#4db878",
            }}
          >
            👤+ إضافة نسل لـ {person.full_name.split(" ")[0]}
          </button>
        </div>
      )}

      {/* ══ LINEAGE CHAIN ════════════════════════════════════════════════════ */}
      {lineage && lineage.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#4db878" }}>
            سلسلة النسب — {lineage.length} جيل
          </div>

          <div className="relative">
            {/* Vertical connector line */}
            <div
              className="absolute right-[18px] top-5 bottom-5"
              style={{ width: "2px", background: "linear-gradient(to bottom, rgba(45,122,79,0.6), rgba(45,122,79,0.05))" }}
            />

            <div className="space-y-2">
              {lineage.map((member, idx) => {
                const isCurrent = member.id === person.id;
                const isRoot = idx === 0;
                const color = GEN_COLORS[idx % GEN_COLORS.length];
                const generation = lineage.length - 1 - idx;

                return (
                  <div key={member.id} className="relative flex items-center gap-4 pr-10">
                    {/* Generation dot */}
                    <div
                      className="absolute right-0 flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full shadow z-10"
                      style={isCurrent
                        ? { background: "linear-gradient(135deg,#2d7a4f,#1a5c36)", boxShadow: "0 0 0 3px rgba(45,122,79,0.3)" }
                        : { background: "rgba(12,27,17,0.9)", border: `2px solid ${color.dot}` }}
                    >
                      {isCurrent ? (
                        <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" /></svg>
                      ) : isRoot ? (
                        <span style={{ fontSize: "14px" }}>👴</span>
                      ) : (
                        <span className="text-xs font-black" style={{ color: color.dot }}>{idx + 1}</span>
                      )}
                    </div>

                    {/* Card */}
                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => !isCurrent && onSelectPerson(member)}
                      className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-150 text-right"
                      style={isCurrent
                        ? { background: "linear-gradient(135deg, rgba(45,122,79,0.25), rgba(26,92,54,0.15))", border: "1px solid rgba(45,122,79,0.4)", cursor: "default" }
                        : { background: color.bg, border: `1px solid ${color.border}`, cursor: "pointer" }}
                      onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.filter = "brightness(1.15)"; }}
                      onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.filter = ""; }}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-bold" style={{ color: isCurrent ? "#e8f5ec" : color.text }}>
                          {member.full_name}
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: "rgba(232,240,235,0.35)" }}>
                          {isRoot ? "الجد الأكبر" : `الجد ${generation === 1 ? "المباشر" : `رقم ${generation}`}`}
                          {isCurrent && " · الشخص المحدد"}
                        </div>
                      </div>
                      {!isCurrent && (
                        <svg width="14" height="14" fill="none" stroke={color.dot} strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {(!lineage || lineage.length === 0) && (
        <div className="text-sm text-center py-4" style={{ color: "rgba(232,240,235,0.3)" }}>
          لا تتوفر معلومات النسب لهذا الشخص
        </div>
      )}
    </div>
  );
}
