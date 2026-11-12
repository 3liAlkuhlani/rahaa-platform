import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { PrimaryButton } from '../components/common/PrimaryButton';
import {
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Ban,
  Eye,
  Star,
  X,
  Car,
  FileCheck,
} from 'lucide-react';
import { api } from '../services/api';

const DRIVER_STATUS_BADGES = {
  approved: { label: 'معتمد', cls: 'bg-emerald-100 text-emerald-800' },
  pending: { label: 'بانتظار الاعتماد', cls: 'bg-amber-100 text-amber-800' },
  rejected: { label: 'مرفوض', cls: 'bg-rose-100 text-rose-800' },
  banned: { label: 'موقوف / محظور', cls: 'bg-rose-100 text-rose-800' },
};

export const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [onlineFilter, setOnlineFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const [detailsDriver, setDetailsDriver] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchDrivers = async (targetPage = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getDrivers({
        status: statusFilter,
        online: onlineFilter,
        search: search.trim(),
        page: targetPage,
        per_page: 15,
      });
      const paginator = res.drivers || {};
      setDrivers(paginator.data || []);
      setPagination({
        current_page: paginator.current_page || 1,
        last_page: paginator.last_page || 1,
        total: paginator.total || 0,
      });
    } catch (err) {
      setError(err.message || 'تعذر تحميل قائمة السائقين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers(page);
  }, [statusFilter, onlineFilter, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDrivers(1);
  };

  const openDetails = async (driverId) => {
    setDetailsLoading(true);
    setDetailsDriver({ id: driverId });
    try {
      const res = await api.getAdminDriver(driverId);
      setDetailsDriver(res.driver);
    } catch (err) {
      alert(err.message || 'تعذر تحميل تفاصيل السائق');
      setDetailsDriver(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove = async (driver) => {
    if (!window.confirm(`اعتماد حساب السائق (${driver.name}) وتفعيله للعمل؟`)) return;
    try {
      const res = await api.approveDriver(driver.id);
      setActionMsg(res.message || 'تم اعتماد السائق بنجاح');
      fetchDrivers(page);
    } catch (err) {
      alert(err.message || 'فشل اعتماد السائق');
    }
  };

  const handleReject = async (driver) => {
    const reason = window.prompt('يرجى كتابة سبب رفض طلب السائق:', 'الوثائق غير واضحة أو غير مستوفية');
    if (reason === null) return;
    try {
      const res = await api.rejectDriver(driver.id, reason);
      setActionMsg(res.message || 'تم رفض طلب السائق');
      fetchDrivers(page);
    } catch (err) {
      alert(err.message || 'فشل رفض السائق');
    }
  };

  const handleToggleBan = async (driver) => {
    const isBanned = driver.status === 'banned';
    if (!window.confirm(isBanned ? `إعادة تفعيل حساب السائق (${driver.name})؟` : `إيقاف وحظر السائق (${driver.name})؟`)) return;
    try {
      const res = await api.toggleUserStatus(driver.id);
      setActionMsg(res.message || 'تم تغيير حالة السائق');
      fetchDrivers(page);
    } catch (err) {
      alert(err.message || 'فشل تغيير حالة السائق');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة السائقين والكباتن"
        description="متابعة ملفات الكباتن، حالة الاتصال، المركبات والوثائق، التقييمات، واعتماد أو إيقاف الحسابات"
        actions={
          <PrimaryButton
            variant="secondary"
            icon={RefreshCw}
            onClick={() => fetchDrivers(page)}
            disabled={loading}
          >
            تحديث السائقين
          </PrimaryButton>
        }
      />

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-cairo font-bold flex items-center justify-between">
          <span>{actionMsg}</span>
          <button type="button" onClick={() => setActionMsg('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rahaa-rose-bg border border-rahaa-rose/30 text-rahaa-rose text-xs font-tajawal">
          {error}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-rahaa-card rounded-2xl p-4 border border-rahaa-border flex flex-col lg:flex-row gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'approved', label: 'معتمدون' },
            { id: 'pending', label: 'بانتظار الاعتماد' },
            { id: 'rejected', label: 'مرفوضون' },
            { id: 'banned', label: 'موقوفون' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setStatusFilter(s.id);
                setPage(1);
              }}
              className={`h-9 px-3.5 rounded-xl text-xs font-cairo font-bold ${
                statusFilter === s.id
                  ? 'bg-rahaa-blue text-white'
                  : 'bg-rahaa-bg text-rahaa-text-muted hover:text-rahaa-navy'
              }`}
            >
              {s.label}
            </button>
          ))}

          <select
            value={onlineFilter}
            onChange={(e) => {
              setOnlineFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal text-rahaa-navy"
          >
            <option value="all">الاتصال: الكل</option>
            <option value="online">متصل حالياً</option>
            <option value="offline">غير متصل</option>
          </select>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-rahaa-text-subtle absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم، الهاتف، اللوحة، المركبة..."
              className="w-full h-9 pr-9 pl-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal focus:outline-none focus:border-rahaa-blue"
            />
          </div>
          <button
            type="submit"
            className="h-9 px-4 rounded-xl bg-rahaa-navy text-white text-xs font-cairo font-bold"
          >
            بحث
          </button>
        </form>
      </div>

      {/* Drivers Table */}
      <div className="bg-rahaa-card rounded-2xl border border-rahaa-border shadow-rahaa-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-rahaa-bg border-b border-rahaa-border font-cairo font-bold text-rahaa-navy">
              <tr>
                <th className="py-3.5 px-4">الكابتن / السائق</th>
                <th className="py-3.5 px-4">المركبة واللوحة</th>
                <th className="py-3.5 px-4">الاتصال</th>
                <th className="py-3.5 px-4">الرحلات والتقييم</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rahaa-border font-tajawal">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-rahaa-text-muted">
                    جاري تحميل قائمة السائقين...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-rahaa-text-subtle">
                    لا توجد حسابات سائقين مطابقة
                  </td>
                </tr>
              ) : (
                drivers.map((d) => {
                  const prof = d.driver_profile;
                  const effectiveStatus = d.status === 'banned' ? 'banned' : prof?.status || 'pending';
                  const st = DRIVER_STATUS_BADGES[effectiveStatus] || DRIVER_STATUS_BADGES.pending;
                  const avgRating = d.trips_as_driver_avg_rating
                    ? Number(d.trips_as_driver_avg_rating).toFixed(1)
                    : Number(prof?.rating || 5).toFixed(1);

                  return (
                    <tr key={d.id} className="hover:bg-rahaa-bg/50">
                      <td className="py-3.5 px-4">
                        <div className="font-cairo font-bold text-rahaa-navy">{d.name}</div>
                        <div className="font-mono text-[11px] text-rahaa-text-subtle">{d.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-rahaa-navy">
                          {prof?.vehicle_model || d.vehicles?.[0]?.model || 'غير مسجلة'}
                        </div>
                        <div className="font-mono text-[11px] text-rahaa-text-subtle">
                          لوحة: {prof?.vehicle_plate || d.vehicles?.[0]?.plate_number || '—'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {prof?.is_online ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-cairo font-bold text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            متصل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-rahaa-text-subtle text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-gray-400" />
                            غير متصل
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-cairo font-bold text-rahaa-navy">
                          {d.trips_as_driver_count ?? prof?.total_trips ?? 0} رحلة
                        </div>
                        <div className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{avgRating}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-cairo font-bold ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 flex-wrap justify-center">
                          <button
                            type="button"
                            onClick={() => openDetails(d.id)}
                            className="h-8 px-2.5 rounded-lg bg-rahaa-bg border border-rahaa-border text-rahaa-navy hover:bg-rahaa-blue-light hover:text-rahaa-blue text-[11px] font-cairo font-bold inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>التفاصيل</span>
                          </button>

                          {effectiveStatus !== 'approved' && effectiveStatus !== 'banned' && (
                            <button
                              type="button"
                              onClick={() => handleApprove(d)}
                              className="h-8 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-[11px] font-cairo font-bold inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>اعتماد</span>
                            </button>
                          )}

                          {effectiveStatus === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleReject(d)}
                              className="h-8 px-2.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white text-[11px] font-cairo font-bold inline-flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>رفض</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleBan(d)}
                            className={`h-8 px-2.5 rounded-lg text-[11px] font-cairo font-bold inline-flex items-center gap-1 ${
                              d.status === 'banned'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white'
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>{d.status === 'banned' ? 'تفعيل' : 'إيقاف'}</span>
                          </button>
                        </div>
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

      {/* Driver Full Details Modal */}
      {detailsDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rahaa-navy/60 backdrop-blur-xs">
          <div className="bg-rahaa-card rounded-3xl w-full max-w-2xl p-6 border border-rahaa-border shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rahaa-border">
              <h2 className="font-cairo font-bold text-base text-rahaa-navy">تفاصيل ملف الكابتن والوثائق</h2>
              <button type="button" onClick={() => setDetailsDriver(null)} className="p-1.5 rounded-lg hover:bg-rahaa-bg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-10 text-center text-xs text-rahaa-text-muted">جاري تحميل التفاصيل...</div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-rahaa-bg border border-rahaa-border">
                  <div>
                    <div className="text-rahaa-text-subtle">الاسم</div>
                    <div className="font-cairo font-bold text-rahaa-navy">{detailsDriver.name}</div>
                  </div>
                  <div>
                    <div className="text-rahaa-text-subtle">الهاتف</div>
                    <div className="font-mono font-bold text-rahaa-navy">{detailsDriver.phone}</div>
                  </div>
                  <div>
                    <div className="text-rahaa-text-subtle">رقم الرخصة</div>
                    <div className="font-mono font-bold text-rahaa-navy">
                      {detailsDriver.driver_profile?.license_number || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-rahaa-text-subtle">المركبة</div>
                    <div className="font-cairo font-bold text-rahaa-navy">
                      {detailsDriver.driver_profile?.vehicle_model || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-rahaa-text-subtle">رقم اللوحة</div>
                    <div className="font-mono font-bold text-rahaa-navy">
                      {detailsDriver.driver_profile?.vehicle_plate || '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-rahaa-text-subtle">التقييم والرحلات</div>
                    <div className="font-cairo font-bold text-rahaa-blue">
                      {Number(detailsDriver.trips_as_driver_avg_rating || 5).toFixed(1)} ★ ({detailsDriver.trips_as_driver_count || 0} رحلة)
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="font-cairo font-bold text-sm text-rahaa-navy mb-2 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>الوثائق المرفوعة</span>
                  </h3>
                  {(detailsDriver.verification_documents || []).length === 0 ? (
                    <div className="p-3 rounded-xl bg-rahaa-bg text-rahaa-text-subtle text-center">
                      لا توجد وثائق مرفوعة إضافية
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {detailsDriver.verification_documents.map((doc) => (
                        <div key={doc.id} className="p-3 rounded-xl bg-rahaa-bg border border-rahaa-border flex items-center justify-between">
                          <span className="font-cairo font-bold text-rahaa-navy">{doc.document_type}</span>
                          <span className="text-[11px] font-bold text-rahaa-blue">{doc.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Trips */}
                <div>
                  <h3 className="font-cairo font-bold text-sm text-rahaa-navy mb-2 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-rahaa-blue" />
                    <span>أحدث رحلات السائق</span>
                  </h3>
                  {(detailsDriver.trips_as_driver || []).length === 0 ? (
                    <div className="p-3 rounded-xl bg-rahaa-bg text-rahaa-text-subtle text-center">
                      لا توجد رحلات منفذة بعد
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {detailsDriver.trips_as_driver.map((t) => (
                        <div key={t.id} className="p-3 rounded-xl bg-rahaa-bg border border-rahaa-border flex items-center justify-between">
                          <div>
                            <div className="font-cairo font-bold text-rahaa-navy">
                              #{t.id} • {t.pickup_address} ← {t.dropoff_address}
                            </div>
                            <div className="text-[11px] text-rahaa-text-subtle">
                              الراكب: {t.passenger?.name || '—'}
                            </div>
                          </div>
                          <div className="font-cairo font-bold text-rahaa-blue">
                            {Number(t.fare || 0).toLocaleString()} ر.ي
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
