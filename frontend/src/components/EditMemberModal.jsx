import React, { useState } from "react";

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
        blood_type: member.blood_type || "",
        health_notes: member.health_notes || "",
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
                blood_type: form.blood_type || null,
                health_notes: form.health_notes || null,
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

            <div className="w-full max-w-md rounded-2xl p-5 md:p-6 animate-fade-in-scale max-h-[90vh] overflow-y-auto"
                style={{ background: "rgba(12,27,17,0.98)", border: "1px solid rgba(45,122,79,0.3)" }}>

                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-black text-lg flex items-center gap-2" style={{ color: "#e8f5ec" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4db878" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        تعديل بيانات الفرد
                    </h2>
                    <button onClick={onClose} className="text-xl opacity-40 hover:opacity-70 transition-opacity">✕</button>
                </div>

                <div className="space-y-3">
                    {/* is_alive toggle */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl transition-all"
                        style={{
                            background: form.is_alive ? "rgba(45,122,79,0.15)" : "rgba(148,163,184,0.1)",
                            border: `1px solid ${form.is_alive ? "rgba(45,122,79,0.35)" : "rgba(148,163,184,0.2)"}`
                        }}>
                        <div className="flex items-center gap-2">
                            {form.is_alive ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#4db878"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>
                            )}
                            <div>
                                <div className="text-sm font-bold" style={{ color: form.is_alive ? "#4db878" : "#94a3b8" }}>
                                    {form.is_alive ? "حيّ" : "توفي"}
                                </div>
                                <div className="text-xs" style={{ color: "rgba(232,240,235,0.35)" }}>الحالة الحالية</div>
                            </div>
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

                    {/* Blood type + Health notes */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-semibold mb-1 block flex items-center gap-1" style={{ color: "rgba(232,240,235,0.5)" }}>
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22c4.97 0 7-3.58 7-7 0-4.5-7-13-7-13S5 10.5 5 15c0 3.42 2.03 7 7 7z" /></svg>
                                فصيلة الدم
                            </label>
                            <select name="blood_type" value={form.blood_type} onChange={handleChange} className="input-field">
                                <option value="">— غير محدد —</option>
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
                            <label className="text-xs font-semibold mb-1 block flex items-center gap-1" style={{ color: "rgba(232,240,235,0.5)" }}>
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                                ملاحظات صحية
                            </label>
                            <input name="health_notes" value={form.health_notes} onChange={handleChange} className="input-field" placeholder="أمراض مزمنة، حساسية..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-semibold mb-1 block flex items-center gap-1" style={{ color: "rgba(232,240,235,0.5)" }}>
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13.5 19.79 19.79 0 0 1 1.08 4.92 2 2 0 0 1 3.06 2.75h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                الهاتف
                            </label>
                            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="01012345678" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold mb-1 block flex items-center gap-1" style={{ color: "rgba(232,240,235,0.5)" }}>
                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                الإيميل
                            </label>
                            <input name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="email@mail.com" />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-3 px-3 py-2 rounded-xl text-sm" style={{ background: "rgba(200,50,50,0.12)", color: "#f87171" }}>
                        {error}
                    </div>
                )}

                <div className="flex gap-2 mt-5">
                    <button onClick={handleSave} disabled={loading} className="btn-primary flex-1">
                        {loading ? "جاري الحفظ..." : "حفظ"}
                    </button>
                    <button onClick={onClose}
                        className="px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-70"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(232,240,235,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        إلغاء
                    </button>
                </div>

                {!confirm ? (
                    <button onClick={() => setConfirm(true)} className="w-full mt-2 py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-80"
                        style={{ background: "rgba(200,50,50,0.08)", color: "#f87171", border: "1px solid rgba(200,50,50,0.15)" }}>
                        حذف هذا الفرد
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
