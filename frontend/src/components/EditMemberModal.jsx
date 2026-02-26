import React, { useState, useRef } from "react";

export default function EditMemberModal({ member, apiBase, token, onSave, onDelete, onClose }) {
    const [form, setForm] = useState({
        full_name: member.full_name || "",
        branch_name: member.branch_name || "",
        gender: member.gender || "",
        birth_year: member.birth_year || "",
        death_year: member.death_year || "",
        email: member.email || "",
        phone: member.phone || "",
        is_alive: member.is_alive !== false,
    });
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [error, setError] = useState("");

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSave = async () => {
        setError(""); setLoading(true);
        try {
            const payload = {
                ...form,
                birth_year: form.birth_year ? parseInt(form.birth_year) : null,
                death_year: form.death_year ? parseInt(form.death_year) : null,
                gender: form.gender || null,
                branch_name: form.branch_name || null,
                email: form.email || null,
                phone: form.phone || null,
            };
            const res = await fetch(`${apiBase}/members/${member.id}`, {
                method: "PUT", headers, body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error((await res.json()).detail || "خطأ");
            const updated = await res.json();
            onSave(updated);
            onClose();
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await fetch(`${apiBase}/members/${member.id}`, { method: "DELETE", headers });
            onDelete(member.id);
            onClose();
        } catch (e) { setError("فشل الحذف"); }
        finally { setDeleting(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={e => e.target === e.currentTarget && onClose()}>

            <div className="w-full max-w-md rounded-2xl p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto"
                style={{ background: "rgba(12,27,17,0.98)", border: "1px solid rgba(45,122,79,0.3)" }}>

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-black text-lg" style={{ color: "#e8f5ec" }}>تعديل بيانات الفرد</h2>
                    <button onClick={onClose} className="text-xl opacity-40 hover:opacity-70">✕</button>
                </div>

                <div className="space-y-3">
                    {/* is_alive toggle — most prominent */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl"
                        style={{
                            background: form.is_alive ? "rgba(45,122,79,0.15)" : "rgba(148,163,184,0.1)",
                            border: `1px solid ${form.is_alive ? "rgba(45,122,79,0.35)" : "rgba(148,163,184,0.2)"}`
                        }}>
                        <div>
                            <div className="text-sm font-bold" style={{ color: form.is_alive ? "#4db878" : "#94a3b8" }}>
                                {form.is_alive ? "💚 حيّ" : "🕊️ توفي"}
                            </div>
                            <div className="text-xs" style={{ color: "rgba(232,240,235,0.35)" }}>الحالة الحالية</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="is_alive" checked={form.is_alive} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 rounded-full transition-colors peer-checked:bg-green-600"
                                style={{ background: form.is_alive ? "#2d7a4f" : "#374151" }}>
                                <div className="w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-transform"
                                    style={{ left: form.is_alive ? "24px" : "4px" }} />
                            </div>
                        </label>
                    </div>

                    <div>
                        <label className="text-xs font-semibold mb-1 block" style={{ color: "rgba(232,240,235,0.5)" }}>الاسم الكامل *</label>
                        <input name="full_name" value={form.full_name} onChange={handleChange} className="input-field" placeholder="الاسم الكامل" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-semibold mb-1 block" style={{ color: "rgba(232,240,235,0.5)" }}>الفرع</label>
                            <input name="branch_name" value={form.branch_name} onChange={handleChange} className="input-field" placeholder="الفرع" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold mb-1 block" style={{ color: "rgba(232,240,235,0.5)" }}>النوع</label>
                            <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                                <option value="">—</option>
                                <option value="male">ذكر</option>
                                <option value="female">أنثى</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-semibold mb-1 block" style={{ color: "rgba(232,240,235,0.5)" }}>سنة الميلاد</label>
                            <input name="birth_year" type="number" value={form.birth_year} onChange={handleChange} className="input-field" placeholder="1980" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold mb-1 block" style={{ color: "rgba(232,240,235,0.5)" }}>سنة الوفاة</label>
                            <input name="death_year" type="number" value={form.death_year} onChange={handleChange} className="input-field" placeholder="إن وجد" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-semibold mb-1 block" style={{ color: "rgba(232,240,235,0.5)" }}>الهاتف</label>
                            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="01012345678" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold mb-1 block" style={{ color: "rgba(232,240,235,0.5)" }}>الإيميل</label>
                            <input name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="email@mail.com" />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-3 px-3 py-2 rounded-xl text-sm" style={{ background: "rgba(200,50,50,0.12)", color: "#f87171" }}>
                        ❌ {error}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mt-5">
                    <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
                        {loading ? "جاري الحفظ..." : "💾 حفظ"}
                    </button>
                    <button onClick={onClose}
                        className="px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-70"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(232,240,235,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        إلغاء
                    </button>
                </div>

                {/* Delete */}
                {!confirm ? (
                    <button onClick={() => setConfirm(true)} className="w-full mt-2 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-80"
                        style={{ background: "rgba(200,50,50,0.08)", color: "#f87171", border: "1px solid rgba(200,50,50,0.15)" }}>
                        🗑️ حذف هذا الفرد
                    </button>
                ) : (
                    <div className="mt-2 p-3 rounded-xl text-sm text-center" style={{ background: "rgba(200,50,50,0.1)", border: "1px solid rgba(200,50,50,0.2)" }}>
                        <p className="mb-2" style={{ color: "#f87171" }}>هل أنت متأكد من الحذف؟</p>
                        <div className="flex gap-2 justify-center">
                            <button onClick={handleDelete} disabled={deleting}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold" style={{ background: "#b91c1c", color: "#fff" }}>
                                {deleting ? "..." : "نعم، احذف"}
                            </button>
                            <button onClick={() => setConfirm(false)}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(232,240,235,0.6)" }}>
                                إلغاء
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
