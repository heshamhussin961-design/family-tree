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
  TreePine
} from "lucide-react";

const DEFINITION = {
  title: "تعريف شجرة العائلة",
  concept: "الفكرة من إنشائها:",
  intro: "شجرة العائلة ليست مجرد أسماء وتواريخ؛ بل لها فوائد عميقة على المستوى النفسي، الاجتماعي، الثقافي، وحتى العملي.",
  points: [
    { title: "أولاً: فوائد نفسية وشخصية", content: "مثل: تعزيز الهوية والانتماء، فعندما تعرف من أين أتيت، فإنك تشعر بثبات أكبر وفهم أعمق لذاتك. أيضاً، تقوية الثقة بالنفس ومعرفة قصص نجاح أو صمود أجدادك تعطيك إحساساً بالقوة والاستمرارية. كما توضح فهم الأنماط العائلية التي مارسها أجدادنا، والتي انتقلت إلينا، والتي سوف ننقلها نحن لأبنائنا مثل المهن، الهجرة، الصفات، أو حتى التحديات المتكررة." },
    { title: "ثانياً: فوائد اجتماعية وعائلية", content: "منها تقوية الروابط بين أفراد العائلة حيث أن الشجرة تصبح مشروعاً مشتركاً يجمع الأجيال. يحفظ الذاكرة العائلية، وقصص الأجداد حتى لا تضيع مع الزمن. وتعليم الأبناء احترام العائلة، فالطفل عندما يرى جذوره يفهم معنى العائلة الممتدة." },
    { title: "ثالثاً: فوائد ثقافية وتاريخية", content: "توثيق النسب والأصل مهم خصوصاً في المجتمعات العربية. أيضاً حفظ القصص المرتبطة بالأسماء والأماكن. ربط العائلة بتاريخ المكان، المدن والقرى، الهجرة، الأحداث المهمة." },
    { title: "رابعاً: فوائد تعليمية", content: "تنمية مهارات البحث والتوثيق، تعلم قراءة الوثائق القديمة، فهم التسلسل الزمني (التاريخ)." },
    { title: "خامساً: فوائد عملية وقانونية (أحياناً)", content: "إثبات صلة القرابة، قضايا الميراث، طلبات جنسية أو إقامة في بعض الدول. توثيق الأنساب رسمياً." },
    { title: "سادساً: فوائد عاطفية عميقة", content: "مثل إحياء ذكرى من رحلوا، والشعور بالامتنان لهم، وارتباطهم ببعضهم، وإحياء ذكراهم. وذلك من خلال سرد القصص المتعلقة بهم، والامتنان بهذا الامتداد عبر الزمن، والشعور بأننا جزء من قصة كبيرة، نحن الآن نمثل إحدى مراحلها." }
  ],
  footer: "هذه الشجرة سوف تبني لنا إرثاً معرفياً يستفيد منها الأبناء والأحفاد.",
  quote: "خلاصة جميلة: شجرة العائلة تقول: نحن لم نبدأ من الصفر، ولن ننتهي عندنا."
};

const BENEFITS = {
  title: "الفائدة من التسجيل والدخول في شجرة العائلة",
  list: [
    "إظهار تاريخ العائلة ومعرفة الجذور الأصيلة لكل فرد فيها",
    "التعرف على أبناء العم في شتى أنحاء العالم",
    "الاستفادة من جمع أفراد العائلة تحت مظلة واحدة",
    "سهولة الوصول إلى المشتركين عن طريق الهاتف المسجل ووسائل التواصل الاجتماعي",
    "تقديم الخدمات للمشتركين بالشكل المناسب",
    "الفزعات والمساعدات الطارئة أو الفورية",
    "الاستفادة من المقترحات الجديدة التي يتقدّم بها أبناء العائلة من أي نقطة في العالم",
    "تنظيم لقاءات وفعاليات اجتماعية تجمع العائلة من خلال المراسلات الإلكترونية",
    "مخرجات جديدة"
  ]
};

