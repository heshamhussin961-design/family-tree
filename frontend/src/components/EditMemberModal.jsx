import React, { useState } from "react";

export default function EditMemberModal({ member, apiBase, token, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ full_name: member.full_name || "", branch_name: member.branch_name || "", gender: member.gender || "", birth_year: member.birth_year || "", death_year: member.death_year || "", email: member.email || "", phone: member.phone || "", is_alive: member.is_alive !== false, blood_type: member.blood_type || "", health_notes: member.health_notes || "" });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
  const handleChange = e => { const { name, value, type, checked } = e.target; setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value })); };

  const handleSave = async () => {
    setError(""); setLoading(true);
    try {
      const payload = { ...form, birth_year: form.birth_year ? parseInt(form.birth_year) : null, death_year: form.death_year ? parseInt(form.death_year) : null, gender: form.gender || null, branch_name: form.branch_name || null, email: form.email || null, phone: form.phone || null, blood_type: form.blood_type || null, health_notes: form.health_notes || null };
      const res = await fetch(`${apiBase}/members/${member.id}`, { method: "PUT", headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).detail || "خطأ");
      onSave(await res.json()); onClose();
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const handleDelete = async () => { setDeleting(true); try { await fetch(`${apiBase}/members/${member.id}`, { method: "DELETE", headers }); onDelete(member.id); onClose(); } catch { setError("فشل الحذف"); } finally { setDeleting(false); } };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
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
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>الفرع</label><input name="branch_name" value={form.branch_name} onChange={handleChange} className="input-field" /></div>
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>النوع</label><select name="gender" value={form.gender} onChange={handleChange} className="input-field"><option value="">—</option><option value="male">ذكر</option><option value="female">أنثى</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>سنة الميلاد</label><input name="birth_year" type="number" value={form.birth_year} onChange={handleChange} className="input-field" /></div>
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>سنة الوفاة</label><input name="death_year" type="number" value={form.death_year} onChange={handleChange} className="input-field" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>فصيلة الدم</label><select name="blood_type" value={form.blood_type} onChange={handleChange} className="input-field"><option value="">—</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select></div>
            <div><label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-secondary)" }}>ملاحظات صحية</label><input name="health_notes" value={form.health_notes} onChange={handleChange} className="input-field" placeholder="حساسية، أمراض..." /></div>
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
