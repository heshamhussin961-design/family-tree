import React, { useState } from "react";

const SECTIONS = [
  {
    key: "photos",
    icon: "📷",
    title: "صور شخصيات",
    description: "صور تعبر عن شخصيات وأحداث من تاريخ العائلة",
    color: "#4db878",
    bg: "rgba(45,122,79,0.12)",
  },
  {
    key: "documents",
    icon: "📜",
    title: "مستندات قديمة",
    description: "وثائق ومستندات تروي تاريخ آل أبوعلي البيطار",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.10)",
  },
  {
    key: "letters",
    icon: "✉️",
    title: "رسائل قديمة",
    description: "رسائل ومراسلات تحكي قصص الأجداد والأهل",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.10)",
  },
  {
    key: "stories",
    icon: "📖",
    title: "قصص وروايات قديمة",
    description: "حكايات وروايات تعبر عن تراث وتاريخ العائلة",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.10)",
  },
];

// مقتطفات من عرض "شجرة عائلة أبوعلي البيطار - عرض ومقترحات"
// أول 9 صفحات — الحكاية كلها
const STORY_SECTIONS = [
  {
    id: 1,
    title: "تعريف شجرة العائلة",
    content:
      "شجرة العائلة ليست مجرد أسماء وتواريخ؛ بل مشروع له فوائد نفسية واجتماعية وثقافية وعملية. " +
      "تعزز الهوية والانتماء، وتقوي الثقة بالنفس عبر معرفة قصص نجاح وصمود الأجداد، " +
      "وتساعدنا على فهم الأنماط العائلية التي انتقلت بين الأجيال في المهن والهجرة والصفات والتحديات.",
  },
  {
    id: 2,
    title: "فوائد تسجيل الأفراد في الشجرة",
    content:
      "التسجيل في الشجرة يظهر تاريخ العائلة ويعرّف كل فرد بجذوره الأصيلة، " +
      "ويساعد على التعرف على أبناء العم في شتى أنحاء العالم، " +
      "ويجمع العائلة تحت مظلّة واحدة لتسهيل التواصل وتقديم الخدمات للمشتركين، " +
      "والاستفادة من الفزعات والمساعدات الطارئة والمقترحات الجديدة والفعاليات الاجتماعية.",
  },
  {
    id: 3,
    title: "إظهار تاريخ العائلة ومعرفة الجذور الأصيلة",
    content:
      "اجتهد الأجداد والآباء والأعمام الأوائل في وضع حجر الأساس لشجرة آل أبوعلي البيطار، " +
      "وتركونا أمام مسؤولية إكمال المسيرة ووضع اللبنات في مكانها الصحيح. " +
      "الهدف هو بناء محترم للعائلة يتناسب مع تكنولوجيا العصر وزمن الذكاء الاصطناعي، " +
      "ويحفظ الإرث العظيم الذي تركه من سبقونا مثل العم الفاضل خليل نمر أبوعلي رحمه الله.",
  },
  {
    id: 4,
    title: "التعرف على أبناء العم في شتى أنحاء العالم",
    content:
      "بسبب الانشغال في طلب الرزق والسفر لدول متعددة، قلت الزيارات وصار اللقاء بين أفراد العائلة الكبيرة أمراً صعباً. " +
      "لذلك أصبحت التكنولوجيا ووسائل التواصل الاجتماعي وسيلة مهمة لمتابعة الأهل والأقارب وسماع أخبارهم، " +
      "ومعرفة أماكن تواجدهم وأحوالهم، ليبقى التواصل وصلة الرحم حاضرة رغم بُعد المسافات.",
  },
  {
    id: 5,
    title: "الاستفادة من جمع أفراد العائلة تحت مظلّة واحدة",
    content:
      "جمع أفراد العائلة تحت مظلة واحدة يحقق فوائد عملية عديدة؛ " +
      "مثل سهولة التصويت في أي انتخابات داخلية أو خارجية بشكل مدروس، " +
      "والحصول على خصومات وخدمات صحية أفضل، " +
      "وتيسير التعامل مع الحالات الإنسانية الطارئة كالحاجة إلى متبرعين بالدم عبر معلومات موثّقة ومحدّثة.",
  },
  {
    id: 6,
    title: "سهولة الوصول إلى المشتركين ووسائل التواصل",
    content:
      "توفر الشجرة وسيلة سريعة لإرسال الرسائل الإلكترونية والتنبيهات عبر الهاتف أو الواتس أب أو البريد الإلكتروني، " +
      "وتسهّل دفع الاشتراكات مباشرة إلى حساب الديوان البنكي بدون الحاجة إلى تحصيل يدوي. " +
      "هذا يوفّر الوقت والجهد والتكاليف، ويجعل إدارة شؤون العائلة أكثر تنظيمًا وفعالية.",
  },
  {
    id: 7,
    title: "الفزعات والمساعدات الطارئة أو الفورية",
    content:
      "وجود قاعدة بيانات منظّمة لأبناء العائلة يساعد على تقديم الخدمات للمشتركين بالشكل اللائق، " +
      "ويُسهّل التواصل مع اللجنة المسؤولة عن المساعدات في الديوان أو مع أصحاب الأيادي البيضاء مباشرة، " +
      "بحيث تصل الفزعة في الوقت المناسب لمن يحتاجها.",
  },
  {
    id: 8,
    title: "الاستفادة من المقترحات الجديدة لأبناء العائلة",
    content:
      "كل مقترح يقدّمه أبناء العائلة، من أي مكان في العالم، يُستمع له بعناية ويُدرس بإيجابية. " +
      "الهدف هو مزج خبرة الآباء مع حيوية الأبناء لمواكبة التسارع والتطور، " +
      "وإطلاق فعاليات ودورات مفيدة مثل حفظ القرآن والحديث، ودورات علمية ومهنية، " +
      "وتوفير تدريبات وفرص عمل تسهم في تطوير الذات وخدمة المجتمع.",
  },
  {
    id: 9,
    title: "تنظيم اللقاءات والفعاليات الاجتماعية",
    content:
      "تنظيم لقاءات وفعاليات اجتماعية يجمع العائلة ويقوّي الروابط بين أفرادها؛ " +
      "مثل اجتماعات دورية لرئيس وأعضاء الديوان المنتخب، " +
      "واحتفاليات واجتماع عائلي سنوي يجمع أكبر عدد ممكن من أفراد العائلة، " +
      "والمشاركة باسم العائلة في المناسبات المهمة خارجياً.",
  },
];

