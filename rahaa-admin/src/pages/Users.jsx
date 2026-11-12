import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { PrimaryButton } from '../components/common/PrimaryButton';
import {
  Search,
  RefreshCw,
  CheckCircle2,
  Ban,
  ShieldCheck,
  Users as UsersIcon,
  Eye,
  Edit3,
  X,
  Car,
} from 'lucide-react';
import { api } from '../services/api';

const STATUS_LABEL = {
  active: { text: 'نشط ومفعل', badge: 'bg-emerald-100 text-emerald-800' },
  pending: { text: 'قيد المراجعة', badge: 'bg-amber-100 text-amber-800' },
  rejected: { text: 'مرفوض', badge: 'bg-rose-100 text-rose-800' },
  banned: { text: 'موقوف / محظور', badge: 'bg-rose-100 text-rose-800' },
};

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'passenger', 'driver'
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Details & Trip History Modal
  const [detailsUser, setDetailsUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Edit User Modal
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', status: 'active' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async (targetPage = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminUsers({
        search: searchQuery.trim(),
        role: roleFilter,
        status: statusFilter,
        page: targetPage,
        per_page: 15,
      });
      const paginator = res.users || {};
      setUsers(paginator.data || []);
      setPagination({
        current_page: paginator.current_page || 1,
        last_page: paginator.last_page || 1,
        total: paginator.total || 0,
      });
    } catch (err) {
      setError(err.message || 'تعذر تحميل قائمة المستخدمين من الخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [roleFilter, statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1);
  };

  const openDetails = async (userId) => {
    setDetailsLoading(true);
    setDetailsUser({ id: userId, loading: true });
    try {
      const res = await api.getAdminUser(userId);
      setDetailsUser(res.user);
    } catch (err) {
      alert(err.message || 'تعذر جلب تفاصيل المستخدم');
      setDetailsUser(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      status: user.status || 'active',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await api.updateAdminUser(editUser.id, editForm);
      setActionMsg(res.message || 'تم تحديث بيانات المستخدم بنجاح');
      setEditUser(null);
      fetchUsers(page);
    } catch (err) {
      alert(err.message || 'فشل تحديث بيانات المستخدم');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBan = async (user) => {
    const isBanned = user.status === 'banned';
    const confirmMsg = isBanned
      ? `هل تريد إعادة تفعيل حساب (${user.name})؟`
      : `هل تريد حظر وإيقاف حساب (${user.name})؟`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await api.toggleUserStatus(user.id);
      setActionMsg(res.message || 'تم تحديث حالة الحساب');
      fetchUsers(page);
    } catch (err) {
      alert(err.message || 'فشل تغيير حالة المستخدم');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المستخدمين"
        description="عرض والبحث عن جميع المستخدمين (الركاب والسائقين)، تعديل بياناتهم، متابعة سجل رحلاتهم، وتفعيل أو تعطيل حساباتهم"
        actions={
          <PrimaryButton
            variant="secondary"
            icon={RefreshCw}
            onClick={() => fetchUsers(page)}
            disabled={loading}
          >
            تحديث القائمة
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

      {/* Search & Filters */}
      <div className="bg-rahaa-card rounded-2xl p-4 border border-rahaa-border flex flex-col lg:flex-row gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'passenger', label: 'الركاب' },
            { id: 'driver', label: 'الكباتن / السائقين' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setRoleFilter(r.id);
                setPage(1);
              }}
              className={`h-9 px-3.5 rounded-xl text-xs font-cairo font-bold transition-all ${
                roleFilter === r.id
                  ? 'bg-rahaa-blue text-white'
                  : 'bg-rahaa-bg text-rahaa-text-muted hover:text-rahaa-navy'
              }`}
            >
              {r.label}
            </button>
          ))}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal text-rahaa-navy"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط ومفعل</option>
            <option value="pending">قيد المراجعة</option>
            <option value="banned">موقوف / محظور</option>
          </select>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-rahaa-text-subtle absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم، الهاتف، أو البريد..."
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

      {/* Users Table */}
      <div className="bg-rahaa-card rounded-2xl border border-rahaa-border shadow-rahaa-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-rahaa-bg border-b border-rahaa-border font-cairo font-bold text-rahaa-navy">
              <tr>
                <th className="py-3.5 px-4">المستخدم</th>
                <th className="py-3.5 px-4">الهاتف والبريد</th>
                <th className="py-3.5 px-4">الدور</th>
                <th className="py-3.5 px-4">الرحلات</th>
                <th className="py-3.5 px-4">تاريخ التسجيل</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rahaa-border font-tajawal">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-rahaa-text-muted">
                    جاري تحميل المستخدمين...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-rahaa-text-subtle">
                    لا توجد حسابات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const st = STATUS_LABEL[u.status] || STATUS_LABEL.active;
                  const tripsCount =
                    u.role === 'driver' ? u.trips_as_driver_count || 0 : u.trips_as_passenger_count || 0;
                  return (
                    <tr key={u.id} className="hover:bg-rahaa-bg/50">
                      <td className="py-3.5 px-4">
                        <div className="font-cairo font-bold text-rahaa-navy">{u.name}</div>
                        <div className="text-[10px] text-rahaa-text-subtle">#{u.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-rahaa-navy">{u.phone || '—'}</div>
                        <div className="text-[11px] text-rahaa-text-subtle">{u.email || '—'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-cairo font-bold ${
                            u.role === 'driver'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rahaa-blue-light text-rahaa-blue'
                          }`}
                        >
                          {u.role === 'driver' ? 'كابتن / سائق' : 'راكب'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-cairo font-bold text-rahaa-navy">{tripsCount}</td>
                      <td className="py-3.5 px-4 text-[11px] text-rahaa-text-muted">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('ar-YE') : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-cairo font-bold ${st.badge}`}>
                          {st.text}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetails(u.id)}
                            title="عرض التفاصيل وسجل الرحلات"
                            className="h-8 px-2.5 rounded-lg bg-rahaa-bg border border-rahaa-border text-rahaa-navy hover:bg-rahaa-blue-light hover:text-rahaa-blue text-[11px] font-cairo font-bold inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>تفاصيل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(u)}
                            title="تعديل البيانات"
                            className="h-8 px-2.5 rounded-lg bg-rahaa-blue-light text-rahaa-blue hover:bg-rahaa-blue hover:text-white text-[11px] font-cairo font-bold inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleBan(u)}
                            className={`h-8 px-2.5 rounded-lg text-[11px] font-cairo font-bold inline-flex items-center gap-1 ${
                              u.status === 'banned'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white'
                            }`}
                          >
                            {u.status === 'banned' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>تفعيل</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" />
                                <span>تعطيل</span>
                              </>
                            )}
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

      {/* User Details & Trip History Modal */}
      {detailsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rahaa-navy/60 backdrop-blur-xs">
          <div className="bg-rahaa-card rounded-3xl w-full max-w-2xl p-6 border border-rahaa-border shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rahaa-border">
              <h2 className="font-cairo font-bold text-base text-rahaa-navy flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-rahaa-blue" />
                <span>ملف المستخدم وسجل الرحلات</span>
              </h2>
              <button type="button" onClick={() => setDetailsUser(null)} className="p-1.5 rounded-lg hover:bg-rahaa-bg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-10 text-center text-xs text-rahaa-text-muted">جاري تحميل التفاصيل...</div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-rahaa-bg border border-rahaa-border">
                  <div>
                    <div className="text-rahaa-text-subtle">الاسم</div>
                    <div className="font-cairo font-bold text-rahaa-navy">{detailsUser.name}</div>
                  </div>
                  <div>
                    <div className="text-rahaa-text-subtle">الهاتف</div>
                    <div className="font-mono font-bold text-rahaa-navy">{detailsUser.phone}</div>
                  </div>
                  <div>
                    <div className="text-rahaa-text-subtle">البريد</div>
                    <div className="font-tajawal text-rahaa-navy">{detailsUser.email || '—'}</div>
                  </div>
                  <div>
                    <div className="text-rahaa-text-subtle">تاريخ التسجيل</div>
                    <div className="font-tajawal text-rahaa-navy">
                      {detailsUser.created_at ? new Date(detailsUser.created_at).toLocaleDateString('ar-YE') : '—'}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-cairo font-bold text-sm text-rahaa-navy mb-2 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-rahaa-blue" />
                    <span>سجل الرحلات الأخيرة</span>
                  </h3>
                  {((detailsUser.role === 'driver'
                    ? detailsUser.trips_as_driver
                    : detailsUser.trips_as_passenger) || []).length === 0 ? (
                    <div className="p-4 rounded-xl bg-rahaa-bg text-center text-rahaa-text-subtle">
                      لا توجد رحلات مسجلة لهذا الحساب
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {(detailsUser.role === 'driver'
                        ? detailsUser.trips_as_driver
                        : detailsUser.trips_as_passenger
                      ).map((t) => (
                        <div
                          key={t.id}
                          className="p-3 rounded-xl bg-rahaa-bg border border-rahaa-border flex items-center justify-between"
                        >
                          <div>
                            <div className="font-cairo font-bold text-rahaa-navy">
                              رحلة #{t.id}: {t.pickup_address} ← {t.dropoff_address}
                            </div>
                            <div className="text-[11px] text-rahaa-text-subtle">
                              {t.created_at ? new Date(t.created_at).toLocaleString('ar-YE') : ''}
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-cairo font-bold text-rahaa-blue">
                              {Number(t.fare || 0).toLocaleString()} ر.ي
                            </div>
                            <div className="text-[10px] text-rahaa-text-muted">{t.status}</div>
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

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rahaa-navy/60 backdrop-blur-xs">
          <div className="bg-rahaa-card rounded-3xl w-full max-w-md p-6 border border-rahaa-border shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rahaa-border">
              <h2 className="font-cairo font-bold text-base text-rahaa-navy">تعديل بيانات المستخدم</h2>
              <button type="button" onClick={() => setEditUser(null)} className="p-1.5 rounded-lg hover:bg-rahaa-bg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-cairo font-bold text-rahaa-navy mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border font-tajawal"
                />
              </div>
              <div>
                <label className="block font-cairo font-bold text-rahaa-navy mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border font-tajawal"
                />
              </div>
              <div>
                <label className="block font-cairo font-bold text-rahaa-navy mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border font-tajawal"
                />
              </div>
              <div>
                <label className="block font-cairo font-bold text-rahaa-navy mb-1">حالة الحساب</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border font-tajawal"
                >
                  <option value="active">نشط ومفعل</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="rejected">مرفوض</option>
                  <option value="banned">موقوف / محظور</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="h-10 px-4 rounded-xl border border-rahaa-border font-cairo font-bold text-rahaa-text-muted"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-5 rounded-xl bg-rahaa-blue text-white font-cairo font-bold hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
