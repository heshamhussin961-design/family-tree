import React, { useState, useEffect } from "react";
import { 
  Globe, 
  User, 
  MapPin, 
  Heart, 
  Shield, 
  Users, 
  MessageSquare, 
  Lightbulb, 
  Star,
  Upload,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Plus
} from "lucide-react";

const ROLES = [
  {
    title: "تمثيل العائلة بصورة مشرّفة",
    items: [
      "التصرف بأخلاق واحترام يعكس تربية العائلة.",
      "الحفاظ على السمعة الطيبة للعائلة في المجتمع الجديد.",
      "الالتزام بالقوانين والأنظمة في البلد الذي يعيش فيه."
    ],
    icon: Star
  },
  {
    title: "الحفاظ على القيم والتقاليد",
    items: [
      "التمسك بالقيم الدينية والأخلاقية.",
      "احترام العادات مع الانفتاح على ثقافة البلد المضيف دون فقدان الهوية."
    ],
    icon: Shield
  },
  {
    title: "بناء علاقات جيدة",
    items: [
      "تكوين علاقات طيبة مع الناس من مختلف الجنسيات.",
      "تمثيل العائلة بطريقة إيجابية أمام الأصدقاء والزملاء والجيران."
    ],
    icon: Users
  },
  {
    title: "نقل صورة إيجابية عن الوطن والعائلة",
    items: [
      "التحدث عن بلده وعائلته بشكل مشرف.",
      "تعريف الآخرين بثقافته وتقاليده."
    ],
    icon: Globe
  },
  {
    title: "دعم أفراد العائلة",
    items: [
      "مساعدة أي فرد من العائلة يأتي إلى البلد نفسه (إرشاد، استقبال، مساعدة في السكن أو العمل).",
      "نقل الخبرات والنصائح لأفراد العائلة في الوطن."
    ],
    icon: Heart
  },
  {
    title: "الحفاظ على التواصل مع ديوان العائلة",
    items: [
      "البقاء على اتصال دائم مع ديوان العائلة.",
      "مشاركة الأخبار والإنجازات والتحديات."
    ],
    icon: MessageSquare
  }
];

