import React, { useRef, useState } from "react";

const SVG_ICONS = {
  email: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  phone: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13.5 19.79 19.79 0 0 1 1.08 4.92 2 2 0 0 1 3.06 2.75h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  blood: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c4.97 0 7-3.58 7-7 0-4.5-7-13-7-13S5 10.5 5 15c0 3.42 2.03 7 7 7z" />
    </svg>
  ),
  health: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  calendar: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  branch: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" x2="6" y1="3" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  ),
  addUser: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  ),
  camera: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
    </svg>
  ),
};

const GEN_COLORS = [
  { dot: "#f59e0b", text: "#fbbf24", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
  { dot: "#2d7a4f", text: "#4db878", bg: "rgba(45,122,79,0.12)", border: "rgba(45,122,79,0.3)" },
  { dot: "#6366f1", text: "#818cf8", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.3)" },
  { dot: "#ec4899", text: "#f472b6", bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.3)" },
];

export default function PersonProfile({ data, onSelectPerson, onAddDescendant, apiBase, isAdmin }) {
  const { person, lineage } = data;
  const initial = person.full_name?.charAt(0) || "؟";

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
      className="rounded-2xl p-5 md:p-7 animate-fade-in-up"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* ══ TOP: Avatar + Name ══════════════════════════════════ */}
      <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-start mb-6 md:mb-8">
        {/* Avatar */}
        <div className="relative flex-shrink-0 mx-auto md:mx-0">
          <div
            className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl overflow-hidden cursor-pointer group animate-fade-in-scale"
            style={{ background: imageUrl ? "transparent" : "linear-gradient(135deg,#2d7a4f,#0f4d28)" }}
            onClick={() => photoInputRef.current?.click()}
            title="اضغط لتغيير الصورة"
          >
            {imageUrl ? (
              <img src={imageUrl} alt={person.full_name} className="w-full h-full object-cover" />
            ) : initial}
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.45)" }}>
              <span className="text-white">{SVG_ICONS.camera}</span>
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

          <span
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1"
            style={{ background: "rgba(12,27,17,0.95)", border: "1px solid rgba(45,122,79,0.4)", color: "#4db878" }}
          >
            {person.gender === "male" ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="10" cy="14" r="5"/><path d="M19 5l-4.35 4.35M15 5h4v4"/></svg> ذكر</>
            ) : person.gender === "female" ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg> أنثى</>
            ) : (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> فرد</>
            )}
          </span>
        </div>

        {/* Info */}
        <div className="mt-4 md:mt-0 flex-1 text-center md:text-right w-full">
          <h2 className="text-xl md:text-2xl font-black mb-1 animate-fade-in-up" style={{ color: "#e8f5ec" }}>
            {person.full_name}
          </h2>

          <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2 mb-3">
            {person.branch_name && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold animate-fade-in-up stagger-1"
                style={{ background: "rgba(45,122,79,0.18)", color: "#4db878", border: "1px solid rgba(45,122,79,0.3)" }}>
                {SVG_ICONS.branch} فرع: {person.branch_name}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold animate-fade-in-up stagger-2"
              style={person.is_alive !== false
                ? { background: "rgba(45,122,79,0.1)", color: "#4db878", border: "1px solid rgba(45,122,79,0.2)" }
                : { background: "rgba(100,100,100,0.12)", color: "#6b7280", border: "1px solid rgba(100,100,100,0.2)" }}>
              {person.is_alive !== false ? (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> على قيد الحياة</>
              ) : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg> المرحوم</>
              )}
            </span>
          </div>

          {/* Info cards: dates + health */}
          {(person.birth_year || person.death_year || person.blood_type || person.health_notes) && (
            <div className="grid grid-cols-2 gap-2 mb-3 max-w-md mx-auto md:mx-0">
              {person.birth_year && (
                <div className="px-3 py-2.5 rounded-xl text-center animate-fade-in-up stagger-3 hover-lift"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center justify-center gap-1 text-[10px] mb-1" style={{ color: "rgba(232,240,235,0.35)" }}>
                    {SVG_ICONS.calendar} سنة الميلاد
                  </div>
                  <div className="text-sm font-bold" style={{ color: "#e8f5ec" }}>{person.birth_year} م</div>
                </div>
              )}
              {person.death_year && (
                <div className="px-3 py-2.5 rounded-xl text-center animate-fade-in-up stagger-4 hover-lift"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center justify-center gap-1 text-[10px] mb-1" style={{ color: "rgba(232,240,235,0.35)" }}>
                    {SVG_ICONS.calendar} سنة الوفاة
                  </div>
                  <div className="text-sm font-bold" style={{ color: "#e8f5ec" }}>{person.death_year} م</div>
                </div>
              )}
              {person.blood_type && (
                <div className="px-3 py-2.5 rounded-xl text-center animate-fade-in-up stagger-5 hover-lift"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <div className="flex items-center justify-center gap-1 text-[10px] mb-1" style={{ color: "rgba(239,68,68,0.6)" }}>
                    {SVG_ICONS.blood} فصيلة الدم
                  </div>
                  <div className="text-base font-black" style={{ color: "#ef4444" }}>{person.blood_type}</div>
                </div>
              )}
              {person.health_notes && (
                <div className="px-3 py-2.5 rounded-xl text-right col-span-2 md:col-span-1 animate-fade-in-up stagger-6 hover-lift"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-1 text-[10px] mb-1" style={{ color: "rgba(232,240,235,0.35)" }}>
                    {SVG_ICONS.health} ملاحظات صحية
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: "rgba(232,240,235,0.75)" }}>{person.health_notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Contact chips — admin only */}
          {isAdmin && (person.email || person.phone) && (
            <div className="flex flex-wrap gap-2 justify-center md:justify-start animate-fade-in-up stagger-7">
              <div className="text-[10px] font-bold w-full mb-1" style={{ color: "rgba(245,158,11,0.6)" }}>
                <span className="flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  بيانات التواصل (للأدمن فقط)
                </span>
              </div>
              {person.phone && (
                <a href={`tel:${person.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover-lift transition-all"
                  style={{ background: "rgba(180,130,40,0.12)", color: "#d4a93a", border: "1px solid rgba(180,130,40,0.22)" }}>
                  {SVG_ICONS.phone} {person.phone}
                </a>
              )}
              {person.email && (
                <a href={`mailto:${person.email}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover-lift transition-all"
                  style={{ background: "rgba(45,122,79,0.13)", color: "#4db878", border: "1px solid rgba(45,122,79,0.22)" }}>
                  {SVG_ICONS.email} {person.email}
                </a>
              )}
            </div>
          )}

          {uploadError && (
            <div className="mt-2 text-xs px-3 py-1.5 rounded-xl inline-block"
              style={{ background: "rgba(200,50,50,0.12)", color: "#f87171", border: "1px solid rgba(200,50,50,0.2)" }}>
              {uploadError}
            </div>
          )}

          <div className="mt-2 text-[11px] flex items-center gap-1 justify-center md:justify-start" style={{ color: "rgba(232,240,235,0.25)" }}>
            {SVG_ICONS.camera} اضغط على الصورة لتغييرها
          </div>
        </div>
      </div>

      {/* ══ Add Descendant CTA ═══════════════════════════════════ */}
      {onAddDescendant && (
        <div className="mb-6 animate-fade-in-up stagger-4">
          <button
            onClick={() => onAddDescendant(person)}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, rgba(45,122,79,0.3), rgba(26,92,54,0.2))",
              border: "1px solid rgba(45,122,79,0.4)",
              color: "#4db878",
            }}
          >
            {SVG_ICONS.addUser} إضافة نسل لـ {person.full_name.split(" ")[0]}
          </button>
        </div>
      )}

      {/* ══ LINEAGE CHAIN ══════════════════════════════════════════ */}
      {lineage && lineage.length > 0 && (
        <div className="animate-fade-in-up stagger-5">
          <div className="text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: "#4db878" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="6" height="6" x="2" y="2" rx="1" /><rect width="6" height="6" x="16" y="16" rx="1" /><rect width="6" height="6" x="2" y="16" rx="1" /><path d="M5 8v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" /><path d="M12 12v4" />
            </svg>
            سلسلة النسب — {lineage.length} جيل
          </div>

          <div className="relative">
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
                  <div key={member.id} className={`relative flex items-center gap-3 md:gap-4 pr-10 animate-fade-in-up stagger-${Math.min(idx + 1, 8)}`}>
                    <div
                      className="absolute right-0 flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full shadow z-10"
                      style={isCurrent
                        ? { background: "linear-gradient(135deg,#2d7a4f,#1a5c36)", boxShadow: "0 0 0 3px rgba(45,122,79,0.3)" }
                        : { background: "rgba(12,27,17,0.9)", border: `2px solid ${color.dot}` }}
                    >
                      {isCurrent ? (
                        <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M12 2a5 5 0 1 1 0 10A5 5 0 0 1 12 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" /></svg>
                      ) : isRoot ? (
                        <svg width="14" height="14" fill="none" stroke={color.dot} strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22v-7" /><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2" /></svg>
                      ) : (
                        <span className="text-xs font-black" style={{ color: color.dot }}>{idx + 1}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => !isCurrent && onSelectPerson(member)}
                      className="flex-1 flex items-center justify-between px-3 md:px-4 py-2.5 rounded-xl transition-all duration-150 text-right hover-lift"
                      style={isCurrent
                        ? { background: "linear-gradient(135deg, rgba(45,122,79,0.25), rgba(26,92,54,0.15))", border: "1px solid rgba(45,122,79,0.4)", cursor: "default" }
                        : { background: color.bg, border: `1px solid ${color.border}`, cursor: "pointer" }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate" style={{ color: isCurrent ? "#e8f5ec" : color.text }}>
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
