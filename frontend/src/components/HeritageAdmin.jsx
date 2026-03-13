import { INITIAL_HERITAGE } from "../constants/heritage";
import { Edit2, Trash2, Plus, X, Info, PlusCircle, MinusCircle } from "lucide-react";

export default function HeritageAdmin({ apiBase, token, notify }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    section_key: "",
    type: "text",
    title: "",
    subtitle: "",
    content: { paragraphs: [""] },
    icon: "",
    order: 0,
    is_visible: true
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/admin/heritage`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        let merged = [...INITIAL_HERITAGE];
        if (data && data.length > 0) {
          data.forEach(dbItem => {
            const idx = merged.findIndex(h => h.section_key === dbItem.section_key);
            if (idx !== -1) merged[idx] = dbItem;
            else merged.push(dbItem);
          });
        }
        setSections(merged.sort((a,b) => (a.order || 0) - (b.order || 0)));
      }
    } catch (e) {
      console.error(e);
      if (notify) notify("فشل تحميل البيانات", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section) => {
    setEditingId(section.id);
    // Ensure content matches our form structure
    let content = { ...section.content };
    if (section.type === 'text' && !content.paragraphs) {
      content = { paragraphs: [content.text || ""] };
    } else if ((section.type === 'points' || section.type === 'list') && !content.points && !content.items) {
      content = { items: [] };
    } else if (section.type === 'grid' && !content.items) {
      content = { items: [] };
    }

    setFormData({
      ...section,
      content
    });
    setShowAddForm(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const body = { 
        ...formData, 
        order: parseInt(formData.order) 
      };
      
      const isNew = !editingId || typeof editingId === 'string';
      const url = !isNew 
        ? `${apiBase}/heritage/${editingId}`
        : `${apiBase}/heritage`;
      
      const method = !isNew ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        if (notify) notify(editingId ? "تم التعديل بنجاح" : "تمت الإضافة بنجاح", "success");
        resetForm();
        fetchSections();
      } else {
        const data = await res.json();
        if (notify) notify(data.detail || "حدث خطأ", "error");
      }
    } catch (e) {
      if (notify) notify("خطأ في الاتصال", "error");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({
      section_key: "",
      type: "text",
      title: "",
      subtitle: "",
      content: { paragraphs: [""] },
      icon: "",
      order: sections.length + 1,
      is_visible: true
    });
  };

  const handleDelete = async (id) => {
    if (typeof id === 'string') {
      if (notify) notify("لا يمكن حذف الأقسام الأساسية؛ يمكنك إخفاؤها فقط", "error");
      return;
    }
    if (!window.confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    try {
      const res = await fetch(`${apiBase}/heritage/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        if (notify) notify("تم الحذف بنجاح", "success");
        fetchSections();
      }
    } catch (e) {
      if (notify) notify("خطأ في الاتصال", "error");
    }
  };

  // Helper for dynamic content updates
  const updateContent = (newContent) => {
    setFormData({ ...formData, content: { ...formData.content, ...newContent } });
  };

  // Render the Smart Content Form based on type
  const renderContentEditor = () => {
    switch (formData.type) {
      case 'text':
        const paras = formData.content.paragraphs || [""];
        return (
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400">الفقرات (Paragraphs)</label>
            {paras.map((p, idx) => (
              <div key={idx} className="flex gap-2">
                <textarea 
                  className="input-field w-full h-24 text-sm"
                  value={p}
                  onChange={(e) => {
                    const newParas = [...paras];
                    newParas[idx] = e.target.value;
                    updateContent({ paragraphs: newParas });
                  }}
                  placeholder={`الفقرة ${idx + 1}...`}
                />
                <button 
                  type="button"
                  onClick={() => {
                    const newParas = paras.filter((_, i) => i !== idx);
                    updateContent({ paragraphs: newParas.length ? newParas : [""] });
                  }}
                  className="p-2 self-start text-gray-500 hover:text-red-500 transition-colors"
                >
                  <MinusCircle size={20} />
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => updateContent({ paragraphs: [...paras, ""] })}
              className="flex items-center gap-2 text-xs font-bold text-accent hover:underline px-2"
            >
              <PlusCircle size={14} /> إضافة فقرة جديدة
            </button>
          </div>
        );

      case 'points':
      case 'list':
        const items = formData.content.points || formData.content.items || [""];
        const key = formData.type === 'points' ? 'points' : 'items';
        return (
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400">العناصر (Items)</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input 
                  className="input-field w-full"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx] = e.target.value;
                    updateContent({ [key]: newItems });
                  }}
                  placeholder={`العنصر ${idx + 1}...`}
                />
                <button 
                  type="button"
                  onClick={() => {
                    const newItems = items.filter((_, i) => i !== idx);
                    updateContent({ [key]: newItems.length ? newItems : [""] });
                  }}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <MinusCircle size={20} />
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => updateContent({ [key]: [...items, ""] })}
              className="flex items-center gap-2 text-xs font-bold text-accent hover:underline px-2"
            >
              <PlusCircle size={14} /> إضافة عنصر جديد
            </button>
          </div>
        );

      case 'grid':
        const gridItems = formData.content.items || [{ t: "", d: "" }];
        return (
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400">الكروت (Cards)</label>
            {gridItems.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 relative">
                <button 
                  type="button"
                  onClick={() => {
                    const newItems = gridItems.filter((_, i) => i !== idx);
                    updateContent({ items: newItems.length ? newItems : [{ t: "", d: "" }] });
                  }}
                  className="absolute top-4 left-4 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <MinusCircle size={20} />
                </button>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">عنوان الكرت</label>
                  <input 
                    className="input-field w-full"
                    value={item.t}
                    onChange={(e) => {
                      const newItems = [...gridItems];
                      newItems[idx] = { ...item, t: e.target.value };
                      updateContent({ items: newItems });
                    }}
                    placeholder="مثال: الخدمة الصحية"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">وصف الكرت</label>
                  <textarea 
                    className="input-field w-full h-16 text-xs"
                    value={item.d}
                    onChange={(e) => {
                      const newItems = [...gridItems];
                      newItems[idx] = { ...item, d: e.target.value };
                      updateContent({ items: newItems });
                    }}
                    placeholder="اشرح الفائدة هنا..."
                  />
                </div>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => updateContent({ items: [...gridItems, { t: "", d: "" }] })}
              className="flex items-center gap-2 text-xs font-bold text-accent hover:underline px-2"
            >
              <PlusCircle size={14} /> إضافة كرت جديد
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && sections.length === 0) return <div className="p-10 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">إدارة أقسام التراث</h3>
        {!showAddForm && !editingId && (
          <button 
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold"
          >
            <Plus size={16} /> إضافة قسم جديد
          </button>
        )}
      </div>

      {(showAddForm || editingId) && (
        <form onSubmit={handleSave} className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">مفتاح القسم (Section Key - فريد)</label>
              <input 
                className="input-field w-full" 
                value={formData.section_key} 
                onChange={e => setFormData({...formData, section_key: e.target.value})}
                placeholder="مثال: roots, history"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">نوع القسم</label>
              <select 
                className="input-field w-full" 
                value={formData.type} 
                onChange={e => {
                  const newType = e.target.value;
                  // reset content structure for type
                  let content = { paragraphs: [""] };
                  if (newType === 'grid') content = { items: [{ t: "", d: "" }] };
                  else if (newType === 'points' || newType === 'list') content = { items: [""] };
                  setFormData({...formData, type: newType, content});
                }}
              >
                <option value="text">نص (عنوان + فقرات)</option>
                <option value="grid">شبكة (كروت مع عناوين ووصف)</option>
                <option value="points">نقاط (قائمة نقطية)</option>
                <option value="list">قائمة (عناصر بسيطة)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">العنوان</label>
              <input 
                className="input-field w-full" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">العنوان الفرعي (اختياري)</label>
              <input 
                className="input-field w-full" 
                value={formData.subtitle || ""} 
                onChange={e => setFormData({...formData, subtitle: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">الأيقونة (اسم من Lucide)</label>
              <input 
                className="input-field w-full" 
                value={formData.icon || ""} 
                onChange={e => setFormData({...formData, icon: e.target.value})}
                placeholder="مثال: History, Users, Globe"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">الترتيب</label>
              <input 
                type="number" 
                className="input-field w-full" 
                value={formData.order} 
                onChange={e => setFormData({...formData, order: e.target.value})}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-4">
            {renderContentEditor()}
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="is_visible" 
              checked={formData.is_visible} 
              onChange={e => setFormData({...formData, is_visible: e.target.checked})} 
            />
            <label htmlFor="is_visible" className="text-sm font-bold text-gray-300">ظاهر للجمهور</label>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 py-3 bg-accent text-white rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-accent/20">حفظ التغييرات</button>
            <button 
              type="button" 
              onClick={resetForm}
              className="px-8 py-3 bg-white/5 text-gray-400 rounded-xl font-bold border border-white/10"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {sections.map((s) => (
          <div key={s.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-accent">
                {s.icon || <Info size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm">{s.title}</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 uppercase">{s.type === 'text' ? 'نص' : s.type === 'grid' ? 'شبكة' : s.type === 'points' ? 'نقاط' : 'قائمة'}</span>
                  {!s.is_visible && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">مخفي</span>}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">المفتاح: {s.section_key} | الترتيب: {s.order}</div>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(s)}
                className="p-2 text-gray-400 hover:text-accent hover:bg-white/5 rounded-lg transition-all"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => handleDelete(s.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
