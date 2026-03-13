import React, { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, ChevronUp, ChevronDown, Check, X, Info } from "lucide-react";

export default function HeritageAdmin({ apiBase, token, notify }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    section_key: "",
    type: "text",
    title: "",
    subtitle: "",
    content: "{}",
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
      if (res.ok) setSections(await res.json());
    } catch (e) {
      console.error(e);
      if (notify) notify("فشل تحميل البيانات", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section) => {
    setEditingId(section.id);
    setFormData({
      ...section,
      content: JSON.stringify(section.content, null, 2)
    });
    setShowAddForm(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let parsedContent;
      try {
        parsedContent = JSON.parse(formData.content);
      } catch (err) {
        if (notify) notify("خطأ في تنسيق JSON", "error");
        return;
      }

      const body = { 
        ...formData, 
        content: parsedContent,
        order: parseInt(formData.order) 
      };
      
      const url = editingId 
        ? `${apiBase}/heritage/${editingId}`
        : `${apiBase}/heritage`;
      
      const method = editingId ? "PUT" : "POST";

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
        setEditingId(null);
        setShowAddForm(false);
        fetchSections();
      } else {
        const data = await res.json();
        if (notify) notify(data.detail || "حدث خطأ", "error");
      }
    } catch (e) {
      if (notify) notify("خطأ في الاتصال", "error");
    }
  };

  const handleDelete = async (id) => {
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

  if (loading && sections.length === 0) return <div className="p-10 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">إدارة أقسام التراث</h3>
        {!showAddForm && !editingId && (
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({
                section_key: "",
                type: "text",
                title: "",
                subtitle: "",
                content: "{}",
                icon: "",
                order: sections.length + 1,
                is_visible: true
              });
              setShowAddForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold"
          >
            <Plus size={16} /> إضافة قسم جديد
          </button>
        )}
      </div>

      {(showAddForm || editingId) && (
        <form onSubmit={handleSave} className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Section Key (Unique)</label>
              <input 
                className="input-field w-full" 
                value={formData.section_key} 
                onChange={e => setFormData({...formData, section_key: e.target.value})}
                placeholder="e.g. roots, benefits"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Type</label>
              <select 
                className="input-field w-full" 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="text">Text (Title + Paragraphs)</option>
                <option value="grid">Grid (Cards with Titles/Desc)</option>
                <option value="points">Points (Bullet points)</option>
                <option value="list">List (Simple list items)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Title (Arabic)</label>
              <input 
                className="input-field w-full" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Subtitle (Arabic - Optional)</label>
              <input 
                className="input-field w-full" 
                value={formData.subtitle || ""} 
                onChange={e => setFormData({...formData, subtitle: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Icon (Lucide Name)</label>
              <input 
                className="input-field w-full" 
                value={formData.icon || ""} 
                onChange={e => setFormData({...formData, icon: e.target.value})}
                placeholder="History, Users, Globe etc."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Order</label>
              <input 
                type="number" 
                className="input-field w-full" 
                value={formData.order} 
                onChange={e => setFormData({...formData, order: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400">Content (JSON Data)</label>
            <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">
              <Info size={12} />
              text: {"{text: '...', extra: '...'}"} | points: {"{points: ['...', '...']}"} | grid/list: {"{items: [...]}"}
            </div>
            <textarea 
              className="input-field w-full h-40 font-mono text-xs" 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})}
              dir="ltr"
              required
            />
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
            <button type="submit" className="flex-1 py-2 bg-accent text-white rounded-lg font-bold">حفظ</button>
            <button 
              type="button" 
              onClick={() => { setEditingId(null); setShowAddForm(false); }}
              className="px-6 py-2 bg-white/5 text-gray-400 rounded-lg font-bold border border-white/10"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {sections.map((s) => (
          <div key={s.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-accent">
                {s.icon || <Info size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm">{s.title}</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400 uppercase">{s.type}</span>
                  {!s.is_visible && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">مخفي</span>}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Key: {s.section_key} | Order: {s.order}</div>
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
