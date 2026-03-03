import React, { useState, useRef, useEffect } from "react";

const EMPTY = { full_name: "", branch_name: "", gender: "", birth_year: "", email: "", phone: "", blood_type: "", profession: "", university_degree: "", job_title: "", is_student: false, looking_for_job: false };

export default function AddMemberForm({ apiBase, onSuccess, parentPerson }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);
  const [parentQuery, setParentQuery] = useState("");
  const [parentResults, setParentResults] = useState([]);
  const [parentId, setParentId] = useState(null);
  const [parentOpen, setParentOpen] = useState(false);
  const debounceRef = useRef(null);
  const parentRef = useRef(null);

  useEffect(() => { if (parentPerson) { setParentQuery(parentPerson.full_name); setParentId(parentPerson.id); } }, [parentPerson]);
  useEffect(() => { const h = (e) => { if (parentRef.current && !parentRef.current.contains(e.target)) setParentOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  useEffect(() => {
    if (!parentQuery.trim()) { setParentResults([]); setParentOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try { const r = await fetch(`${apiBase}/search?q=${encodeURIComponent(parentQuery)}&limit=8`); setParentResults(await r.json()); setParentOpen(true); } catch {}
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [parentQuery, apiBase]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setStatus(null); setLoading(true);
    try {
      const payload = { full_name: form.full_name.trim(), branch_name: form.branch_name.trim() || null, parent_id: parentId || null, gender: form.gender || null, birth_year: form.birth_year ? parseInt(form.birth_year) : null, email: form.email.trim() || null, phone: form.phone.trim() || null, blood_type: form.blood_type.trim() || null, profession: form.profession.trim() || null, university_degree: form.university_degree.trim() || null, job_title: form.job_title.trim() || null, is_student: !!form.is_student, looking_for_job: !!form.looking_for_job };
      const res = await fetch(`${apiBase}/members`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      const newMember = await res.json();
      if (photoFile) { const fd = new FormData(); fd.append("file", photoFile); await fetch(`${apiBase}/members/${newMember.id}/photo`, { method: "POST", body: fd }); }
      setStatus("success"); setForm(EMPTY); setParentQuery(parentPerson ? parentPerson.full_name : ""); setParentId(parentPerson ? parentPerson.id : null); setPhotoFile(null); setPhotoPreview(null);
      if (onSuccess) setTimeout(() => onSuccess(newMember), 1200);
    } catch { setStatus("error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="card p-5 md:p-7 animate-fade-in-up">
      <div className="mb-5">
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>إضافة فرد</div>
        <h2 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>تسجيل في سجل آل أبوعلي البيطار</h2>
        {parentPerson && <div className="mt-2 px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>إضافة نسل لـ: <strong>{parentPerson.full_name}</strong></div>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo */}
        <div className="flex flex-col items-center gap-2">
          <div onClick={() => photoInputRef.current?.click()} className="w-16 h-16 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition"
            style={{ border: "2px dashed rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}>
            {photoPreview ? <img src={photoPreview} alt="" className="w-full h-full object-cover" /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>}
          </div>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{photoFile ? photoFile.name : "اختر صورة (اختياري)"}</span>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الاسم الكامل *</label>
          <input type="text" name="full_name" required value={form.full_name} onChange={handleChange} placeholder="اكتب الاسم كاملاً" className="input-field" />
        </div>

        <div ref={parentRef} className="relative">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>اسم الأب (ابحث عنه)</label>
          <div className="relative">
            <input type="text" value={parentQuery} onChange={e => { setParentQuery(e.target.value); setParentId(null); }} placeholder="ابدأ اكتب اسم الأب..." className="input-field" style={parentId ? { borderColor: "var(--primary)" } : {}} />
            {parentId && <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
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

        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الفرع</label><input type="text" name="branch_name" value={form.branch_name} onChange={handleChange} placeholder="مثال: فرع حسين" className="input-field" /></div>
          <div><label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>النوع</label><select name="gender" value={form.gender} onChange={handleChange} className="input-field"><option value="">-- اختر --</option><option value="male">ذكر</option><option value="female">أنثى</option></select></div>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>سنة الميلاد</label><input type="number" name="birth_year" value={form.birth_year} onChange={handleChange} placeholder="1980" className="input-field" /></div>
          <div><label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الهاتف</label><input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="01012345678" className="input-field" /></div>
          <div><label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الإيميل</label><input type="email" name="email" value={form.email} onChange={handleChange} placeholder="example@mail.com" className="input-field" /></div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? "جاري الحفظ..." : "حفظ"}</button>
          {status === "success" && <div className="px-3 py-1.5 rounded-lg text-sm font-semibold animate-fade-in-scale" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>تم الحفظ ✓</div>}
          {status === "error" && <div className="px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>حدث خطأ</div>}
        </div>
      </form>
    </div>
  );
}
