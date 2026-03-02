import React, { useState, useRef, useEffect } from "react";

const EMPTY = {
  full_name: "", branch_name: "",
  gender: "", birth_year: "", email: "", phone: "",
};

export default function AddMemberForm({ apiBase, onSuccess, parentPerson }) {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);

  // Parent search
  const [parentQuery, setParentQuery] = useState("");
  const [parentResults, setParentResults] = useState([]);
  const [parentId, setParentId] = useState(null);
  const [parentOpen, setParentOpen] = useState(false);
  const debounceRef = useRef(null);
  const parentRef = useRef(null);

  /* ── Auto-fill parent when coming from TreeView ── */
  useEffect(() => {
    if (parentPerson) {
      setParentQuery(parentPerson.full_name);
      setParentId(parentPerson.id);
    }
  }, [parentPerson]);

  /* ── Close parent dropdown on outside click ── */
  useEffect(() => {
    const h = (e) => { if (parentRef.current && !parentRef.current.contains(e.target)) setParentOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Parent name search ── */
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
      // 1. Create the member
      const payload = {
        full_name: form.full_name.trim(),
        branch_name: form.branch_name.trim() || null,
        parent_id: parentId || null,
        gender: form.gender || null,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      };
      const res = await fetch(`${apiBase}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const newMember = await res.json();

      // 2. Upload photo if provided
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
    <div className="rounded-2xl p-6 md:p-8 animate-fade-in-up"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(20px)" }}>

      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#4db878" }}>إضافة فرد</div>
        <h2 className="text-xl font-black" style={{ color: "#e8f5ec" }}>تسجيل في سجل آل أبوعلي البيطار</h2>
        {parentPerson && (
          <div className="mt-2 px-3 py-1.5 rounded-xl text-sm inline-flex items-center gap-2"
            style={{ background: "rgba(45,122,79,0.15)", border: "1px solid rgba(45,122,79,0.3)", color: "#4db878" }}>
            👨 إضافة نسل لـ: <strong>{parentPerson.full_name}</strong>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* صورة الشخص */}
        <div className="flex flex-col items-center gap-3">
          <div
            onClick={() => photoInputRef.current?.click()}
            className="w-20 h-20 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:opacity-80"
            style={{
              background: photoPreview ? "transparent" : "rgba(45,122,79,0.15)",
              border: "2px dashed rgba(45,122,79,0.4)",
            }}
          >
            {photoPreview
              ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              : <span className="text-3xl">📷</span>
            }
          </div>
          <button type="button" onClick={() => photoInputRef.current?.click()}
            className="text-xs font-semibold" style={{ color: "rgba(232,240,235,0.4)" }}>
            {photoFile ? "📎 " + photoFile.name : "اختر صورة (اختياري)"}
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        {/* الاسم الكامل */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(232,240,235,0.55)" }}>
            الاسم الكامل *
          </label>
          <input type="text" name="full_name" required
            value={form.full_name} onChange={handleChange}
            placeholder="اكتب الاسم كاملاً" className="input-field" />
        </div>

        {/* البحث عن الأب */}
        <div ref={parentRef} className="relative">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(232,240,235,0.55)" }}>
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#4db878" }}>✓</span>
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
                  <div className="flex-1 text-right">
                    <div className="text-sm font-semibold" style={{ color: "#e8f5ec" }}>{p.full_name}</div>
                    {p.branch_name && <div className="text-xs" style={{ color: "#4db878" }}>{p.branch_name}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* اسم الفرع + النوع */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(232,240,235,0.55)" }}>الفرع</label>
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

        {/* سنة الميلاد + تواصل */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(232,240,235,0.55)" }}>سنة الميلاد</label>
            <input type="number" name="birth_year" value={form.birth_year}
              onChange={handleChange} placeholder="مثال: 1980" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(232,240,235,0.55)" }}>الهاتف</label>
            <input type="tel" name="phone" value={form.phone}
              onChange={handleChange} placeholder="01012345678" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(232,240,235,0.55)" }}>الإيميل</label>
            <input type="email" name="email" value={form.email}
              onChange={handleChange} placeholder="example@mail.com" className="input-field" />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "جاري الحفظ..." : "💾 حفظ"}
          </button>
          {status === "success" && (
            <div className="px-4 py-2 rounded-full text-sm font-semibold animate-fade-in-up"
              style={{ background: "rgba(45,122,79,0.2)", color: "#4db878", border: "1px solid rgba(45,122,79,0.3)" }}>
              ✅ تم الحفظ
            </div>
          )}
          {status === "error" && (
            <div className="px-4 py-2 rounded-full text-sm font-semibold animate-fade-in-up"
              style={{ background: "rgba(200,50,50,0.15)", color: "#f87171", border: "1px solid rgba(200,50,50,0.25)" }}>
              ❌ حدث خطأ
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
