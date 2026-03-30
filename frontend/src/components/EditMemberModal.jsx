import React, { useState } from "react";
import COUNTRIES from "../constants/countries.js";

export default function EditMemberModal({ member, apiBase, token, isAdmin, onSave, onDelete, onClose, notify }) {
  const [form, setForm] = useState({
    full_name: member.full_name || "",
    gender: member.gender || "",
    birth_year: member.birth_year || "",
    birth_month: member.birth_month || "",
    birth_day: member.birth_day || "",
    death_year: member.death_year || "",
    death_month: member.death_month || "",
    death_day: member.death_day || "",
    email: member.email || "",
    phone: member.phone || "",
    is_alive: member.is_alive !== false,
    blood_type: member.blood_type || "",
    profession: member.profession || "",
    university_degree: member.university_degree || "",
    job_title: member.job_title || "",
    is_student: member.is_student || false,
    looking_for_job: member.looking_for_job || false,
    birth_place: member.birth_place || "",
    residence_place: member.residence_place || "",
    marital_status: member.marital_status || "",
    mother_name: member.mother_name || "",
    biography: member.biography || "",
    is_public: member.is_public !== undefined ? member.is_public : true
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
  const handleChange = e => { const { name, value, type, checked } = e.target; setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value })); };

  const handleSave = async () => {
    setError(""); setLoading(true);
    try {
      const payload = {
        ...form,
        birth_year: form.birth_year ? parseInt(form.birth_year) : null,
        birth_month: form.birth_month ? parseInt(form.birth_month) : null,
        birth_day: form.birth_day ? parseInt(form.birth_day) : null,
        death_year: form.death_year ? parseInt(form.death_year) : null,
        death_month: form.death_month ? parseInt(form.death_month) : null,
        death_day: form.death_day ? parseInt(form.death_day) : null,
        gender: form.gender || null,
        email: form.email || null,
        phone: form.phone || null,
        blood_type: form.blood_type || null,
        profession: form.profession || null,
        university_degree: form.university_degree || null,
        job_title: form.job_title || null,
        is_student: !!form.is_student,
        looking_for_job: !!form.looking_for_job,
        birth_place: form.birth_place || null,
        residence_place: form.residence_place || null,
        marital_status: form.marital_status || null,
        mother_name: form.mother_name || null,
        biography: form.biography || null,
        is_public: !!form.is_public
      };
      const res = await fetch(`${apiBase}/members/${member.id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).detail || "خطأ");
      onSave(await res.json()); onClose();
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${apiBase}/members/${member.id}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error();
      onDelete(member.id);
      onClose();
    } catch {
      if (notify) notify("فشل الحذف", "error");
      setError("فشل الحذف");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md card p-5 animate-fade-in-scale max-h-[90vh] overflow-y-auto" style={{ boxShadow: "var(--shadow-card-lg)" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-lg" style={{ color: "var(--text-primary)" }}>تعديل بيانات الفرد</h2>
          <button onClick={onClose} className="text-xl transition" style={{ color: "var(--text-muted)" }}>✕</button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: form.is_alive ? "var(--primary-dim)" : "rgba(255,255,255,0.03)", border: form.is_alive ? "1px solid rgba(16,185,129,0.2)" : "1px solid var(--border)" }}>
            <div className="text-sm font-bold" style={{ color: form.is_alive ? "var(--primary)" : "var(--text-muted)" }}>{form.is_alive ? "حيّ" : "توفي"}</div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="is_alive" checked={form.is_alive} onChange={handleChange} className="sr-only peer" />
              <div className="w-10 h-5 rounded-full transition-colors" style={{ background: form.is_alive ? "var(--primary)" : "#444" }}>
                <div className="w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-all" style={{ left: form.is_alive ? "22px" : "3px" }} />
              </div>
            </label>
          </div>

          <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>الاسم الكامل *</label><input name="full_name" value={form.full_name} onChange={handleChange} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>النوع</label><select name="gender" value={form.gender} onChange={handleChange} className="input-field"><option value="">—</option><option value="male">ذكر</option><option value="female">أنثى</option></select></div>
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>اسم الأم</label><input name="mother_name" value={form.mother_name} onChange={handleChange} className="input-field" placeholder="اسم الأم الكامل" /></div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>الحالة الاجتماعية</label>
            <select name="marital_status" value={form.marital_status} onChange={handleChange} className="input-field">
              <option value="">—</option>
              <option value="أعزب">أعزب / عزباء</option>
              <option value="متزوج">متزوج / متزوجة</option>
              <option value="مطلق">مطلق / مطلقة</option>
              <option value="أرمل">أرمل / أرملة</option>
            </select>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>تاريخ الميلاد</label>
              <div className="grid grid-cols-3 gap-2">
                <input name="birth_day" type="number" placeholder="يوم" value={form.birth_day} onChange={handleChange} className="input-field text-center px-1" min="1" max="31" />
                <select name="birth_month" value={form.birth_month} onChange={handleChange} className="input-field text-center px-1">
                  <option value="">شهر</option>
                  {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                </select>
                <input name="birth_year" type="number" placeholder="سنة" value={form.birth_year} onChange={handleChange} className="input-field text-center px-1" />
              </div>
            </div>

            {!form.is_alive && (
              <div className="animate-fade-in">
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>تاريخ الوفاة</label>
                <div className="grid grid-cols-3 gap-2">
                  <input name="death_day" type="number" placeholder="يوم" value={form.death_day} onChange={handleChange} className="input-field text-center px-1" min="1" max="31" />
                  <select name="death_month" value={form.death_month} onChange={handleChange} className="input-field text-center px-1">
                    <option value="">شهر</option>
                    {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                  </select>
                  <input name="death_year" type="number" placeholder="سنة" value={form.death_year} onChange={handleChange} className="input-field text-center px-1" />
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>فصيلة الدم</label><select name="blood_type" value={form.blood_type} onChange={handleChange} className="input-field"><option value="">—</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select></div>
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>المهنة</label><input name="profession" value={form.profession} onChange={handleChange} className="input-field" placeholder="مهندس، طبيب..." /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>مكان الميلاد</label><select name="birth_place" value={form.birth_place} onChange={handleChange} className="input-field"><option value="">—</option>{COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>مكان الإقامة</label><select name="residence_place" value={form.residence_place} onChange={handleChange} className="input-field"><option value="">—</option>{COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>المؤهل الجامعي</label><input name="university_degree" value={form.university_degree} onChange={handleChange} className="input-field" placeholder="بكالوريوس..." /></div>
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>الوظيفة</label><input name="job_title" value={form.job_title} onChange={handleChange} className="input-field" placeholder="مدير مشاريع..." /></div>
          </div>
          <div className="flex flex-wrap gap-4 py-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_student" checked={form.is_student} onChange={handleChange} className="sr-only peer" />
              <div className="w-9 h-5 rounded-full transition-colors relative" style={{ background: form.is_student ? "var(--primary)" : "#444" }}>
                <div className="w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-all" style={{ left: form.is_student ? "18px" : "2px" }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: form.is_student ? "var(--primary)" : "var(--text-secondary)" }}>طالب</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="looking_for_job" checked={form.looking_for_job} onChange={handleChange} className="sr-only peer" />
              <div className="w-9 h-5 rounded-full transition-colors relative" style={{ background: form.looking_for_job ? "var(--accent)" : "#444" }}>
                <div className="w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-all" style={{ left: form.looking_for_job ? "18px" : "2px" }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: form.looking_for_job ? "var(--accent)" : "var(--text-secondary)" }}>يبحث عن عمل</span>
            </label>
            {isAdmin && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_public" checked={form.is_public} onChange={handleChange} className="sr-only peer" />
                <div className="w-9 h-5 rounded-full transition-colors relative" style={{ background: form.is_public ? "var(--primary)" : "#444" }}>
                  <div className="w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-all" style={{ left: form.is_public ? "18px" : "2px" }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: form.is_public ? "var(--primary)" : "var(--text-secondary)" }}>ظهور عام</span>
              </label>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>السيرة الذاتية</label>
            <textarea name="biography" value={form.biography} onChange={handleChange} placeholder="اكتب نبذة عن الشخص..." className="input-field" rows={3} style={{ resize: "vertical", minHeight: "70px" }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>الهاتف</label><input name="phone" value={form.phone} onChange={handleChange} className="input-field" /></div>
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>الإيميل</label><input name="email" value={form.email} onChange={handleChange} className="input-field" /></div>
          </div>
        </div>

        {error && <div className="mt-3 px-3 py-2 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>{error}</div>}

        <div className="flex gap-2 mt-5">
          <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">{loading ? "جاري الحفظ..." : "حفظ"}</button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-bold transition" style={{ color: "var(--text-muted)", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>إلغاء</button>
        </div>

        {!confirm ? (
          <button onClick={() => setConfirm(true)} className="w-full mt-2 py-2 rounded-xl text-xs font-bold transition" style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>حذف هذا الفرد</button>
        ) : (
          <div className="mt-2 p-3 rounded-xl text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <p className="text-sm mb-2" style={{ color: "#ef4444" }}>هل أنت متأكد؟</p>
            <div className="flex gap-2 justify-center">
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "#ef4444" }}>{deleting ? "..." : "نعم، احذف"}</button>
              <button onClick={() => setConfirm(false)} className="px-4 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}>إلغاء</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
