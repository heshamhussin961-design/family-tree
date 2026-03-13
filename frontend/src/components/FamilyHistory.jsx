import React, { useEffect, useState } from 'react';
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
  Mail,
  Users2
} from 'lucide-react';

export default function FamilyHistory({ apiBase }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${apiBase}/stats`);
        if (r.ok) {
          const data = await r.json();
          setStats(data);
        }
      } catch (e) {
        console.error('Failed to fetch stats', e);
      }
    })();
  }, [apiBase]);

  const introPoints = [
    'إظهار تاريخ العائلة ومعرفة الجذور الأصيلة لكل فرد فيها',
    'التعرف على أبناء العم في شتى أنحاء العالم',
    'الاستفادة من جمع أفراد العائلة تحت مظلية واحدة',
    'سهولة الوصول إلى المشتركين عن طريق الهاتف المسجل ووسائل التواصل الاجتماعي',
    'تقديم الخدمات للمشتركين بالشكل المناسب',
    'الفزعات والمساعدات الطارئة أو الفورية',
    'الاستفادة من المقترحات الجديدة التي ممكن أن يتقدّم بها أبناء العائلة من أي نقطة في العالم',
    'تنظيم لقاءات وفعاليات اجتماعية تجمع العائلة من خلال المراسلات الإلكترونية',
    'مخرجات جديدة'
  ];

  const umbrellaPoints = [
    { 
      t: 'سهولة التصويت', 
      d: 'سهولة التصويت في أي انتخابات داخلية كانت أو خارجية. (بشكل مدروس).',
      icon: CheckCircle2,
      color: 'text-green-400'
    },
    { 
      t: 'بطاقات وخدمات', 
      d: 'الحصول على بطاقات خصومات أو خدمات أو خدمات صحية، بشكل أفضل وأسعار أفضل.',
      icon: Banknote,
      color: 'text-blue-400'
    },
    { 
      t: 'الحالات الإنسانية', 
      d: 'إذا حصل أمراً طارئاً وتطلب متبرعين بالدم، يرسل السيستم رسالة لجميع من يحمل نفس فصيلة الدم (بشكل مدروس).',
      icon: Heart,
      color: 'text-red-400'
    }
  ];

  const accessPoints = [
    { t: 'إرسال الرسائل الإلكترونية عن طريق الهاتف أو الواتس أب أو البريد الإلكتروني للتذكير.', icon: Mail },
    { t: 'دفع مبلغ الاشتراك مباشرة إلى الحساب البنكي للديوان دون الحاجة لمحصلين.', icon: Banknote },
    { t: 'توفير الوقت والمال المستخدم في استخدام وسائل النقل.', icon: Car }
  ];

  const socialPoints = [
    'اجتماعات دورية لرئيس وأعضاء الديوان المنتخب من قبل العائلة الكريمة',
    'تنظيم اجتماع عائلي سنوي، يجمع أكبر نسبة من العائلة (حتى ولو لمرة واحدة)',
    'المناسبات المهمة التي ممكن أن تشارك بها العائلة خارجياً',
    'الاستفادة من مقترحات الجديدة التي ممكن أن يتقدم بها أبناء العائلة من أي نقطة في العالم'
  ];

  return (
    <div className='max-w-6xl mx-auto px-6 py-12 space-y-24 text-right' dir='rtl'>
      <section className='space-y-12'>
        <div className='space-y-4'>
          <h3 className='text-4xl font-black text-white mb-8 border-r-4 border-primary pr-6'>
            الفائدة من التسجيل والدخول في شجرة العائلة
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.02] p-8 rounded-3xl border border-white/5'>
            {introPoints.map((text, i) => (
              <div key={i} className='flex items-center gap-4 text-gray-300 font-bold group'>
                <div className='w-2 h-2 rounded-full bg-accent group-hover:scale-150 transition-transform shrink-0' />
                <span className='text-lg leading-relaxed'>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='space-y-8 glass-card p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group'>
        <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-10 -mt-10 blur-2xl' />
        <div className='flex items-center gap-4 mb-6'>
          <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform'>
            <TreePine size={28} />
          </div>
          <h4 className='text-3xl font-black text-white'>إظهار تاريخ العائلة ومعرفة الجذور الأصيلة لكل فرد</h4>
        </div>
        <div className='space-y-6 text-gray-400 leading-[2] text-xl font-medium max-w-4xl'>
          <p>
            كل منا يرغب في إظهار هذه العائلة الكريمة بالشكل اللائق بها. فقد اجتهد الأجداد والآباء والأعمام الأولين (رحمهم الله) جميعاً في وضع حجر الأساس في هذا الموضوع، وتوجب علينا جميعا، أن نكمل المسيرة، ووضع اللبنات في مكانها الصحيح، من أجل الحصول على بناء محترم للعائلة، يتناسب مع تكنولوجيا هذا العصر في زمن الـ AI.
          </p>
          <div className='p-6 bg-white/[0.03] rounded-2xl border-r-4 border-accent italic'>
            "ترك لنا الأجداد والأعمام، أعرف منهم العم الفاضل/ خليل نمر أبوعلي (رحمه الله)، إرثاً عظيماً، بقي للعام 2000م دون متابعة إلى تاريخنا هذا."
          </div>
        </div>
      </section>

      <section className='space-y-8 glass-card p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group'>
        <div className='absolute top-0 left-0 w-32 h-32 bg-accent/5 rounded-br-[5rem] -ml-10 -mt-10 blur-2xl' />
        <div className='flex items-center gap-4 mb-6'>
          <div className='w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:-rotate-12 transition-transform'>
            <Globe size={28} />
          </div>
          <h4 className='text-3xl font-black text-white'>التعرف على أبناء العم في شتى أنحاء العالم</h4>
        </div>
        <div className='space-y-6 text-gray-400 leading-[2] text-xl font-medium max-w-4xl'>
          <p>
            بسبب انشغال العديد منا في لقمة العيش، والسعي لذلك عبر السفر إلى بلدان ودول شتى في أنحاء المعمورة، أصبحت الزيارات أقل والتلاقي ليس بالأمر السهل والهيّن، على مستوى العائلة الكبيرة، وحتى أحياناً على مستوى العائلة الصغيرة.
          </p>
          <p>
            كما أصبح الكثير منا في هذا زمن لا يجد الوقت الكافي لزيارة أخاه أو أخته أو حتى ابنته وولده، فما بالك في أبناء العم والعمة، والخال والخالة، وهذا كله من صلة الرحم.
          </p>
          <p>
            لذلك، أصبحت متابعة الأهل والأقارب والأسرة الكبيرة على الأقل، عن طريق التكنولوجيا ووسائل التواصل الاجتماعي (الفيسبوك، الواتس أب، الرسائل الإلكترونية) ممكنة، وأسهل بكثير.
          </p>
          <div className='p-8 bg-gradient-to-l from-primary/10 to-transparent rounded-2xl border-r-4 border-primary mt-6'>
            <p className='text-white font-bold italic'>
              "من منا، يحب أن يسمع على الأقل أخبار أبناء العم الآخرين، أماكن تواجدهم، أحوالهم، ويرغب في أن يكون في هذا التجمع، هو من سيسجل معنا في هذه الشجرة، التي أسأل الله العظيم أن تكون شجرة طيبة مثمرة، أصلها ثابت وفرعها في السماء."
            </p>
          </div>
        </div>
      </section>

      <section className='space-y-8'>
        <div className='flex items-center gap-4 mb-10'>
          <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary'>
            <Layers size={28} />
          </div>
          <h4 className='text-3xl font-black text-white'>الاستفادة من جمع أفراد العائلة تحت مظلية واحدة</h4>
        </div>
        <p className='text-gray-300 font-bold text-2xl mb-8 pr-6 border-r-4 border-accent/50'>
          هناك العديد من الفوائد التي ممكن أن تتحقق من خلال جمع أفراد العائلة الكبيرة تحت مظلية واحدة، منها:
        </p>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {umbrellaPoints.map((item, i) => (
            <div key={i} className='p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-4 hover:border-primary/40 transition-all hover:-translate-y-2'>
              <item.icon size={32} className={`${item.color} mb-2`} />
              <div className='text-2xl font-black text-white'>{item.t}</div>
              <p className='text-gray-400 leading-relaxed font-bold text-lg'>{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
        <div className='space-y-8 glass-card p-10 rounded-[2.5rem] border border-white/5'>
          <div className='flex items-center gap-4 mb-6'>
            <div className='w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent'>
              <Phone size={28} />
            </div>
            <h4 className='text-2xl font-black text-white leading-tight'>سهولة الوصول إلى المشتركين</h4>
          </div>
          <p className='text-gray-500 font-bold text-lg mb-6'>عن طريق الهاتف المسجل ووسائل التواصل الاجتماعي</p>
          <ul className='space-y-6'>
            {accessPoints.map((point, i) => (
              <li key={i} className='flex gap-4 group'>
                <point.icon className='text-accent shrink-0 mt-1' size={24} />
                <span className='text-xl text-gray-300 font-bold leading-relaxed'>{point.t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className='space-y-8 glass-card p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-primary/5 to-transparent'>
          <div className='flex items-center gap-4 mb-6'>
            <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary'>
              <ShieldCheck size={28} />
            </div>
            <h4 className='text-2xl font-black text-white leading-tight'>الفزعات والمساعدات الطارئة</h4>
          </div>
          <p className='text-gray-500 font-bold text-lg mb-6'>تقديم الخدمات للمشتركين بالشكل اللائق والمناسب</p>
          <div className='space-y-6 text-xl text-gray-300 font-bold leading-relaxed'>
            <p>
              التواصل مع المعنيين يتم بشكل مباشر مع اللجنة المسؤولة عن تقديم المساعدات في الديوان، ويكون عبر واتس أب خاص بها، أو عبر ترتيب اجتماع معها.
            </p>
            <p className='p-4 bg-white/5 rounded-xl border border-white/5'>
              أو يتم عن طريق الشخص المعني بشكل مباشر، هذا يرجع للمتبرعين (أصحاب الأيادي البيضاء).
            </p>
          </div>
        </div>
      </section>

      <section className='space-y-12'>
        <div className='flex items-center gap-4 mb-10'>
          <div className='w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent'>
            <Users2 size={28} />
          </div>
          <h4 className='text-3xl font-black text-white'>تنظيم لقاءات وفعاليات اجتماعية تجمع العائلة</h4>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {socialPoints.map((text, i) => (
            <div key={i} className='p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 group hover:bg-white/[0.05] transition-all'>
              <div className='w-3 h-3 rounded-full bg-primary' />
              <span className='text-xl text-gray-200 font-bold leading-relaxed'>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <div className='relative p-16 text-center rounded-[4rem] bg-gradient-to-br from-primary/10 via-white/[0.02] to-accent/5 border border-white/10 mt-12'>
        <div className='absolute top-0 right-0 p-10 text-8xl text-primary/10 font-serif select-none font-black leading-none'>“</div>
        <p className='relative text-2xl text-white max-w-3xl mx-auto leading-loose font-black italic'>
          "شجرة العائلة هي مشروعنا المشترك لحفظ الذاكرة، وتقوية الروابط، وبناء مستقبل محترم لأجيالنا القادمة يتناسب مع تكنولوجيا العصر."
        </p>
        <div className='absolute bottom-0 left-0 p-10 text-8xl text-accent/10 font-serif rotate-180 select-none font-black leading-none'>“</div>
      </div>
    </div>
  );
}
