import React, { useEffect, useState } from "react";
import {
  History,
  Users,
  Layers,
  Heart,
  Globe,
  ShieldCheck,
  Cpu,
  Clock,
  BookOpen,
  ArrowRight,
  Info,
  CheckCircle2,
  Phone,
  Banknote,
  Car,
  Lightbulb,
  TreePine,
  Edit,
  PlusCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Icon mapping
const ICON_MAP = {
  History,
  Users,
  Layers,
  Heart,
  Globe,
  ShieldCheck,
  Cpu,
  Clock,
  BookOpen,
  ArrowRight,
  Info,
  CheckCircle2,
  Phone,
  Banknote,
  Car,
  Lightbulb,
  TreePine
};

import { INITIAL_HERITAGE } from "../constants/heritage";

export default function FamilyHistory({ apiBase, isAdmin }) {
  const [stats, setStats] = useState(null);
  const [heritage, setHeritage] = useState(INITIAL_HERITAGE);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const statsRes = await fetch(`${apiBase}/stats`);
        if (statsRes.ok) setStats(await statsRes.json());
        
        const heritageRes = await fetch(`${apiBase}/heritage`);
        if (heritageRes.ok) {
          const data = await heritageRes.json();
          let finalHeritage = [...INITIAL_HERITAGE];
          
          if (data && data.length > 0) {
            data.forEach(dbItem => {
              const idx = finalHeritage.findIndex(h => h.section_key === dbItem.section_key);
              if (idx !== -1) {
                finalHeritage[idx] = dbItem;
              } else {
                finalHeritage.push(dbItem);
              }
            });
          }

          const mappedData = finalHeritage.map(item => {
            if (item.section_key === 'header' && (item.title === 'تراث عائلة' || item.title === 'تراث العائلة')) {
              return { ...item, title: 'تراث عائلة' };
            }
            return item;
          }).sort((a, b) => (a.order || 0) - (b.order || 0));

          setHeritage(mappedData);
        }
      } catch (e) { 
        console.error("Failed to fetch heritage data:", e); 
      } finally {
        setLoading(false);
      }
    })();
  }, [apiBase]);

  const renderSection = (section) => {
    const Icon = ICON_MAP[section.icon] || Info;
    
    // Add Admin Edit Overlay
    const AdminControls = isAdmin && (
      <div className="absolute top-4 left-4 z-10 transition-all">
        <button 
          onClick={() => navigate("/admin")}
          className="p-2 bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-full transition-all border border-primary/30 shadow-lg shadow-black/20"
          title="تعديل هذا القسم في لوحة التحكم"
        >
          <Edit size={16} />
        </button>
      </div>
    );

    switch (section.type) {
      case 'text':
        if (section.section_key === 'quote' || section.section_key === 'header') return null;

        return (
          <div key={section.id} className="relative card p-8 md:p-10 bg-white/[0.01] border-white/5 space-y-6 group hover:border-primary/20 transition-all">
            {AdminControls}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Icon size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white leading-tight">{section.title}</h4>
                {section.subtitle && <p className="text-xs text-gray-400 mt-1 font-medium">{section.subtitle}</p>}
              </div>
            </div>
            <div className="text-gray-400 leading-loose space-y-4">
              {section.content.text && <p>{section.content.text}</p>}
              {section.content.extra && <p className="p-4 rounded-xl bg-white/5 border-r-2 border-primary italic">{section.content.extra}</p>}
              {section.content.paragraphs && section.content.paragraphs.map((p, i) => (
                <p key={i} className="text-sm md:text-base">{p}</p>
              ))}
            </div>
          </div>
        );

      case 'grid':
        return (
          <div key={section.id} className="relative card p-8 bg-white/[0.01] border-white/5 space-y-6 group hover:border-primary/20 transition-all">
            {AdminControls}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Icon size={24} />
              </div>
              <h4 className="text-xl font-bold text-white leading-tight">{section.title}</h4>
            </div>
            {section.subtitle && <p className="text-gray-300 font-bold mb-4">{section.subtitle}</p>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {section.content.items?.map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3 group/item hover:border-primary/30 transition-all">
                  <div className="text-primary font-black text-sm uppercase tracking-wider">{item.t}</div>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'points':
        return (
          <div key={section.id} className="relative card p-8 bg-white/[0.01] border-white/5 space-y-8 group hover:border-primary/20 transition-all">
            {AdminControls}
            <div className="flex items-center gap-3">
              <Icon size={24} className="text-accent" />
              <h4 className="text-lg font-black text-white leading-tight">{section.title}</h4>
            </div>
            {section.subtitle && <p className="text-sm text-gray-300 -mt-4">{section.subtitle}</p>}
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              {section.content.points?.map((pt, i) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> 
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'list':
        return (
          <div key={section.id} className="relative card p-8 bg-white/[0.01] border-white/5 space-y-6 group hover:border-primary/20 transition-all">
            {AdminControls}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Icon size={24} />
              </div>
              <h4 className="text-xl font-bold text-white leading-tight">{section.title}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.content.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-5 rounded-xl bg-white/5 group/list border border-transparent hover:border-white/10 transition-all">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm text-gray-300 font-bold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const header = heritage.find(s => s.section_key === 'header');
  const quote = heritage.find(s => s.section_key === 'quote');
  const otherSections = heritage.filter(s => s.section_key !== 'header' && s.section_key !== 'quote').sort((a,b) => a.order - b.order);

  return (
    <div className="animate-fade-in-up space-y-12 pb-10">
      {/* Header */}
      {header && (
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#1c1c22] to-[#0c0c0e] border border-white/5 p-8 md:p-12 text-center">
          {isAdmin && (
            <div className="absolute top-4 left-4 z-10">
              <button 
                onClick={() => navigate("/admin")} 
                className="p-2 bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-full transition-all border border-primary/30"
              >
                <Edit size={16} />
              </button>
            </div>
          )}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-accent mb-6 shadow-2xl shadow-accent/20">
            {header.icon && ICON_MAP[header.icon] ? React.createElement(ICON_MAP[header.icon], { size: 40, color: "#fff", strokeWidth: 1.5 }) : <History size={40} color="#fff" strokeWidth={1.5} />}
          </div>
          <h2 className="relative font-black text-white mb-2 tracking-tight leading-tight">
            <span className="block mb-4 text-accent uppercase tracking-widest text-2xl font-bold">{header.title}</span>
            <span className="text-3xl">{header.subtitle}</span>
          </h2>
          <p className="relative text-sm text-gray-400 font-medium max-w-lg mx-auto leading-relaxed">
            {header.content.text}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-8 bg-white/[0.01] border-white/5 flex flex-col items-center text-center group hover:bg-white/[0.03] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div className="text-4xl font-black text-white mb-1">{stats.total}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">فرد في العائلة</div>
          </div>
          <div className="card p-8 bg-white/[0.01] border-white/5 flex flex-col items-center text-center group hover:bg-white/[0.03] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers size={24} />
            </div>
            <div className="text-4xl font-black text-white mb-1">{stats.generations}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">من الأجيال</div>
          </div>
          <div className="card p-8 bg-white/[0.01] border-white/5 flex flex-col items-center text-center group hover:bg-white/[0.03] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart size={24} />
            </div>
            <div className="text-4xl font-black text-white mb-1">{stats.living}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">على قيد الحياة</div>
          </div>
        </div>
      )}

      <section className="space-y-10">
        <div className="grid grid-cols-1 gap-8">
          {otherSections.map(renderSection)}
        </div>
      </section>

      {/* Quote */}
      {quote && (
        <div className="relative p-12 text-center rounded-[3.5rem] bg-gradient-to-br from-accent/10 via-white/[0.02] to-transparent border border-white/5">
          {isAdmin && (
            <div className="absolute top-4 left-4 z-10">
              <button 
                onClick={() => navigate("/admin")} 
                className="p-2 bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-full transition-all border border-primary/30"
              >
                <Edit size={16} />
              </button>
            </div>
          )}
          <div className="absolute top-0 left-0 p-10 text-7xl text-white/5 font-serif select-none font-black">“</div>
          <p className="relative text-base text-gray-300 max-w-2xl mx-auto leading-relaxed font-bold italic">
            "{quote.content.text}"
          </p>
          <div className="absolute bottom-0 right-0 p-10 text-7xl text-white/5 font-serif rotate-180 select-none font-black">“</div>
        </div>
      )}

      {/* Admin Add Section Shortcut */}
      {isAdmin && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={() => navigate("/admin")}
            className="flex items-center gap-3 px-8 py-4 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-2xl font-bold transition-all border border-primary/20 group text-sm shadow-xl shadow-primary/5"
          >
            <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>إضافة قسم جديد</span>
          </button>
        </div>
      )}
    </div>
  );
}