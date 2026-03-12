import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate, Link, NavLink, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  TreePine,
  Library,
  History,
  Search,
  UserPlus,
  ShieldCheck,
  Mail,
  LogOut,
  LogIn,
  ChevronLeft,
  Menu,
  X,
  Globe
} from "lucide-react";

import Dashboard from "./components/Dashboard.jsx";
import SearchBar from "./components/SearchBar.jsx";
import PersonProfile from "./components/PersonProfile.jsx";
import AddMemberForm from "./components/AddMemberForm.jsx";
import MembersList from "./components/MembersList.jsx";
import TreeView from "./components/TreeView.jsx";
import LoginPage from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import InviteManager from "./components/InviteManager.jsx";
import FamilyArchive from "./components/FamilyArchive.jsx";
import FamilyHistory from "./components/FamilyHistory.jsx";
import FamilyAmbassadors from "./components/FamilyAmbassadors.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import { ToastContainer } from "./components/Toast.jsx";

const API_BASE = import.meta.env.VITE_API_BASE ||
  (window.location.hostname === "localhost" ? "http://localhost:8080" : "/api");

const NAV_ITEMS = [
  { path: "/", label: "الرئيسية", icon: <Home size={18} /> },
  { path: "/tree", label: "شجرة العائلة", icon: <TreePine size={18} /> },
  { path: "/archive", label: "تراث العائلة", icon: <Library size={18} /> },
  { path: "/history", label: "تاريخ العائلة", icon: <History size={18} /> },
  { path: "/ambassadors", label: "سفراء العائلة", icon: <Globe size={18} /> },
  { path: "/search", label: "بحث عن أفراد", icon: <Search size={18} /> },
  { path: "/add", label: "إضافة فرد جديد", icon: <UserPlus size={18} /> },
];

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function Navbar({ isAdmin, userInfo, onLogout, onAdminLogin, theme, toggleTheme }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!userInfo;
  const displayRole = userInfo?.role === "admin" ? "أدمن" : userInfo?.display_name || "";

  return (
    <>
      <nav className="top-nav sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}>
              <TreePine size={20} color="#fff" />
            </div>
            <span className="font-extrabold text-lg tracking-tight hidden sm:block text-slate-900 dark:text-white" style={{ color: "var(--text-primary)" }}>شجرة آل أبوعلي البيطار</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link transition-all ${isActive ? "active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
            {isAdmin && (
              <>
                <NavLink to="/admin" className={({ isActive }) => `nav-link transition-all ${isActive ? "active" : ""}`}>
                  <ShieldCheck size={18} />
                  الإدارة
                </NavLink>
                <NavLink to="/invites" className={({ isActive }) => `nav-link transition-all ${isActive ? "active" : ""}`}>
                  <Mail size={18} />
                  دعوات
                </NavLink>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm" style={{
                  background: isAdmin ? "var(--accent-dim)" : "var(--primary-dim)",
                  color: isAdmin ? "var(--accent)" : "var(--primary)"
                }}>{displayRole}</span>
                <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={onAdminLogin}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:bg-accent-dim hover:border-accent"
                style={{ color: "var(--accent)", borderColor: "rgba(197,160,89,0.3)" }}
              >
                <LogIn size={18} />
                <span>دخول</span>
              </button>
            )}
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-gray-400 hover:bg-white/5 rounded-xl transition">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-72 bg-card border-l border-white/5 z-[70] flex flex-col"
              style={{ background: "var(--bg-card)" }}
            >
              <div className="p-5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary">
                    <TreePine size={18} color="#fff" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white" style={{ color: "var(--text-primary)" }}>القائمة</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-400 hover:bg-white/5 rounded-xl transition">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {NAV_ITEMS.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-500 hover:bg-white/5"}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                {isAdmin && (
                  <>
                    <div className="h-px bg-white/5 my-4 mx-4" />
                    <NavLink to="/admin" onClick={() => setSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? "bg-primary text-white shadow-lg" : "text-gray-500 hover:bg-white/5"}`}>
                      <ShieldCheck size={18} />
                      <span>الإدارة</span>
                    </NavLink>
                    <NavLink to="/invites" onClick={() => setSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? "bg-primary text-white shadow-lg" : "text-gray-500 hover:bg-white/5"}`}>
                      <Mail size={18} />
                      <span>دعوات</span>
                    </NavLink>
                  </>
                )}
              </div>

              <div className="p-6 border-t border-white/5">
                {isLoggedIn ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {userInfo.display_name?.[0] || userInfo.username?.[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white" style={{ color: "var(--text-primary)" }}>{userInfo.display_name}</div>
                        <div className="text-xs text-gray-500">{isAdmin ? "مسؤول النظام" : "محرر فرعي"}</div>
                      </div>
                    </div>
                    <button onClick={() => { onLogout(); setSidebarOpen(false); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border border-red-500/20 text-red-500 hover:bg-red-500/5 transition">
                      <LogOut size={18} />
                      <span>تسجيل خروج</span>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { onAdminLogin(); setSidebarOpen(false); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition">
                    <LogIn size={18} />
                    <span>تسجيل دخول</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("ft_token") || "");
  const [userInfo, setUserInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ft_user") || "null"); } catch { return null; }
  });

  const [theme, setTheme] = useState(() => localStorage.getItem("ft_theme") || "dark");
  const [toasts, setToasts] = useState([]);

  const [selected, setSelected] = useState(null);
  const [treeRoot, setTreeRoot] = useState(null);
  const [treePath, setTreePath] = useState([]);
  const [showTreeState, setShowTreeState] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [parentPerson, setParentPerson] = useState(null);
  const [showFemales, setShowFemales] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = userInfo?.role === "admin";
  const isLoggedIn = !!token && !!userInfo;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ft_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Fetch global settings
    fetch(`${API_BASE}/settings/show_females_to_visitors`)
      .then(r => r.json())
      .then(val => {
        if (typeof val === "boolean") setShowFemales(val);
      })
      .catch(() => { });
  }, []);

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  const notify = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleLogin = (data) => {
    const t = typeof data === "string" ? data : data.access_token;
    setToken(t);
    localStorage.setItem("ft_token", t);
    if (typeof data === "object") {
      const info = { role: data.role, display_name: data.display_name, branch_root_id: data.branch_root_id, user_id: data.user_id };
      setUserInfo(info);
      localStorage.setItem("ft_user", JSON.stringify(info));
    } else {
      const info = { role: "admin", display_name: "أدمن" };
      setUserInfo(info);
      localStorage.setItem("ft_user", JSON.stringify(info));
    }
    setShowLogin(false);
    notify("تم تسجيل الدخول بنجاح", "success");
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("ft_token");
    localStorage.removeItem("ft_user");
    setToken("");
    setUserInfo(null);
    notify("تم تسجيل الخروج", "info");
    navigate("/");
  };

  const handleToggleShowFemales = async () => {
    const newVal = !showFemales;
    setShowFemales(newVal);
    if (isAdmin) {
      try {
        await fetch(`${API_BASE}/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ key: "show_females_to_visitors", value: newVal })
        });
        notify(`تم ${newVal ? 'إظهار' : 'إخفاء'} الإناث للزوار`, "success");
      } catch (e) {
        notify("فشل في حفظ الإعدادات", "error");
        console.error("Failed to save setting", e);
      }
    }
  };

  const handleSelectPerson = async (person) => {
    if (!person || !person.id) return;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/person/${person.id}`, { headers });
      if (!res.ok) {
        notify("حدث خطأ في جلب بيانات الشخص", "error");
        return;
      }
      const data = await res.json();
      setSelected(data);
      navigate(`/profile/${person.id}`);
    } catch (e) {
      notify("خطأ في الاتصال بالسيرفر", "error");
      console.error("Error selecting person:", e);
    }
  };

  const handleAddDescendant = (p) => {
    if (p) {
      setParentPerson(p);
      navigate("/add");
    }
  };

  const RenderLoginPage = () => (
    <LoginPage
      apiBase={API_BASE}
      onLogin={handleLogin}
      onCancel={() => setShowLogin(false)}
    />
  );

  const BackButton = () => (
    <button onClick={() => navigate(-1)} className="group mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors">
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-primary/10 transition-colors">
        <ChevronLeft size={16} />
      </div>
      <span>رجوع</span>
    </button>
  );

  if (showLogin) return <RenderLoginPage />;

  return (
    <div className="min-h-screen transition-colors duration-300 Selection:bg-primary/20 Selection:text-primary" style={{ background: "var(--bg-main)" }}>
      <Navbar isAdmin={isAdmin} userInfo={userInfo}
        onLogout={handleLogout} onAdminLogin={() => setShowLogin(true)}
        theme={theme} toggleTheme={toggleTheme} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <PageWrapper>
                <Dashboard apiBase={API_BASE} isAdmin={isAdmin} onLogout={handleLogout}
                  onAdminLogin={() => setShowLogin(true)} onViewTree={() => navigate("/tree")}
                  onViewSearch={() => navigate("/search")} onViewArchive={() => navigate("/archive")}
                  onAddMember={() => { setParentPerson(null); navigate("/add"); }}
                  onExportGedcom={() => window.open(`${API_BASE}/export/gedcom`, "_blank")} />
              </PageWrapper>
            } />

            <Route path="/tree" element={
              <PageWrapper>
                <div className="card p-4 md:p-8 overflow-hidden shadow-xl shadow-black/5">
                  <TreeView apiBase={API_BASE} token={token} isAdmin={isAdmin} rootPerson={treeRoot}
                    onAddMember={handleAddDescendant} onViewProfile={handleSelectPerson}
                    showFemales={showFemales} onToggleShowFemales={handleToggleShowFemales}
                    onBack={treeRoot ? () => setTreeRoot(null) : undefined}
                    onBackToDashboard={!treeRoot ? () => navigate("/") : undefined}
                    path={treePath} setPath={setTreePath}
                    showTree={showTreeState} setShowTree={setShowTreeState} />
                </div>
              </PageWrapper>
            } />

            <Route path="/archive" element={
              <PageWrapper>
                <BackButton />
                <FamilyArchive apiBase={API_BASE} token={token} isAdmin={isAdmin} notify={notify} />
              </PageWrapper>
            } />

            <Route path="/history" element={
              <PageWrapper>
                <BackButton />
                <FamilyHistory apiBase={API_BASE} />
              </PageWrapper>
            } />

            <Route path="/ambassadors" element={
              <PageWrapper>
                <BackButton />
                <FamilyAmbassadors apiBase={API_BASE} token={token} isAdmin={isAdmin} notify={notify} />
              </PageWrapper>
            } />

            <Route path="/search" element={
              <PageWrapper>
                <BackButton />
                <div className="space-y-6">
                  <SearchBar apiBase={API_BASE} token={token} onSelectPerson={handleSelectPerson} showFemales={showFemales} />
                  <MembersList apiBase={API_BASE} token={token} onSelectPerson={handleSelectPerson} showFemales={showFemales} />
                </div>
              </PageWrapper>
            } />

            <Route path="/profile/:id" element={
              <PageWrapper>
                <BackButton />
                {selected ? (
                  <div className="space-y-8">
                    <PersonProfile data={selected} onSelectPerson={handleSelectPerson} onAddDescendant={handleAddDescendant}
                      apiBase={API_BASE} isAdmin={isAdmin} token={token} userInfo={userInfo} notify={notify} />
                    <button onClick={() => { setTreeRoot(selected.person); navigate("/tree"); }}
                      className="w-full sm:w-auto px-6 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition">
                      <TreePine size={20} />
                      عرض في الشجرة
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <TreePine size={48} className="mb-4 opacity-20" />
                    <p>برجاء اختيار شخص من البحث أو الشجرة</p>
                    <button onClick={() => navigate("/search")} className="mt-4 text-primary font-bold">الذهاب للبحث</button>
                  </div>
                )}
              </PageWrapper>
            } />

            <Route path="/add" element={
              <PageWrapper>
                <BackButton />
                <div className="max-w-2xl mx-auto">
                  <div className="bg-primary/5 p-4 rounded-2xl mb-8 flex items-center gap-4 border border-primary/10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-card text-primary shadow-sm">
                      <UserPlus size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white" style={{ color: "var(--text-primary)" }}>إضافة فرد جديد</h3>
                      <p className="text-xs text-gray-500">سجل بيانات الفرد لتظهر في شجرة العائلة</p>
                    </div>
                  </div>
                  <AddMemberForm apiBase={API_BASE} parentPerson={parentPerson}
                    onSuccess={(m) => { notify("تم إضافة الفرد بنجاح", "success"); setParentPerson(null); handleSelectPerson(m); }} notify={notify} />
                </div>
              </PageWrapper>
            } />

            <Route path="/admin" element={
              isAdmin ? (
                <PageWrapper>
                  <BackButton />
                  <AdminPanel apiBase={API_BASE} token={token} isAdmin={isAdmin} notify={notify} />
                </PageWrapper>
              ) : <Navigate to="/" />
            } />

            <Route path="/invites" element={
              isAdmin ? (
                <PageWrapper>
                  <BackButton />
                  <InviteManager apiBase={API_BASE} token={token} />
                </PageWrapper>
              ) : <Navigate to="/" />
            } />

            <Route path="/invite/:code" element={
              <PageWrapper>
                <InviteHandler handleLogin={handleLogin} />
              </PageWrapper>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </main>

      <footer className="py-12 text-center transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
          <p className="text-sm font-medium text-gray-400">سجل عائلة آل أبوعلي البيطار الرقمي</p>
          <p className="mt-2 text-xs text-gray-400">© {new Date().getFullYear()} جميع الحقوق محفوظة</p>
        </div>
      </footer>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function InviteHandler({ handleLogin }) {
  const { code } = useParams();
  const navigate = useNavigate();

  return (
    <RegisterPage
      apiBase={API_BASE}
      inviteCode={code}
      onRegister={(data) => { handleLogin(data); }}
      onCancel={() => navigate("/")}
    />
  );
}
