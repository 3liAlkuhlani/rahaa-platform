import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Truck,
  Car,
  Key,
  Bike,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  FileText,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';

export const AdminTransportManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles' | 'documents'
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal inspection
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const fetchTransportData = async () => {
    try {
      setLoading(true);
      const [vehRes, docRes] = await Promise.all([
        api.getAdminVehicles(serviceFilter, statusFilter),
        api.getAdminDocuments(statusFilter),
      ]);
      if (vehRes?.vehicles) setVehicles(vehRes.vehicles);
      if (docRes?.documents) setDocuments(docRes.documents);
    } catch (err) {
      console.error('Error fetching admin transport data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportData();
  }, [serviceFilter, statusFilter]);

  const handleApproveVehicle = async (id) => {
    try {
      const res = await api.approveAdminVehicle(id);
      setActionMsg(res.message || 'تم اعتماد المركبة بنجاح');
      setTimeout(() => setActionMsg(null), 3000);
      fetchTransportData();
    } catch (err) {
      alert(err.message || 'فشل اعتماد المركبة');
    }
  };

  const handleRejectVehicle = async (id) => {
    const reason = prompt('يرجى كتابة سبب رفض المركبة:') || 'الوثائق غير مستوفاة';
    try {
      const res = await api.rejectAdminVehicle(id, reason);
      setActionMsg(res.message || 'تم رفض المركبة');
      setTimeout(() => setActionMsg(null), 3000);
      fetchTransportData();
    } catch (err) {
      alert(err.message || 'فشل رفض المركبة');
    }
  };

  const handleVerifyDocument = async (id, status) => {
    try {
      const res = await api.verifyAdminDocument(id, status);
      setActionMsg(res.message || 'تم تحديث حالة الوثيقة');
      setSelectedDoc(null);
      setTimeout(() => setActionMsg(null), 3000);
      fetchTransportData();
    } catch (err) {
      alert(err.message || 'فشل تحديث حالة الوثيقة');
    }
  };

  const getServiceLabel = (srv) => {
    switch (srv) {
      case 'rental': return { label: 'تأجير سيارات', color: 'bg-amber-100 text-amber-800' };
      case 'truck': return { label: 'شاحنة بضائع', color: 'bg-emerald-100 text-emerald-800' };
      case 'motorcycle': return { label: 'دراجة نارية', color: 'bg-purple-100 text-purple-800' };
      default: return { label: 'تاكسي أجرة', color: 'bg-blue-100 text-blue-800' };
    }
  };

  return (
    <div className="space-y-6 font-tajawal animate-fadeIn">
      <PageHeader
        title="إدارة منظومة النقل المتعدد وتوثيق المركبات"
        subtitle="مراجعة واعتماد مركبات التأجير وشاحنات البضائع والدراجات النارية والتحقق من التراخيص الرسمية"
      />

      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Tabs & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-rahaa-border shadow-rahaa-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`h-10 px-4 rounded-xl text-xs font-cairo font-bold transition-all ${
              activeTab === 'vehicles'
                ? 'bg-rahaa-primary text-white shadow-rahaa-sm'
                : 'bg-rahaa-bg text-rahaa-text-muted hover:bg-gray-100'
            }`}
          >
            المركبات المسجلة ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`h-10 px-4 rounded-xl text-xs font-cairo font-bold transition-all ${
              activeTab === 'documents'
                ? 'bg-rahaa-primary text-white shadow-rahaa-sm'
                : 'bg-rahaa-bg text-rahaa-text-muted hover:bg-gray-100'
            }`}
          >
            طلبات توثيق الوثائق ({documents.length})
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-cairo font-bold text-rahaa-navy focus:outline-none"
          >
            <option value="all">جميع أنواع الخدمات</option>
            <option value="taxi">تاكسي</option>
            <option value="rental">تأجير سيارات</option>
            <option value="truck">شاحنات</option>
            <option value="motorcycle">دراجات نارية</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-cairo font-bold text-rahaa-navy focus:outline-none"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">بانتظار المراجعة</option>
            <option value="approved">معتمد وموثق</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div className="py-16 text-center text-xs text-rahaa-text-subtle">
          جاري تحميل بيانات منظومة النقل...
        </div>
      ) : activeTab === 'vehicles' ? (
        <div className="bg-white rounded-2xl border border-rahaa-border overflow-hidden shadow-rahaa-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-rahaa-bg border-b border-rahaa-border font-cairo font-bold text-rahaa-navy">
                <tr>
                  <th className="py-3 px-4">المركبة والطراز</th>
                  <th className="py-3 px-4">الخدمة</th>
                  <th className="py-3 px-4">المالك / الكابتن</th>
                  <th className="py-3 px-4">رقم اللوحة</th>
                  <th className="py-3 px-4">السعر / الحمولة</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rahaa-border font-tajawal">
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-rahaa-text-subtle">
                      لا توجد مركبات مسجلة في هذا التصنيف
                    </td>
                  </tr>
                ) : (
                  vehicles.map((v) => {
                    const srv = getServiceLabel(v.service_type);
                    return (
                      <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-rahaa-navy">
                          {v.make} {v.model} ({v.year})
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${srv.color}`}>
                            {srv.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-rahaa-navy">
                          <div>{v.owner?.name || 'مالك مركبة'}</div>
                          <span className="text-[10px] text-rahaa-text-subtle">{v.owner?.phone}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">{v.plate_number}</td>
                        <td className="py-3.5 px-4">
                          {v.daily_rate
                            ? `${Number(v.daily_rate).toLocaleString()} ر.ي/يوم`
                            : v.max_payload_kg
                            ? `حمولة ${v.max_payload_kg} كجم`
                            : 'أجرة عداد'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              v.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : v.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {v.status === 'approved' ? 'معتمد' : v.status === 'rejected' ? 'مرفوض' : 'بانتظار التدقيق'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {v.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleApproveVehicle(v.id)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-cairo font-bold text-[11px] shadow-xs transition-all"
                              >
                                اعتماد
                              </button>
                            )}
                            {v.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleRejectVehicle(v.id)}
                                className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-cairo font-bold text-[11px] transition-all"
                              >
                                رفض
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Documents Tab */
        <div className="bg-white rounded-2xl border border-rahaa-border overflow-hidden shadow-rahaa-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-rahaa-bg border-b border-rahaa-border font-cairo font-bold text-rahaa-navy">
                <tr>
                  <th className="py-3 px-4">نوع الوثيقة</th>
                  <th className="py-3 px-4">الخدمة</th>
                  <th className="py-3 px-4">مقدم الخدمة</th>
                  <th className="py-3 px-4">تاريخ الرفع</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rahaa-border font-tajawal">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-rahaa-text-subtle">
                      لا توجد طلبات وثائق للمراجعة حالياً
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-rahaa-navy flex items-center gap-2">
                        <FileText className="w-4 h-4 text-rahaa-primary" />
                        <span>{doc.document_type}</span>
                      </td>
                      <td className="py-3.5 px-4">{doc.service_type}</td>
                      <td className="py-3.5 px-4">
                        <div>{doc.user?.name || 'مستخدم'}</div>
                        <span className="text-[10px] text-rahaa-text-subtle">{doc.user?.phone}</span>
                      </td>
                      <td className="py-3.5 px-4 text-rahaa-text-muted">
                        {new Date(doc.created_at).toLocaleDateString('ar-YE')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            doc.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {doc.status === 'approved' ? 'معتمدة' : doc.status === 'rejected' ? 'مرفوضة' : 'قيد المراجعة'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleVerifyDocument(doc.id, 'approved')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-cairo font-bold text-[11px]"
                          >
                            قبول الوثيقة
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerifyDocument(doc.id, 'rejected')}
                            className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-cairo font-bold text-[11px]"
                          >
                            رفض
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransportManagement;
