import React, { useRef, useState } from "react";
import {
  Camera,
  Trash2,
  User,
  UserPlus,
  Edit3,
  Heart,
  Skull,
  Briefcase,
  GraduationCap,
  MapPin,
  Droplets,
  Mail,
  Phone,
  ChevronRight,
  Star,
  Check,
  X,
  Users
} from "lucide-react";
import EditMemberModal from "./EditMemberModal.jsx";
import AddMemberForm from "./AddMemberForm.jsx";

const GEN_COLORS = [
  { dot: "#C5A059", text: "#C5A059", bg: "rgba(197,160,89,0.08)", border: "rgba(197,160,89,0.2)" },
  { dot: "#10B981", text: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
  { dot: "#8B5CF6", text: "#8B5CF6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)" },
  { dot: "#06B6D4", text: "#06B6D4", bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.2)" },
];

function formatDate(day, month, year) {
  if (!year) return null;
  if (!day && !month) return year;
  const d = day ? String(day).padStart(2, "0") : "??";
  const m = month ? String(month).padStart(2, "0") : "??";
  return `${d}/${m}/${year}`;
}

function InfoCard({ label, value, color, empty, icon: Icon }) {
  return (
    <div className="card p-4 flex flex-col items-center justify-center text-center gap-2 border-white/5 bg-white/[0.02]">
      {Icon && <Icon size={14} className="text-gray-500 opacity-50" />}
      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-sm font-black truncate w-full px-2" style={{ color: value ? (color || "var(--text-primary)") : "var(--text-muted)" }}>
        {value || empty || "—"}
      </div>
    </div>
  );
}

export default function PersonProfile({ data, onSelectPerson, onAddDescendant, apiBase, isAdmin, token, userInfo, notify }) {
  const { person, lineage } = data;
  const initial = person.full_name?.charAt(0) || "؟";
  const [localPerson, setLocalPerson] = useState(person);
  const [localImageUrl, setLocalImageUrl] = useState(person.image_url);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [editing, setEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const photoInputRef = useRef(null);
  const addFormRef = useRef(null);
  const imageUrl = localImageUrl ? (localImageUrl.startsWith("http") ? localImageUrl : `${apiBase || ""}${localImageUrl}`) : null;

  const p = localPerson;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true); setUploadError("");
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch(`${apiBase}/members/${p.id}/photo`, { method: "POST", body: fd });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || "فشل رفع الصورة");
      setLocalImageUrl(result.image_url);
      notify("تم تحديث الصورة الشخصية", "success");
    } catch (e) {
      setUploadError(e.message);
      notify(e.message, "error");
    }
    finally { setUploadLoading(false); }
  };

  const handleRemovePhoto = async (e) => {
    e.stopPropagation(); e.preventDefault();
    if (!imageUrl) return;
    if (!window.confirm("هل تريد إزالة الصورة؟")) return;
    setUploadLoading(true); setUploadError("");
    try {
      const res = await fetch(`${apiBase}/members/${p.id}/photo`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل إزالة الصورة");
      setLocalImageUrl(null);
      notify("تم إزالة الصورة", "info");
    } catch (e) {
      setUploadError(e.message);
      notify(e.message, "error");
    }
    finally { setUploadLoading(false); }
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleToggleAddForm = () => {
    setShowAddForm(prev => !prev);
    if (!showAddForm) {
      setTimeout(() => addFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  };

  return (
    <>
    <div className="card p-6 md:p-10 shadow-2xl border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 rounded-full" />

      {/* Profile Header */}
      <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start mb-10">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-28 h-28 md:w-36 md:h-36 rounded-3xl flex items-center justify-center text-4xl font-black text-white overflow-hidden cursor-pointer group shadow-2xl border-2 border-white/10"
            style={{ background: imageUrl ? "transparent" : "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}
            onClick={() => photoInputRef.current?.click()}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={p.full_name} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
            ) : (initial)}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <Camera size={28} color="#fff" />
            </div>
          </div>
          {uploadLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          {imageUrl && (
            <button
              onClick={handleRemovePhoto}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition z-10 border-2 border-bg-card"
              style={{ borderColor: "var(--bg-card)" }}
            >
              <Trash2 size={14} />
            </button>
          )}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-card border border-white/10 text-[10px] font-black tracking-widest uppercase shadow-xl" style={{ background: "var(--bg-card)" }}>
            {p.gender === "male" ? "ذكر" : "أنثى"}
          </div>
        </div>

        {/* Info detail */}
        <div className="flex-1 text-center md:text-right space-y-4">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white" style={{ color: "var(--text-primary)" }}>{p.full_name}</h2>
            {p.branch_name && (
              <div className="text-primary font-bold text-sm">عائلة {p.branch_name}</div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${p.is_alive !== false ? "bg-primary/10 text-primary border-primary/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}>
              {p.is_alive !== false ? "على قيد الحياة" : "المرحوم"}
            </span>
            {p.marital_status && (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20">
                {p.marital_status}
              </span>
            )}
            {p.profession && (
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-accent/10 text-accent border border-accent/20">
                {p.profession}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            {isAdmin && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-accent text-sm font-bold transition border border-white/5"
              >
                <Edit3 size={16} />
                تعديل البيانات
              </button>
            )}
            <button
              onClick={handleToggleAddForm}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition border ${showAddForm ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"}`}
            >
              {showAddForm ? <X size={16} /> : <UserPlus size={16} />}
              {showAddForm ? "إغلاق النموذج" : "إضافة نسل"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Data */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoCard label="تاريخ الميلاد" value={formatDate(p.birth_day, p.birth_month, p.birth_year)} icon={Star} />
            <InfoCard label="تاريخ الوفاة" value={formatDate(p.death_day, p.death_month, p.death_year)} icon={Skull} />
            <InfoCard label="فصيلة الدم" value={p.blood_type} color="#ef4444" icon={Droplets} />
            <InfoCard label="المهنة" value={p.profession} color="var(--accent)" icon={Briefcase} />
            <InfoCard label="مكان الميلاد" value={p.birth_place} icon={MapPin} />
            <InfoCard label="السكن" value={p.residence_place} icon={MapPin} />
            <InfoCard label="المؤهل" value={p.university_degree} icon={GraduationCap} />
            <InfoCard label="المسمى الوظيفي" value={p.job_title} icon={Briefcase} />
          </div>

          {/* Spouses Section */}
          {(p.spouses?.length > 0 || isAdmin) && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-pink-500">
                <Heart size={20} fill="currentColor" className="opacity-20" />
                <h3 className="font-black text-sm uppercase tracking-widest">{p.gender === "male" ? "الزوجات" : "الأزواج"}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {p.spouses?.map(spouse => (
                  <div key={spouse.id} className="card p-4 bg-white/[0.01] border-pink-500/10 relative group">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-pink-400 transition-colors" style={{ color: "var(--text-primary)" }}>{spouse.full_name}</div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
                          {spouse.birth_year && <span>ولد {formatDate(spouse.birth_day, spouse.birth_month, spouse.birth_year)}</span>}
                          {spouse.profession && <span>{spouse.profession}</span>}
                        </div>
                        {isAdmin && (spouse.phone || spouse.email) && (
                          <div className="flex gap-3 pt-2">
                            {spouse.phone && <a href={`tel:${spouse.phone}`} className="text-accent underline decoration-accent/30 lowercase"><Phone size={12} className="inline ml-1" />{spouse.phone}</a>}
                            {spouse.email && <a href={`mailto:${spouse.email}`} className="text-primary underline decoration-primary/30 lowercase"><Mail size={12} className="inline ml-1" />{spouse.email}</a>}
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={async () => {
                            if (!window.confirm("حذف بيانات الزوجة؟")) return;
                            await fetch(`${apiBase}/spouses/${spouse.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
                            setLocalPerson(prev => ({ ...prev, spouses: prev.spouses.filter(s => s.id !== spouse.id) }));
                          }}
                          className="p-2 opacity-0 group-hover:opacity-100 text-red-500 bg-red-500/10 rounded-lg transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isAdmin && (
                  <button
                    onClick={() => {
                      const name = prompt(p.gender === "male" ? "اسم الزوجة الكامل:" : "اسم الزوج الكامل:"); if (!name) return;
                      fetch(`${apiBase}/members/${p.id}/spouses`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ full_name: name })
                      }).then(r => r.json()).then(newSpouse => setLocalPerson(prev => ({ ...prev, spouses: [...(prev.spouses || []), newSpouse] })));
                    }}
                    className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-white/5 rounded-[var(--radius-lg)] text-xs font-bold text-gray-500 hover:border-pink-500/30 hover:text-pink-400 transition-all bg-white/[0.01]"
                  >
                    <Heart size={16} />
                    إضافة {p.gender === "male" ? "زوجة" : "زوج"} جديد
                  </button>
                )}
              </div>
            </div>
          )}

          {showAddForm && (
            <div ref={addFormRef} className="animate-fade-in-up">
              <div className="mb-4 flex items-center gap-2 text-primary font-bold">
                <UserPlus size={18} />
                <span>إضافة فرد جديد كـ نسل لـ {p.full_name}</span>
              </div>
              <AddMemberForm apiBase={apiBase} parentPerson={p} onSuccess={() => { notify("تم إضافة الفرد بنجاح", "success"); setShowAddForm(false); }} notify={notify} />
            </div>
          )}
        </div>

        {/* Right Column: Lineage */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-accent">
            <Users size={20} className="opacity-20" />
            <h3 className="font-black text-sm uppercase tracking-widest">سلسلة النسب</h3>
          </div>

          <div className="relative pr-6">
            <div className="absolute right-0 top-6 bottom-6 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            <div className="space-y-4">
              {lineage?.map((m, idx) => {
                const isCurrent = m.id === p.id;
                const isRoot = idx === 0;
                const c = GEN_COLORS[idx % GEN_COLORS.length];
                const genLabel = isRoot ? "الجد المؤسس" : `الجيل ${idx + 1}`;

                return (
                  <div key={m.id} className="relative group">
                    <div
                      className={`absolute right-[-24px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-500 flex items-center justify-center z-10 ${isCurrent ? 'bg-primary border-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-card border-white/10 group-hover:border-accent'}`}
                      style={{ background: isCurrent ? undefined : "var(--bg-card)" }}
                    >
                      {isCurrent && <Check size={8} color="#fff" strokeWidth={4} />}
                    </div>

                    <button
                      disabled={isCurrent}
                      onClick={() => onSelectPerson(m)}
                      className={`w-full text-right p-4 rounded-2xl transition-all border ${isCurrent ? 'bg-primary/10 border-primary/20' : 'bg-white/[0.02] border-white/5 hover:border-accent/30 hover:bg-accent/5 cursor-pointer'}`}
                    >
                      <div className="text-xs font-bold text-gray-500 mb-1 flex items-center justify-between">
                        <span>{genLabel}</span>
                        {isRoot && <Star size={10} className="text-accent fill-accent" />}
                      </div>
                      <div className={`font-black text-sm ${isCurrent ? 'text-primary' : 'text-gray-200 group-hover:text-white'}`}>
                        {m.full_name}
                      </div>
                    </button>

                    {!isCurrent && (
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={16} className="text-accent" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    {editing && (
      <EditMemberModal
        member={localPerson} apiBase={apiBase} token={token} isAdmin={isAdmin} notify={notify}
        onSave={u => { setLocalPerson(u); setLocalImageUrl(u.image_url); notify("تم تحديث البيانات بنجاح", "success"); }}
        onDelete={() => { notify("تم حذف العضو بنجاح", "info"); }} onClose={() => setEditing(false)}
      />
    )}
    </>
  );
}

function useParams() {
  throw new Error("Function not implemented.");
}
