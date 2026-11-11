import React, { useState, useEffect } from 'react';
import { TripStatsGrid } from '../components/trips/TripStatsGrid';
import { TripFiltersBar } from '../components/trips/TripFiltersBar';
import { TripsTable } from '../components/trips/TripsTable';
import { LiveTripMapCard } from '../components/trips/LiveTripMapCard';
import { PageHeader } from '../components/common/PageHeader';
import { api } from '../services/api';

export const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminTrips();
      if (res.trips && res.trips.data) {
        const mapped = res.trips.data.map((t) => {
          let statusLabel = 'قيد الانتظار';
          if (t.status === 'in_progress') statusLabel = 'قيد التنفيذ';
          if (t.status === 'completed') statusLabel = 'مكتملة';
          if (t.status === 'cancelled') statusLabel = 'ملغاة';
          if (t.status === 'accepted') statusLabel = 'تم القبول';

          const cleanNum = String(t.trip_number || t.id || '').replace(/^[A-Za-z-]+/, '');
          return {
            id: `#رحلة-${cleanNum}`,
            rider: {
              name: t.passenger?.name || 'راكب',
              avatarBg: 'bg-rahaa-primary/10',
              initials: (t.passenger?.name || 'ر')[0],
              phone: t.passenger?.phone || '—',
            },
            driver: {
              name: t.driver?.name || 'بانتظار سائق',
              avatarBg: 'bg-rahaa-accent/15',
              initials: (t.driver?.name || 'س')[0],
              phone: t.driver?.phone || '—',
              car: 'تويوتا كورولا',
            },
            route: { from: t.pickup_name, to: t.dropoff_name },
            fare: `${t.fare.toLocaleString('ar-YE')} ر.ي`,
            status: statusLabel,
            vehicleType: t.vehicle_type || 'comfort',
            time: new Date(t.created_at).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
            speed: '٤٠ كم/س',
            eta: '١٠ دقائق',
            distance: '٤.٥ كم',
            raw: t,
          };
        });

        setTrips(mapped);
        setAllTrips(mapped);
        if (mapped.length > 0) {
          setSelectedTrip(mapped[0]);
        }
      }
    } catch (err) {
      console.error('Error loading trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleFilterChange = ({ vehicleType, status, searchTerm }) => {
    let filtered = [...allTrips];

    if (vehicleType !== 'all') {
      filtered = filtered.filter((t) => t.vehicleType === vehicleType);
    }
    if (status !== 'all') {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (searchTerm && searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(query) ||
          t.rider.name.toLowerCase().includes(query) ||
          t.driver.name.toLowerCase().includes(query)
      );
    }

    setTrips(filtered);
    if (filtered.length > 0) {
      setSelectedTrip(filtered[0]);
    }
  };

  const handleResetFilters = () => {
    setTrips(allTrips);
    if (allTrips.length > 0) {
      setSelectedTrip(allTrips[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <PageHeader
        title="إدارة الرحلات والمتابعة المباشرة"
        subtitle='متابعة دقيقة وتفاعلية لجميع رحلات شبكة "راحة" في أمانة العاصمة صنعاء'
      />

      {/* 1. Top KPI Stats Grid */}
      <TripStatsGrid />

      {/* 2. Filters Toolbar */}
      <TripFiltersBar
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* 3. Main Split View: Trips Table & Live Map Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Data Table (7 cols on Desktop) */}
        <div className="lg:col-span-7">
          <TripsTable
            trips={trips}
            selectedTripId={selectedTrip?.id}
            onSelectTrip={(trip) => setSelectedTrip(trip)}
            onShowAll={handleResetFilters}
          />
        </div>

        {/* Right Column: Live Map Tracking Panel (5 cols on Desktop) */}
        <div className="lg:col-span-5 h-full">
          <LiveTripMapCard selectedTrip={selectedTrip} />
        </div>
      </div>
    </div>
  );
};
