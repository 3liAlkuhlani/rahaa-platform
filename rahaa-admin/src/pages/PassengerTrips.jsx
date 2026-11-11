import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, Car, MapPin, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const PassengerTrips = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.getMyTrips();
      if (res?.trips?.data) {
        const mapped = res.trips.data.map((t) => ({
          id: `#${t.trip_number}`,
          raw: t,
          date: new Date(t.created_at).toLocaleString('ar-YE', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          from: t.pickup_name,
          to: t.dropoff_name,
          captain: t.driver?.name || 'بانتظار تعيين سائق',
          car: t.driver?.driver_profile?.vehicle_model || 'راحة بلس',
          cost: `${Number(t.fare || 0).toLocaleString()} ر.ي`,
          status:
            t.status === 'completed'
              ? 'مكتملة'
              : t.status === 'cancelled'
                ? 'ملغاة'
                : 'جارية / نشطة',
          rawStatus: t.status,
          rating: t.driver_rating || (t.status === 'completed' ? 5 : null),
        }));
        setTrips(mapped);
      }
    } catch {
      // Keep empty list on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const filteredTrips =
    filterStatus === 'all'
      ? trips
      : trips.filter((t) =>
        filterStatus === 'completed'
          ? t.rawStatus === 'completed'
          : t.rawStatus === 'cancelled'
      );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cairo text-rahaa-navy">
            سجل الرحلات
          </h1>
          <p className="text-xs sm:text-sm text-rahaa-text-muted font-tajawal">
            جميع مشاويرك المسجلة مع كباتن راحة في صنعاء
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTrips}
            className="h-10 px-3 rounded-xl border border-rahaa-border bg-rahaa-card hover:bg-rahaa-blue-soft text-rahaa-navy font-cairo font-bold text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rahaa-blue ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-rahaa-card p-1 rounded-xl border border-rahaa-border">
            <button
              onClick={() => setFilterStatus('all')}
              className={`h-8 px-3 rounded-lg text-xs font-cairo font-bold transition-all ${filterStatus === 'all'
                  ? 'bg-rahaa-blue text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:text-rahaa-navy'
                }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`h-8 px-3 rounded-lg text-xs font-cairo font-bold transition-all ${filterStatus === 'completed'
                  ? 'bg-rahaa-emerald text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:text-rahaa-navy'
                }`}
            >
              المكتملة
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`h-8 px-3 rounded-lg text-xs font-cairo font-bold transition-all ${filterStatus === 'cancelled'
                  ? 'bg-rahaa-rose text-white shadow-rahaa-sm'
                  : 'text-rahaa-text-muted hover:text-rahaa-navy'
                }`}
            >
              الملغاة
            </button>
          </div>
        </div>
      </div>

      {/* Trips Cards List */}
      {loading ? (
        <div className="bg-rahaa-card rounded-2xl p-8 border border-rahaa-border text-center text-xs font-cairo text-rahaa-text-muted">
          جاري تحميل سجل الرحلات...
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="bg-rahaa-card rounded-2xl p-8 border border-rahaa-border text-center text-xs font-cairo text-rahaa-text-muted">
          لا توجد رحلات مطابقة للفلتر المحدد.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-rahaa-card rounded-2xl p-5 border border-rahaa-border shadow-rahaa-card hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex items-center justify-between border-b border-rahaa-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-rahaa-navy">
                    {trip.id}
                  </span>
                  <span className="text-xs text-rahaa-text-subtle font-tajawal flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{trip.date}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-cairo font-bold ${trip.rawStatus === 'completed'
                        ? 'bg-rahaa-emerald-bg text-rahaa-emerald'
                        : trip.rawStatus === 'cancelled'
                          ? 'bg-rahaa-rose-bg text-rahaa-rose'
                          : 'bg-rahaa-blue-light text-rahaa-blue'
                      }`}
                  >
                    {trip.status}
                  </span>
                  <span className="font-cairo font-bold text-sm text-rahaa-blue">
                    {trip.cost}
                  </span>
                </div>
              </div>

              {/* Route Details */}
              <div className="space-y-2 text-xs font-tajawal text-rahaa-text-muted pr-3 border-r-2 border-rahaa-blue/30 mr-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rahaa-emerald" />
                  <span>من:</span>
                  <span className="font-bold text-rahaa-navy">{trip.from}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rahaa-orange" />
                  <span>إلى:</span>
                  <span className="font-bold text-rahaa-navy">{trip.to}</span>
                </div>
              </div>

              {/* Captain & Map Action Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-rahaa-border/60 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rahaa-blue-light flex items-center justify-center text-rahaa-blue">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-cairo font-semibold text-rahaa-navy">
                      الكابتن: {trip.captain}
                    </span>
                    <span className="text-rahaa-text-subtle font-tajawal mr-1">
                      ({trip.car})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {trip.rating && (
                    <div className="flex items-center gap-1 text-rahaa-orange font-cairo font-bold">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{Number(trip.rating).toFixed(1)}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate('/passenger/map', { state: { trip: trip.raw } })}
                    className="px-3 py-1.5 rounded-lg bg-rahaa-blue-light hover:bg-rahaa-blue text-rahaa-blue hover:text-white font-cairo font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>عرض على الخريطة</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
