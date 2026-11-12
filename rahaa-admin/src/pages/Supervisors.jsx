import React, { useEffect, useState } from 'react';
import {
  UserCog,
  Plus,
  Edit3,
  ShieldCheck,
  History,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';

const PERMISSION_LABELS = {
  overview: 'الرئيسية والإحصائيات',
  users: 'إدارة المستخدمين',
  drivers: 'إدارة السائقين',
  trips: 'إدارة الرحلات',
  vehicles: 'منظومة النقل والمركبات',
  complaints: 'الشكاوى والبلاغات',
  analytics: 'التقارير والتحليلات',
  settings: 'إعدادات النظام',
};

export const Supervisors = () => {
  const [activeTab, setActiveTab] = useState('supervisors'); // 'supervisors' | 'logs'
  const [supervisors, setSupervisors] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState(Object.keys(PERMISSION_LABELS));
  const [logs, setLogs] = useState([]);
  const [logsPagination, setLogsPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [logsPage, setLogsPage] = useState(1);
  const [logsSearch, setLogsSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [form, setForm] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    status: 'active',
    permissions: ['overview', 'trips', 'complaints'],
  });
  const [saving, setSaving] = useState(false);

  const loadSupervisors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getSupervisors();
      setSupervisors(res.supervisors || []);
      if (Array.isArray(res.available_permissions)) {
        setAvailablePermissions(res.available_permissions);
      }
    } catch (err) {
      setError(err.message || 'تعذر تحميل قائمة المشرفين');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async (targetPage = logsPage) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAuditLogs({
        page: targetPage,
        per_page: 20,
        search: logsSearch.trim(),
      });
      const paginator = res.logs || {};
      setLogs(paginator.data || []);
      setLogsPagination({
        current_page: paginator.current_page || 1,
        last_page: paginator.last_page || 1,
        total: paginator.total || 0,
      });
    } catch (err) {
      setError(err.message || 'تعذر تحميل سجل العمليات الإدارية');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'supervisors') {
      loadSupervisors();
    } else {
      loadAuditLogs(logsPage);
    }
  }, [activeTab, logsPage]);

  const openCreateModal = () => {
    setEditingSupervisor(null);
    setForm({
      name: '',
      username: '',
      phone: '',
      email: '',
      password: '',
      status: 'active',
      permissions: ['overview', 'trips', 'complaints'],
    });
    setModalOpen(true);
  };

  const openEditModal = (sup) => {
    setEditingSupervisor(sup);
    setForm({
      name: sup.name || '',
      username: sup.username || '',
      phone: sup.phone || '',
      email: sup.email || '',
      password: '',
      status: sup.status || 'active',
      permissions: Array.isArray(sup.permissions) ? sup.permissions : [],
    });
    setModalOpen(true);
  };

  const togglePermission = (perm) => {
    setForm((prev) => {
      const exists = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== perm)
          : [...prev.permissions, perm],
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.permissions.length === 0) {
      alert('يرجى تحديد صلاحية واحدة على الأقل للمشرف');
      return;
    }
    setSaving(true);
    setActionMsg('');
    try {
      if (editingSupervisor) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        const res = await api.updateSupervisor(editingSupervisor.id, payload);
        setActionMsg(res.message || 'تم تحديث المشرف بنجاح');
      } else {
        const res = await api.createSupervisor(form);
        setActionMsg(res.message || 'تم إضافة المشرف بنجاح');
      }
      setModalOpen(false);
      loadSupervisors();
    } catch (err) {
      alert(err.message || 'فشل حفظ بيانات المشرف');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (sup) => {
    const confirmText =
      sup.status === 'banned'
        ? `هل تريد إعادة تفعيل حساب المشرف (${sup.name})؟`
        : `هل تريد تعطيل حساب المشرف (${sup.name}) وإلغاء جلساته؟`;
    if (!window.confirm(confirmText)) return;

    try {
      const res = await api.toggleSupervisorStatus(sup.id);
      setActionMsg(res.message || 'تم تحديث حالة المشرف');
      loadSupervisors();
    } catch (err) {
      alert(err.message || 'تعذر تغيير حالة المشرف');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-cairo font-bold text-rahaa-navy flex items-center gap-2.5">
            <UserCog className="w-6 h-6 text-rahaa-blue" />
            <span>إدارة المشرفين وسجل العمليات</span>
          </h1>
          <p className="text-xs font-tajawal text-rahaa-text-muted mt-1">
            إنشاء حسابات المشرفين وتحديد صلاحيات الوصول الدقيقة ومراقبة جميع العمليات الإدارية (مخصص للأدمن فقط)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'supervisors' && (
            <button
              type="button"
              onClick={openCreateModal}
              className="h-10 px-4 rounded-xl bg-rahaa-blue text-white text-xs font-cairo font-bold hover:opacity-90 flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مشرف جديد</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => (activeTab === 'supervisors' ? loadSupervisors() : loadAuditLogs(logsPage))}
            className="h-10 px-3.5 rounded-xl bg-rahaa-card border border-rahaa-border text-xs font-cairo font-bold text-rahaa-navy hover:bg-rahaa-bg flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-rahaa-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('supervisors')}
          className={`h-10 px-4 rounded-xl text-xs font-cairo font-bold flex items-center gap-2 transition-all ${
            activeTab === 'supervisors'
              ? 'bg-rahaa-navy text-white shadow-sm'
              : 'bg-rahaa-card border border-rahaa-border text-rahaa-text-muted'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>حسابات المشرفين والصلاحيات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`h-10 px-4 rounded-xl text-xs font-cairo font-bold flex items-center gap-2 transition-all ${
            activeTab === 'logs'
              ? 'bg-rahaa-navy text-white shadow-sm'
              : 'bg-rahaa-card border border-rahaa-border text-rahaa-text-muted'
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجل العمليات الإدارية (Audit Logs)</span>
        </button>
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

      {activeTab === 'supervisors' ? (
        <div className="bg-rahaa-card rounded-2xl border border-rahaa-border shadow-rahaa-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-rahaa-bg border-b border-rahaa-border font-cairo font-bold text-rahaa-navy">
                <tr>
                  <th className="py-3.5 px-4">الاسم واسم المستخدم</th>
                  <th className="py-3.5 px-4">الهاتف / البريد</th>
                  <th className="py-3.5 px-4">الدور</th>
                  <th className="py-3.5 px-4">الصلاحيات الممنوحة</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rahaa-border font-tajawal">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-rahaa-text-muted">
                      جاري تحميل حسابات الإدارة والمشرفين...
                    </td>
                  </tr>
                ) : (
                  supervisors.map((sup) => (
                    <tr key={sup.id} className="hover:bg-rahaa-bg/50">
                      <td className="py-3.5 px-4">
                        <div className="font-cairo font-bold text-rahaa-navy">{sup.name}</div>
                        <div className="text-[11px] text-rahaa-text-subtle">@{sup.username || '—'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-rahaa-navy">{sup.phone || '—'}</div>
                        <div className="text-[11px] text-rahaa-text-subtle">{sup.email || '—'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {sup.role === 'admin' ? (
                          <span className="px-2.5 py-1 rounded-full bg-rahaa-navy text-white text-[11px] font-cairo font-bold">
                            مدير النظام (أدمن)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rahaa-blue-light text-rahaa-blue text-[11px] font-cairo font-bold">
                            مشرف
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        {sup.role === 'admin' ? (
                          <span className="text-xs font-cairo font-bold text-emerald-700">
                            جميع الصلاحيات الكاملة
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {(sup.permissions || []).map((p) => (
                              <span
                                key={p}
                                className="px-2 py-0.5 rounded-md bg-rahaa-bg border border-rahaa-border text-[10px] font-cairo"
                              >
                                {PERMISSION_LABELS[p] || p}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {sup.status === 'active' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-cairo font-bold">
                            نشط
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-cairo font-bold">
                            معطل
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {sup.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rahaa-text-subtle">
                            <Lock className="w-3.5 h-3.5" />
                            محمي
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(sup)}
                              className="h-8 px-2.5 rounded-lg bg-rahaa-blue-light text-rahaa-blue hover:bg-rahaa-blue hover:text-white text-[11px] font-cairo font-bold inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>تعديل</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(sup)}
                              className={`h-8 px-2.5 rounded-lg text-[11px] font-cairo font-bold inline-flex items-center gap-1 ${
                                sup.status === 'active'
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                              }`}
                            >
                              {sup.status === 'active' ? (
                                <>
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>تعطيل</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>تفعيل</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setLogsPage(1);
              loadAuditLogs(1);
            }}
            className="flex gap-2 max-w-md"
          >
            <input
              type="text"
              value={logsSearch}
              onChange={(e) => setLogsSearch(e.target.value)}
              placeholder="ابحث في تفاصيل العمليات أو اسم المنفذ..."
              className="flex-1 h-10 px-3 rounded-xl bg-rahaa-card border border-rahaa-border text-xs font-tajawal"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-rahaa-navy text-white text-xs font-cairo font-bold"
            >
              بحث
            </button>
          </form>

          <div className="bg-rahaa-card rounded-2xl border border-rahaa-border shadow-rahaa-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-rahaa-bg border-b border-rahaa-border font-cairo font-bold text-rahaa-navy">
                  <tr>
                    <th className="py-3.5 px-4">المنفذ</th>
                    <th className="py-3.5 px-4">العملية</th>
                    <th className="py-3.5 px-4">التفاصيل</th>
                    <th className="py-3.5 px-4">عنوان IP</th>
                    <th className="py-3.5 px-4">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rahaa-border font-tajawal">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-rahaa-text-subtle">
                        لا توجد عمليات مسجلة بعد
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-rahaa-bg/50">
                        <td className="py-3 px-4">
                          <div className="font-cairo font-bold text-rahaa-navy">
                            {log.admin?.name || 'النظام'}
                          </div>
                          <div className="text-[10px] text-rahaa-text-subtle">
                            {log.admin?.role === 'supervisor' ? 'مشرف' : 'أدمن'}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-rahaa-blue font-bold">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-rahaa-navy">{log.details}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-rahaa-text-subtle">
                          {log.ip_address || '—'}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-rahaa-text-muted">
                          {log.created_at ? new Date(log.created_at).toLocaleString('ar-YE') : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {logsPagination.last_page > 1 && (
              <div className="px-4 py-3 border-t border-rahaa-border flex items-center justify-between text-xs font-tajawal">
                <span>
                  صفحة {logsPagination.current_page} من {logsPagination.last_page}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={logsPagination.current_page <= 1}
                    onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-rahaa-border disabled:opacity-40"
                  >
                    السابق
                  </button>
                  <button
                    type="button"
                    disabled={logsPagination.current_page >= logsPagination.last_page}
                    onClick={() => setLogsPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-rahaa-border disabled:opacity-40"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Supervisor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rahaa-navy/60 backdrop-blur-xs">
          <div className="bg-rahaa-card rounded-3xl w-full max-w-lg p-6 border border-rahaa-border shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-rahaa-border">
              <h2 className="font-cairo font-bold text-base text-rahaa-navy">
                {editingSupervisor ? `تعديل صلاحيات: ${editingSupervisor.name}` : 'إضافة مشرف جديد'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-rahaa-bg text-rahaa-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">اسم المستخدم *</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                  {editingSupervisor ? 'كلمة مرور جديدة (اتركها فارغة للإبقاء على الحالية)' : 'كلمة المرور *'}
                </label>
                <input
                  type="password"
                  required={!editingSupervisor}
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border text-xs font-tajawal"
                />
              </div>

              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-2">
                  الأقسام والصلاحيات المسموحة للمشرف:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map((perm) => {
                    const checked = form.permissions.includes(perm);
                    return (
                      <label
                        key={perm}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-cairo cursor-pointer transition-colors ${
                          checked
                            ? 'bg-rahaa-blue-light border-rahaa-blue text-rahaa-blue font-bold'
                            : 'bg-rahaa-bg border-rahaa-border text-rahaa-text-muted'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(perm)}
                          className="accent-rahaa-blue"
                        />
                        <span>{PERMISSION_LABELS[perm] || perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-rahaa-border text-xs font-cairo font-bold text-rahaa-text-muted"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-5 rounded-xl bg-rahaa-blue text-white text-xs font-cairo font-bold hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? 'جاري الحفظ...' : editingSupervisor ? 'حفظ التعديلات' : 'إنشاء حساب المشرف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
