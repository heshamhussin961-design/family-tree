import React, { useState, useRef, useEffect } from "react";

const EMPTY = { full_name: "", branch_name: "", gender: "", birth_year: "", birth_month: "", birth_day: "", death_year: "", death_month: "", death_day: "", is_alive: true, email: "", phone: "", blood_type: "", profession: "", university_degree: "", job_title: "", is_student: false, looking_for_job: false, birth_place: "", residence_place: "", is_married: false, marital_status: "" };

export default function AddMemberForm({ apiBase, onSuccess, parentPerson, notify }) {
  const [form, setForm] = useState(EMPTY);
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);
  const [parentQuery, setParentQuery] = useState("");
  const [parentResults, setParentResults] = useState([]);
  const [parentId, setParentId] = useState(null);
  const [parentOpen, setParentOpen] = useState(false);
  const [parentLineage, setParentLineage] = useState([]);
  const debounceRef = useRef(null);
  const parentRef = useRef(null);

  const isDescendantMode = !!parentPerson;

  useEffect(() => { if (parentPerson) { setParentQuery(parentPerson.full_name); setParentId(parentPerson.id); } }, [parentPerson]);

  // Fetch lineage
  useEffect(() => {
    if (!parentId || !apiBase) return;
    (async () => {
      try {
        const r = await fetch(`${apiBase}/person/${parentId}`);
        if (r.ok) {
          const data = await r.json();
          setParentLineage(data.lineage || []);
        } else setParentLineage([]);
      } catch { setParentLineage([]); }
    })();
  }, [parentId, apiBase]);
  useEffect(() => { const h = (e) => { if (parentRef.current && !parentRef.current.contains(e.target)) setParentOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  useEffect(() => {
    if (parentId) return;
    if (!parentQuery.trim()) { setParentResults([]); setParentOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try { const r = await fetch(`${apiBase}/search?q=${encodeURIComponent(parentQuery)}&limit=8`); setParentResults(await r.json()); setParentOpen(true); } catch { }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [parentQuery, apiBase, parentId]);

  // Auto-generate full name: firstName + reversed lineage (Arab naming: name father grandfather ...)
  useEffect(() => {
    if (!isDescendantMode) return;
    if (parentLineage.length > 0) {
      const ancestors = [...parentLineage].reverse().map(m => m.full_name);
      const fullName = firstName.trim() ? [firstName.trim(), ...ancestors].join(" ") : "";
      setForm(p => ({ ...p, full_name: fullName }));
    } else if (parentPerson) {
      const fullName = firstName.trim() ? `${firstName.trim()} ${parentPerson.full_name}` : "";
      setForm(p => ({ ...p, full_name: fullName }));
    }
  }, [firstName, parentLineage, isDescendantMode, parentPerson]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setStatus(null); setLoading(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        branch_name: form.branch_name.trim() || null,
        parent_id: parentId || null,
        gender: form.gender || null,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        birth_month: form.birth_month ? parseInt(form.birth_month) : null,
        birth_day: form.birth_day ? parseInt(form.birth_day) : null,
        death_year: form.death_year ? parseInt(form.death_year) : null,
        death_month: form.death_month ? parseInt(form.death_month) : null,
        death_day: form.death_day ? parseInt(form.death_day) : null,
        is_alive: !!form.is_alive,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        blood_type: form.blood_type.trim() || null,
        profession: form.profession.trim() || null,
        university_degree: form.university_degree.trim() || null,
        job_title: form.job_title.trim() || null,
        is_student: !!form.is_student,
        looking_for_job: !!form.looking_for_job,
        birth_place: form.birth_place.trim() || null,
        residence_place: form.residence_place.trim() || null,
        is_married: !!form.is_married,
        marital_status: form.marital_status || null
      };
      const res = await fetch(`${apiBase}/members`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      const newMember = await res.json();
      if (photoFile) { const fd = new FormData(); fd.append("file", photoFile); await fetch(`${apiBase}/members/${newMember.id}/photo`, { method: "POST", body: fd }); }

      if (newMember.is_approved === false) {
        setStatus("pending");
      } else {
        setStatus("success");
      }

      setForm(EMPTY); setFirstName(""); setParentQuery(parentPerson ? parentPerson.full_name : ""); setParentId(parentPerson ? parentPerson.id : null); setPhotoFile(null); setPhotoPreview(null);
      if (onSuccess) setTimeout(() => onSuccess(newMember), 2000);
    } catch {
      setStatus("error");
      if (notify) notify("حدث خطأ أثناء الحفظ", "error");
    }
    finally { setLoading(false); }
  };

  return (
    <div className="card p-5 md:p-7 animate-fade-in-up">
      <div className="mb-5">
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>إضافة فرد</div>
        <h2 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>تسجيل في سجل آل أبوعلي البيطار</h2>
        {isDescendantMode && (
          <div className="mt-2 px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>
            إضافة نسل لـ: <strong>{parentPerson.full_name}</strong>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div onClick={() => photoInputRef.current?.click()} className="w-16 h-16 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition"
              style={{ border: "2px dashed rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}>
              {photoPreview ? <img src={photoPreview} alt="" className="w-full h-full object-cover" /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>}
            </div>
            {photoPreview && (
              <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} title="إزالة الصورة"
                className="absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition"
                style={{ background: "#ef4444", border: "2px solid var(--bg-card)" }}>
                ✕
              </button>
            )}
          </div>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{photoFile ? photoFile.name : "اختر صورة (اختياري)"}</span>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { if (photoPreview) URL.revokeObjectURL(photoPreview); setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
        </div>

        {/* Parent / Lineage Section — shown FIRST */}
        <div ref={parentRef} className="relative">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>اسم الأب (النسب)</label>
          {isDescendantMode && parentId ? (
            <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(16,185,129,0.08)", border: "1.5px solid var(--primary)" }}>
              {parentLineage.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1 text-sm" style={{ direction: "rtl" }}>
                  {parentLineage.map((m, i) => (
                    <span key={m.id} className="flex items-center gap-1">
                      {i > 0 && <span style={{ color: "var(--text-muted)", fontSize: 10 }}>←</span>}
                      <span className="font-bold" style={{ color: i === parentLineage.length - 1 ? "var(--primary)" : "var(--text-primary)" }}>{m.full_name}</span>
                    </span>
                  ))}
                  <svg className="ml-2 flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--primary)" }}>
                  <span className="font-bold">{parentPerson.full_name}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>جاري تحميل النسب...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <input type="text" value={parentQuery} onChange={e => { setParentQuery(e.target.value); setParentId(null); }} placeholder="ابدأ اكتب اسم الأب..." className="input-field" style={parentId ? { borderColor: "var(--primary)" } : {}} />
              {parentId && <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
          )}
          {parentOpen && parentResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full rounded-xl overflow-hidden z-50" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card-lg)" }}>
              {parentResults.map((p, i) => (
                <button key={p.id} type="button" onClick={() => { setParentQuery(p.full_name); setParentId(p.id); setParentOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-right transition"
                  style={{ borderBottom: i < parentResults.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--primary)" }}>{p.full_name?.charAt(0)}</div>
                  <div className="min-w-0"><div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{p.full_name}</div>{p.branch_name && <div className="text-[11px] truncate" style={{ color: "var(--primary)" }}>{p.branch_name}</div>}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name Section — different for descendant vs manual */}
        {isDescendantMode ? (
          <>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الاسم الأول *</label>
              <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="اكتب الاسم الأول فقط (مثال: أحمد)" className="input-field" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الاسم الكامل (تلقائي)</label>
              <div className="rounded-xl px-3 py-2.5 text-sm font-semibold min-h-[42px] flex items-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: form.full_name ? "var(--text-primary)" : "var(--text-muted)", direction: "rtl" }}>
                {form.full_name || "سيظهر الاسم الكامل هنا تلقائياً..."}
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الاسم الكامل *</label>
            <input type="text" name="full_name" required value={form.full_name} onChange={handleChange} placeholder="اكتب الاسم كاملاً" className="input-field" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الفرع</label><input type="text" name="branch_name" value={form.branch_name} onChange={handleChange} placeholder="مثال: فرع حسين" className="input-field" /></div>
          <div><label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>النوع</label><select name="gender" value={form.gender} onChange={handleChange} className="input-field"><option value="">-- اختر --</option><option value="male">ذكر</option><option value="female">أنثى</option></select></div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الحالة الاجتماعية</label>
          <select name="marital_status" value={form.marital_status} onChange={handleChange} className="input-field">
            <option value="">-- اختر الحالة --</option>
            <option value="أعزب">أعزب / عزباء</option>
            <option value="متزوج">متزوج / متزوجة</option>
            <option value="مطلق">مطلق / مطلقة</option>
            <option value="أرمل">أرمل / أرملة</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>فصيلة الدم</label>
            <select name="blood_type" value={form.blood_type} onChange={handleChange} className="input-field">
              <option value="">-- غير محدد --</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>المهنة</label>
            <input type="text" name="profession" value={form.profession} onChange={handleChange} placeholder="مثال: مهندس، طبيب..." className="input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>مكان الميلاد</label>
            <input type="text" name="birth_place" value={form.birth_place} onChange={handleChange} placeholder="مثال: القاهرة، مصر" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>مكان الإقامة</label>
            <input type="text" name="residence_place" value={form.residence_place} onChange={handleChange} placeholder="مثال: الرياض، السعودية" className="input-field" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>المؤهل الجامعي</label>
            <input type="text" name="university_degree" value={form.university_degree} onChange={handleChange} placeholder="مثال: بكالوريوس هندسة..." className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الوظيفة</label>
            <input type="text" name="job_title" value={form.job_title} onChange={handleChange} placeholder="مثال: مدير مشاريع..." className="input-field" />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_student" checked={form.is_student} onChange={e => setForm(p => ({ ...p, is_student: e.target.checked }))} className="sr-only peer" />
            <div className="w-9 h-5 rounded-full transition-colors relative" style={{ background: form.is_student ? "var(--primary)" : "#444" }}>
              <div className="w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-all" style={{ left: form.is_student ? "18px" : "2px" }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: form.is_student ? "var(--primary)" : "var(--text-secondary)" }}>طالب</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="looking_for_job" checked={form.looking_for_job} onChange={e => setForm(p => ({ ...p, looking_for_job: e.target.checked }))} className="sr-only peer" />
            <div className="w-9 h-5 rounded-full transition-colors relative" style={{ background: form.looking_for_job ? "var(--accent)" : "#444" }}>
              <div className="w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-all" style={{ left: form.looking_for_job ? "18px" : "2px" }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: form.looking_for_job ? "var(--accent)" : "var(--text-secondary)" }}>يبحث عن عمل</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="is_married" checked={form.is_married} onChange={e => setForm(p => ({ ...p, is_married: e.target.checked }))} className="sr-only peer" />
            <div className="w-9 h-5 rounded-full transition-colors relative" style={{ background: form.is_married ? "#f472b6" : "#444" }}>
              <div className="w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-all" style={{ left: form.is_married ? "18px" : "2px" }} />
            </div>
            <span className="text-xs font-semibold" style={{ color: form.is_married ? "#f472b6" : "var(--text-secondary)" }}>متزوج</span>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: form.is_alive ? "var(--primary-dim)" : "rgba(255,255,255,0.03)", border: form.is_alive ? "1px solid rgba(16,185,129,0.2)" : "1px solid var(--border)" }}>
          <div className="text-sm font-bold" style={{ color: form.is_alive ? "var(--primary)" : "var(--text-muted)" }}>{form.is_alive ? "على قيد الحياة" : "المرحوم (توفي)"}</div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="is_alive" checked={form.is_alive} onChange={e => setForm(p => ({ ...p, is_alive: e.target.checked }))} className="sr-only peer" />
            <div className="w-10 h-5 rounded-full transition-colors" style={{ background: form.is_alive ? "var(--primary)" : "#444" }}>
              <div className="w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-all" style={{ left: form.is_alive ? "22px" : "3px" }} />
            </div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>تاريخ الميلاد</label>
            <div className="grid grid-cols-3 gap-1">
              <input type="number" name="birth_day" value={form.birth_day} onChange={handleChange} placeholder="يوم" className="input-field px-1 text-center" min="1" max="31" />
              <select name="birth_month" value={form.birth_month} onChange={handleChange} className="input-field px-1 text-center">
                <option value="">شهر</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <input type="number" name="birth_year" value={form.birth_year} onChange={handleChange} placeholder="سنة" className="input-field px-1 text-center" />
            </div>
          </div>

          {!form.is_alive && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>تاريخ الوفاة</label>
              <div className="grid grid-cols-3 gap-1">
                <input type="number" name="death_day" value={form.death_day} onChange={handleChange} placeholder="يوم" className="input-field px-1 text-center" min="1" max="31" />
                <select name="death_month" value={form.death_month} onChange={handleChange} className="input-field px-1 text-center">
                  <option value="">شهر</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                <input type="number" name="death_year" value={form.death_year} onChange={handleChange} placeholder="سنة" className="input-field px-1 text-center" />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الهاتف</label><input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="01012345678" className="input-field" /></div>
          <div className="col-span-2"><label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الإيميل</label><input type="email" name="email" value={form.email} onChange={handleChange} placeholder="example@mail.com" className="input-field" /></div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? "جاري الحفظ..." : "حفظ"}</button>
          {status === "success" && <div className="px-3 py-1.5 rounded-lg text-sm font-semibold animate-fade-in-scale" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>تم الحفظ ✓</div>}
          {status === "pending" && <div className="px-3 py-1.5 rounded-lg text-sm font-semibold animate-fade-in-scale" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>تم إرسال الطلب للإدارة ⏳</div>}
          {status === "error" && <div className="px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>حدث خطأ</div>}
        </div>
      </form>
    </div>
  );
}
