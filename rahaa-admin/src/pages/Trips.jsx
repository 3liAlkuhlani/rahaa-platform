import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { RefreshCw, Search, Eye, X, MapPin } from 'lucide-react';
import { api } from '../services/api';

const STATUS_BADGE = {
  requested: { label: 'بانتظار القبول', cls: 'bg-amber-100 text-amber-800' },
  accepted: { label: 'تم القبول', cls: 'bg-sky-100 text-sky-800' },
  arrived: { label: 'وصل السائق', cls: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'قيد التنفيذ', cls: 'bg-indigo-100 text-indigo-800' },
  completed: { label: 'مكتملة', cls: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'ملغاة', cls: 'bg-rose-100 text-rose-800' },
};

const VEHICLE_LABELS = {
  economy: 'توفير (Economy)',
  comfort: 'راحة بلس (Comfort)',
  vip: 'VIP فاخرة',
  taxi: 'تاكسي',
  motorcycle: 'دراجة نارية',
};

export const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);

  const fetchTrips = async (targetPage = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminTrips({
        status: statusFilter,
        vehicle_type: vehicleFilter,
        date_from: dateFrom,
        date_to: dateTo,
        search: search.trim(),
        page: targetPage,
        per_page: 15,
      });
      const paginator = res.trips || {};
      setTrips(paginator.data || []);
      setPagination({
        current_page: paginator.current_page || 1,
        last_page: paginator.last_page || 1,
        total: paginator.total || 0,
      });
    } catch (err) {
      setError(err.message || 'تعذر تحميل سجل الرحلات من الخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips(page);
  }, [statusFilter, vehicleFilter, dateFrom, dateTo, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTrips(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة ومراقبة الرحلات"
        description="متابعة حية لجميع رحلات الركاب والسائقين مع البحث والتصفية حسب التاريخ والحالة ونوع المركبة"
        actions={
          <PrimaryButton
            variant="secondary"
            icon={RefreshCw}
            onClick={() => fetchTrips(page)}
            disabled={loading}
          >
            تحديث السجل
          </PrimaryButton>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rahaa-rose-bg border border-rahaa-rose/30 text-rahaa-rose text-xs font-tajawal">
          {error}
        </div>
      )}

      {/* Multi-Filters Bar */}
      <div className="bg-rahaa-card rounded-2xl p-4 border border-rahaa-border space-y-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'requested', label: 'بانتظار القبول' },
            { id: 'in_progress', label: 'قيد التنفيذ' },
            { id: 'completed', label: 'مكتملة' },
            { id: 'cancelled', label: 'ملغاة' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`h-9 px-3.5 rounded-xl text-xs font-cairo font-bold ${
                statusFilter === tab.id
                  ? 'bg-rahaa-blue text-white'
                  : 'bg-rahaa-bg text-rahaa-text-muted hover:text-rahaa-navy'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-rahaa-text-subtle absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث برقم الرحلة، الراكب، السائق، أو العنوان..."
              className="w-full h-9 pr-9 pl-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal"
            />
          </div>

          <select
            value={vehicleFilter}
            onChange={(e) => {
              setVehicleFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal"
          >
            <option value="all">كل أنواع المركبات</option>
            <option value="economy">توفير (Economy)</option>
            <option value="comfort">راحة بلس (Comfort)</option>
            <option value="vip">VIP فاخرة</option>
            <option value="motorcycle">دراجة نارية</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            title="من تاريخ"
            className="h-9 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal"
          />

          <div className="flex gap-2">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              title="إلى تاريخ"
              className="flex-1 h-9 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal"
            />
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-rahaa-navy text-white text-xs font-cairo font-bold"
            >
              بحث
            </button>
          </div>
        </form>
      </div>

      {/* Trips Table */}
      <div className="bg-rahaa-card rounded-2xl border border-rahaa-border shadow-rahaa-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-rahaa-bg border-b border-rahaa-border font-cairo font-bold text-rahaa-navy">
              <tr>
                <th className="py-3.5 px-4">رقم الرحلة</th>
                <th className="py-3.5 px-4">الراكب</th>
                <th className="py-3.5 px-4">السائق</th>
                <th className="py-3.5 px-4">المسار (الانطلاق ← الوجهة)</th>
                <th className="py-3.5 px-4">المركبة</th>
                <th className="py-3.5 px-4">القيمة</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4">التاريخ</th>
                <th className="py-3.5 px-4 text-center">تفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rahaa-border font-tajawal">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-rahaa-text-muted">
                    جاري تحميل سجل الرحلات...
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-rahaa-text-subtle">
                    لا توجد رحلات مطابقة للبحث أو الفلاتر المحددة
                  </td>
                </tr>
              ) : (
                trips.map((t) => {
                  const st = STATUS_BADGE[t.status] || { label: t.status, cls: 'bg-slate-100 text-slate-700' };
                  return (
                    <tr key={t.id} className="hover:bg-rahaa-bg/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-rahaa-navy">#{t.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-cairo font-bold text-rahaa-navy">{t.passenger?.name || '—'}</div>
                        <div className="text-[10px] text-rahaa-text-subtle">{t.passenger?.phone || ''}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-cairo font-bold text-rahaa-navy">{t.driver?.name || 'لم يُعيّن'}</div>
                        <div className="text-[10px] text-rahaa-text-subtle">{t.driver?.phone || ''}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate font-bold text-rahaa-navy">{t.pickup_address}</div>
                        <div className="truncate text-[11px] text-rahaa-text-muted">← {t.dropoff_address}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {VEHICLE_LABELS[t.vehicle_type] || t.vehicle_type || 'تاكسي'}
                      </td>
                      <td className="py-3.5 px-4 font-cairo font-bold text-rahaa-blue">
                        {Number(t.fare || 0).toLocaleString()} ر.ي
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-cairo font-bold ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-rahaa-text-muted">
                        {t.created_at ? new Date(t.created_at).toLocaleString('ar-YE') : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedTrip(t)}
                          className="h-8 px-2.5 rounded-lg bg-rahaa-blue-light text-rahaa-blue hover:bg-rahaa-blue hover:text-white text-[11px] font-cairo font-bold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination.last_page > 1 && (
          <div className="px-4 py-3 border-t border-rahaa-border flex items-center justify-between text-xs font-tajawal">
            <span>
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

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rahaa-navy/60 backdrop-blur-xs">
          <div className="bg-rahaa-card rounded-3xl w-full max-w-lg p-6 border border-rahaa-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rahaa-border">
              <h2 className="font-cairo font-bold text-base text-rahaa-navy flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rahaa-blue" />
                <span>تفاصيل الرحلة #{selectedTrip.id}</span>
              </h2>
              <button type="button" onClick={() => setSelectedTrip(null)} className="p-1.5 rounded-lg hover:bg-rahaa-bg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-rahaa-bg border border-rahaa-border space-y-1.5">
                <div><span className="text-rahaa-text-muted">نقطة الانطلاق:</span> <strong className="text-rahaa-navy">{selectedTrip.pickup_address}</strong></div>
                <div><span className="text-rahaa-text-muted">نقطة الوصول:</span> <strong className="text-rahaa-navy">{selectedTrip.dropoff_address}</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-rahaa-bg border border-rahaa-border">
                <div>
                  <div className="text-rahaa-text-subtle">الراكب</div>
                  <div className="font-cairo font-bold text-rahaa-navy">{selectedTrip.passenger?.name || '—'}</div>
                  <div className="font-mono text-[11px]">{selectedTrip.passenger?.phone || ''}</div>
                </div>
                <div>
                  <div className="text-rahaa-text-subtle">السائق</div>
                  <div className="font-cairo font-bold text-rahaa-navy">{selectedTrip.driver?.name || 'لم يُعيّن'}</div>
                  <div className="font-mono text-[11px]">{selectedTrip.driver?.phone || ''}</div>
                </div>
                <div>
                  <div className="text-rahaa-text-subtle">وسيلة النقل</div>
                  <div className="font-cairo font-bold text-rahaa-navy">
                    {VEHICLE_LABELS[selectedTrip.vehicle_type] || selectedTrip.vehicle_type}
                  </div>
                </div>
                <div>
                  <div className="text-rahaa-text-subtle">الأجرة والدفع</div>
                  <div className="font-cairo font-bold text-rahaa-blue">
                    {Number(selectedTrip.fare || 0).toLocaleString()} ر.ي ({selectedTrip.payment_method})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
