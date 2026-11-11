import React, { useState } from 'react';
import { Eye, CheckCircle2, Clock, AlertCircle, Receipt, X } from 'lucide-react';

export const FinancialTransactionsTable = ({ trips = [], loading = false }) => {
  const [selectedTx, setSelectedTx] = useState(null);

  const transactions = trips.map((t) => {
    const isCompleted = t.status === 'completed';
    const isCancelled = t.status === 'cancelled';

    const cleanNum = String(t.trip_number || t.id || '').replace(/^[A-Za-z-]+/, '');
    return {
      id: `#رحلة-${cleanNum}`,
      partyName: t.passenger?.name || 'عميل راحة',
      driverName: t.driver?.name || 'بانتظار سائق',
      initials: (t.passenger?.name || 'ع')[0],
      type:
        t.payment_method === 'cash'
          ? 'دفع نقدي (كاش)'
          : t.payment_method === 'card'
          ? 'تحويل بنكي / بطاقة'
          : 'دفع محفظة جيب',
      dateTime: new Date(t.created_at).toLocaleString('ar-YE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      route: `${t.pickup_name} ← ${t.dropoff_name}`,
      amount: `${Number(t.fare || 0).toLocaleString()} ر.ي`,
      status: isCompleted ? 'ناجحة' : isCancelled ? 'ملغاة' : 'معلقة',
    };
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ناجحة':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-cairo font-bold bg-rahaa-emerald-bg text-rahaa-emerald">
            <CheckCircle2 className="w-3.5 h-3.5" />
            مكتملة
          </span>
        );
      case 'معلقة':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-cairo font-bold bg-rahaa-orange-light text-rahaa-orange">
            <Clock className="w-3.5 h-3.5" />
            جارية
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-cairo font-bold bg-rahaa-rose-bg text-rahaa-rose">
            <AlertCircle className="w-3.5 h-3.5" />
            ملغاة
          </span>
        );
    }
  };

  return (
    <div className="bg-rahaa-card rounded-2xl border border-rahaa-border shadow-rahaa-card overflow-hidden">
      {/* Table Header */}
      <div className="p-5 border-b border-rahaa-border flex items-center justify-between">
        <h3 className="font-cairo font-bold text-base text-rahaa-navy">
          سجل العمليات والمعاملات المالية
        </h3>
        <span className="text-xs font-tajawal text-rahaa-text-muted">
          إجمالي العمليات المعروضة: {transactions.length}
        </span>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-rahaa-blue-soft text-rahaa-text-muted font-cairo text-xs font-bold border-b border-rahaa-border">
              <th className="py-3.5 px-4 text-right">المرجع</th>
              <th className="py-3.5 px-4 text-right">العميل / السائق</th>
              <th className="py-3.5 px-4 text-right">المسار</th>
              <th className="py-3.5 px-4 text-right">طريقة الدفع</th>
              <th className="py-3.5 px-4 text-right">التاريخ والوقت</th>
              <th className="py-3.5 px-4 text-right">المبلغ</th>
              <th className="py-3.5 px-4 text-center">الحالة</th>
              <th className="py-3.5 px-4 text-center">الإيصال</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rahaa-border/50">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs font-cairo text-rahaa-text-muted">
                  جاري تحميل المعاملات المالية...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs font-cairo text-rahaa-text-muted">
                  لا توجد معاملات مطابقة للفلاتر المحددة.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-rahaa-bg/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-xs text-rahaa-navy whitespace-nowrap">
                    {tx.id}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rahaa-blue-avatar flex items-center justify-center font-cairo font-bold text-xs text-rahaa-blue shrink-0">
                        {tx.initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-cairo text-xs text-rahaa-navy font-bold">
                          {tx.partyName}
                        </span>
                        <span className="font-tajawal text-[11px] text-rahaa-text-muted">
                          الكابتن: {tx.driverName}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-tajawal text-xs text-rahaa-navy whitespace-nowrap">
                    {tx.route}
                  </td>

                  <td className="py-3.5 px-4 font-cairo text-xs text-rahaa-navy font-semibold whitespace-nowrap">
                    {tx.type}
                  </td>

                  <td className="py-3.5 px-4 font-tajawal text-xs text-rahaa-text-muted whitespace-nowrap">
                    {tx.dateTime}
                  </td>

                  <td className="py-3.5 px-4 font-cairo font-bold text-xs text-rahaa-blue whitespace-nowrap">
                    {tx.amount}
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {getStatusBadge(tx.status)}
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedTx(tx)}
                      title="عرض الإيصال"
                      className="p-1.5 rounded-lg text-rahaa-blue hover:bg-rahaa-blue-light transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-rahaa-navy/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-right space-y-4 border border-rahaa-border shadow-2xl">
            <div className="flex items-center justify-between border-b border-rahaa-border pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rahaa-blue" />
                <h3 className="font-cairo font-bold text-base text-rahaa-navy">
                  إيصال العملية المالية ({selectedTx.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="text-rahaa-text-subtle hover:text-rahaa-navy"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-tajawal text-xs">
              <div className="flex justify-between py-1.5 border-b border-rahaa-border/50">
                <span className="text-rahaa-text-muted">الراكب:</span>
                <span className="font-bold text-rahaa-navy">{selectedTx.partyName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-rahaa-border/50">
                <span className="text-rahaa-text-muted">السائق:</span>
                <span className="font-bold text-rahaa-navy">{selectedTx.driverName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-rahaa-border/50">
                <span className="text-rahaa-text-muted">المسار:</span>
                <span className="font-bold text-rahaa-navy">{selectedTx.route}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-rahaa-border/50">
                <span className="text-rahaa-text-muted">طريقة الدفع:</span>
                <span className="font-bold text-rahaa-navy">{selectedTx.type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-rahaa-border/50">
                <span className="text-rahaa-text-muted">المبلغ الإجمالي:</span>
                <span className="font-cairo font-bold text-sm text-rahaa-blue">{selectedTx.amount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-rahaa-text-muted">الحالة:</span>
                <div>{getStatusBadge(selectedTx.status)}</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="h-10 bg-rahaa-blue text-white px-5 rounded-xl font-cairo font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
