import React, { useState, useEffect } from 'react';
import { FinancialHeaderBar } from '../components/financial/FinancialHeaderBar';
import { FinancialStatsGrid } from '../components/financial/FinancialStatsGrid';
import { RevenueChartCard } from '../components/financial/RevenueChartCard';
import { PaymentDistributionCard } from '../components/financial/PaymentDistributionCard';
import { FinancialTransactionsTable } from '../components/financial/FinancialTransactionsTable';
import { PageHeader } from '../components/common/PageHeader';
import { api } from '../services/api';

export const Analytics = () => {
  const [stats, setStats] = useState({});
  const [paymentDistribution, setPaymentDistribution] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchFinancialData = async () => {
    setLoading(true);
    try {
      const [statsRes, tripsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminTrips(),
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (statsRes?.payment_distribution) {
        setPaymentDistribution(statsRes.payment_distribution);
      }
      if (tripsRes?.trips?.data) {
        setAllTrips(tripsRes.trips.data);
      }
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const filteredTrips = allTrips.filter((t) => {
    const matchesPayment =
      paymentFilter === 'all' || t.payment_method === paymentFilter;
    const matchesStatus =
      statusFilter === 'all' || t.status === statusFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (t.trip_number || '').toLowerCase().includes(q) ||
      (t.passenger?.name || '').toLowerCase().includes(q) ||
      (t.driver?.name || '').toLowerCase().includes(q) ||
      (t.pickup_name || '').toLowerCase().includes(q) ||
      (t.dropoff_name || '').toLowerCase().includes(q);

    return matchesPayment && matchesStatus && matchesSearch;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setPaymentFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Description */}
      <PageHeader
        title="الأرباح والتقارير المالية"
        subtitle="تحليل الإيرادات وتوزيع المدفوعات وسجل العمليات المالية المباشرة في منصة راحة"
      />

      {/* 1. Unified Filters & Actions Toolbar */}
      <FinancialHeaderBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onResetFilters={handleResetFilters}
        onRefresh={fetchFinancialData}
        onExportExcel={() => alert('جاري تصدير التقرير المالي...')}
        isRefreshing={loading}
      />

      {/* 2. Top KPI Financial Metrics Grid */}
      <FinancialStatsGrid
        stats={stats}
        paymentDistribution={paymentDistribution}
      />

      {/* 3. Revenue Analysis Grid & Payment Distribution Grid */}
      <div className="space-y-6">
        <RevenueChartCard stats={stats} trips={filteredTrips} />
        <PaymentDistributionCard distribution={paymentDistribution} />
      </div>

      {/* 4. Financial Transactions Table */}
      <FinancialTransactionsTable trips={filteredTrips} loading={loading} />
    </div>
  );
};
