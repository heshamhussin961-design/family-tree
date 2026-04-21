import React, { useState, useEffect } from "react";
import {
  Library,
  Image as ImageIcon,
  FileText,
  Mail,
  BookOpen,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  Download,
  ExternalLink,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertCircle,
  Pencil,
  X,
  Video,
  Mic,
  Box
} from "lucide-react";

const SECTIONS = [
  { key: "photos", title: "صور أشخاص", icon: ImageIcon },
  { key: "videos", title: "فيديوهات قديمة", icon: Video },
  { key: "voices", title: "فويسات", icon: Mic },
  { key: "antiques", title: "مقتنيات قديمة", icon: Box },
  { key: "documents", title: "مستندات قديمة", icon: FileText },
  { key: "letters", title: "رسائل قديمة", icon: Mail },
  { key: "stories", title: "قصص وروايات", icon: BookOpen },
];

export default function FamilyArchive({ apiBase, token, isAdmin, notify }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedType, setSelectedType] = useState("photos");
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [editingItem, setEditingItem] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Story state
  const [stories, setStories] = useState([]);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyContent, setStoryContent] = useState("");
  const [storyVisible, setStoryVisible] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${apiBase}/archive`, { headers });
      if (res.ok) setItems(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchStories = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${apiBase}/stories`, { headers });
      if (res.ok) setStories(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchItems();
    fetchStories();
  }, [apiBase, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem && (!file || !title)) return;
    if (editingItem && !title) return;

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", selectedType);
    if (description) formData.append("description", description);
    formData.append("is_visible", isVisible);
    if (file) formData.append("file", file);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem ? `${apiBase}/archive/${editingItem.id}` : `${apiBase}/archive`;

      const res = await fetch(url, {
        method,
        headers,
        body: formData,
      });

      if (res.ok) {
        notify(editingItem ? "تم تحديث العنصر بنجاح" : "تم الرفع للأرشيف بنجاح", "success");
        setTitle("");
        setDescription("");
        setFile(null);
        setIsVisible(false);
        setEditingItem(null);
        fetchItems(); // refresh list
      } else {
        notify("حدث خطأ أثناء العملية", "error");
      }
    } catch {
      notify("حدث خطأ في الاتصال بالسيرفر", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || "");
    setSelectedType(item.category);
    setIsVisible(item.is_visible);
    setFile(null);
    // Scroll to form
    const formElement = document.getElementById("archive-form");
    if (formElement) formElement.scrollIntoView({ behavior: "smooth" });
  };

  const handleToggleVisibility = async (id, currentStatus) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      };
      const res = await fetch(`${apiBase}/archive/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ is_visible: !currentStatus })
      });
      if (res.ok) fetchItems();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${apiBase}/archive/${id}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        notify("تم حذف العنصر بنجاح", "success");
        fetchItems();
      } else {
        notify("فشل حذف العنصر", "error");
      }
    } catch (e) {
      notify("خطأ في الاتصال", "error");
      console.error(e);
    }
  };

  // Story Handlers
  const handleStorySubmit = async (e) => {
    e.preventDefault();
    const payload = { title: storyTitle, content: storyContent, is_visible: storyVisible };
    try {
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const method = editingStory ? "PUT" : "POST";
      const url = editingStory ? `${apiBase}/stories/${editingStory.id}` : `${apiBase}/stories`;
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (res.ok) {
        notify(editingStory ? "تم تعديل الإعلان" : "تمت إضافة الإعلان", "success");
        setStoryTitle(""); setStoryContent(""); setEditingStory(null); setShowStoryForm(false);
        fetchStories();
      }
    } catch { notify("خطأ في الاتصال", "error"); }
  };

  const handleDeleteStory = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    try {
      const res = await fetch(`${apiBase}/stories/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { notify("تم الحذف", "success"); fetchStories(); }
    } catch { notify("خطأ في الاتصال", "error"); }
  };

  const handleReorder = async (id, direction) => {
    const idx = stories.findIndex(s => s.id === id);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === stories.length - 1)) return;
    const newStories = [...stories];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    [newStories[idx], newStories[targetIdx]] = [newStories[targetIdx], newStories[idx]];

    setStories(newStories); // Optimistic update
    try {
      await fetch(`${apiBase}/stories/reorder`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ story_ids: newStories.map(s => s.id) })
      });
    } catch { notify("فشل تحديث الترتيب", "error"); fetchStories(); }
  };

  const renderGallery = (category) => {
    const categoryItems = items.filter(i => i.category === category);
    if (categoryItems.length === 0) return null;

    const Icon = SECTIONS.find(s => s.key === category)?.icon || ImageIcon;

    return (
      <div key={category} className="space-y-4">
        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-wider text-sm">
          <Icon size={18} />
          <span>{SECTIONS.find(s => s.key === category)?.title || category}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categoryItems.map(item => (
            <div key={item.id} className="group card overflow-hidden border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all flex flex-col">
              {item.file_type === "image" ? (
                <div className="relative h-48 w-full bg-gray-900 overflow-hidden">
                  <img src={`${apiBase}${item.file_url}`} alt={item.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <a href={`${apiBase}${item.file_url}`} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-primary text-white shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="h-48 w-full flex flex-col items-center justify-center gap-3 bg-white/[0.02] border-b border-white/5 text-primary group-hover:bg-white/[0.04] transition-colors">
                  {item.category === "videos" ? <Video size={48} strokeWidth={1} /> : 
                   item.category === "voices" ? <Mic size={48} strokeWidth={1} /> :
                   <FileText size={48} strokeWidth={1} />}
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-40">
                    {item.category === "videos" ? "Video File" : 
                     item.category === "voices" ? "Audio File" : "Document File"}
                  </span>
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                <h5 className="font-bold text-sm text-white mb-1 group-hover:text-primary transition-colors">{item.title}</h5>
                {item.description && <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{item.description}</p>}

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  <a href={`${apiBase}${item.file_url}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-accent hover:opacity-80 transition">
                    <Download size={12} />
                    {item.file_type === "image" ? "View Image" : "Download"}
                  </a>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleEditItem(item)}
                        title="تعديل"
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 transition-all hover:text-white">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleToggleVisibility(item.id, item.is_visible)}
                        title={item.is_visible ? "إخفاء" : "عرض"}
                        className={`p-1.5 rounded-lg transition-all ${item.is_visible ? "bg-primary/10 text-primary" : "bg-white/5 text-gray-600 hover:text-white"}`}>
                        {item.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button onClick={() => handleDelete(item.id)}
                        title="حذف"
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500/50 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#16161a] to-[#0c0c0e] border border-white/5 p-8 md:p-12 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary mb-6 shadow-2xl shadow-primary/20">
          <Library size={40} color="#fff" strokeWidth={1.5} />
        </div>
        <h2 className="relative text-3xl font-black text-white mb-2 tracking-tight leading-tight">
          <span className="block mb-4">تاريخ و تراث</span>
          آل أبوعلي البيطار
        </h2>
        <p className="relative text-sm text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">أرشيف عائلي متكامل يحفظ الذاكرة البصرية والوثائقية لآل أبوعلي البيطار عبر الأجيال.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-6 md:p-8 bg-white/[0.01] border-white/5 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Library size={20} />
                </div>
                <h3 className="text-xl font-black text-white">معرض الأرشيف</h3>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-gray-400">
                <CheckCircle2 size={12} className="text-primary" />
                <span>{items.length} عنصر مؤرشف</span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Loading Archive...</span>
              </div>
            ) : items.length > 0 ? (
              <div className="space-y-12">
                {SECTIONS.map(s => renderGallery(s.key))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-gray-700">
                  <ImageIcon size={32} />
                </div>
                <p className="text-sm font-bold text-gray-600">الأرشيف فارغ حالياً</p>
              </div>
            )}
          </div>

          <div className="card p-6 md:p-8 bg-white/[0.01] border-white/5 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-accent" />
                <h3 className="text-lg font-black text-white">إعلانات ومناسبات</h3>
              </div>
              {isAdmin && (
                <button onClick={() => { setShowStoryForm(!showStoryForm); setEditingStory(null); setStoryTitle(""); setStoryContent(""); }}
                  className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-[10px] font-black uppercase hover:bg-accent hover:text-white transition-all flex items-center gap-1.5">
                  <Upload size={12} />
                  إضافة إعلان / مناسبة
                </button>
              )}
            </div>

            {isAdmin && (showStoryForm || editingStory) && (
              <form onSubmit={handleStorySubmit} className="p-4 rounded-2xl bg-accent/5 border border-accent/10 space-y-4">
                <div className="text-[10px] font-black text-accent uppercase tracking-widest">{editingStory ? "تعديل إعلان / مناسبة" : "إعلان / مناسبة جديدة"}</div>
                <input type="text" required value={storyTitle} onChange={e => setStoryTitle(e.target.value)} className="input-field text-xs py-2" placeholder="عنوان الإعلان / المناسبة..." />
                <textarea required rows={4} value={storyContent} onChange={e => setStoryContent(e.target.value)} className="input-field text-xs py-2 resize-none" placeholder="تفاصيل الإعلان / المناسبة..." />
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={storyVisible} onChange={e => setStoryVisible(e.target.checked)} className="w-4 h-4 rounded border-white/10 bg-white/5 text-accent focus:ring-accent/20" />
                    <span className="text-[10px] font-bold text-gray-400">ظهور للعامة</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { setShowStoryForm(false); setEditingStory(null); }} className="px-4 py-2 text-[10px] font-bold text-gray-500 hover:text-white transition">إلغاء</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-accent text-white text-[10px] font-black uppercase">حفظ</button>
                  </div>
                </div>
              </form>
            )}

            <div className="grid gap-4">
              {stories.length === 0 && <div className="text-center py-10 text-xs text-gray-600">لا توجد إعلانات أو مناسبات بعد</div>}
              {stories.map((item, idx) => (
                <div key={item.id} className={`group p-5 rounded-2xl bg-white/[0.02] border border-white/5 transition-all ${!item.is_visible ? 'opacity-40 grayscale' : 'hover:bg-white/[0.04]'}`}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-bold text-white group-hover:text-accent transition-colors">{item.title}</h4>
                        {isAdmin && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleReorder(item.id, "up")} className="p-1 text-gray-500 hover:text-white"><ChevronDown size={14} className="rotate-180" /></button>
                            <button onClick={() => handleReorder(item.id, "down")} className="p-1 text-gray-500 hover:text-white"><ChevronDown size={14} /></button>
                            <button onClick={() => { setEditingStory(item); setStoryTitle(item.title); setStoryContent(item.content); setStoryVisible(item.is_visible); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="p-1 text-blue-400 hover:text-blue-300"><Eye size={14} /></button>
                            <button onClick={() => handleDeleteStory(item.id)} className="p-1 text-red-500/50 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium whitespace-pre-wrap">{item.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                <FileText size={16} />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-widest">السجل الرسمي</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-medium mb-4">يعتبر ملف <span className="text-primary font-bold">XLS</span> المحفوظ في الديوان هو المرجع الأساسي الموثق لكل البيانات.</p>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[10px] text-gray-500 font-bold">
              يحتفظ رئيس الديوان بالنسخة الورقية الأصلية.
            </div>
          </div>

          {isAdmin && (
            <div id="archive-form" className="card p-6 bg-accent/5 border-accent/10 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                  <Upload size={12} />
                  <span>Admin Panel</span>
                </div>
                <h4 className="text-lg font-black text-white">{editingItem ? "تعديل في الأرشيف" : "إضافة للأرشيف"}</h4>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 px-1">تصنيف المحتوى</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTIONS.map(s => (
                      <button key={s.key} type="button" onClick={() => setSelectedType(s.key)}
                        className={`py-2 px-3 rounded-xl text-[10px] font-bold transition-all border ${selectedType === s.key ? 'bg-accent/20 border-accent/40 text-accent' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}>
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 px-1">العنوان</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="input-field py-2 text-xs" placeholder="مثال: صورة قديمة لمنزل الجد..." />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 px-1">الوصف</label>
                  <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="input-field py-2 text-xs resize-none" placeholder="اكتب تفاصيل إضافية هنا..." />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 px-1">
                    {editingItem ? "تغيير الملف (اختياري)" : "الملف المرافق"}
                  </label>
                  <div className="relative group cursor-pointer">
                    <input type="file" required={!editingItem} onChange={e => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="py-3 px-4 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center gap-3 group-hover:bg-white/[0.08] transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500">
                        <Upload size={16} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 truncate">{file ? file.name : (editingItem ? 'اترك فارغاً للاحتفاظ بالملف الحالي' : 'اختر ملفاً...')}</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors">
                  <input type="checkbox" checked={isVisible} onChange={e => setIsVisible(e.target.checked)} className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20" />
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">عرض للعامة فوراً</span>
                </label>

                <div className="flex items-center gap-2">
                  {editingItem && (
                    <button type="button" onClick={() => { setEditingItem(null); setTitle(""); setDescription(""); setFile(null); }} className="p-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition flex items-center justify-center">
                      <X size={16} />
                    </button>
                  )}
                  <button type="submit" disabled={isUploading || (!editingItem && (!file || !title)) || (editingItem && !title)} className="flex-1 btn-primary py-3 text-xs font-black uppercase tracking-widest disabled:opacity-50">
                    {isUploading ? "Uploading..." : (editingItem ? "تحديث العنصر" : "Save to Archive")}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-center space-y-3">
            <Info size={24} className="mx-auto text-gray-700" />
            <p className="text-[10px] font-bold text-gray-600 leading-relaxed">لمشاركة الصور أو القصص التاريخية في الأرشيف العائلي، يرجى التواصل مع إدارة الموقع.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