const STORIES = [
  {
    title: "إظهار تاريخ العائلة ومعرفة الجذور الأصيلة لكل فرد",
    content: [
      "كل منا يرغب في إظهار هذه العائلة الكريمة بالشكل اللائق بها. فقد اجتهد الأجداد والآباء والأعمام الأولين (رحمهم الله) جميعاً في وضع حجر الأساس في هذا الموضوع، وتوجب علينا جميعاً، أن نكمل المسيرة، ووضع اللبنات في مكانها الصحيح، من أجل الحصول على بناء محترم للعائلة، يتناسب مع تكنولوجيا هذا العصر في زمن الـ AI.",
      "ترك لنا الأجداد والأعمام، أعرف منهم العم الفاضل/ خليل نمر أبوعلي (رحمه الله)، إرثاً عظيماً، بقي للعام 2000م دون متابعة إلى تاريخنا هذا."
    ],
    icon: TreePine
  },
  {
    title: "التعرف على أبناء العم في شتى أنحاء العالم",
    content: [
      "بسبب انشغال العديد منا في لقمة العيش، والسعي لذلك عبر السفر إلى بلدان ودول شتى في أنحاء المعمورة، أصبحت الزيارات أقل والتلاقي ليس بالأمر السهل والهيّن، على مستوى العائلة الكبيرة، وحتى أحياناً على مستوى العائلة الصغيرة.",
      "كما أصبح الكثير منا في هذا الزمن لا يجد الوقت الكافي لزيارة أخاه أو أخته أو حتى ابنته وولده، فما بالك في أبناء العم والعمة، والخال والخالة، وهذا كله من صلة الرحم.",
      "لذلك، أصبحت متابعة الأهل والأقارب والأسرة الكبيرة على الأقل، عن طريق التكنولوجيا ووسائل التواصل الاجتماعي (الفيسبوك، الواتس أب، الرسائل الإلكترونية) ممكنة، وأسهل بكثير.",
      "من منا، يحب أن يسمع على الأقل أخبار أبناء العم الآخرين، أماكن تواجدهم، أحوالهم، ويرغب في أن يكون في هذا التجمع، هو من سيسجل معنا في هذه الشجرة، التي أسأل الله العظيم أن تكون شجرة طيبة مثمرة، أصلها ثابت وفرعها في السماء."
    ],
    icon: Globe
  }
];

const ACCESS_COMMUNICATION = {
  title: "سهولة الوصول إلى المشتركين",
  subtitle: "عن طريق الهاتف المسجل ووسائل التواصل الاجتماعي",
  points: [
    { text: "إرسال الرسائل الإلكترونية عن طريق الهاتف أو الواتس أب أو البريد الإلكتروني للتذكير.", icon: Phone },
    { text: "دفع مبلغ الاشتراك مباشرة إلى الحساب البنكي للديوان. (ليس هناك حاجة إلى إرسال شخص لتحصيل المبلغ، أو تحويل من حساب إلى حساب شخص آخر).", icon: Banknote },
    { text: "توفير الوقت والمال المستخدم في استخدام وسائل النقل. (السيارة الخاصة أو التاكسي).", icon: Car }
  ]
};

