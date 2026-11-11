import React, { useState, useEffect } from 'react';
import { DriverStatsGrid } from '../components/drivers/DriverStatsGrid';
import { DriverFiltersBar } from '../components/drivers/DriverFiltersBar';
import { DriversTable } from '../components/drivers/DriversTable';
import { AddDriverModal } from '../components/drivers/AddDriverModal';
import { DriverDocsModal } from '../components/drivers/DriverDocsModal';
import { PageHeader } from '../components/common/PageHeader';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { UserPlus } from 'lucide-react';
import { api } from '../services/api';

export const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDriverForDocs, setSelectedDriverForDocs] = useState(null);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.getDrivers();
      if (res.drivers && res.drivers.data) {
        const mapped = res.drivers.data.map((u) => {
          const prof = u.driver_profile || {};
          let statusLabel = 'موثق';
          if (prof.status === 'pending') statusLabel = 'بانتظار المراجعة';
          if (prof.status === 'rejected') statusLabel = 'مرفوض';
          if (u.status === 'banned') statusLabel = 'محظور';

          return {
            id: u.id,
            name: u.name,
            phone: u.phone || '—',
            vehicleType: prof.vehicle_type === 'vip' ? 'راحة بلس' : 'إقتصادية',
            vehicleColor: 'bg-rahaa-primary',
            plateNumber: prof.vehicle_plate || 'صنعاء / 12345',
            status: statusLabel,
            regDate: new Date(u.created_at).toLocaleDateString('ar-YE'),
            avatarBg: 'bg-rahaa-primary/10',
            raw: u,
          };
        });
        setDrivers(mapped);
        setAllDrivers(mapped);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleFilterChange = ({ searchTerm, vehicleType, status }) => {
    let filtered = [...allDrivers];

    if (vehicleType !== 'all') {
      filtered = filtered.filter((d) => d.vehicleType === vehicleType);
    }
    if (status !== 'all') {
      filtered = filtered.filter((d) => d.status === status);
    }
    if (searchTerm && searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.phone.includes(q) ||
          d.plateNumber.includes(q)
      );
    }

    setDrivers(filtered);
  };

  const handleResetFilters = () => {
    setDrivers(allDrivers);
  };

  const handleAddDriver = (newDriver) => {
    setDrivers([newDriver, ...drivers]);
    alert(`تمت إضافة السائق ${newDriver.name} بنجاح وهو بانتظار التوثيق!`);
  };

  const handleToggleBan = async (driver) => {
    try {
      await api.toggleUserStatus(driver.id);
      await fetchDrivers();
    } catch (err) {
      alert(err.message || 'فشل تعديل حالة السائق');
    }
  };

  const handleApproveDocs = async (driver) => {
    try {
      const res = await api.approveDriver(driver.id);
      alert(res.message || `تم توثيق واعتماد حساب السائق ${driver.name} بنجاح!`);
      setSelectedDriverForDocs(null);
      await fetchDrivers();
    } catch (err) {
      alert(err.message || 'فشل اعتماد السائق');
    }
  };

  const handleRejectDocs = async (driver) => {
    try {
      const res = await api.rejectDriver(driver.id, 'البيانات أو الوثائق المرفقة غير واضحة');
      alert(res.message || `تم رفض وثائق السائق ${driver.name}`);
      setSelectedDriverForDocs(null);
      await fetchDrivers();
    } catch (err) {
      alert(err.message || 'فشل رفض السائق');
    }
  };

  const handleExportExcel = () => {
    alert('جاري تصدير قائمة السائقين إلى ملف Excel...');
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Action Button */}
      <PageHeader
        title="إدارة السائقين"
        subtitle="إدارة وتدقيق بيانات السائقين المسجلين في المنصة وتوثيق الوثائق الرسمية"
        actions={
          <PrimaryButton onClick={() => setIsAddModalOpen(true)} size="lg">
            <UserPlus className="w-5 h-5" />
            إضافة سائق جديد
          </PrimaryButton>
        }
      />

      {/* 1. Top KPI Metrics Grid */}
      <DriverStatsGrid />

      {/* 2. Filters Toolbar */}
      <DriverFiltersBar
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* 3. Main Data Table */}
      <DriversTable
        drivers={drivers}
        onInspectDocs={(driver) => setSelectedDriverForDocs(driver)}
        onEditDriver={(driver) => alert(`تعديل بيانات السائق ${driver.name}`)}
        onToggleBan={handleToggleBan}
        onExportExcel={handleExportExcel}
      />

      {/* Add Driver Modal Dialog */}
      <AddDriverModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDriver={handleAddDriver}
      />

      {/* Driver Documents Inspection Modal */}
      <DriverDocsModal
        driver={selectedDriverForDocs}
        isOpen={!!selectedDriverForDocs}
        onClose={() => setSelectedDriverForDocs(null)}
        onApprove={handleApproveDocs}
        onReject={handleRejectDocs}
      />
    </div>
  );
};
