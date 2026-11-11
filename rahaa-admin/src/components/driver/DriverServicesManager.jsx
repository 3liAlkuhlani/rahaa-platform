import React, { useState, useEffect } from 'react';
import { api, getCurrentUser } from '../../services/api';
import {
  Car,
  Key,
  Truck,
  Bike,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  PlusCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const DriverServicesManager = () => {
  const currentUser = getCurrentUser();
  const [data, setData] = useState({ services: [], vehicles: [], documents: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'vehicles' | 'documents'

  // Add Vehicle Form State
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    service_type: 'rental',
    make: 'تويوتا',
    model: 'كورولا 2023',
    year: 2023,
    plate_number: '',
    category: 'sedan',
    seats: 5,
    daily_rate: 20000,
    with_driver_available: true,
    self_drive_available: true,
    location_name: 'صنعاء - شارع حدة',
  });
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [formMsg, setFormMsg] = useState(null);

  const fetchServicesData = async () => {
    try {
      setLoading(true);
      const res = await api.getMyTransportServices();
      if (res) {
        setData({
          services: res.services || [],
          vehicles: res.vehicles || [],
          documents: res.documents || [],
        });
      }
    } catch (err) {
      console.error('Error fetching driver services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, []);

  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    try {
      setAddingVehicle(true);
      setFormMsg(null);
      const res = await api.addVehicle(newVehicle);
      setFormMsg({ type: 'success', text: res.message || 'تمت إضافة المركبة بنجاح!' });
      setTimeout(() => {
        setIsAddVehicleOpen(false);
        setFormMsg(null);
        fetchServicesData();
      }, 1500);
    } catch (err) {
      setFormMsg({ type: 'error', text: err.message || 'فشل إضافة المركبة' });
    } finally {
      setAddingVehicle(false);
    }
  };

  const serviceBadges = {
    taxi: { title: 'سائق تاكسي معتمد', icon: Car, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    rental: { title: 'مقدم خدمة تأجير سيارات', icon: Key, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    truck: { title: 'سائق شاحنة نقل عفش وبضائع', icon: Truck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    motorcycle: { title: 'كابتن دراجة نارية وسريعة', icon: Bike, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  };

  return (
    <div className="bg-white rounded-3xl border border-rahaa-border p-6 shadow-rahaa-card font-tajawal space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-rahaa-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rahaa-primary/10 text-rahaa-primary text-xs font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            منظومة الخدمات والمركبات المتعددة
          </div>
          <h2 className="font-cairo font-bold text-lg text-rahaa-navy">
            الخدمات والمركبات المسجلة في حسابك
          </h2>
          <p className="text-xs text-rahaa-text-subtle">
            يمكنك تقديم أكثر من خدمة نقل، وإدارة أسطول مركباتك ورفع وثائق التوثيق الرسمية.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddVehicleOpen(true)}
          className="h-10 px-4 rounded-xl bg-rahaa-primary hover:bg-rahaa-navy text-white font-cairo font-bold text-xs flex items-center gap-2 transition-all shadow-rahaa-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة مركبة / خدمة جديدة</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-rahaa-border pb-2">
        {[
          { id: 'services', label: `الخدمات المعتمدة (${data.services.length})` },
          { id: 'vehicles', label: `المركبات المسجلة (${data.vehicles.length})` },
          { id: 'documents', label: `الوثائق والتراخيص (${data.documents.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-cairo font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-rahaa-primary text-white shadow-rahaa-sm'
                : 'text-rahaa-text-muted hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-8 text-center text-xs text-rahaa-text-subtle">
          جاري تحميل بيانات خدماتك...
        </div>
      ) : activeTab === 'services' ? (
        /* Services List */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.services.length === 0 ? (
            <div className="col-span-2 p-6 rounded-2xl bg-gray-50 text-center text-xs text-rahaa-text-subtle">
              لا توجد خدمات معتمدة حالياً. أضف مركبتك وارفع الوثائق لتفعيل الخدمات.
            </div>
          ) : (
            data.services.map((srv) => {
              const meta = serviceBadges[srv.service_type] || serviceBadges.taxi;
              const Icon = meta.icon;
              return (
                <div
                  key={srv.id}
                  className={`p-4 rounded-2xl border ${meta.color} flex items-center justify-between shadow-xs`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-cairo font-bold text-xs text-rahaa-navy">
                        {meta.title}
                      </h4>
                      <span className="text-[10px] text-rahaa-text-subtle block">
                        نوع الخدمة: {srv.service_type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      srv.status === 'approved'
                        ? 'bg-emerald-600 text-white'
                        : srv.status === 'rejected'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {srv.status === 'approved' ? 'معتمد ونشط' : srv.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      ) : activeTab === 'vehicles' ? (
        /* Vehicles List */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.vehicles.length === 0 ? (
            <div className="col-span-3 p-6 rounded-2xl bg-gray-50 text-center text-xs text-rahaa-text-subtle">
              لم تسجل أي مركبة بعد. اضغط على زر "إضافة مركبة جديدة" أعلاه.
            </div>
          ) : (
            data.vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-rahaa-bg rounded-2xl border border-rahaa-border p-4 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-cairo font-bold text-rahaa-navy text-sm">
                    {v.make} {v.model}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      v.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {v.status === 'approved' ? 'معتمدة' : 'بانتظار التدقيق'}
                  </span>
                </div>

                <div className="text-rahaa-text-subtle space-y-0.5">
                  <div>اللوحة: <strong className="text-rahaa-navy">{v.plate_number}</strong></div>
                  <div>الخدمة: <strong className="text-rahaa-navy">{v.service_type}</strong></div>
                  {v.daily_rate && (
                    <div>سعر اليوم: <strong className="text-amber-700">{Number(v.daily_rate).toLocaleString()} ر.ي</strong></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Documents Tab */
        <div className="space-y-3">
          {data.documents.length === 0 ? (
            <div className="p-6 rounded-2xl bg-gray-50 text-center text-xs text-rahaa-text-subtle">
              لا توجد وثائق مرفوعة بعد.
            </div>
          ) : (
            data.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl border border-rahaa-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-rahaa-primary" />
                  <span className="font-bold text-rahaa-navy">{doc.document_type}</span>
                  <span className="text-rahaa-text-subtle text-[11px]">({doc.service_type})</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    doc.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : doc.status === 'rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {doc.status === 'approved' ? 'موثقة' : doc.status === 'rejected' ? 'مرفوضة' : 'قيد المراجعة'}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-rahaa-xl border border-rahaa-border">
            <div className="flex items-center justify-between pb-3 border-b border-rahaa-border mb-4">
              <h3 className="font-cairo font-bold text-base text-rahaa-navy">
                إضافة مركبة / خدمة جديدة
              </h3>
              <button
                type="button"
                onClick={() => setIsAddVehicleOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {formMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold mb-4 ${
                  formMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleAddVehicleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                  نوع الخدمة:
                </label>
                <select
                  value={newVehicle.service_type}
                  onChange={(e) => setNewVehicle({ ...newVehicle, service_type: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs font-cairo font-bold text-rahaa-navy focus:outline-none"
                >
                  <option value="rental">السيارات الخاصة وتأجير السيارات</option>
                  <option value="truck">شاحنة نقل عفش وبضائع</option>
                  <option value="motorcycle">دراجة نارية وتوصيل</option>
                  <option value="taxi">سيارة أجرة تاكسي</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                    الشركة المصنعة:
                  </label>
                  <input
                    type="text"
                    required
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                    الموديل وسنة الصنع:
                  </label>
                  <input
                    type="text"
                    required
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                  رقم اللوحة الرسمي:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: صنعاء / 98451"
                  value={newVehicle.plate_number}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plate_number: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs focus:outline-none"
                />
              </div>

              {newVehicle.service_type === 'rental' && (
                <div>
                  <label className="block text-xs font-cairo font-bold text-rahaa-navy mb-1">
                    سعر التأجير اليومي (ر.ي):
                  </label>
                  <input
                    type="number"
                    value={newVehicle.daily_rate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, daily_rate: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-rahaa-border bg-rahaa-bg text-xs focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="w-1/3 h-10 rounded-xl border border-rahaa-border text-xs font-cairo font-bold hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={addingVehicle}
                  className="w-2/3 h-10 rounded-xl bg-rahaa-primary hover:bg-rahaa-navy text-white text-xs font-cairo font-bold shadow-xs disabled:opacity-50"
                >
                  {addingVehicle ? 'جاري الحفظ...' : 'حفظ وإرسال للاعتماد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverServicesManager;

