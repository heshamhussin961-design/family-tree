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
            {/* Background blobs */}
            <div style={{ position: "fixed", top: "-80px", right: "-80px", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(45,122,79,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "fixed", bottom: "-100px", left: "-80px", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,92,54,0.13) 0%, transparent 70%)", pointerEvents: "none" }} />

            <div className="w-full max-w-sm animate-fade-in-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-xl"
                        style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)" }}>
                        <span className="text-4xl">🌳</span>
                    </div>
                    <h1 className="text-2xl font-black" style={{ color: "#e8f5ec" }}>شجرة عائلة البيطار</h1>
                    <p className="text-sm mt-1" style={{ color: "rgba(232,240,235,0.45)" }}>تسجيل الدخول للوحة الأدمن</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl p-7"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(20px)" }}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(232,240,235,0.55)" }}>
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
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(232,240,235,0.55)" }}>
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
                            <div className="px-4 py-2.5 rounded-xl text-sm text-center"
                                style={{ background: "rgba(200,50,50,0.15)", color: "#f87171", border: "1px solid rgba(200,50,50,0.25)" }}>
                                ❌ {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                            {loading ? "جاري الدخول..." : "🔑 دخول"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs mt-4" style={{ color: "rgba(232,240,235,0.2)" }}>
                    هذه الصفحة للأدمن فقط
                </p>
                {onCancel && (
                    <button onClick={onCancel}
                        className="w-full mt-3 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(232,240,235,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        ← العودة للموقع
                    </button>
                )}
            </div>
        </div>
    );
}
