import React, { useState } from "react";

const SECTIONS = [
  { key: "photos", title: "صور شخصيات" },
  { key: "documents", title: "مستندات قديمة" },
  { key: "letters", title: "رسائل قديمة" },
  { key: "stories", title: "قصص وروايات" },
];

const STORY_SECTIONS = [
  { id: 1, title: "تعريف شجرة العائلة", content: "شجرة العائلة ليست مجرد أسماء وتواريخ؛ بل مشروع له فوائد نفسية واجتماعية وثقافية وعملية. تعزز الهوية والانتماء، وتقوي الثقة بالنفس عبر معرفة قصص نجاح وصمود الأجداد، وتساعدنا على فهم الأنماط العائلية التي انتقلت بين الأجيال في المهن والهجرة والصفات والتحديات." },
  { id: 2, title: "فوائد تسجيل الأفراد في الشجرة", content: "التسجيل في الشجرة يظهر تاريخ العائلة ويعرّف كل فرد بجذوره الأصيلة، ويساعد على التعرف على أبناء العم في شتى أنحاء العالم، ويجمع العائلة تحت مظلّة واحدة لتسهيل التواصل وتقديم الخدمات للمشتركين، والاستفادة من الفزعات والمساعدات الطارئة والمقترحات الجديدة والفعاليات الاجتماعية." },
  { id: 3, title: "إظهار تاريخ العائلة ومعرفة الجذور الأصيلة", content: "اجتهد الأجداد والآباء والأعمام الأوائل في وضع حجر الأساس لشجرة آل أبوعلي البيطار، وتركونا أمام مسؤولية إكمال المسيرة ووضع اللبنات في مكانها الصحيح. الهدف هو بناء محترم للعائلة يتناسب مع تكنولوجيا العصر وزمن الذكاء الاصطناعي، ويحفظ الإرث العظيم الذي تركه من سبقونا مثل العم الفاضل خليل نمر أبوعلي رحمه الله." },
  { id: 4, title: "التعرف على أبناء العم في شتى أنحاء العالم", content: "بسبب الانشغال في طلب الرزق والسفر لدول متعددة، قلت الزيارات وصار اللقاء بين أفراد العائلة الكبيرة أمراً صعباً. لذلك أصبحت التكنولوجيا ووسائل التواصل الاجتماعي وسيلة مهمة لمتابعة الأهل والأقارب وسماع أخبارهم، ومعرفة أماكن تواجدهم وأحوالهم، ليبقى التواصل وصلة الرحم حاضرة رغم بُعد المسافات." },
  { id: 5, title: "الاستفادة من جمع أفراد العائلة تحت مظلّة واحدة", content: "جمع أفراد العائلة تحت مظلة واحدة يحقق فوائد عملية عديدة؛ مثل سهولة التصويت في أي انتخابات داخلية أو خارجية بشكل مدروس، والحصول على خصومات وخدمات صحية أفضل، وتيسير التعامل مع الحالات الإنسانية الطارئة كالحاجة إلى متبرعين بالدم عبر معلومات موثّقة ومحدّثة." },
  { id: 6, title: "سهولة الوصول إلى المشتركين ووسائل التواصل", content: "توفر الشجرة وسيلة سريعة لإرسال الرسائل الإلكترونية والتنبيهات عبر الهاتف أو الواتس أب أو البريد الإلكتروني، وتسهّل دفع الاشتراكات مباشرة إلى حساب الديوان البنكي بدون الحاجة إلى تحصيل يدوي. هذا يوفّر الوقت والجهد والتكاليف، ويجعل إدارة شؤون العائلة أكثر تنظيمًا وفعالية." },
  { id: 7, title: "الفزعات والمساعدات الطارئة أو الفورية", content: "وجود قاعدة بيانات منظّمة لأبناء العائلة يساعد على تقديم الخدمات للمشتركين بالشكل اللائق، ويُسهّل التواصل مع اللجنة المسؤولة عن المساعدات في الديوان أو مع أصحاب الأيادي البيضاء مباشرة، بحيث تصل الفزعة في الوقت المناسب لمن يحتاجها." },
  { id: 8, title: "الاستفادة من المقترحات الجديدة لأبناء العائلة", content: "كل مقترح يقدّمه أبناء العائلة، من أي مكان في العالم، يُستمع له بعناية ويُدرس بإيجابية. الهدف هو مزج خبرة الآباء مع حيوية الأبناء لمواكبة التسارع والتطور، وإطلاق فعاليات ودورات مفيدة مثل حفظ القرآن والحديث، ودورات علمية ومهنية، وتوفير تدريبات وفرص عمل تسهم في تطوير الذات وخدمة المجتمع." },
  { id: 9, title: "تنظيم اللقاءات والفعاليات الاجتماعية", content: "تنظيم لقاءات وفعاليات اجتماعية يجمع العائلة ويقوّي الروابط بين أفرادها؛ مثل اجتماعات دورية لرئيس وأعضاء الديوان المنتخب، واحتفاليات واجتماع عائلي سنوي يجمع أكبر عدد ممكن من أفراد العائلة، والمشاركة باسم العائلة في المناسبات المهمة خارجياً." },
];

