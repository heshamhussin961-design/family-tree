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

/* Pages: "dashboard" | "tree" | "search" | "add" | "profile" */
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("ft_token") || "");
  const [page, setPage] = useState("dashboard");
  const [selected, setSelected] = useState(null);       // PersonProfile data
  const [treeRoot, setTreeRoot] = useState(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [parentPerson, setParentPerson] = useState(null); // for AddMemberForm auto-fill

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

  /* Fetch full person data (with lineage) then show profile */
  const handleSelectPerson = async (person) => {
    try {
      const res = await fetch(`${API_BASE}/person/${person.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setSelected(data);
      setPage("profile");
    } catch { /* silent */ }
  };

  /* Called from TreeView or PersonProfile — go to add form with parent pre-filled */
  const handleAddDescendant = (parentPerson) => {
    setParentPerson(parentPerson);
    setPage("add");
  };

  /* Admin login modal overlay */
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
    { key: "dashboard", label: "🏠 الرئيسية" },
    { key: "tree", label: "🌳 الشجرة" },
    { key: "archive", label: "📚 تراث العائلة" },
    { key: "search", label: "🔍 بحث" },
    { key: "add", label: "➕ إضافة" },
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
    <div className="min-h-screen flex flex-col items-center px-4 py-8 relative overflow-x-hidden">
      {/* Background blobs */}
      <div style={{ position: "fixed", top: "-80px", right: "-80px", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(45,122,79,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-100px", left: "-80px", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle, rgba(26,92,54,0.13) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className={`${page === "tree" ? "max-w-full" : "max-w-5xl"} w-full relative z-10`}>

        {/* Navbar */}
        <header className="flex items-center justify-between mb-7 animate-fade-in-up">
          <button onClick={() => setPage("dashboard")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
              style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)" }}>
              <span className="text-xl">🌳</span>
            </div>
            <h1 className="text-lg font-black" style={{ color: "#e8f5ec" }}>شجرة أنساب آل أبوعلي البيطار</h1>
          </button>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: "rgba(245,158,11,0.13)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
                  👑 أدمن
                </span>
                <button onClick={handleLogout}
                  className="text-xs px-3 py-1 rounded-full opacity-50 hover:opacity-80 transition-opacity"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(232,240,235,0.6)" }}>
                  خروج
                </button>
              </>
            ) : (
              <button onClick={() => setShowAdminLogin(true)}
                className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(232,240,235,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                🔑 أدمن
              </button>
            )}
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-1.5 p-1 rounded-full mb-7 w-fit"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => {
              if (t.key === "add") setParentPerson(null);
              setPage(t.key);
            }}
              className="px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200"
              style={(page === t.key || (page === "profile" && t.key === "search"))
                ? { background: "linear-gradient(135deg,#2d7a4f,#1a5c36)", color: "#fff", boxShadow: "0 3px 14px rgba(45,122,79,0.4)" }
                : { color: "rgba(232,240,235,0.5)" }
              }>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tree ── */}
        {page === "tree" && (
          <div className="animate-fade-in-up rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>
            <TreeView
              apiBase={API_BASE}
              token={token}
              isAdmin={isAdmin}
              rootPerson={treeRoot}
              onAddMember={handleAddDescendant}
              onViewProfile={handleSelectPerson}
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
            <SearchBar apiBase={API_BASE} onSelectPerson={handleSelectPerson} />
            <MembersList apiBase={API_BASE} onSelectPerson={handleSelectPerson} />
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
            />
            <button
              onClick={() => { setTreeRoot(selected.person); setPage("tree"); }}
              className="btn-primary text-sm"
            >
              🌳 عرض في الشجرة
            </button>
          </div>
        )}

        {/* ── Add ── */}
        {page === "add" && (
          <div className="animate-fade-in-up">
            <div className="mb-5 p-4 rounded-xl text-sm"
              style={{ background: "rgba(45,122,79,0.1)", border: "1px solid rgba(45,122,79,0.2)", color: "rgba(232,240,235,0.7)" }}>
              📝 أي فرد من آل أبوعلي البيطار يقدر يضيف نفسه هنا
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

        <footer className="mt-14 text-center text-xs" style={{ color: "rgba(232,240,235,0.12)" }}>
          سجل أنساب آل أبوعلي البيطار الرقمي · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
