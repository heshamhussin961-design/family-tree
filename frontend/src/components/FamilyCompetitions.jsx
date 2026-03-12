import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Target, 
  Settings, 
  Users, 
  Award, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  X, 
  Upload,
  BookOpen,
  GraduationCap,
  Microscope,
  Medal,
  ChevronDown,
  Info
} from "lucide-react";

export default function FamilyCompetitions({ apiBase, token, isAdmin, notify }) {
  const [competitions, setCompetitions] = useState([]);
  const [results, setResults] = useState([]);
  const [settings, setSettings] = useState({
    comp_intro_title: "برنامج جوائز أبناء العائلة",
    comp_goal: "تشجيع أبناء وأحفاد العائلة على التفوق في مجالات الدين والعلم والأخلاق، وتعزيز روح التنافس الإيجابي بينهم.",
    comp_organization: "تشكيل لجنة من العائلة مختصة بهذا الشأن، مهتمتها الإشراف والمتابعة..."
  });
  const [loading, setLoading] = useState(true);

  // Admin States
  const [editSettings, setEditSettings] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  const [editingResult, setEditingResult] = useState(null);

  // Form States
  const [compTitle, setCompTitle] = useState("");
  const [compDesc, setCompDesc] = useState("");
  
  const [resName, setResName] = useState("");
  const [resCompId, setResCompId] = useState("");
  const [resStatus, setResStatus] = useState("winner");
  const [resReward, setResReward] = useState("");
  const [resYear, setResYear] = useState(new Date().getFullYear());
  const [resNotes, setResNotes] = useState("");

  const fetchData = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [compRes, resultRes, settingsRes] = await Promise.all([
        fetch(`${apiBase}/competitions?t=${Date.now()}`, { headers }),
        fetch(`${apiBase}/competitions/results?t=${Date.now()}`),
        fetch(`${apiBase}/competitions/settings?t=${Date.now()}`)
      ]);

      if (compRes.ok) setCompetitions(await compRes.json());
      if (resultRes.ok) setResults(await resultRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch (e) {
      console.error(e);
      notify("خطأ في جلب البيانات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiBase, token]);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", settings.comp_intro_title);
    formData.append("goal", settings.comp_goal);
    formData.append("organization", settings.comp_organization);

    try {
      const res = await fetch(`${apiBase}/competitions/settings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        notify("تم تحديث الإعدادات", "success");
        setEditSettings(false);
        fetchData();
      }
    } catch { notify("خطأ في الاتصال", "error"); }
  };

  const handleCompSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", compTitle);
    formData.append("description", compDesc);

    try {
      const method = editingComp ? "PUT" : "POST";
      const url = editingComp ? `${apiBase}/competitions/${editingComp.id}` : `${apiBase}/competitions`;
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        notify(editingComp ? "تم التحديث" : "تمت الإضافة", "success");
        setEditingComp(null); setCompTitle(""); setCompDesc("");
        fetchData();
      }
    } catch { notify("خطأ في الاتصال", "error"); }
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("competition_id", resCompId);
    formData.append("member_name", resName);
    formData.append("status", resStatus);
    formData.append("reward", resReward);
    formData.append("year", resYear);
    formData.append("notes", resNotes);

    try {
      const method = editingResult ? "PUT" : "POST";
      const url = editingResult ? `${apiBase}/competitions/results/${editingResult.id}` : `${apiBase}/competitions/results`;
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        notify(editingResult ? "تم التحديث" : "تمت الإضافة", "success");
        setEditingResult(null); setResName(""); setResReward(""); setResNotes("");
        fetchData();
      }
    } catch { notify("خطأ في الاتصال", "error"); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    const url = type === 'comp' ? `${apiBase}/competitions/${id}` : `${apiBase}/competitions/results/${id}`;
    try {
      const res = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { notify("تم الحذف", "success"); fetchData(); }
    } catch { notify("خطأ في الاتصال", "error"); }
  };

  const getCompIcon = (title) => {
    if (title.includes("قرآن") || title.includes("دين")) return BookOpen;
    if (title.includes("دراسي") || title.includes("علم")) return GraduationCap;
    if (title.includes("رياضي")) return Trophy;
    return Medal;
  };

  return (
    <div className="animate-fade-in-up space-y-12 pb-20 font-arabic">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#16161a] to-[#0c0c0e] border border-white/5 p-8 md:p-16 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-[2.2rem] bg-primary mb-6 shadow-2xl shadow-primary/20">
          <Trophy size={48} color="#fff" strokeWidth={1.5} />
        </div>
        <h1 className="relative text-3xl md:text-4xl font-black text-white mb-6 tracking-tight leading-tight">
          {settings.comp_intro_title}
          <span className="block text-primary mt-4 text-lg md:text-xl font-bold italic">مسابقات علمية, دينية, رياضية</span>
        </h1>
        {isAdmin && (
            <button onClick={() => setEditSettings(!editSettings)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl text-primary hover:bg-white/10 transition-all">
                <Settings size={20} />
            </button>
        )}
      </div>

      {/* Intro Admin Form */}
      {isAdmin && editSettings && (
          <div className="card p-8 bg-primary/5 border-primary/20 max-w-4xl mx-auto space-y-6 animate-fade-in">
              <h3 className="text-xl font-black text-white">تعديل مقدمة الصفحة</h3>
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">العنوان الرئيسي</label>
                    <input type="text" value={settings.comp_intro_title} onChange={e => setSettings({...settings, comp_intro_title: e.target.value})} className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">الهدف من البرنامج</label>
                    <textarea value={settings.comp_goal} onChange={e => setSettings({...settings, comp_goal: e.target.value})} className="input-field min-h-[100px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">آلية التنظيم</label>
                    <textarea value={settings.comp_organization} onChange={e => setSettings({...settings, comp_organization: e.target.value})} className="input-field min-h-[150px]" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setEditSettings(false)} className="btn-secondary">إلغاء</button>
                      <button type="submit" className="btn-primary px-8">حفظ التغييرات</button>
                  </div>
              </form>
          </div>
      )}

      {/* Goal & Organization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-8 border-white/5 bg-white/[0.01] space-y-6">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Target size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-white">الهدف</h2>
              </div>
              <p className="text-gray-400 leading-loose text-md font-medium">
                  {settings.comp_goal}
              </p>
          </div>
          <div className="card p-8 border-white/5 bg-white/[0.01] space-y-6">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                      <Settings size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-white">آلية التنظيم</h2>
              </div>
              <div className="text-gray-400 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                  {settings.comp_organization}
              </div>
          </div>
      </div>

      {/* Competitions Section */}
      <div className="space-y-8">
          <div className="flex items-center justify-between overflow-x-hidden">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white italic">المسابقات المتاحة</h2>
                    <div className="h-1.5 w-32 bg-primary rounded-full" />
                </div>
                {isAdmin && (
                    <button onClick={() => { setEditingComp(null); setCompTitle(""); setCompDesc(""); setEditSettings(false); document.getElementById('comp-form')?.scrollIntoView({behavior:'smooth'}); }} className="btn-primary py-2 px-6 flex items-center gap-2">
                        <Plus size={18} />
                        إضافة مسابقة
                    </button>
                )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map(comp => {
                  const Icon = getCompIcon(comp.title);
                  return (
                    <div key={comp.id} className="group card p-6 bg-[#0c0c0e] border-white/10 hover:border-primary/30 transition-all hover:bg-white/[0.02]">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                <Icon size={24} />
                            </div>
                            {isAdmin && (
                                <div className="flex gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingComp(comp); setCompTitle(comp.title); setCompDesc(comp.description || ""); }} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"><Pencil size={14}/></button>
                                    <button onClick={() => handleDelete('comp', comp.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={14}/></button>
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-black text-white mb-3 group-hover:text-primary transition-colors">{comp.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed min-h-[40px]">
                            {comp.description}
                        </p>
                    </div>
                  );
              })}
          </div>
      </div>

      {/* Results / Winners Section */}
      <div className="space-y-8">
          <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white italic">الحاصلون على الجوائز</h2>
                    <div className="h-1.5 w-32 bg-accent rounded-full" />
                </div>
                {isAdmin && (
                    <button onClick={() => { setEditingResult(null); setResName(""); setResReward(""); setEditSettings(false); document.getElementById('result-form')?.scrollIntoView({behavior:'smooth'}); }} className="btn-primary bg-accent hover:bg-accent/80 py-2 px-6 flex items-center gap-2">
                        <Plus size={18} />
                        إضافة فائز/مرشح
                    </button>
                )}
          </div>

          <div className="card overflow-hidden border-white/10 bg-[#0c0c0e]">
              <div className="overflow-x-auto">
                  <table className="w-full text-right">
                      <thead>
                          <tr className="bg-white/5 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                              <th className="p-4">الفائز / المرشح</th>
                              <th className="p-4">المسابقة</th>
                              <th className="p-4 text-center">السنة</th>
                              <th className="p-4">المكافأة</th>
                              <th className="p-4 text-center">الحالة</th>
                              {isAdmin && <th className="p-4 text-center">إجراءات</th>}
                          </tr>
                      </thead>
                      <tbody className="text-sm font-medium">
                          {results.map(res => {
                              const comp = competitions.find(c => c.id === res.competition_id);
                              return (
                                <tr key={res.id} className="border-t border-white/5 hover:bg-white/[0.01] transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">
                                                {res.member_name[0]}
                                            </div>
                                            <span className="text-white font-bold">{res.member_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-400">{comp?.title || "مسابقة عامة"}</td>
                                    <td className="p-4 text-center text-gray-500 font-mono">{res.year}</td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black">
                                            {res.reward || "---"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${res.status === 'winner' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                            {res.status === 'winner' ? 'فائز' : 'مرشح'}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => {
                                                    setEditingResult(res); setResName(res.member_name); setResCompId(res.competition_id);
                                                    setResStatus(res.status); setResReward(res.reward || ""); setResYear(res.year); setResNotes(res.notes || "");
                                                }} className="p-2 text-gray-500 hover:text-white transition-colors"><Pencil size={14}/></button>
                                                <button onClick={() => handleDelete('result', res.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                              );
                          })}
                          {results.length === 0 && (
                              <tr>
                                  <td colSpan={isAdmin ? 6 : 5} className="p-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">لا يوجد بيانات مسجلة حالياً</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>

      {/* Admin Management Forms */}
      {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-20">
              {/* Competition Form */}
              <div id="comp-form" className="card p-8 bg-primary/5 border-primary/20 space-y-6">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                          <Plus size={20} />
                      </div>
                      <h3 className="text-xl font-black text-white">{editingComp ? "تعديل مسابقة" : "إضافة مسابقة جديدة"}</h3>
                  </div>
                  <form onSubmit={handleCompSubmit} className="space-y-4">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 px-1">اسم المسابقة</label>
                          <input type="text" required value={compTitle} onChange={e => setCompTitle(e.target.value)} className="input-field" placeholder="مثلاً: مسابقة حفظ القرآن الكريم" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 px-1">وصف المسابقة</label>
                          <textarea value={compDesc} onChange={e => setCompDesc(e.target.value)} className="input-field min-h-[80px]" placeholder="..." />
                      </div>
                      <div className="flex gap-3 pt-2">
                          {editingComp && (
                              <button type="button" onClick={() => {setEditingComp(null); setCompTitle(""); setCompDesc("");}} className="p-3 bg-white/5 rounded-xl text-gray-400"><X size={20}/></button>
                          )}
                          <button type="submit" className="flex-1 btn-primary py-4 font-black tracking-widest uppercase text-xs">
                              {editingComp ? "تحديث المسابقة" : "إدراج مسابقة"}
                          </button>
                      </div>
                  </form>
              </div>

              {/* Result Form */}
              <div id="result-form" className="card p-8 bg-accent/5 border-accent/20 space-y-6">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center">
                          <Award size={20} />
                      </div>
                      <h3 className="text-xl font-black text-white">{editingResult ? "تعديل بيانات فائز" : "إضافة فائز جديد"}</h3>
                  </div>
                  <form onSubmit={handleResultSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 px-1">اسم الفائز</label>
                            <input type="text" required value={resName} onChange={e => setResName(e.target.value)} className="input-field" />
                        </div>
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-xs font-bold text-gray-500 px-1">المسابقة</label>
                            <select required value={resCompId} onChange={e => setResCompId(e.target.value)} className="input-field appearance-none">
                                <option value="">اختر المسابقة...</option>
                                {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 px-1">الحالة</label>
                            <select value={resStatus} onChange={e => setResStatus(e.target.value)} className="input-field">
                                <option value="winner">فائز</option>
                                <option value="candidate">مرشح</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 px-1">السنة</label>
                            <input type="number" value={resYear} onChange={e => setResYear(e.target.value)} className="input-field" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 px-1">المكافأة</label>
                            <input type="text" value={resReward} onChange={e => setResReward(e.target.value)} className="input-field" placeholder="مثلاً: درع + 500$" />
                        </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 px-1">ملاحظات إضافية</label>
                          <textarea value={resNotes} onChange={e => setResNotes(e.target.value)} className="input-field min-h-[80px]" />
                      </div>
                      <div className="flex gap-3 pt-2">
                          {editingResult && (
                              <button type="button" onClick={() => {setEditingResult(null); setResName(""); setResReward("");}} className="p-3 bg-white/5 rounded-xl text-gray-400"><X size={20}/></button>
                          )}
                          <button type="submit" className="flex-1 btn-primary bg-accent hover:bg-accent/80 border-accent/20 py-4 font-black tracking-widest uppercase text-xs">
                              {editingResult ? "تحديث البيانات" : "إدراج فائز"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 p-12 rounded-[2.5rem] bg-gradient-to-b from-white/[0.02] to-transparent border border-white/5">
            <Info size={32} className="text-primary/40" />
            <div className="text-center space-y-4">
                <h4 className="text-xl font-black text-white">تكريم الفائزين</h4>
                <p className="text-sm text-gray-500 leading-loose max-w-2xl font-medium">
                    يتم تكريم الفائزين في ديوان العائلة أو خلال اجتماع العائلة السنوي، مع منحهم شهادات تقدير وجوائز مالية، بالإضافة لنشر أسمائهم في سجل إنجازات العائلة الرقمي وعلى كافة منصاتنا الرسمية.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-4">
                    <span className="px-4 py-2 rounded-xl bg-primary/5 text-primary text-[10px] font-black border border-primary/10 tracking-widest">ديوان العائلة</span>
                    <span className="px-4 py-2 rounded-xl bg-accent/5 text-accent text-[10px] font-black border border-accent/10 tracking-widest">الاجتماع السنوي</span>
                    <span className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-[10px] font-black border border-white/10 tracking-widest">المواقع الرسمية</span>
                </div>
            </div>
      </div>
    </div>
  );
}
