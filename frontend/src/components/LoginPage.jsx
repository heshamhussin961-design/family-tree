import React, { useState } from "react";

export default function LoginPage({ apiBase, onLogin, onCancel }) {
    const [form, setForm] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "خطأ في تسجيل الدخول");
            }
            const data = await res.json();
            localStorage.setItem("ft_token", data.access_token);
            onLogin(data.access_token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="animate-blob" style={{ position: "fixed", top: "-80px", right: "-80px", width: "420px", height: "420px", background: "radial-gradient(circle, rgba(45,122,79,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div className="animate-blob" style={{ position: "fixed", bottom: "-100px", left: "-80px", width: "380px", height: "380px", background: "radial-gradient(circle, rgba(26,92,54,0.13) 0%, transparent 70%)", pointerEvents: "none", animationDelay: "4s" }} />

            <div className="w-full max-w-sm animate-fade-in-up">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-xl animate-glow-pulse"
                        style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)", color: "#fff" }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22v-7" /><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2" /><path d="M7 15l5-5 5 5" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black" style={{ color: "#e8f5ec" }}>شجرة آل أبوعلي البيطار</h1>
                    <p className="text-sm mt-1 flex items-center justify-center gap-1.5" style={{ color: "rgba(232,240,235,0.45)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        تسجيل الدخول للوحة الأدمن
                    </p>
                </div>

                <div className="rounded-2xl p-6 md:p-7"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(20px)" }}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: "rgba(232,240,235,0.55)" }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                اسم المستخدم
                            </label>
                            <input
                                type="text" required value={form.username}
                                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                placeholder="admin"
                                className="input-field"
                                autoComplete="username"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: "rgba(232,240,235,0.55)" }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                كلمة المرور
                            </label>
                            <input
                                type="password" required value={form.password}
                                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                placeholder="••••••••"
                                className="input-field"
                                autoComplete="current-password"
                            />
                        </div>

                        {error && (
                            <div className="px-4 py-2.5 rounded-xl text-sm text-center animate-fade-in-up"
                                style={{ background: "rgba(200,50,50,0.15)", color: "#f87171", border: "1px solid rgba(200,50,50,0.25)" }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
                            {loading ? (
                                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            )}
                            {loading ? "جاري الدخول..." : "دخول"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs mt-4" style={{ color: "rgba(232,240,235,0.2)" }}>
                    هذه الصفحة للأدمن فقط
                </p>
                {onCancel && (
                    <button onClick={onCancel}
                        className="w-full mt-3 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 flex items-center justify-center gap-2"
                        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(232,240,235,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                        العودة للموقع
                    </button>
                )}
            </div>
        </div>
    );
}