export default function FamilyHistory({ apiBase }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${apiBase}/stats`);
        if (r.ok) setStats(await r.json());
      } catch (e) { console.error(e); }
    })();
  }, [apiBase]);

  return (
    <div className="animate-fade-in-up space-y-12 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#1c1c22] to-[#0c0c0e] border border-white/5 p-8 md:p-12 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-accent mb-6 shadow-2xl shadow-accent/20">
          <History size={40} color="#fff" strokeWidth={1.5} />
        </div>
        <h2 className="relative font-black text-white mb-2 tracking-tight leading-tight">
          <span className="block mb-4 text-accent uppercase tracking-widest text-2xl font-bold">تراث عائلة</span>
          <span className="text-3xl">آل أبوعلي البيطار</span>
        </h2>
        <p className="relative text-sm text-gray-400 font-medium max-w-lg mx-auto leading-relaxed">
          نحن لا نوثق مجرد أسماء، بل نحفظ هوية وتاريخ وقصص أجدادنا لنورثها للأجيال القادمة
        </p>
      </div>

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
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">من الأجيال</div>
          </div>
          <div className="card p-8 bg-white/[0.01] border-white/5 flex flex-col items-center text-center group hover:bg-white/[0.03] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart size={24} />
            </div>
            <div className="text-4xl font-black text-white mb-1">{stats.living}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">على قيد الحياة</div>
          </div>
        </div>
      )}

      {/* Benefits Detailed Section */}
      <section className="space-y-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Lightbulb size={20} />
          </div>
          <h3 className="text-2xl font-black text-white">الفائدة من التسجيل والدخول في شجرة العائلة</h3>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Card 1 */}
          <div className="card p-8 bg-white/[0.01] border-white/5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <TreePine size={24} />
              </div>
              <h4 className="text-xl font-bold text-white">1. إظهار تاريخ العائلة ومعرفة الجذور الأصيلة لكل فرد</h4>
            </div>
            <p className="text-gray-400 leading-loose">
              كل منا يرغب في إظهار هذه العائلة الكريمة بالشكل اللائق بها. فقد اجتهد الأجداد والآباء والأعمام الأولين (رحمهم الله) جميعاً في وضع حجر الأساس في هذا الموضوع، وتوجب علينا جميعاً، أن نكمل المسيرة، ووضع اللبنات في مكانها الصحيح، من أجل الحصول على بناء محترم للعائلة، يتناسب مع تكنولوجيا هذا العصر في زمن الـ AI.
              <br /><br />
              ترك لنا الأجداد والأعمام، أعرف منهم العم الفاضل/ خليل نمر أبوعلي (رحمه الله)، إرثاً عظيماً، بقي للعام 2000م دون متابعة إلى تاريخنا هذا.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card p-8 bg-white/[0.01] border-white/5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Globe size={24} />
              </div>
              <h4 className="text-xl font-bold text-white">2. التعرف على أبناء العم في شتى أنحاء العالم</h4>
            </div>
            <div className="text-gray-400 space-y-4 leading-loose">
              <p>بسبب انشغال العديد منا في لقمة العيش، والسعي لذلك عبر السفر إلى بلدان ودول شتى في أنحاء المعمورة، أصبحت الزيارات أقل والتلاقي ليس بالأمر السهل والهيّن، على مستوى العائلة الكبيرة، وحتى أحياناً على مستوى العائلة الصغيرة.</p>
              <p>كما أصبح الكثير منا في هذا زمن لا يجد الوقت الكافي لزيارة أخاه أو أخته أو حتى ابنته وولده، فما بالك في أبناء العم والعمة، والخال والخالة، وهذا كله من صلة الرحم.</p>
              <p>لذلك، أصبحت متابعة الأهل والأقارب والأسرة الكبيرة على الأقل، عن طريق التكنولوجيا ووسائل التواصل الاجتماعي (الفيسبوك، الواتس أب، الرسائل الإلكترونية) ممكنة، وأسهل بكثير.</p>
              <p>من منا، يحب أن يسمع على الأقل أخبار أبناء العم الآخرين، أماكن تواجدهم، أحوالهم، ويرغب في أن يكون في هذا التجمع، هو من سيسجل معنا في هذه الشجرة، التي أسأل الله العظيم أن تكون شجرة طيبة مثمرة، أصلها ثابت وفرعها في السماء.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card p-8 bg-white/[0.01] border-white/5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <h4 className="text-xl font-bold text-white">3. الاستفادة من جمع أفراد العائلة تحت مظلية واحدة</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { t: "سهولة التصويت", d: "في أي انتخابات داخلية كانت أو خارجية (بشكل مدروس)." },
                { t: "بطاقات خصومات", d: "الحصول على بطاقات خصومات أو خدمات صحية بشكل أفضل وأسعار أفضل." },
                { t: "الحالات الإنسانية", d: "في حال الطوارئ، يسهل الوصول للمتبرعين بالدم حسب الفصيلة المسجلة بالسيستم." }
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="text-primary font-bold text-sm">{item.t}</div>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4 */}
          <div className="card p-8 bg-white/[0.01] border-white/5 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone size={20} className="text-accent" />
                  <h4 className="font-bold text-white">سهولة الوصول والتواصل</h4>
                </div>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="flex gap-2"><span>•</span> إرسال رسائل تذكير عبر الواتس أب والبريد الإلكتروني.</li>
                  <li className="flex gap-2"><span>•</span> دفع مبالغ الاشتراك مباشرة للحساب البنكي للديوان.</li>
                  <li className="flex gap-2"><span>•</span> توفير الوقت والمال في التنقل والتحصيل اليدوي.</li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-primary" />
                  <h4 className="font-bold text-white">الفزعات والمساعدات</h4>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  تقديم الخدمات للمشتركين بالشكل اللائق، والتواصل المباشر مع اللجنة المسؤولة عن المساعدات عبر الواتس أب الخاص أو الاجتماعات المرتبة.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="card p-8 bg-white/[0.01] border-white/5 space-y-6">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                 <Cpu size={24} />
               </div>
               <h4 className="text-xl font-bold text-white">تنظيم لقاءات وفعاليات اجتماعية</h4>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                   <CheckCircle2 size={16} className="text-primary" />
                   <span className="text-sm text-gray-300">اجتماعات دورية لرئيس وأعضاء الديوان</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                   <CheckCircle2 size={16} className="text-primary" />
                   <span className="text-sm text-gray-300">تنظيم اجتماع عائلي سنوي يجمع الكل</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                   <CheckCircle2 size={16} className="text-primary" />
                   <span className="text-sm text-gray-300">مشاركة العائلة في المناسبات الخارجية</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                   <CheckCircle2 size={16} className="text-primary" />
                   <span className="text-sm text-gray-300">الاستفادة من مقترحات أبناء العائلة عالمياً</span>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <div className="relative p-12 text-center rounded-[3.5rem] bg-gradient-to-br from-accent/10 via-white/[0.02] to-transparent border border-white/5">
        <div className="absolute top-0 left-0 p-10 text-7xl text-white/5 font-serif select-none">“</div>
        <p className="relative text-base text-gray-300 max-w-2xl mx-auto leading-relaxed font-bold italic">
          "اجتهد الأجداد في وضع حجر الأساس... ونحن نكمل المسيرة بحفظ هذا الإرث رقمياً، متمسكين بجذورنا وماضين نحو مستقبل مشرق لأبنائنا."
        </p>
        <div className="absolute bottom-0 right-0 p-10 text-7xl text-white/5 font-serif rotate-180 select-none">“</div>
      </div>
    </div>
  );
}