export default function FamilyArchive({ isAdmin }) {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedType, setSelectedType] = useState("photos");

  const handleSubmit = (e) => {
    e.preventDefault();
    setUploadStatus("سيتم حفظ هذا المحتوى في أرشيف العائلة عند تفعيل ميزة الرفع.");
    setTimeout(() => setUploadStatus(null), 4000);
  };

  return (
    <div className="animate-fade-in-up space-y-5">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3" style={{ background: "var(--primary)", boxShadow: "0 4px 20px rgba(16,185,129,0.25)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
        </div>
        <h2 className="text-2xl font-black mb-1" style={{ color: "var(--text-primary)" }}>تراث آل أبوعلي البيطار</h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>صور شخصيات · مستندات قديمة · رسائل · قصص وروايات تعبر عن تاريخ العائلة</p>
      </div>

      {/* Official record */}
      <div className="card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3" style={{ direction: "rtl", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <div>
            <div className="text-sm font-bold mb-0.5" style={{ color: "var(--primary)" }}>السجل الورقي لعائلة آل أبوعلي البيطار</div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>الاعتماد على ملف السجل: <strong style={{ color: "var(--text-primary)" }}>FAMILY-TREE/6سجل آل أبوعلي البيطار (1) (1).xls</strong> كمصدر أساسي.</p>
          </div>
        </div>
        <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>يحتفظ الديوان بالنسخة الأصلية.</div>
      </div>

      {/* Admin upload */}
      {isAdmin && (
        <div className="card p-6 space-y-4" style={{ border: "1px solid rgba(197,160,89,0.15)" }}>
          <div style={{ direction: "rtl" }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>للأدمن فقط</div>
            <h3 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>إدارة أرشيف العائلة</h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>اختر نوع المحتوى ثم ارفع صورًا أو مستندات أو قصصًا خاصة بالعائلة.</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            {SECTIONS.map(s => (
              <button key={s.key} type="button" onClick={() => setSelectedType(s.key)}
                className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all"
                style={selectedType === s.key
                  ? { background: "var(--accent-dim)", border: "1px solid rgba(197,160,89,0.25)", color: "var(--accent)" }
                  : { background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                {s.title}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3" style={{ direction: "rtl" }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>نوع المحتوى</label>
                <select className="input-field" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                  <option value="photos">صور شخصيات</option><option value="documents">مستندات قديمة</option><option value="letters">رسائل قديمة</option><option value="stories">قصص وروايات قديمة</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>ملف (صورة / PDF / مستند)</label>
                <input type="file" className="input-field" accept="image/*,.pdf,.doc,.docx" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>وصف قصير للمحتوى</label>
              <textarea rows={3} className="input-field" placeholder="مثال: صورة للجد فلان مع العائلة في سنة 1980..." />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary text-sm px-5">حفظ في أرشيف العائلة (قريباً)</button>
            </div>
            {uploadStatus && <div className="mt-2 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--primary)" }}>{uploadStatus}</div>}
          </form>
        </div>
      )}

      {/* Stories */}
      <div className="card p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between mb-2" style={{ direction: "rtl" }}>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>الحكاية كلها</div>
            <h3 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>مقتطفات من عرض شجرة آل أبوعلي البيطار</h3>
          </div>
        </div>

        <div className="space-y-3">
          {STORY_SECTIONS.map(item => (
            <div key={item.id} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
              <div className="flex items-start gap-3" style={{ direction: "rtl" }}>
                <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>{item.id}</div>
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>{item.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 text-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>إن كان لديكم صور أو مستندات أو قصص تودون مشاركتها في أرشيف العائلة، تواصلوا مع الإدارة.</p>
      </div>
    </div>
  );
}
