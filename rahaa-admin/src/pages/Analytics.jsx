import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { PrimaryButton } from '../components/common/PrimaryButton';
import {
  Download,
  Printer,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { api } from '../services/api';

const REPORT_TYPES = [
  { id: 'trips', label: 'تقرير الرحلات' },
  { id: 'users', label: 'المستخدمون والسائقون' },
  { id: 'revenue', label: 'تقارير الإيرادات' },
  { id: 'vehicles', label: 'وسائل النقل' },
  { id: 'complaints', label: 'الشكاوى والبلاغات' },
];

export const Analytics = () => {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [reportType, setReportType] = useState('trips');
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo);
  const [dateTo, setDateTo] = useState(today);
  const [summary, setSummary] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminReports({
        type: reportType,
        date_from: dateFrom,
        date_to: dateTo,
      });
      setSummary(res.summary || {});
      setRows(Array.isArray(res.rows) ? res.rows : []);
    } catch (err) {
      setError(err.message || 'تعذر تحميل التقرير من الخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, dateFrom, dateTo]);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const blob = await api.exportAdminReport({
        type: reportType,
        date_from: dateFrom,
        date_to: dateTo,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rahaa-${reportType}-report-${dateFrom}-to-${dateTo}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'فشل تصدير ملف التقرير');
    } finally {
      setExporting(false);
    }
  };

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="التقارير والتحليلات المالية والتشغيلية"
        description="تقارير تفصيلية مباشرة من قاعدة البيانات حسب الفترة الزمنية مع إمكانية التصدير إلى Excel وطباعة PDF"
        actions={
          <div className="flex flex-wrap gap-2">
            <PrimaryButton
              variant="secondary"
              icon={RefreshCw}
              onClick={fetchReport}
              disabled={loading}
            >
              تحديث
            </PrimaryButton>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={exporting || rows.length === 0}
              className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-xs font-cairo font-bold hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'جاري التصدير...' : 'تصدير Excel (CSV)'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="h-10 px-4 rounded-xl bg-rahaa-navy text-white text-xs font-cairo font-bold hover:opacity-90 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / PDF</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rahaa-rose-bg border border-rahaa-rose/30 text-rahaa-rose text-xs font-tajawal">
          {error}
        </div>
      )}

      {/* Report Controls */}
      <div className="bg-rahaa-card rounded-2xl p-4 border border-rahaa-border flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
        <div className="flex flex-wrap gap-2">
          {REPORT_TYPES.map((rt) => (
            <button
              key={rt.id}
              type="button"
              onClick={() => setReportType(rt.id)}
              className={`h-9 px-3.5 rounded-xl text-xs font-cairo font-bold transition-all ${
                reportType === rt.id
                  ? 'bg-rahaa-blue text-white shadow-xs'
                  : 'bg-rahaa-bg text-rahaa-text-muted hover:text-rahaa-navy'
              }`}
            >
              {rt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-tajawal">
          <span className="text-rahaa-text-muted">من:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border"
          />
          <span className="text-rahaa-text-muted">إلى:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 px-3 rounded-xl bg-rahaa-bg border border-rahaa-border"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(summary).map(([key, val]) => (
          <div key={key} className="bg-rahaa-card rounded-2xl p-4 border border-rahaa-border shadow-2xs">
            <div className="text-[11px] font-cairo text-rahaa-text-muted uppercase">{key.replace(/_/g, ' ')}</div>
            <div className="text-xl font-cairo font-black text-rahaa-navy mt-1">
              {typeof val === 'number' ? val.toLocaleString() : String(val)}
            </div>
          </div>
        ))}
      </div>

      {/* Report Data Table */}
      <div className="bg-rahaa-card rounded-2xl border border-rahaa-border shadow-rahaa-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-rahaa-border flex items-center justify-between">
          <h3 className="font-cairo font-bold text-sm text-rahaa-navy flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-rahaa-blue" />
            <span>بيانات التقرير التفصيلية ({rows.length} سجل)</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-rahaa-bg border-b border-rahaa-border font-cairo font-bold text-rahaa-navy">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="py-3 px-4">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rahaa-border font-tajawal">
              {loading ? (
                <tr>
                  <td colSpan={Math.max(1, columns.length)} className="py-10 text-center text-rahaa-text-muted">
                    جاري توليد التقرير من قاعدة البيانات...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={Math.max(1, columns.length)} className="py-10 text-center text-rahaa-text-subtle">
                    لا توجد بيانات مسجلة في هذه الفترة الزمنية
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-rahaa-bg/50">
                    {columns.map((col) => (
                      <td key={col} className="py-3 px-4 text-rahaa-navy">
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : '—'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