export default function FamilyArchive({ isAdmin }) {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedType, setSelectedType] = useState("photos");

  const handleSubmit = (e) => {
    e.preventDefault();
    // حالياً واجهة فقط بدون ربط نهائي بالباك إند
    setUploadStatus("سيتم حفظ هذا المحتوى في أرشيف العائلة عند تفعيل ميزة الرفع.");
    setTimeout(() => setUploadStatus(null), 4000);
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 animate-glow-pulse"
          style={{ background: "linear-gradient(135deg,#2d7a4f,#1a5c36)", color: "#fff" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /><path d="M8 7h6" /><path d="M8 11h8" />
          </svg>
        </div>
        <h2 className="text-2xl font-black mb-1" style={{ color: "#e8f5ec" }}>
          تراث آل أبوعلي البيطار
        </h2>
        <p className="text-sm" style={{ color: "rgba(232,240,235,0.5)" }}>
          صور شخصيات · مستندات قديمة · رسائل · قصص وروايات تعبر عن تاريخ العائلة
        </p>
      </div>

      {/* السجل الورقي الرسمي */}
      <div
        className="rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{
          background: "rgba(10,26,16,0.9)",
          border: "1px solid rgba(77,184,120,0.4)",
        }}
      >
        <div className="flex items-start gap-3" style={{ direction: "rtl" }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "rgba(77,184,120,0.18)" }}
          >
            📗
          </div>
          <div>
            <div className="text-sm font-bold mb-0.5" style={{ color: "#4db878" }}>
              السجل الورقي لعائلة آل أبوعلي البيطار
            </div>
            <p className="text-xs" style={{ color: "rgba(232,240,235,0.7)" }}>
              الاعتماد على ملف السجل:
              {" "}
              <strong>FAMILY-TREE/6سجل آل أبوعلي البيطار (1) (1).xls</strong>
              {" "}
              كمصدر أساسي في إدخال بيانات الشجرة الرقمية.
            </p>
          </div>
        </div>
        <div className="text-[11px] md:text-xs" style={{ color: "rgba(232,240,235,0.45)" }}>
          يحتفظ الديوان بالنسخة الأصلية، وهذه النسخة الرقمية مبنية عليها.
        </div>
      </div>

      {/* لوحة رفع محتوى الأرشيف — تظهر للأدمن فقط */}
      {isAdmin && (
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div className="flex items-center justify-between gap-3" style={{ direction: "rtl" }}>
            <div>
              <div
                className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: "#f59e0b" }}
              >
                للأدمن فقط
              </div>
              <h3 className="text-lg font-black" style={{ color: "#e8f5ec" }}>
                إدارة أرشيف العائلة
              </h3>
              <p className="text-xs mt-1" style={{ color: "rgba(232,240,235,0.55)" }}>
                اختر نوع المحتوى ثم ارفع صورًا أو مستندات أو قصصًا خاصة بالعائلة.
              </p>
            </div>
            <div
              className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl"
              style={{ background: "rgba(245,158,11,0.12)" }}
            >
              <span className="text-xl">🛠️</span>
            </div>
          </div>

          {/* الأيقونات الأربعة */}
          <div className="grid gap-3 sm:grid-cols-4">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSelectedType(s.key)}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs font-semibold transition-all"
                style={{
                  background:
                    selectedType === s.key ? s.bg : "rgba(255,255,255,0.03)",
                  border:
                    selectedType === s.key
                      ? `1px solid ${s.color}66`
                      : "1px solid rgba(255,255,255,0.06)",
                  color:
                    selectedType === s.key
                      ? s.color
                      : "rgba(232,240,235,0.7)",
                }}
              >
                <span
                  className="text-2xl"
                  style={{
                    filter:
                      selectedType === s.key ? "none" : "grayscale(0.2)",
                  }}
                >
                  {s.icon}
                </span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>

          {/* فورم الرفع */}
          <form onSubmit={handleSubmit} className="space-y-3" style={{ direction: "rtl" }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "rgba(232,240,235,0.55)" }}
                >
                  نوع المحتوى
                </label>
                <select
                  className="input-field"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="photos">صور شخصيات</option>
                  <option value="documents">مستندات قديمة</option>
                  <option value="letters">رسائل قديمة</option>
                  <option value="stories">قصص وروايات قديمة</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "rgba(232,240,235,0.55)" }}
                >
                  ملف (صورة / PDF / مستند)
                </label>
                <input
                  type="file"
                  className="input-field"
                  accept="image/*,.pdf,.doc,.docx"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "rgba(232,240,235,0.55)" }}
              >
                وصف قصير للمحتوى
              </label>
              <textarea
                rows={3}
                className="input-field"
                placeholder="مثال: صورة للجد فلان مع العائلة في سنة 1980، أمام بيت العائلة القديم..."
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary text-sm px-5">
                حفظ في أرشيف العائلة (قريباً)
              </button>
            </div>

            {uploadStatus && (
              <div
                className="mt-2 px-3 py-2 rounded-xl text-xs"
                style={{
                  background: "rgba(37,99,235,0.12)",
                  border: "1px solid rgba(37,99,235,0.35)",
                  color: "#bfdbfe",
                }}
              >
                {uploadStatus}
              </div>
            )}
          </form>
        </div>
      )}

      {/* الحكاية كلها — من 9 صفحات العرض */}
      <div
        className="rounded-2xl p-6 md:p-7 space-y-5"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center justify-between gap-3 mb-2" style={{ direction: "rtl" }}>
          <div>
            <div
              className="text-xs font-bold uppercase tracking-widest mb-1"
              style={{ color: "#4db878" }}
            >
              الحكاية كلها
            </div>
            <h3 className="text-lg font-black" style={{ color: "#e8f5ec" }}>
              مقتطفات من عرض شجرة آل أبوعلي البيطار
            </h3>
          </div>
          <div
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: "rgba(45,122,79,0.16)" }}
          >
            <span>🌿</span>
          </div>
        </div>

        <div className="space-y-4">
          {STORY_SECTIONS.map((item) => (
            <div
              key={item.id}
              className="relative rounded-2xl p-4 md:p-5"
              style={{
                background: "rgba(0,0,0,0.18)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-start gap-3" style={{ direction: "rtl" }}>
                <div
                  className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "rgba(45,122,79,0.16)",
                    color: "#4db878",
                  }}
                >
                  {item.id}
                </div>
                <div className="space-y-1">
                  <h4
                    className="text-sm md:text-base font-bold"
                    style={{ color: "#e8f5ec" }}
                  >
                    {item.title}
                  </h4>
                  <p
                    className="text-xs md:text-sm leading-relaxed"
                    style={{ color: "rgba(232,240,235,0.7)" }}
                  >
                    {item.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-5 text-center"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
        <p className="text-sm" style={{ color: "rgba(232,240,235,0.45)" }}>
          إن كان لديكم صور أو مستندات أو قصص تودون مشاركتها في أرشيف العائلة، تواصلوا مع الإدارة.
        </p>
      </div>
    </div>
  );
}
