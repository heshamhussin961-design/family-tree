import React, { useState } from "react";
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

const TAB_ICONS = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  tree: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-7" /><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2" /><path d="M7 15l5-5 5 5" />
    </svg>
  ),
  archive: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /><path d="M8 7h6" /><path d="M8 11h8" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  add: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  ),
};

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("ft_token") || "");
  const [page, setPage] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [treeRoot, setTreeRoot] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [parentPerson, setParentPerson] = useState(null);
  const [showFemales, setShowFemales] = useState(true);

  const isAdmin = !!token;

  const handleLogin = (t) => {
    setToken(t);
    localStorage.setItem("ft_token", t);
    setShowAdminLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("ft_token");
    setToken("");
  };

  const handleSelectPerson = async (person) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/person/${person.id}`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setSelected(data);
      setPage("profile");
    } catch { /* silent */ }
  };

  const handleAddDescendant = (parentPerson) => {
    setParentPerson(parentPerson);
    setPage("add");
  };

  if (showAdminLogin) {
    return (
      <div>
        <LoginPage
          apiBase={API_BASE}
          onLogin={handleLogin}
          onCancel={() => setShowAdminLogin(false)}
        />
      </div>
    );
  }

  const TABS = [
    { key: "dashboard", label: "الرئيسية", icon: TAB_ICONS.dashboard },
    { key: "tree", label: "الشجرة", icon: TAB_ICONS.tree },
    { key: "archive", label: "تراث العائلة", icon: TAB_ICONS.archive },
    { key: "search", label: "بحث", icon: TAB_ICONS.search },
    { key: "add", label: "إضافة", icon: TAB_ICONS.add },
  ];

  if (page === "dashboard") {
    return (
      <Dashboard
        apiBase={API_BASE}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onAdminLogin={() => setShowAdminLogin(true)}
        onViewTree={() => setPage("tree")}
        onViewSearch={() => setPage("search")}
        onViewArchive={() => setPage("archive")}
        onAddMember={() => { setParentPerson(null); setPage("add"); }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-3 md:px-4 py-6 md:py-8 relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="animate-blob" style={{ position: "fixed", top: "-80px", right: "-80px", width: "420px", height: "420px", background: "radial-gradient(circle, rgba(45,122,79,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div className="animate-blob" style={{ position: "fixed", bottom: "-100px", left: "-80px", width: "380px", height: "380px", background: "radial-gradient(circle, rgba(26,92,54,0.13) 0%, transparent 70%)", pointerEvents: "none", animationDelay: "4s" }} />

      <div className={`${page === "tree" ? "max-w-full" : "max-w-5xl"} w-full relative z-10`}>

        {/* Navbar */}
        <header className="flex items-center justify-between mb-5 md:mb-7 animate-fade-in-down">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow"
              style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)", color: "#fff" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22v-7" /><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2" /><path d="M7 15l5-5 5 5" />
              </svg>
            </div>
            <h1 className="text-base md:text-lg font-black" style={{ color: "#e8f5ec" }}>شجرة آل أبوعلي البيطار</h1>
          </button>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <span className="px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1"
                  style={{ background: "rgba(245,158,11,0.13)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  أدمن
                </span>
                <button onClick={handleLogout}
                  className="text-[10px] md:text-xs px-2.5 py-1 rounded-full opacity-50 hover:opacity-80 transition-opacity"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(232,240,235,0.6)" }}>
                  خروج
                </button>
              </>
            ) : (
              <button onClick={() => setShowAdminLogin(true)}
                className="text-[10px] md:text-xs px-2.5 py-1.5 rounded-full font-semibold transition-all hover:opacity-80 flex items-center gap-1"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(232,240,235,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                أدمن
              </button>
            )}
          </div>
        </header>

        {/* Tabs - scrollable on mobile */}
        <div className="overflow-x-auto pb-1 -mx-3 px-3 md:mx-0 md:px-0">
          <div className="flex gap-1 md:gap-1.5 p-1 rounded-full mb-5 md:mb-7 w-fit"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => {
                if (t.key === "add") setParentPerson(null);
                setPage(t.key);
              }}
                className="px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap"
                style={(page === t.key || (page === "profile" && t.key === "search"))
                  ? { background: "linear-gradient(135deg,#2d7a4f,#1a5c36)", color: "#fff", boxShadow: "0 3px 14px rgba(45,122,79,0.4)" }
                  : { color: "rgba(232,240,235,0.5)" }
                }>
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tree ── */}
        {page === "tree" && (
          <div className="animate-fade-in-up rounded-2xl p-3 md:p-5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>
            <TreeView
              apiBase={API_BASE}
              token={token}
              isAdmin={isAdmin}
              rootPerson={treeRoot}
              onAddMember={handleAddDescendant}
              onViewProfile={handleSelectPerson}
              showFemales={showFemales}
              onToggleShowFemales={() => setShowFemales(v => !v)}
            />
            {treeRoot && (
              <button onClick={() => setTreeRoot(null)} className="mt-3 text-xs opacity-50 hover:opacity-80"
                style={{ color: "rgba(232,240,235,0.5)" }}>
                ← عرض الشجرة الكاملة
              </button>
            )}
          </div>
        )}

        {/* ── تراث العائلة ── */}
        {page === "archive" && (
          <div className="animate-fade-in-up">
            <FamilyArchive isAdmin={isAdmin} />
          </div>
        )}

        {/* ── Search ── */}
        {page === "search" && (
          <div className="animate-fade-in-up space-y-5">
            <SearchBar apiBase={API_BASE} token={token} onSelectPerson={handleSelectPerson} showFemales={showFemales} />
            <MembersList apiBase={API_BASE} token={token} onSelectPerson={handleSelectPerson} showFemales={showFemales} />
          </div>
        )}

        {/* ── Profile ── */}
        {page === "profile" && selected && (
          <div className="animate-fade-in-up space-y-4">
            <button
              onClick={() => setPage("search")}
              className="flex items-center gap-2 text-sm font-semibold mb-1 hover:opacity-80 transition-opacity"
              style={{ color: "rgba(232,240,235,0.5)" }}
            >
              ← رجوع للبحث
            </button>
            <PersonProfile
              data={selected}
              onSelectPerson={handleSelectPerson}
              onAddDescendant={handleAddDescendant}
              apiBase={API_BASE}
              isAdmin={isAdmin}
            />
            <button
              onClick={() => { setTreeRoot(selected.person); setPage("tree"); }}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22v-7" /><path d="M7 15H5a2 2 0 0 1-1.5-3.3L12 3l8.5 8.7A2 2 0 0 1 19 15h-2" /><path d="M7 15l5-5 5 5" /></svg>
              عرض في الشجرة
            </button>
          </div>
        )}

        {/* ── Add ── */}
        {page === "add" && (
          <div className="animate-fade-in-up">
            <div className="mb-5 p-4 rounded-xl text-sm flex items-center gap-3"
              style={{ background: "rgba(45,122,79,0.1)", border: "1px solid rgba(45,122,79,0.2)", color: "rgba(232,240,235,0.7)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4db878" strokeWidth="2" className="flex-shrink-0"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              أي فرد من آل أبوعلي البيطار يقدر يضيف نفسه هنا
            </div>
            <AddMemberForm
              apiBase={API_BASE}
              parentPerson={parentPerson}
              onSuccess={(newMember) => {
                setParentPerson(null);
                handleSelectPerson(newMember);
              }}
            />
          </div>
        )}

        <footer className="mt-12 md:mt-14 text-center text-xs" style={{ color: "rgba(232,240,235,0.12)" }}>
          سجل أنساب آل أبوعلي البيطار الرقمي · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
