import React, { useState, useEffect, useRef } from "react";
import Dashboard from "./components/Dashboard.jsx";
import SearchBar from "./components/SearchBar.jsx";
import PersonProfile from "./components/PersonProfile.jsx";
import AddMemberForm from "./components/AddMemberForm.jsx";
import MembersList from "./components/MembersList.jsx";
import TreeView from "./components/TreeView.jsx";
import LoginPage from "./components/LoginPage.jsx";
import FamilyArchive from "./components/FamilyArchive.jsx";

const API_BASE = import.meta.env.VITE_API_BASE ||
  (window.location.hostname === "localhost" ? "http://localhost:8080" : "/api");

const NAV_ITEMS = [
  {
    key: "dashboard", label: "الرئيسية",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    key: "tree", label: "شجرة العائلة",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22v-7"/><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2"/><path d="M7 15l5-5 5 5"/></svg>,
  },
  {
    key: "archive", label: "تراث العائلة",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
  },
  {
    key: "search", label: "بحث عن أفراد",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  },
  {
    key: "add", label: "إضافة فرد جديد",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>,
  },
];

function Navbar({ page, setPage, isAdmin, onLogout, onAdminLogin, setParentPerson }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (key) => {
    if (key === "add") setParentPerson(null);
    setPage(key);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Desktop Nav */}
      <nav className="top-nav hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 22v-7"/><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2"/><path d="M7 15l5-5 5 5"/></svg>
            </div>
            <span className="font-black text-base" style={{ color: "var(--text-primary)" }}>شجرة آل أبوعلي البيطار</span>
          </div>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => navigate(item.key)}
                className={`nav-link flex items-center gap-2 ${(page === item.key || (page === "profile" && item.key === "search")) ? "active" : ""}`}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>أدمن</span>
                <button onClick={onLogout} className="text-xs px-3 py-1.5 rounded-lg transition" style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}>خروج</button>
              </>
            ) : (
              <button onClick={onAdminLogin} className="text-xs px-3 py-1.5 rounded-lg transition hover:opacity-80" style={{ color: "var(--accent)", border: "1px solid rgba(197,160,89,0.25)" }}>أدمن</button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="top-nav md:hidden">
        <div className="px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 22v-7"/><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2"/></svg>
            </div>
            <span className="font-black text-sm" style={{ color: "var(--text-primary)" }}>آل أبوعلي البيطار</span>
          </div>

          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg transition" style={{ color: "var(--text-secondary)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Mobile Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 22v-7"/><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2"/></svg>
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>القائمة</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg" style={{ color: "var(--text-muted)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="py-2">
          {NAV_ITEMS.map(item => (
            <button key={item.key} onClick={() => navigate(item.key)}
              className={`sidebar-link w-full ${(page === item.key || (page === "profile" && item.key === "search")) ? "active" : ""}`}>
              <div className="icon-box">{item.icon}</div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="px-5 py-4 mt-auto" style={{ borderTop: "1px solid var(--border)" }}>
          {isAdmin ? (
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>أدمن</span>
              <button onClick={() => { onLogout(); setSidebarOpen(false); }} className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}>خروج</button>
            </div>
          ) : (
            <button onClick={() => { onAdminLogin(); setSidebarOpen(false); }} className="w-full py-2 rounded-lg text-sm font-semibold transition" style={{ color: "var(--accent)", border: "1px solid rgba(197,160,89,0.25)" }}>تسجيل دخول أدمن</button>
          )}
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("ft_token") || "");
  const [page, setPage] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [treeRoot, setTreeRoot] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [parentPerson, setParentPerson] = useState(null);
  const [showFemales, setShowFemales] = useState(true);

  const isAdmin = !!token;

  const handleLogin = (t) => { setToken(t); localStorage.setItem("ft_token", t); setShowAdminLogin(false); };
  const handleLogout = () => { localStorage.removeItem("ft_token"); setToken(""); };

  const handleSelectPerson = async (person) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/person/${person.id}`, { headers });
      if (!res.ok) return;
      setSelected(await res.json());
      setPage("profile");
    } catch {}
  };

  const handleAddDescendant = (p) => { setParentPerson(p); setPage("add"); };

  if (showAdminLogin) {
    return <LoginPage apiBase={API_BASE} onLogin={handleLogin} onCancel={() => setShowAdminLogin(false)} />;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
      <Navbar page={page} setPage={setPage} isAdmin={isAdmin}
        onLogout={handleLogout} onAdminLogin={() => setShowAdminLogin(true)}
        setParentPerson={setParentPerson} />

      <main className="px-4 md:px-6 py-6 md:py-8">
        <div className={`${page === "tree" ? "max-w-full" : "max-w-4xl"} w-full mx-auto`}>

          {page === "dashboard" && (
            <Dashboard apiBase={API_BASE} isAdmin={isAdmin} onLogout={handleLogout}
              onAdminLogin={() => setShowAdminLogin(true)} onViewTree={() => setPage("tree")}
              onViewSearch={() => setPage("search")} onViewArchive={() => setPage("archive")}
              onAddMember={() => { setParentPerson(null); setPage("add"); }} />
          )}

          {page === "tree" && (
            <div className="card p-4 md:p-6 animate-fade-in-up">
              <TreeView apiBase={API_BASE} token={token} isAdmin={isAdmin} rootPerson={treeRoot}
                onAddMember={handleAddDescendant} onViewProfile={handleSelectPerson}
                showFemales={showFemales} onToggleShowFemales={() => setShowFemales(v => !v)} />
              {treeRoot && <button onClick={() => setTreeRoot(null)} className="mt-3 text-xs transition" style={{ color: "var(--text-muted)" }}>← عرض الشجرة الكاملة</button>}
            </div>
          )}

          {page === "archive" && <div className="animate-fade-in-up"><FamilyArchive isAdmin={isAdmin} /></div>}

          {page === "search" && (
            <div className="animate-fade-in-up space-y-4">
              <SearchBar apiBase={API_BASE} token={token} onSelectPerson={handleSelectPerson} showFemales={showFemales} />
              <MembersList apiBase={API_BASE} token={token} onSelectPerson={handleSelectPerson} showFemales={showFemales} />
            </div>
          )}

          {page === "profile" && selected && (
            <div className="animate-fade-in-up space-y-4">
              <button onClick={() => setPage("search")} className="text-sm font-semibold transition" style={{ color: "var(--text-muted)" }}>← رجوع</button>
              <PersonProfile data={selected} onSelectPerson={handleSelectPerson} onAddDescendant={handleAddDescendant} apiBase={API_BASE} isAdmin={isAdmin} />
              <button onClick={() => { setTreeRoot(selected.person); setPage("tree"); }}
                className="btn-primary text-sm flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22v-7"/><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2"/></svg>
                عرض في الشجرة
              </button>
            </div>
          )}

          {page === "add" && (
            <div className="animate-fade-in-up">
              <div className="card p-4 mb-4 flex items-center gap-3" style={{ border: "1px solid rgba(16,185,129,0.15)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>أي فرد من آل أبوعلي البيطار يقدر يضيف نفسه هنا</span>
              </div>
              <AddMemberForm apiBase={API_BASE} parentPerson={parentPerson} onSuccess={(m) => { setParentPerson(null); handleSelectPerson(m); }} />
            </div>
          )}

        </div>
      </main>

      <footer className="py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        سجل أنساب آل أبوعلي البيطار الرقمي · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
