import React, { useState, useEffect } from "react";

export default function InviteManager({ apiBase, token }) {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newInvite, setNewInvite] = useState({ branch_root_id: "", max_uses: 1, expires_hours: 168 });
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);
    const [error, setError] = useState("");

    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    // Load invitations
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${apiBase}/invitations`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.ok) setInvites(await res.json());
            } catch { }
            finally { setLoading(false); }
        })();
    }, [apiBase, token]);

    // Search for branch root
    useEffect(() => {
        if (!searchQuery.trim() || selectedBranch) { setSearchResults([]); setSearchOpen(false); return; }
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`${apiBase}/search?q=${encodeURIComponent(searchQuery)}&limit=8`, { headers: { Authorization: `Bearer ${token}` } });
                setSearchResults(await res.json());
                setSearchOpen(true);
            } catch { }
        }, 300);
        return () => clearTimeout(t);
    }, [searchQuery, apiBase, token, selectedBranch]);

    const handleCreate = async () => {
        if (!selectedBranch) { setError("اختر الفرع أولاً"); return; }
        setCreating(true); setError("");
        try {
            const res = await fetch(`${apiBase}/invitations`, {
                method: "POST", headers,
                body: JSON.stringify({ branch_root_id: selectedBranch.id, max_uses: parseInt(newInvite.max_uses) || 1, expires_hours: parseInt(newInvite.expires_hours) || 168 }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "فشل إنشاء الدعوة");
            setInvites(prev => [data, ...prev]);
            setShowCreate(false);
            setSelectedBranch(null);
            setSearchQuery("");
            setNewInvite({ branch_root_id: "", max_uses: 1, expires_hours: 168 });
        } catch (err) { setError(err.message); }
        finally { setCreating(false); }
    };

    const handleDelete = async (code) => {
        if (!window.confirm("هل تريد حذف هذه الدعوة؟")) return;
        try {
            await fetch(`${apiBase}/invitations/${code}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            setInvites(prev => prev.filter(i => i.code !== code));
        } catch { }
    };

    const copyInviteLink = (invite) => {
        const url = invite.invite_url || `${window.location.origin}/#/invite/${invite.code}`;
        navigator.clipboard.writeText(url);
        setCopiedCode(invite.code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const shareWhatsApp = (invite) => {
        const url = invite.invite_url || `${window.location.origin}/#/invite/${invite.code}`;
        const text = `أهلاً! تم دعوتك للتسجيل في شجرة آل أبوعلي البيطار (المستخدم: ${invite.branch_name}).\n\nسجّل من هنا:\n${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    };

    const shareEmail = (invite) => {
        const url = invite.invite_url || `${window.location.origin}/#/invite/${invite.code}`;
        const subject = "دعوة للتسجيل في شجرة آل أبوعلي البيطار";
        const body = `أهلاً!\n\nتم دعوتك للتسجيل في شجرة آل أبوعلي البيطار (المستخدم: ${invite.branch_name}).\n\nسجّل من هنا:\n${url}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
    };

    return (
        <div className="card p-5 md:p-7 animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>إدارة الدعوات</div>
                    <h2 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>روابط الدعوة</h2>
                </div>
                <button onClick={() => setShowCreate(!showCreate)}
                    className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition"
                    style={{ background: showCreate ? "rgba(239,68,68,0.1)" : "var(--primary-dim)", color: showCreate ? "#ef4444" : "var(--primary)", border: `1px solid ${showCreate ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}` }}>
                    {showCreate ? (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg> إلغاء</>
                    ) : (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg> دعوة جديدة</>
                    )}
                </button>
            </div>

            {/* Create Invitation Form */}
            {showCreate && (
                <div className="mb-6 p-4 rounded-xl space-y-3" style={{ background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)" }}>
                    <div className="relative">
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>اختر المستخدم (جذر الصلاحيات)</label>
                        <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSelectedBranch(null); }}
                            placeholder="ابحث عن الشخص الجذر..." className="input-field"
                            style={selectedBranch ? { borderColor: "var(--primary)" } : {}} />
                        {selectedBranch && (
                            <div className="mt-1 flex items-center gap-2 text-sm" style={{ color: "var(--primary)" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                {selectedBranch.full_name}
                            </div>
                        )}
                        {searchOpen && searchResults.length > 0 && (
                            <div className="absolute top-full mt-1 w-full rounded-xl overflow-hidden z-50" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card-lg)" }}>
                                {searchResults.map((p, i) => (
                                    <button key={p.id} type="button" onClick={() => { setSelectedBranch(p); setSearchQuery(p.full_name); setSearchOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-right transition"
                                        style={{ borderBottom: i < searchResults.length - 1 ? "1px solid var(--border)" : "none" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card-hover)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--primary)" }}>{p.full_name?.charAt(0)}</div>
                                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{p.full_name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>عدد الاستخدامات</label>
                            <input type="number" min="1" max="100" value={newInvite.max_uses} onChange={e => setNewInvite(p => ({ ...p, max_uses: e.target.value }))} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>الصلاحية (ساعات)</label>
                            <select value={newInvite.expires_hours} onChange={e => setNewInvite(p => ({ ...p, expires_hours: e.target.value }))} className="input-field">
                                <option value="24">24 ساعة</option>
                                <option value="72">3 أيام</option>
                                <option value="168">7 أيام</option>
                                <option value="720">30 يوم</option>
                                <option value="8760">سنة</option>
                            </select>
                        </div>
                    </div>

                    {error && <div className="px-3 py-2 rounded-lg text-sm text-center" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>{error}</div>}

                    <button onClick={handleCreate} disabled={creating || !selectedBranch}
                        className="btn-primary w-full" style={{ opacity: selectedBranch ? 1 : 0.5 }}>
                        {creating ? "جاري الإنشاء..." : "إنشاء رابط الدعوة"}
                    </button>
                </div>
            )}

            {/* Invitations List */}
            {loading ? (
                <div className="flex items-center gap-2 py-8 justify-center text-sm" style={{ color: "var(--text-muted)" }}>
                    <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "var(--primary)" }} />
                    جاري التحميل...
                </div>
            ) : invites.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>لا توجد دعوات بعد</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>أنشئ دعوة جديدة لدعوة أفراد العائلة</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {invites.map(invite => {
                        const isExpired = invite.expires_at && new Date(invite.expires_at) < new Date();
                        const isUsedUp = invite.use_count >= invite.max_uses;
                        const isActive = !isExpired && !isUsedUp;

                        return (
                            <div key={invite.code} className="p-4 rounded-xl" style={{
                                background: isActive ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.02)",
                                border: `1px solid ${isActive ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)"}`,
                                opacity: isActive ? 1 : 0.6,
                            }}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{invite.branch_name}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold`} style={{
                                                background: isActive ? "var(--primary-dim)" : "rgba(239,68,68,0.1)",
                                                color: isActive ? "var(--primary)" : "#ef4444",
                                            }}>{isActive ? "فعالة" : isExpired ? "منتهية" : "مستخدمة"}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                                            <span>كود: <code style={{ color: "var(--accent)" }}>{invite.code}</code></span>
                                            <span>استخدام: {invite.use_count}/{invite.max_uses}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {isActive && (
                                            <>
                                                <button onClick={() => copyInviteLink(invite)} title="انسخ الرابط"
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                                                    style={{ background: copiedCode === invite.code ? "var(--primary-dim)" : "rgba(255,255,255,0.05)", color: copiedCode === invite.code ? "var(--primary)" : "var(--text-secondary)" }}>
                                                    {copiedCode === invite.code ? (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                    ) : (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                                    )}
                                                </button>
                                                <button onClick={() => shareWhatsApp(invite)} title="شارك على واتساب"
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                                                    style={{ background: "rgba(37,211,102,0.1)", color: "#25d366" }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                </button>
                                                <button onClick={() => shareEmail(invite)} title="شارك بالإيميل"
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                                                    style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                                </button>
                                            </>
                                        )}
                                        <button onClick={() => handleDelete(invite.code)} title="حذف"
                                            className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                                            style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
