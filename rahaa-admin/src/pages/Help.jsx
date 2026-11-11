import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { HelpCircle, Phone, MessageSquare, Mail, FileText, ChevronRight, Compass } from 'lucide-react';

export const Help = () => {
  const faqs = [
    {
      q: 'كيف يتم احتساب تسعيرة الرحلات في أمانة العاصمة صنعاء؟',
      a: 'يتم احتساب التسعيرة وفق خوارزمية ذكية تعتمد على المسافة المقطوعة والوقت المقدر ونوع المركبة (توفير، بلس، فاخرة)، مع مراعاة الحالة المرورية ونطاقات الخدمة في صنعاء.',
    },
    {
      q: 'كيف يمكن للسائق سحب أرباحه من محفظة جيب؟',
      a: 'يمكن للكابتن سحب رصيده في أي وقت عبر التحويل المباشر لحساب بنك الكريمي، ون كاش، أو استلام حوالة عبر النجم، وتتم معالجة الطلبات خلال ٣٠ دقيقة.',
    },
    {
      q: 'ما هي معايير قبول السائقين والمركبات؟',
      a: 'يشترط وجود رخصة قيادة سارية، ملكية سيارة حديثة ونظيفة، فحص فني ساري، وسجل قيادة سليم لضمان أعلى مستويات الأمان للركاب.',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12" dir="rtl">
      <div className="bg-rahaa-card rounded-2xl p-6 border border-rahaa-border shadow-rahaa-card">
        <PageHeader
          title="مركز الدعم والمساعدة"
          subtitle="دليل الاستخدام، الأسئلة الشائعة، وقنوات التواصل المباشر مع غرفة عمليات راحة"
        />
      </div>

      {/* Support Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 text-right">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div className="text-right">
            <div className="font-cairo font-bold text-sm text-rahaa-navy">خدمة العملاء (صنعاء)</div>
            <div className="text-xs text-gray-500 font-tajawal text-right">٠١٤٥٠٠٠٠ - ٩٦٧+</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 text-right">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-rahaa-blue flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="text-right">
            <div className="font-cairo font-bold text-sm text-rahaa-navy">الدعم الفني عبر واتساب</div>
            <div className="text-xs text-gray-500 font-tajawal text-right">٧٧٠٠٠٠١١١ - ٩٦٧+</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 text-right">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div className="text-right">
            <div className="font-cairo font-bold text-sm text-rahaa-navy">البريد والمراسلات للعمليات</div>
            <div className="text-xs text-gray-500 font-tajawal text-right">قسم الدعم الفني - منصة راحة صنعاء</div>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-cairo font-bold text-base text-rahaa-navy pb-2 border-b border-gray-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-rahaa-blue" />
          <span>الأسئلة الأكثر شيوعاً</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
              <h3 className="font-cairo font-bold text-sm text-rahaa-navy">{faq.q}</h3>
              <p className="font-tajawal text-xs text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;
