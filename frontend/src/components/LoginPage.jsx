import React, { useState } from "react";

export default function LoginPage({ apiBase, onLogin, onCancel, onGoRegister }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch(`${apiBase}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "خطأ");
      // Save token + user info
      localStorage.setItem("ft_token", data.access_token);
      localStorage.setItem("ft_user", JSON.stringify({
        role: data.role, display_name: data.display_name,
        branch_root_id: data.branch_root_id, user_id: data.user_id,
      }));
      onLogin(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-main)" }}>
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "var(--primary)", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M12 22v-7" /><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2" /><path d="M7 15l5-5 5 5" /></svg>
          </div>
          <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>شجرة آل أبوعلي البيطار</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>تسجيل الدخول</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>اسم المستخدم</label>
              <input type="text" required value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="admin" className="input-field" autoComplete="username" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 flex justify-between items-center" style={{ color: "var(--text-secondary)" }}>
                كلمة المرور
              </label>
              <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" className="input-field" autoComplete="current-password" />
            </div>
            {error && <div className="px-3 py-2 rounded-lg text-sm text-center" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "جاري الدخول..." : "دخول"}</button>
          </form>
        </div>

        <div className="text-center mt-4 space-y-2">
          {onGoRegister && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              عندك رابط دعوة؟{" "}
              <button onClick={onGoRegister} className="font-semibold" style={{ color: "var(--primary)" }}>سجّل هنا</button>
            </p>
          )}
          {onCancel && <button onClick={onCancel} className="w-full py-2 rounded-xl text-sm font-semibold transition" style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>← العودة</button>}
        </div>
      </div>
    </div>
  );
}
