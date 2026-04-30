import React, { useState, useEffect, useRef } from "react";
import HeritageAdmin from "./HeritageAdmin";

export default function AdminPanel({ apiBase, token, isAdmin, notify }) {
    const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'pending_edits' | 'users' | 'logs' | 'heritage' | 'settings'
    const [pendingMembers, setPendingMembers] = useState([]);
    const [pendingEdits, setPendingEdits] = useState([]);
    const [users, setUsers] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    // For branch selection
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const searchRef = useRef(null);

    const [resetPasswordUserId, setResetPasswordUserId] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState("");
    const [resetSuccess, setResetSuccess] = useState("");

    if (!isAdmin) {
        return <div className="p-10 text-center text-red-500 font-bold">غير مصرح لك بالدخول</div>;
    }

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "pending") {
                const res = await fetch(`${apiBase}/members/pending`, { headers: { "Authorization": `Bearer ${token}` } });
                if (res.ok) setPendingMembers(await res.json());
            } else if (activeTab === "pending_edits") {
                const res = await fetch(`${apiBase}/admin/pending_modifications`, { headers: { "Authorization": `Bearer ${token}` } });
                if (res.ok) setPendingEdits(await res.json());
            } else if (activeTab === "users") {
                const res = await fetch(`${apiBase}/users`, { headers: { "Authorization": `Bearer ${token}` } });
                if (res.ok) setUsers(await res.json());
            } else if (activeTab === "logs") {
                const res = await fetch(`${apiBase}/admin/logs`, { headers: { "Authorization": `Bearer ${token}` } });
                if (res.ok) setAuditLogs(await res.json());
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleApproveEdit = async (id) => {
        try {
            const res = await fetch(`${apiBase}/admin/pending_modifications/${id}/approve`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setPendingEdits(prev => prev.filter(m => m.id !== id));
                if (notify) notify("تمت الموافقة وتطبيق التعديل بنجاح", "success");
            } else {
                if (notify) notify("فشل تطبيق التعديل", "error");
            }
        } catch (err) { if (notify) notify("خطأ في الاتصال", "error"); }
    };

    const handleRejectEdit = async (id) => {
        if (!window.confirm("هل أنت متأكد من رفض هذا التعديل؟")) return;
        try {
            const res = await fetch(`${apiBase}/admin/pending_modifications/${id}/reject`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setPendingEdits(prev => prev.filter(m => m.id !== id));
                if (notify) notify("تم رفض التعديل بنجاح", "info");
            } else {
                if (notify) notify("فشل رفض التعديل", "error");
            }
        } catch (err) { if (notify) notify("خطأ في الاتصال", "error"); }
    };

    const handleApprove = async (id) => {
        try {
            const res = await fetch(`${apiBase}/members/${id}/approve`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setPendingMembers(prev => prev.filter(m => m.id !== id));
                if (notify) notify("تمت الموافقة على الطلب بنجاح", "success");
            } else {
                if (notify) notify("فشل تنفيذ الطلب", "error");
            }
        } catch (err) { if (notify) notify("خطأ في الاتصال", "error"); }
    };

    const handleReject = async (id) => {
        if (!window.confirm("هل أنت متأكد من رفض وحذف هذا الطلب؟")) return;
        try {
            const res = await fetch(`${apiBase}/members/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setPendingMembers(prev => prev.filter(m => m.id !== id));
                if (notify) notify("تم رفض الطلب وحذفه", "info");
            } else {
                if (notify) notify("فشل رفض الطلب", "error");
            }
        } catch (err) { if (notify) notify("خطأ في الاتصال", "error"); }
    };

    const handleRevert = async (logId) => {
        if (!window.confirm("هل أنت متأكد من التراجع عن هذا التعديل؟")) return;
        try {
            const res = await fetch(`${apiBase}/admin/revert`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ log_id: logId })
            });
            if (res.ok) {
                fetchData();
                notify("تم التراجع عن التعديل بنجاح", "success");
            } else {
                const data = await res.json();
                notify(data.detail || "حدث خطأ أثناء التراجع", "error");
            }
        } catch (err) { notify("خطأ في الاتصال", "error"); }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            const res = await fetch(`${apiBase}/users/${userId}/role`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                fetchData();
            }
        } catch (err) { }
    };

    const updateUserBranch = async (userId, branchRootId) => {
        try {
            const res = await fetch(`${apiBase}/users/${userId}/role`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ branch_root_id: branchRootId }) // send null to remove
            });
            if (res.ok) {
                setEditingUserId(null);
                fetchData();
            }
        } catch (err) { }
    };

    const handleResetPassword = async (userId) => {
        if (!newPassword || newPassword.length < 6) {
            setResetError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }
        setResetLoading(true);
        setResetError("");
        setResetSuccess("");
        try {
            const res = await fetch(`${apiBase}/users/${userId}/password`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ new_password: newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setResetSuccess("تم تغيير كلمة المرور بنجاح");
                notify("تم تغيير كلمة المرور للمستخدم", "success");
                setTimeout(() => {
                    setResetPasswordUserId(null);
                    setResetSuccess("");
                    setNewPassword("");
                }, 2000);
            } else {
                setResetError(data.detail || "حدث خطأ");
            }
        } catch (err) {
            setResetError("خطأ في الاتصال");
        }
        setResetLoading(false);
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم نهائياً؟")) return;
        try {
            const res = await fetch(`${apiBase}/users/${userId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                fetchData();
                notify("تم حذف المستخدم بنجاح", "success");
            } else {
                const data = await res.json();
                notify(data.detail || "حدث خطأ أثناء الحذف", "error");
            }
        } catch (err) {
            notify("خطأ في الاتصال", "error");
        }
    };

    // Search logic for branch roots
    useEffect(() => {
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        const timer = setTimeout(async () => {
            try {
                const r = await fetch(`${apiBase}/search?q=${encodeURIComponent(searchQuery)}&limit=5`, { headers: { "Authorization": `Bearer ${token}` } });
                if (r.ok) setSearchResults(await r.json());
            } catch { }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, apiBase, token]);

    return (
        <div className="card p-5 md:p-7 animate-fade-in-up" dir="rtl">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>الإدارة</div>
                    <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>لوحة التحكم والطلبات</h2>
                </div>

                <div className="flex bg-black bg-opacity-20 rounded-xl p-1 shrink-0 flex-wrap">
                    <button onClick={() => setActiveTab("pending")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "pending" ? "shadow-md bg-opacity-20" : "opacity-60"}`} style={{ background: activeTab === "pending" ? "var(--primary)" : "transparent", color: activeTab === "pending" ? "white" : "var(--text-primary)" }}>الإضافات {pendingMembers.length > 0 && `(${pendingMembers.length})`}</button>
                    <button onClick={() => setActiveTab("pending_edits")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "pending_edits" ? "shadow-md bg-opacity-20" : "opacity-60"}`} style={{ background: activeTab === "pending_edits" ? "var(--primary)" : "transparent", color: activeTab === "pending_edits" ? "white" : "var(--text-primary)" }}>التعديلات</button>
                    <button onClick={() => setActiveTab("users")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "users" ? "shadow-md bg-opacity-20" : "opacity-60"}`} style={{ background: activeTab === "users" ? "var(--primary)" : "transparent", color: activeTab === "users" ? "white" : "var(--text-primary)" }}>المستخدمون</button>
                    <button onClick={() => setActiveTab("heritage")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "heritage" ? "shadow-md bg-opacity-20" : "opacity-60"}`} style={{ background: activeTab === "heritage" ? "var(--primary)" : "transparent", color: activeTab === "heritage" ? "white" : "var(--text-primary)" }}>المظلة</button>
                    <button onClick={() => setActiveTab("logs")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "logs" ? "shadow-md bg-opacity-20" : "opacity-60"}`} style={{ background: activeTab === "logs" ? "var(--primary)" : "transparent", color: activeTab === "logs" ? "white" : "var(--text-primary)" }}>السجل</button>
                    <button onClick={() => setActiveTab("settings")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "settings" ? "shadow-md bg-opacity-20" : "opacity-60"}`} style={{ background: activeTab === "settings" ? "var(--primary)" : "transparent", color: activeTab === "settings" ? "white" : "var(--text-primary)" }}>الإعدادات</button>
                </div>
            </div>

            {loading && <div className="text-center py-10" style={{ color: "var(--primary)" }}>جاري التحميل...</div>}

            {!loading && activeTab === "pending" && (
                <div className="space-y-4">
                    {pendingMembers.length === 0 ? (
                        <div className="text-center py-12 text-sm font-bold" style={{ color: "var(--text-muted)" }}>لا توجد طلبات إضافة معلقة.</div>
                    ) : (
                        pendingMembers.map((m) => (
                            <div key={m.id} className="p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                                <div>
                                    <div className="font-bold text-lg" style={{ color: "var(--primary)" }}>{m.full_name}</div>
                                    <div className="flex flex-wrap gap-2 mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                                        {m.branch_name && <span>الفرع: {m.branch_name}</span>}
                                        {m.parent_id && <span>| معرف الأب: {m.parent_id}</span>}
                                        {m.birth_year && <span>| ميلاد: {m.birth_year}</span>}
                                        {m.gender === "female" && <span style={{ color: "var(--accent)" }}>| أنثى</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleApprove(m.id)} className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-80" style={{ background: "#10b981" }}>موافقة وإضافة</button>
                                    <button onClick={() => handleReject(m.id)} className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-80" style={{ background: "#ef4444" }}>رفض الطلب</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {!loading && activeTab === "pending_edits" && (
                <div className="space-y-4">
                    {pendingEdits.length === 0 ? (
                        <div className="text-center py-12 text-sm font-bold" style={{ color: "var(--text-muted)" }}>لا توجد طلبات تعديل معلقة.</div>
                    ) : (
                        pendingEdits.map((m) => (
                            <div key={m.id} className="p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white bg-blue-500">
                                            {m.action === "UPDATE_MEMBER" ? "تعديل بيانات" : m.action === "ADD_SPOUSE" ? "إضافة زوجة" : "حذف زوجة"}
                                        </span>
                                        <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>بواسطة: {m.requested_by || "مجهول"}</span>
                                    </div>
                                    <div className="font-bold text-lg" style={{ color: "var(--primary)" }}>{m.target_name}</div>
                                    <div className="mt-2 text-xs opacity-80" dir="ltr" style={{ color: "var(--text-secondary)" }}>
                                        {Object.keys(m.changes).map(key => (
                                            <div key={key}><strong>{key}</strong>: {String(m.changes[key])}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleApproveEdit(m.id)} className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-80" style={{ background: "#10b981" }}>موافقة وتطبيق</button>
                                    <button onClick={() => handleRejectEdit(m.id)} className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-80" style={{ background: "#ef4444" }}>رفض التعديل</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {!loading && activeTab === "users" && (
                <div className="space-y-4">
                    {users.map((u) => (
                        <div key={u.id} className="p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                            <div>
                                <div className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{u.display_name}</div>
                                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>👤 @{u.username}</div>
                                {u.branch_root_id && <div className="text-xs mt-1" style={{ color: "var(--accent)" }}>محرر لفرع معرف ({u.branch_root_id})</div>}
                            </div>

                            <div className="flex flex-col gap-2 shrink-0 md:min-w-[200px]">
                                {/* Role select */}
                                <select
                                    className="input-field py-1.5 text-xs h-auto cursor-pointer"
                                    value={u.role}
                                    onChange={(e) => updateUserRole(u.id, e.target.value)}
                                >
                                    <option value="branch_editor">محرر فرع (Branch Editor)</option>
                                    <option value="admin">مسؤول (Admin)</option>
                                </select>

                                {/* Branch assignment button & logic */}
                                <div className="relative">
                                    {editingUserId === u.id ? (
                                        <div ref={searchRef} className="absolute bottom-full right-0 mb-1 w-full min-w-[250px] z-10 bg-black bg-opacity-90 rounded-xl p-2 shadow-xl border border-gray-700">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-gray-300">اختر الجد الأكبر للفرع:</span>
                                                <button onClick={() => setEditingUserId(null)} className="text-red-500 text-xs font-bold">إلغاء</button>
                                            </div>
                                            <input
                                                className="input-field py-1 text-xs h-auto w-full mb-2"
                                                placeholder="ابحث عن اسم الجد..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                autoFocus
                                            />
                                            {u.branch_root_id && (
                                                <button onClick={() => updateUserBranch(u.id, null)} className="w-full text-center py-1.5 bg-red-500 bg-opacity-20 text-red-500 rounded-lg text-xs font-semibold mb-2 hover:bg-opacity-30 transition">
                                                    إزالة الفرع الحالي
                                                </button>
                                            )}
                                            <div className="max-h-32 overflow-y-auto space-y-1">
                                                {searchResults.map(res => (
                                                    <button
                                                        key={res.id}
                                                        onClick={() => updateUserBranch(u.id, res.id)}
                                                        className="w-full text-right p-2 rounded-lg text-xs hover:bg-gray-800 transition truncate"
                                                        style={{ color: "var(--primary)" }}
                                                    >
                                                        {res.full_name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setEditingUserId(u.id); setSearchQuery(""); setSearchResults([]); }}
                                            className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold"
                                            style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                                        >
                                            {u.branch_root_id ? "تغيير الفرع المخصص" : "تعيين فرع للمستخدم"}
                                        </button>
                                    )}
                                </div>

                                {/* Reset Password logic */}
                                {resetPasswordUserId === u.id ? (
                                    <div className="bg-black bg-opacity-40 p-3 rounded-lg border border-gray-700 mt-2 text-right">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-gray-300">كلمة المرور الجديدة:</span>
                                            <button onClick={() => { setResetPasswordUserId(null); setResetError(""); setResetSuccess(""); setNewPassword(""); }} className="text-red-500 text-xs font-bold">إلغاء</button>
                                        </div>
                                        <input
                                            type="text"
                                            className="input-field py-1 text-xs h-auto w-full mb-2"
                                            placeholder="اكتب كلمة المرور..."
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            autoFocus
                                        />
                                        {resetError && <div className="text-red-500 text-[10px] mb-2">{resetError}</div>}
                                        {resetSuccess ? (
                                            <div className="text-green-500 text-xs font-bold text-center">{resetSuccess}</div>
                                        ) : (
                                            <button
                                                onClick={() => handleResetPassword(u.id)}
                                                disabled={resetLoading}
                                                className="w-full text-center py-1.5 rounded-lg text-xs font-semibold hover:bg-opacity-30 transition"
                                                style={{ background: "rgba(234, 179, 8, 0.2)", color: "#eab308" }}
                                            >
                                                {resetLoading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { setResetPasswordUserId(u.id); setResetError(""); setResetSuccess(""); setNewPassword(""); }}
                                        className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition hover:opacity-80"
                                        style={{ background: "rgba(234, 179, 8, 0.1)", color: "#eab308", border: "1px solid rgba(234, 179, 8, 0.2)" }}
                                    >
                                        تغيير كلمة المرور
                                    </button>
                                )}

                                <button
                                    onClick={() => deleteUser(u.id)}
                                    className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition hover:opacity-80 mt-1"
                                    style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}
                                >
                                    حذف المستخدم
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && activeTab === "logs" && (
                <div className="space-y-4">
                    {auditLogs.length === 0 ? (
                        <div className="text-center py-12 text-sm font-bold" style={{ color: "var(--text-muted)" }}>لا توجد سجلات.</div>
                    ) : (
                        auditLogs.map((log) => (
                            <div key={log.id} className="p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-white`} style={{ background: log.action.includes("CREATE") ? "#10b981" : (log.action.includes("DELETE") || log.action.includes("REVERT")) ? "#ef4444" : "#eab308" }}>
                                            {log.action}
                                        </span>
                                        <span className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>{new Date(log.timestamp).toLocaleString("ar-EG")}</span>
                                    </div>
                                    <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                        بواسطة: <span style={{ color: "var(--primary)" }}>{log.username}</span>
                                    </div>
                                    <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                                        الجدول: {log.target_table} | المعرف: {log.target_id}
                                    </div>
                                    <div className="mt-2 text-[10px] font-mono opacity-60 overflow-hidden whitespace-nowrap overflow-ellipsis" dir="ltr">
                                        {log.new_values && `New: ${JSON.stringify(log.new_values).substring(0, 50)}...`}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!log.action.startsWith("REVERT") && (
                                        <button onClick={() => handleRevert(log.id)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white transition-opacity hover:opacity-80 border border-white border-opacity-20" style={{ background: "var(--primary)" }}>تراجع (Undo)</button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {!loading && activeTab === "heritage" && (
                <HeritageAdmin apiBase={apiBase} token={token} notify={notify} />
            )}

            {!loading && activeTab === "settings" && (
                <div className="max-w-md mx-auto p-6 rounded-xl border border-white/10" style={{ background: "var(--bg-card)" }}>
                    <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>تغيير كلمة مرور النظام (أدمن)</h3>
                    <div className="mb-4">
                        <label className="block text-xs font-bold mb-2" style={{ color: "var(--text-secondary)" }}>كلمة المرور الجديدة</label>
                        <input
                            type="text"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="6 أحرف على الأقل..."
                            className="input-field w-full py-2"
                        />
                    </div>
                    {resetError && <div className="text-red-500 text-xs mb-4">{resetError}</div>}
                    {resetSuccess && <div className="text-green-500 text-xs mb-4">{resetSuccess}</div>}
                    <button
                        onClick={async () => {
                            if (!newPassword || newPassword.length < 6) {
                                setResetError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
                                return;
                            }
                            setResetLoading(true);
                            setResetError("");
                            setResetSuccess("");
                            try {
                                const res = await fetch(`${apiBase}/admin/system-password`, {
                                    method: "PUT",
                                    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                                    body: JSON.stringify({ new_password: newPassword })
                                });
                                const data = await res.json();
                                if (res.ok) {
                                    setResetSuccess("تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول مجدداً إذا لزم الأمر.");
                                    setNewPassword("");
                                    if (notify) notify("تم تحديث كلمة المرور", "success");
                                } else {
                                    setResetError(data.detail || "حدث خطأ");
                                }
                            } catch (e) { setResetError("خطأ في الاتصال"); }
                            setResetLoading(false);
                        }}
                        disabled={resetLoading}
                        className="w-full py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                        style={{ background: "var(--primary)" }}
                    >
                        {resetLoading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
                    </button>
                </div>
            )}
        </div>
    );
}
