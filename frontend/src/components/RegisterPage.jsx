import React, { useState, useEffect } from "react";

export default function RegisterPage({ apiBase, inviteCode, onRegister, onCancel }) {
    const [form, setForm] = useState({ username: "", password: "", confirmPassword: "", display_name: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [inviteInfo, setInviteInfo] = useState(null);
    const [inviteLoading, setInviteLoading] = useState(true);
    const [inviteError, setInviteError] = useState("");

    // Fetch invitation info
    useEffect(() => {
        if (!inviteCode) return;
        (async () => {
            setInviteLoading(true);
            try {
                const res = await fetch(`${apiBase}/invitations/${inviteCode}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || "كود الدعوة غير صالح");
                if (!data.is_valid) throw new Error("كود الدعوة منتهي أو مستخدم بالكامل");
                setInviteInfo(data);
            } catch (err) { setInviteError(err.message); }
            finally { setInviteLoading(false); }
        })();
    }, [inviteCode, apiBase]);

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(""); setLoading(true);
        if (form.password !== form.confirmPassword) {
            setError("كلمة المرور غير متطابقة");
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${apiBase}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    invite_code: inviteCode,
                    username: form.username,
                    password: form.password,
                    display_name: form.display_name,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "فشل التسجيل");
            // Save token & user info
            localStorage.setItem("ft_token", data.access_token);
            localStorage.setItem("ft_user", JSON.stringify({
                role: data.role, display_name: data.display_name,
                branch_root_id: data.branch_root_id, user_id: data.user_id,
            }));
            onRegister(data);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-main)" }}>
            <div className="w-full max-w-sm animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "var(--primary)", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                    </div>
                    <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>تسجيل في شجرة العائلة</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>أهلاً بيك في سجل آل أبوعلي البيطار</p>
                </div>

                {/* Invitation Info */}
                {inviteLoading && (
                    <div className="card p-4 mb-4 flex items-center gap-2 justify-center" style={{ border: "1px solid var(--border)" }}>
                        <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--primary)" }} />
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>جاري التحقق من الدعوة...</span>
                    </div>
                )}

                {inviteError && (
                    <div className="card p-6 mb-4 text-center" style={{ border: "1px solid rgba(239,68,68,0.3)" }}>
                        <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(239,68,68,0.1)" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        </div>
                        <p className="text-sm font-semibold mb-2" style={{ color: "#ef4444" }}>{inviteError}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>تواصل مع الأدمن للحصول على رابط دعوة جديد</p>
                        {onCancel && <button onClick={onCancel} className="mt-4 text-sm font-semibold" style={{ color: "var(--primary)" }}>← الصفحة الرئيسية</button>}
                    </div>
                )}

                {inviteInfo && (
                    <>
                        <div className="card p-4 mb-4 flex items-center gap-3" style={{ border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.05)" }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22v-7" /><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2" /></svg>
                            </div>
                            <div>
                                <div className="text-sm font-bold" style={{ color: "var(--primary)" }}>المستخدم: {inviteInfo.branch_root_name}</div>
                                <div className="text-xs" style={{ color: "var(--text-muted)" }}>ستتمكن من إضافة النسل لهذا المستخدم</div>
                            </div>
                        </div>

                        <div className="card p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الاسم الظاهر</label>
                                    <input type="text" required value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} placeholder="مثال: أحمد محمد" className="input-field" autoComplete="name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>اسم المستخدم</label>
                                    <input type="text" required value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="مثال: ahmed_m" className="input-field" autoComplete="username" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>كلمة المرور</label>
                                    <input type="password" required minLength={6} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="6 أحرف على الأقل" className="input-field" autoComplete="new-password" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>تأكيد كلمة المرور</label>
                                    <input type="password" required minLength={6} value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="أعد كلمة المرور" className="input-field" autoComplete="new-password" />
                                </div>
                                {error && <div className="px-3 py-2 rounded-lg text-sm text-center" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>{error}</div>}
                                <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "جاري التسجيل..." : "تسجيل"}</button>
                            </form>
                        </div>

                        <div className="text-center mt-4">
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>عندك حساب؟ </span>
                            {onCancel && <button onClick={onCancel} className="text-xs font-semibold" style={{ color: "var(--primary)" }}>سجّل دخول</button>}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