export default function FamilyAmbassadors({ apiBase, token, isAdmin, notify }) {
  const [ambassadors, setAmbassadors] = useState([]);
  const [stats, setStats] = useState({ total_ambassadors: "0", total_countries: "0" });
  const [loading, setLoading] = useState(true);
  
  // Stats form state
  const [editStats, setEditStats] = useState(false);
  const [tempTotalAmb, setTempTotalAmb] = useState("");
  const [tempTotalCountries, setTempTotalCountries] = useState("");

  // Ambassador form state
  const [editingAmb, setEditingAmb] = useState(null);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [years, setYears] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchAmbassadors = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${apiBase}/ambassadors`, { headers });
      if (res.ok) setAmbassadors(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${apiBase}/ambassadors/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setTempTotalAmb(data.total_ambassadors);
        setTempTotalCountries(data.total_countries);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchAmbassadors();
    fetchStats();
  }, [apiBase, token]);

  const handleStatsSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("total_ambassadors", tempTotalAmb);
      formData.append("total_countries", tempTotalCountries);
      
      const res = await fetch(`${apiBase}/ambassadors/stats`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        notify("تم تحديث الإحصائيات بنجاح", "success");
        setEditStats(false);
        fetchStats();
      }
    } catch { notify("خطأ في الاتصال", "error"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !country) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("country", country);
    if (years) formData.append("years", years);
    if (file) formData.append("file", file);

    try {
      const method = editingAmb ? "PUT" : "POST";
      const url = editingAmb ? `${apiBase}/ambassadors/${editingAmb.id}` : `${apiBase}/ambassadors`;
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        notify(editingAmb ? "تم التحديث بنجاح" : "تمت الإضافة بنجاح", "success");
        setName(""); setCountry(""); setYears(""); setFile(null); setEditingAmb(null);
        fetchAmbassadors();
      } else {
        notify("حدث خطأ ما", "error");
      }
    } catch {
      notify("خطأ في الاتصال بالسيرفر", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`${apiBase}/ambassadors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { notify("تم الحذف بنجاح", "success"); fetchAmbassadors(); }
    } catch { notify("خطأ في الاتصال", "error"); }
  };

  const handleToggleVisibility = async (amb) => {
    try {
      const formData = new FormData();
      formData.append("is_visible", !amb.is_visible);
      const res = await fetch(`${apiBase}/ambassadors/${amb.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) fetchAmbassadors();
    } catch { notify("خطأ في الاتصال", "error"); }
  };

  return (
    <div className="animate-fade-in-up space-y-12 pb-20 font-arabic">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#16161a] to-[#0c0c0e] border border-white/5 p-8 md:p-16 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 blur-[120px] rounded-full" />
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4 shadow-2xl shadow-accent/20">
          <Globe size={48} color="#fff" strokeWidth={1.5} />
        </div>
        <h1 className="relative text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
          سفراء العائلة في العالم
          <span className="block text-accent mt-6 text-base md:text-lg font-bold italic opacity-90">تواصل مع سفراء العائلة في الخارج</span>
        </h1>
        <div className="relative max-w-3xl mx-auto bg-white/[0.02] backdrop-blur-md border border-white/5 p-6 rounded-3xl">
          <p className="text-gray-400 leading-relaxed font-medium text-sm md:text-base">
            سفير العائلة في الخارج هو الشخص الذي يمثّل عائلته أو عشيرته أثناء وجوده في بلد آخر، سواء للدراسة أو العمل أو الإقامة. يعتبر عضو منتخب في الديوان، ولكن يعمل من حيث مكان إقامته خارج الدولة (الدولة التي يقيم فيها)، ويحمل مسؤولية أخلاقية واجتماعية كبيرة.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative space-y-4">
        {isAdmin && (
          <button onClick={() => setEditStats(!editStats)} className="absolute -top-10 left-0 p-2 text-accent/50 hover:text-accent transition-colors">
            <Pencil size={18} />
          </button>
        )}
        
        {isAdmin && editStats ? (
          <form onSubmit={handleStatsSubmit} className="max-w-xl mx-auto card p-6 bg-accent/5 border-accent/20 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500">عدد السفراء</label>
              <input type="text" value={tempTotalAmb} onChange={e => setTempTotalAmb(e.target.value)} className="input-field py-2 text-sm" />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-500">عدد الدول</label>
              <input type="text" value={tempTotalCountries} onChange={e => setTempTotalCountries(e.target.value)} className="input-field py-2 text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditStats(false)} className="p-3 text-gray-500"><X size={18} /></button>
              <button type="submit" className="btn-primary py-2 px-6 text-sm">حفظ</button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
            <div className="card p-6 border-white/5 bg-white/[0.01] flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                <User size={24} />
              </div>
              <div className="text-3xl font-black text-white">{stats.total_ambassadors}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">سفير معتمد</div>
            </div>
            <div className="card p-6 border-white/5 bg-white/[0.01] flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Globe size={24} />
              </div>
              <div className="text-3xl font-black text-white">{stats.total_countries}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">دولة حول العالم</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-16">
          {/* List Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white italic">سفراء العائلة في الخارج</h2>
                <div className="h-1 w-20 bg-accent rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ambassadors.length === 0 && !loading && <div className="col-span-full py-20 text-center text-gray-600 font-bold uppercase tracking-widest text-xs">لا يوجد سفراء مسجلين بعد</div>}
              {ambassadors.map(amb => (
                <div key={amb.id} className={`group relative card p-8 bg-[#0c0c0e] border-white/10 flex flex-col items-center transition-all hover:bg-white/[0.02] ${!amb.is_visible ? 'opacity-40 grayscale' : ''}`}>
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => {
                        setEditingAmb(amb); setName(amb.name); setCountry(amb.country); setYears(amb.years || ""); setFile(null);
                        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                      }} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"><Pencil size={14} /></button>
                      <button onClick={() => handleToggleVisibility(amb)} className={`p-2 rounded-lg transition-all ${amb.is_visible ? "bg-primary/10 text-primary" : "bg-white/5 text-gray-400"}`}>{amb.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                      <button onClick={() => handleDelete(amb.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500/40 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                    </div>
                  )}

                  <div className="w-28 h-28 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center p-2 mb-6 group-hover:scale-105 transition-transform duration-500">
                    <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden relative">
                      {amb.image_url ? (
                        <img src={`${apiBase}${amb.image_url}`} alt={amb.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-white/10" />
                      )}
                    </div>
                  </div>

                  <div className="text-center space-y-4 w-full">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-accent tracking-[0.3em] mb-1">الاسم بالكامل</div>
                      <div className="text-lg font-bold text-white tracking-wide border-b border-white/5 pb-2">{amb.name}</div>
                    </div>

                    <div className="flex justify-between items-center text-right pt-2">
                       <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase text-gray-600 tracking-wider">الدولة المقيمة</div>
                          <div className="text-sm font-bold text-primary flex items-center gap-1.5"><MapPin size={12}/>{amb.country}</div>
                       </div>
                       {amb.years && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase text-gray-600 tracking-wider">مدة السفارة</div>
                          <div className="text-sm font-bold text-white">{amb.years} سنوات</div>
                        </div>
                       )}
                    </div>

                    <div className="pt-4 border-t border-white/5 text-center mt-4">
                      <div className="text-accent font-black text-[10px] uppercase tracking-widest leading-relaxed">"الأخلاق الطيبة خير سفير"</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Roles & Responsibilities */}
          <div className="space-y-8">
            <div className="text-right space-y-2 pr-4 border-r-4 border-accent">
              <h2 className="text-2xl font-black text-white italic">المهام والمسؤوليات</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ROLES.map((role, i) => (
                <div key={i} className="group card p-6 border-white/5 bg-white/[0.01] h-full flex flex-col hover:bg-white/[0.03] transition-all">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-all duration-500">
                    <role.icon size={20} />
                  </div>
                  <h3 className="text-md font-black text-white mb-4 leading-tight group-hover:text-accent transition-colors">{role.title}</h3>
                  <ul className="space-y-3">
                    {role.items.map((item, j) => (
                      <li key={j} className="flex gap-2.5 text-xs text-gray-500 leading-relaxed font-medium">
                        <div className="mt-1.5 w-1 h-1 rounded-full bg-accent/40 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-12 lg:sticky lg:top-24 h-fit">
          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 text-center space-y-6">
            <Shield size={48} className="mx-auto text-primary opacity-20" />
            <h4 className="text-xl font-black text-white">وثيقة السفارة</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              يُمنح السفير وثيقة رسمية معتمدة من ديوان آل أبوعلي البيطار، تقديراً لجهوده وتمثيله المشرّف للعائلة في الخارج.
            </p>
            <div className="py-2 px-4 rounded-full bg-black/40 border border-white/5 inline-flex items-center gap-2 text-[10px] font-bold text-gray-500 shadow-xl">
               <Star size={10} className="text-accent" />
               معتمد في السجل العائلي
            </div>
          </div>

          {isAdmin && (
            <div className="card p-6 bg-accent/5 border-accent/10 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-accent tracking-[0.2em]">
                   <Plus size={12} />
                   <span>Admin Management</span>
                </div>
                <h4 className="text-lg font-black text-white">{editingAmb ? "تعديل بيانات سفير" : "إضافة سفير جديد"}</h4>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-500 px-1">الاسم بالكامل</label>
                   <input type="text" required value={name} onChange={e => setName(e.target.value)} className="input-field text-xs py-2.5" placeholder="..." />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-500 px-1">الدولة</label>
                   <input type="text" required value={country} onChange={e => setCountry(e.target.value)} className="input-field text-xs py-2.5" placeholder="..." />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-500 px-1">عدد سنوات السفارة</label>
                   <input type="number" value={years} onChange={e => setYears(e.target.value)} className="input-field text-xs py-2.5" placeholder="..." />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-gray-500 px-1">الصورة الشخصية</label>
                   <div className="relative group cursor-pointer h-20">
                      <input type="file" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="h-full px-4 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center gap-3 transition-colors group-hover:bg-white/[0.08]">
                        <Upload size={16} className="text-accent" />
                        <span className="text-[10px] font-bold text-gray-500 truncate">{file ? file.name : (editingAmb ? 'تغيير الصورة اختياري' : 'اختر صورة...')}</span>
                      </div>
                   </div>
                </div>
                <div className="flex gap-2 pt-2">
                   {editingAmb && (
                    <button type="button" onClick={() => { setEditingAmb(null); setName(""); setCountry(""); setYears(""); setFile(null); }} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition"><X size={18} /></button>
                   )}
                   <button type="submit" disabled={isUploading} className="flex-1 btn-primary py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                     {isUploading ? "Uploading..." : (editingAmb ? "تحديث البيانات" : "إضافة للأعضاء")}
                   </button>
                </div>
              </form>
            </div>
          )}

          <div className="card p-6 border-white/5 text-center space-y-4">
             <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-gray-600">
                <Users size={24} />
             </div>
             <p className="text-[10px] font-bold text-gray-600 leading-relaxed italic">
               نهدف دائماً لتوسيط شبكة تواصل عائلية فعالة عبر كل بقاع الأرض، لخدمة آل البيطار ورفعة اسمهم.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
