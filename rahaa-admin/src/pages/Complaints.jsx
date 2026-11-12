import React, { useEffect, useState } from 'react';
import {
  MessageSquareWarning,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';

const STATUS_META = {
  open: { label: 'مفتوحة', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  in_review: { label: 'قيد المراجعة', badge: 'bg-sky-100 text-sky-800 border-sky-200' },
  resolved: { label: 'تم الحل', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  dismissed: { label: 'مغلقة / مرفوضة', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const CATEGORY_LABELS = {
  trip: 'رحلة',
  driver: 'سائق',
  passenger: 'راكب',
  payment: 'الدفع والمالية',
  vehicle: 'مركبة',
  app: 'التطبيق',
  other: 'أخرى',
};

export const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [counts, setCounts] = useState({ all: 0, open: 0, in_review: 0, resolved: 0, dismissed: 0 });
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editStatus, setEditStatus] = useState('in_review');
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [saving, setSaving] = useState(false);

  const loadComplaints = async (targetPage = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminComplaints({
        status: statusFilter,
        category: categoryFilter,
        search: search.trim(),
        page: targetPage,
        per_page: 15,
      });
      const paginator = res.complaints || {};
      setComplaints(paginator.data || []);
      setPagination({
        current_page: paginator.current_page || 1,
        last_page: paginator.last_page || 1,
        total: paginator.total || 0,
      });
      if (res.counts) setCounts(res.counts);
    } catch (err) {
      setError(err.message || 'تعذر جلب الشكاوى والبلاغات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints(page);
  }, [statusFilter, categoryFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadComplaints(1);
  };

  const openReviewModal = (c) => {
    setSelectedComplaint(c);
    setEditStatus(c.status || 'in_review');
    setSupervisorNotes(c.supervisor_notes || '');
    setActionTaken(c.action_taken || '');
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setSaving(true);
    setActionMsg('');
    try {
      const res = await api.updateAdminComplaint(selectedComplaint.id, {
        status: editStatus,
        supervisor_notes: supervisorNotes,
        action_taken: actionTaken,
      });
      setActionMsg(res.message || 'تم تحديث الشكوى بنجاح');
      setSelectedComplaint(null);
      loadComplaints(page);
    } catch (err) {
      alert(err.message || 'فشل تحديث الشكوى');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-cairo font-bold text-rahaa-navy flex items-center gap-2.5">
            <MessageSquareWarning className="w-6 h-6 text-rahaa-orange" />
            <span>إدارة الشكاوى والبلاغات</span>
          </h1>
          <p className="text-xs font-tajawal text-rahaa-text-muted mt-1">
            مراجعة بلاغات الركاب والسائقين، ربطها بالرحلات، وتدوين ملاحظات المشرف والإجراءات المتخذة
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadComplaints(page)}
          className="h-10 px-4 rounded-xl bg-rahaa-card border border-rahaa-border text-xs font-cairo font-bold text-rahaa-navy hover:bg-rahaa-bg flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-rahaa-card rounded-2xl p-4 border border-rahaa-border shadow-2xs">
          <div className="text-xs font-tajawal text-rahaa-text-muted">إجمالي البلاغات</div>
          <div className="text-2xl font-cairo font-black text-rahaa-navy mt-1">{counts.all}</div>
        </div>
        <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200">
          <div className="text-xs font-tajawal text-amber-800">مفتوحة (بانتظار المراجعة)</div>
          <div className="text-2xl font-cairo font-black text-amber-900 mt-1">{counts.open}</div>
        </div>
        <div className="bg-sky-50/70 rounded-2xl p-4 border border-sky-200">
          <div className="text-xs font-tajawal text-sky-800">قيد المعالجة</div>
          <div className="text-2xl font-cairo font-black text-sky-900 mt-1">{counts.in_review}</div>
        </div>
        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200">
          <div className="text-xs font-tajawal text-emerald-800">تم حلها</div>
          <div className="text-2xl font-cairo font-black text-emerald-900 mt-1">{counts.resolved}</div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-cairo font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {actionMsg}
          </span>
          <button type="button" onClick={() => setActionMsg('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-cairo font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-rahaa-card rounded-2xl p-4 border border-rahaa-border flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'open', label: 'مفتوحة' },
            { id: 'in_review', label: 'قيد المراجعة' },
            { id: 'resolved', label: 'تم الحل' },
            { id: 'dismissed', label: 'مغلقة' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`h-9 px-3.5 rounded-xl text-xs font-cairo font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-rahaa-blue text-white shadow-xs'
                  : 'bg-rahaa-bg text-rahaa-text-muted hover:text-rahaa-navy'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-wrap sm:flex-nowrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal text-rahaa-navy"
          >
            <option value="all">جميع التصنيفات</option>
            {Object.entries(CATEGORY_LABELS).map(([k, lbl]) => (
              <option key={k} value={k}>
                {lbl}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-rahaa-text-subtle absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالعنوان أو اسم المبلغ..."
              className="w-full h-9 pr-9 pl-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal focus:outline-none focus:border-rahaa-blue"
            />
          </div>

          <button
            type="submit"
            className="h-9 px-4 rounded-xl bg-rahaa-navy text-white text-xs font-cairo font-bold hover:opacity-90"
          >
            بحث
          </button>
        </form>
      </div>

      {/* Complaints Table */}
      <div className="bg-rahaa-card rounded-2xl border border-rahaa-border shadow-rahaa-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-rahaa-bg border-b border-rahaa-border font-cairo font-bold text-rahaa-navy">
              <tr>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">العنوان والتفاصيل</th>
                <th className="py-3.5 px-4">صاحب الشكوى</th>
                <th className="py-3.5 px-4">التصنيف</th>
                <th className="py-3.5 px-4">الرحلة المرتبطة</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4">المشرف المعالج</th>
                <th className="py-3.5 px-4 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rahaa-border font-tajawal">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-rahaa-text-muted">
                    جاري تحميل الشكاوى والبلاغات...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-rahaa-text-subtle">
                    لا توجد شكاوى مطابقة للبحث أو الفلتر المحدد
                  </td>
                </tr>
              ) : (
                complaints.map((c) => {
                  const st = STATUS_META[c.status] || STATUS_META.open;
                  return (
                    <tr key={c.id} className="hover:bg-rahaa-bg/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-rahaa-navy">#{c.id}</td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-cairo font-bold text-rahaa-navy truncate">{c.subject}</div>
                        <div className="text-[11px] text-rahaa-text-muted truncate">{c.description}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-rahaa-navy">{c.user?.name || 'غير معروف'}</div>
                        <div className="text-[11px] text-rahaa-text-subtle">{c.user?.phone || ''}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-rahaa-bg border border-rahaa-border text-[11px] font-bold">
                          {CATEGORY_LABELS[c.category] || c.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {c.trip ? (
                          <span className="font-mono text-rahaa-blue font-bold">رحلة #{c.trip.id}</span>
                        ) : (
                          <span className="text-rahaa-text-subtle">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full border text-[11px] font-cairo font-bold ${st.badge}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-rahaa-text-muted">
                        {c.handler?.name || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => openReviewModal(c)}
                          className="h-8 px-3 rounded-lg bg-rahaa-blue-light text-rahaa-blue hover:bg-rahaa-blue hover:text-white font-cairo font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مراجعة ومعالجة</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="px-4 py-3 border-t border-rahaa-border flex items-center justify-between text-xs font-tajawal">
            <span className="text-rahaa-text-muted">
              صفحة {pagination.current_page} من {pagination.last_page} (إجمالي {pagination.total})
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.current_page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-rahaa-border disabled:opacity-40"
              >
                السابق
              </button>
              <button
                type="button"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-rahaa-border disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review & Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rahaa-navy/60 backdrop-blur-xs">
          <div className="bg-rahaa-card rounded-3xl w-full max-w-lg p-6 border border-rahaa-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rahaa-border">
              <h2 className="font-cairo font-bold text-base text-rahaa-navy">
                معالجة الشكوى #{selectedComplaint.id}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 rounded-lg hover:bg-rahaa-bg text-rahaa-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rahaa-bg border border-rahaa-border space-y-1.5 text-xs">
              <div className="font-cairo font-bold text-rahaa-navy">{selectedComplaint.subject}</div>
              <p className="font-tajawal text-rahaa-text-muted leading-relaxed">
                {selectedComplaint.description}
              </p>
              <div className="pt-1 text-[11px] text-rahaa-text-subtle flex flex-wrap gap-3">
                <span>المُبلّغ: <strong className="text-rahaa-navy">{selectedComplaint.user?.name}</strong></span>
                <span>الهاتف: <strong className="text-rahaa-navy">{selectedComplaint.user?.phone}</strong></span>
                {selectedComplaint.trip && (
                  <span>الرحلة: <strong className="text-rahaa-blue">#{selectedComplaint.trip.id}</strong></span>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-3.5">
              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                  حالة الشكوى
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal"
                >
                  <option value="open">مفتوحة</option>
                  <option value="in_review">قيد المراجعة</option>
                  <option value="resolved">تم الحل</option>
                  <option value="dismissed">مغلقة / مرفوضة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                  ملاحظات المشرف
                </label>
                <textarea
                  rows={2}
                  value={supervisorNotes}
                  onChange={(e) => setSupervisorNotes(e.target.value)}
                  placeholder="أضف ملاحظات المتابعة الداخلية..."
                  className="w-full p-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal focus:outline-none focus:border-rahaa-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                  الإجراء المتخذ
                </label>
                <textarea
                  rows={2}
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="مثال: تم التواصل مع الكابتن وتعويض الراكب..."
                  className="w-full p-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal focus:outline-none focus:border-rahaa-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="h-10 px-4 rounded-xl border border-rahaa-border text-xs font-cairo font-bold text-rahaa-text-muted hover:bg-rahaa-bg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-5 rounded-xl bg-rahaa-blue text-white text-xs font-cairo font-bold hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ وتوثيق الإجراء'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

