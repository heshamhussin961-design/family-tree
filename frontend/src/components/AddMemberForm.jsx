import React, { useState, useRef, useEffect } from "react";

const EMPTY = {
  full_name: "", branch_name: "",
  gender: "", birth_year: "", email: "", phone: "",
  blood_type: "", health_notes: "",
};

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

  useEffect(() => {
    if (parentPerson) {
      setParentQuery(parentPerson.full_name);
      setParentId(parentPerson.id);
    }
  }, [parentPerson]);

  useEffect(() => {
    const h = (e) => { if (parentRef.current && !parentRef.current.contains(e.target)) setParentOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (!parentQuery.trim()) { setParentResults([]); setParentOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${apiBase}/search?q=${encodeURIComponent(parentQuery)}&limit=8`);
        const data = await res.json();
        setParentResults(data);
        setParentOpen(true);
      } catch { /* silent */ }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [parentQuery, apiBase]);

  const selectParent = (p) => {
    setParentQuery(p.full_name);
    setParentId(p.id);
    setParentOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        branch_name: form.branch_name.trim() || null,
        parent_id: parentId || null,
        gender: form.gender || null,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        blood_type: form.blood_type.trim() || null,
        health_notes: form.health_notes.trim() || null,
      };
      const res = await fetch(`${apiBase}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const newMember = await res.json();

      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        await fetch(`${apiBase}/members/${newMember.id}/photo`, {
          method: "POST",
          body: formData,
        });
      }

      setStatus("success");
      setForm(EMPTY);
      setParentQuery(parentPerson ? parentPerson.full_name : "");
      setParentId(parentPerson ? parentPerson.id : null);
      setPhotoFile(null);
      setPhotoPreview(null);
      if (onSuccess) setTimeout(() => onSuccess(newMember), 1500);
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-5 md:p-8 animate-fade-in-up"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(20px)" }}>

      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5" style={{ color: "#4db878" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" />
          </svg>
          إضافة فرد
        </div>
        <h2 className="text-lg md:text-xl font-black" style={{ color: "#e8f5ec" }}>تسجيل في سجل آل أبوعلي البيطار</h2>
        {parentPerson && (
          <div className="mt-2 px-3 py-1.5 rounded-xl text-sm inline-flex items-center gap-2"
            style={{ background: "rgba(45,122,79,0.15)", border: "1px solid rgba(45,122,79,0.3)", color: "#4db878" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            إضافة نسل لـ: <strong>{parentPerson.full_name}</strong>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* صورة الشخص */}
        <div className="flex flex-col items-center gap-3">
          <div
            onClick={() => photoInputRef.current?.click()}
            className="w-20 h-20 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:opacity-80 hover:scale-105"
            style={{
              background: photoPreview ? "transparent" : "rgba(45,122,79,0.15)",
              border: "2px dashed rgba(45,122,79,0.4)",
            }}
          >
            {photoPreview
              ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(77,184,120,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
            }
          </div>
          <button type="button" onClick={() => photoInputRef.current?.click()}
            className="text-xs font-semibold flex items-center gap-1" style={{ color: "rgba(232,240,235,0.4)" }}>
            {photoFile ? photoFile.name : "اختر صورة (اختياري)"}
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        {/* الاسم الكامل */}
        <div>
          <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: "rgba(232,240,235,0.55)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            الاسم الكامل *
          </label>
          <input type="text" name="full_name" required
            value={form.full_name} onChange={handleChange}
            placeholder="اكتب الاسم كاملاً" className="input-field" />
        </div>

        {/* البحث عن الأب */}
        <div ref={parentRef} className="relative">
          <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: "rgba(232,240,235,0.55)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            اسم الأب (ابحث عنه)
          </label>
          <div className="relative">
            <input type="text"
              value={parentQuery}
              onChange={e => { setParentQuery(e.target.value); setParentId(null); }}
              placeholder="ابدأ اكتب اسم الأب..."
              className="input-field"
              style={parentId ? { borderColor: "rgba(45,122,79,0.6)" } : {}}
            />
            {parentId && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4db878" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            )}
          </div>
          {parentOpen && parentResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full rounded-xl overflow-hidden shadow-xl z-50"
              style={{ background: "rgba(12,27,17,0.97)", border: "1px solid rgba(45,122,79,0.25)" }}>
              {parentResults.map((p, i) => (
                <button key={p.id} type="button" onClick={() => selectParent(p)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-right transition-colors"
                  style={{ borderBottom: i < parentResults.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(45,122,79,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)" }}>
                    {p.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: "#e8f5ec" }}>{p.full_name}</div>
                    {p.branch_name && <div className="text-xs truncate" style={{ color: "#4db878" }}>{p.branch_name}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* اسم الفرع + النوع */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: "rgba(232,240,235,0.55)" }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
              الفرع
            </label>
            <input type="text" name="branch_name" value={form.branch_name}
              onChange={handleChange} placeholder="مثال: فرع حسين" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(232,240,235,0.55)" }}>النوع</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
              <option value="">-- اختر --</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
        </div>

        {/* فصيلة الدم + ملاحظات صحية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: "rgba(232,240,235,0.55)" }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22c4.97 0 7-3.58 7-7 0-4.5-7-13-7-13S5 10.5 5 15c0 3.42 2.03 7 7 7z" /></svg>
              فصيلة الدم
            </label>
            <select name="blood_type" value={form.blood_type} onChange={handleChange} className="input-field">
              <option value="">-- غير محدد --</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: "rgba(232,240,235,0.55)" }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              ملاحظات صحية (اختياري)
            </label>
            <textarea
              name="health_notes"
              rows={3}
              value={form.health_notes}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="أي ملاحظات صحية مهمة تحب تُسجل (أمراض مزمنة، حساسية، ...)"
            />
          </div>
        </div>

        {/* سنة الميلاد + تواصل */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: "rgba(232,240,235,0.55)" }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              سنة الميلاد
            </label>
            <input type="number" name="birth_year" value={form.birth_year}
              onChange={handleChange} placeholder="مثال: 1980" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: "rgba(232,240,235,0.55)" }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13.5 19.79 19.79 0 0 1 1.08 4.92 2 2 0 0 1 3.06 2.75h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              الهاتف
            </label>
            <input type="tel" name="phone" value={form.phone}
              onChange={handleChange} placeholder="01012345678" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: "rgba(232,240,235,0.55)" }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              الإيميل
            </label>
            <input type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="example@mail.com" className="input-field" />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? (
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            )}
            {loading ? "جاري الحفظ..." : "حفظ"}
          </button>
          {status === "success" && (
            <div className="px-4 py-2 rounded-full text-sm font-semibold animate-bounce-in flex items-center gap-1.5"
              style={{ background: "rgba(45,122,79,0.2)", color: "#4db878", border: "1px solid rgba(45,122,79,0.3)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              تم الحفظ
            </div>
          )}
          {status === "error" && (
            <div className="px-4 py-2 rounded-full text-sm font-semibold animate-fade-in-up flex items-center gap-1.5"
              style={{ background: "rgba(200,50,50,0.15)", color: "#f87171", border: "1px solid rgba(200,50,50,0.25)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
              حدث خطأ
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
