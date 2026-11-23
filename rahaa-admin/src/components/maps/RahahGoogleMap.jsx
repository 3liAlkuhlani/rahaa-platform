import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Crosshair,
  AlertTriangle,
  WifiOff,
  RefreshCw,
  MapPin,
  Navigation,
  Car,
} from 'lucide-react';
import {
  loadGoogleMapsApi,
  resetGoogleMapsLoader,
  SANA_CENTER,
} from '../../utils/googleMapsLoader';

function buildSvgMarkerIcon(maps, type) {
  let fill = '#10B981';
  let stroke = '#FFFFFF';
  let labelGlyph = '●';

  if (type === 'destination') {
    fill = '#0D2D56';
    labelGlyph = '⚑';
  } else if (type === 'driver') {
    fill = '#0B58A8';
    labelGlyph = '▲';
  } else if (type === 'nearby') {
    fill = '#EE9224';
    labelGlyph = '●';
  }

  const svg =
    type === 'driver'
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="${fill}" fill-opacity="0.22"/>
          <circle cx="20" cy="20" r="12" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
          <path d="M20 11 L26 25 L20 22 L14 25 Z" fill="#FFFFFF"/>
        </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
          <path d="M18 2C9.7 2 3 8.7 3 17c0 10.5 15 25 15 25s15-14.5 15-25C33 8.7 26.3 2 18 2z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
          <circle cx="18" cy="17" r="6" fill="#FFFFFF"/>
        </svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: type === 'driver' ? new maps.Size(40, 40) : new maps.Size(34, 42),
    anchor: type === 'driver' ? new maps.Point(20, 20) : new maps.Point(17, 42),
  };
}

function isValidCoord(point) {
  return (
    point &&
    typeof point.lat === 'number' &&
    typeof point.lng === 'number' &&
    !Number.isNaN(point.lat) &&
    !Number.isNaN(point.lng)
  );
}

/**
 * Official Reusable Google Maps Component for Rahah Platform
 * Supports:
 * - Passenger/Pickup Marker, Destination Marker, Live Driver Marker, Nearby Captains
 * - Google Directions API route rendering with automatic Polyline fallback
 * - Interactive map tap selection with Arabic reverse geocoding
 * - GPS Locate button with full permission/error handling
 * - Graceful offline / missing API key / auth failure fallback UI
 */
export const RahahGoogleMap = ({
  center = SANA_CENTER,
  zoom = 13,
  pickup = null, // { lat, lng, label? }
  dropoff = null, // { lat, lng, label? }
  driver = null, // { lat, lng, label? }
  nearbyDrivers = [], // [{ id, lat, lng, label? }]
  showRoute = false,
  interactive = false,
  showGpsButton = true,
  heightClass = 'h-[360px] sm:h-[420px]',
  className = '',
  onMapClick = null, // ({ lat, lng, address }) => void
  onGpsLocated = null, // ({ lat, lng, address }) => void
  onRouteCalculated = null, // ({ distanceText, durationText, distanceValue, durationValue }) => void
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const mapsApiRef = useRef(null);
  const markersRef = useRef({
    pickup: null,
    dropoff: null,
    driver: null,
    nearby: [],
  });
  const directionsRendererRef = useRef(null);
  const fallbackPolylineRef = useRef(null);
  const clickListenerRef = useRef(null);
  const hasFittedBoundsRef = useRef(false);

  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [errorInfo, setErrorInfo] = useState({ code: '', message: '' });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsNotice, setGpsNotice] = useState('');
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine === false : false
  );
  const [reloadTick, setReloadTick] = useState(0);

  // Track browser online/offline state
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (loadState === 'error') {
        resetGoogleMapsLoader();
        setReloadTick((t) => t + 1);
      }
    };
    const handleOffline = () => {
      setIsOffline(true);
    };
    const handleAuthFailure = () => {
      setLoadState('error');
      setErrorInfo({
        code: 'AUTH_FAILURE',
        message: 'فشل التحقق من مفتاح Google Maps API. تأكد من تفعيل Maps JavaScript API وصلاحية المفتاح.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('rahaa-google-maps-auth-failure', handleAuthFailure);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('rahaa-google-maps-auth-failure', handleAuthFailure);
    };
  }, [loadState]);

  // Reverse geocode helper
  const reverseGeocode = useCallback((lat, lng) => {
    return new Promise((resolve) => {
      const maps = mapsApiRef.current;
      if (!maps || !maps.Geocoder) {
        resolve(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        return;
      }
      try {
        const geocoder = new maps.Geocoder();
        geocoder.geocode({ location: { lat, lng }, language: 'ar' }, (results, status) => {
          if (status === 'OK' && results && results[0]?.formatted_address) {
            resolve(results[0].formatted_address);
          } else {
            resolve(`موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }
        });
      } catch {
        resolve(`موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      }
    });
  }, []);

  // Load Google Maps & initialize map instance
  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    setErrorInfo({ code: '', message: '' });

    loadGoogleMapsApi()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        mapsApiRef.current = maps;

        const initialCenter = isValidCoord(pickup)
          ? { lat: pickup.lat, lng: pickup.lng }
          : isValidCoord(center)
          ? center
          : SANA_CENTER;

        const map = new maps.Map(containerRef.current, {
          center: initialCenter,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'simplified' }],
            },
          ],
        });

        mapRef.current = map;
        hasFittedBoundsRef.current = false;
        setLoadState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadState('error');
        setErrorInfo({
          code: err?.code || 'LOAD_ERROR',
          message: err?.message || 'تعذر تحميل خريطة Google Maps حالياً',
        });
      });

    return () => {
      cancelled = true;
      if (clickListenerRef.current && window.google?.maps?.event) {
        window.google.maps.event.removeListener(clickListenerRef.current);
      }
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
      if (fallbackPolylineRef.current) {
        fallbackPolylineRef.current.setMap(null);
      }
      Object.values(markersRef.current).forEach((m) => {
        if (Array.isArray(m)) {
          m.forEach((item) => item?.setMap?.(null));
        } else {
          m?.setMap?.(null);
        }
      });
      markersRef.current = { pickup: null, dropoff: null, driver: null, nearby: [] };
      mapRef.current = null;
    };
  }, [reloadTick]);

  // Interactive click handler
  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (loadState !== 'ready' || !map || !maps) return;

    if (clickListenerRef.current) {
      maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
    }

    if (interactive && onMapClick) {
      clickListenerRef.current = map.addListener('click', async (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        const address = await reverseGeocode(lat, lng);
        onMapClick({ lat, lng, address });
      });
    }
  }, [loadState, interactive, onMapClick, reverseGeocode]);

  // Sync Markers (Passenger/Pickup, Destination, Live Driver, Nearby Captains) without reloading map
  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (loadState !== 'ready' || !map || !maps) return;

    const upsertMarker = (key, coord, type, defaultTitle) => {
      if (!isValidCoord(coord)) {
        if (markersRef.current[key]) {
          markersRef.current[key].setMap(null);
          markersRef.current[key] = null;
        }
        return;
      }

      const position = { lat: coord.lat, lng: coord.lng };
      if (markersRef.current[key]) {
        markersRef.current[key].setPosition(position);
        markersRef.current[key].setTitle(coord.label || defaultTitle);
      } else {
        markersRef.current[key] = new maps.Marker({
          position,
          map,
          title: coord.label || defaultTitle,
          icon: buildSvgMarkerIcon(maps, type),
          zIndex: type === 'driver' ? 30 : type === 'pickup' ? 20 : 15,
        });
      }
    };

    upsertMarker('pickup', pickup, 'pickup', 'موقع الراكب / الانطلاق');
    upsertMarker('dropoff', dropoff, 'destination', 'موقع الوجهة');
    upsertMarker('driver', driver, 'driver', 'موقع السائق المباشر');

    // Sync nearby captains
    markersRef.current.nearby.forEach((m) => m.setMap(null));
    markersRef.current.nearby = [];
    if (Array.isArray(nearbyDrivers) && nearbyDrivers.length > 0) {
      nearbyDrivers.forEach((cap) => {
        if (!isValidCoord(cap)) return;
        const marker = new maps.Marker({
          position: { lat: cap.lat, lng: cap.lng },
          map,
          title: cap.label || cap.name || 'كابتن قريب',
          icon: buildSvgMarkerIcon(maps, 'nearby'),
          zIndex: 10,
        });
        markersRef.current.nearby.push(marker);
      });
    }

    // Fit map bounds automatically once when markers appear
    const points = [pickup, dropoff, driver].filter(isValidCoord);
    if (points.length >= 2 && !hasFittedBoundsRef.current) {
      const bounds = new maps.LatLngBounds();
      points.forEach((pt) => bounds.extend({ lat: pt.lat, lng: pt.lng }));
      map.fitBounds(bounds, { top: 55, bottom: 55, left: 45, right: 45 });
      hasFittedBoundsRef.current = true;
    } else if (points.length === 1 && !hasFittedBoundsRef.current) {
      map.panTo({ lat: points[0].lat, lng: points[0].lng });
      hasFittedBoundsRef.current = true;
    }
  }, [
    loadState,
    pickup?.lat,
    pickup?.lng,
    pickup?.label,
    dropoff?.lat,
    dropoff?.lng,
    dropoff?.label,
    driver?.lat,
    driver?.lng,
    driver?.label,
    nearbyDrivers,
  ]);

  // Google Directions API Route Calculation & Rendering
  useEffect(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (loadState !== 'ready' || !map || !maps) return;

    const clearRoute = () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      if (fallbackPolylineRef.current) {
        fallbackPolylineRef.current.setMap(null);
        fallbackPolylineRef.current = null;
      }
    };

    if (!showRoute || !isValidCoord(pickup) || !isValidCoord(dropoff)) {
      clearRoute();
      return;
    }

    const origin = { lat: pickup.lat, lng: pickup.lng };
    const destination = { lat: dropoff.lat, lng: dropoff.lng };

    const drawFallbackPolyline = () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      if (fallbackPolylineRef.current) {
        fallbackPolylineRef.current.setPath([origin, destination]);
      } else {
        fallbackPolylineRef.current = new maps.Polyline({
          path: [origin, destination],
          geodesic: true,
          strokeColor: '#0B58A8',
          strokeOpacity: 0.9,
          strokeWeight: 4,
          map,
        });
      }
    };

    try {
      const directionsService = new maps.DirectionsService();
      directionsService.route(
        {
          origin,
          destination,
          travelMode: maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            if (fallbackPolylineRef.current) {
              fallbackPolylineRef.current.setMap(null);
              fallbackPolylineRef.current = null;
            }
            if (!directionsRendererRef.current) {
              directionsRendererRef.current = new maps.DirectionsRenderer({
                map,
                suppressMarkers: true, // We render our custom Rahah markers
                preserveViewport: hasFittedBoundsRef.current,
                polylineOptions: {
                  strokeColor: '#0B58A8',
                  strokeOpacity: 0.92,
                  strokeWeight: 5,
                },
              });
            }
            directionsRendererRef.current.setDirections(result);

            const leg = result.routes?.[0]?.legs?.[0];
            if (leg && onRouteCalculated) {
              onRouteCalculated({
                distanceText: leg.distance?.text || '',
                durationText: leg.duration?.text || '',
                distanceValue: leg.distance?.value || 0,
                durationValue: leg.duration?.value || 0,
              });
            }
          } else {
            drawFallbackPolyline();
          }
        }
      );
    } catch {
      drawFallbackPolyline();
    }
  }, [loadState, showRoute, pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng]);

  // GPS Locate User
  const handleLocateMe = () => {
    setGpsNotice('');
    if (!('geolocation' in navigator)) {
      setGpsNotice('المتصفح الحالي لا يدعم خدمة تحديد الموقع GPS.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(15);
        }
        const address = await reverseGeocode(lat, lng);
        setGpsLoading(false);
        if (onGpsLocated) {
          onGpsLocated({ lat, lng, address });
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setGpsNotice('تم رفض إذن الوصول إلى الموقع. يرجى السماح بصلاحية الموقع من إعدادات المتصفح.');
        } else if (err.code === 2) {
          setGpsNotice('تعذر التقاط إشارة GPS حالياً. تأكد من تفعيل خدمة الموقع على جهازك.');
        } else {
          setGpsNotice('انتهت مهلة تحديد الموقع. يرجى المحاولة مرة أخرى.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  const handleRetryLoad = () => {
    resetGoogleMapsLoader();
    setReloadTick((t) => t + 1);
  };

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-rahaa-border bg-slate-100 ${className}`}
      dir="rtl"
    >
      {/* Official Google Map Canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {loadState === 'loading' && (
        <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 z-20 p-4 text-center">
          <div className="w-9 h-9 border-3 border-rahaa-blue border-t-transparent rounded-full animate-spin" />
          <p className="font-cairo font-bold text-xs text-rahaa-navy">
            جاري تحميل خريطة Google Maps...
          </p>
        </div>
      )}

      {/* Error / Offline / Missing Key Graceful Fallback */}
      {loadState === 'error' && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/60 to-slate-100 flex flex-col items-center justify-center gap-3 z-20 p-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
            {isOffline || errorInfo.code === 'OFFLINE' ? (
              <WifiOff className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div className="space-y-1 max-w-md">
            <h4 className="font-cairo font-bold text-sm text-rahaa-navy">
              {errorInfo.code === 'MISSING_API_KEY'
                ? 'مفتاح Google Maps API غير مفعّل بعد'
                : isOffline
                ? 'لا يوجد اتصال بالإنترنت'
                : 'تعذر عرض خريطة Google Maps'}
            </h4>
            <p className="text-xs text-rahaa-text-muted leading-relaxed">
              {errorInfo.message}
            </p>
            {errorInfo.code === 'MISSING_API_KEY' && (
              <p className="text-[11px] text-slate-500 mt-1">
                أضف <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">VITE_GOOGLE_MAPS_API_KEY</code> في ملف <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">rahaa-admin/.env</code> ثم أعد التشغيل.
              </p>
            )}
          </div>

          {/* Real coordinates summary even while map tiles are unavailable */}
          {(isValidCoord(pickup) || isValidCoord(dropoff) || isValidCoord(driver)) && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold">
              {isValidCoord(pickup) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <MapPin className="w-3 h-3" />
                  الانطلاق: {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
                </span>
              )}
              {isValidCoord(driver) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <Car className="w-3 h-3" />
                  السائق: {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
                </span>
              )}
              {isValidCoord(dropoff) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-rahaa-navy border border-slate-300">
                  <Navigation className="w-3 h-3" />
                  الوجهة: {dropoff.lat.toFixed(4)}, {dropoff.lng.toFixed(4)}
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleRetryLoad}
            className="h-9 px-4 rounded-xl bg-rahaa-blue hover:bg-rahaa-blue/90 text-white font-cairo font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {/* GPS Locate Button */}
      {showGpsButton && loadState === 'ready' && (
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={gpsLoading}
          title="تحديد موقعي الحالي عبر GPS"
          className="absolute bottom-4 left-4 z-10 h-10 px-3 rounded-xl bg-white/95 hover:bg-white text-rahaa-navy border border-rahaa-border shadow-md flex items-center gap-1.5 text-xs font-cairo font-bold transition-all disabled:opacity-60"
        >
          <Crosshair className={`w-4 h-4 text-rahaa-blue ${gpsLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{gpsLoading ? 'جاري التحديد...' : 'موقعي الحالي'}</span>
        </button>
      )}

      {/* Map Legend Pill */}
      {loadState === 'ready' && (isValidCoord(pickup) || isValidCoord(dropoff) || isValidCoord(driver)) && (
        <div className="absolute top-3 right-3 z-10 flex flex-wrap items-center gap-1.5 bg-white/92 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-rahaa-border shadow-xs text-[10px] font-cairo font-bold text-rahaa-navy">
          {isValidCoord(pickup) && (
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              الراكب
            </span>
          )}
          {isValidCoord(driver) && (
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0B58A8]" />
              السائق
            </span>
          )}
          {isValidCoord(dropoff) && (
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D2D56]" />
              الوجهة
            </span>
          )}
        </div>
      )}

      {/* GPS Permission / Error Toast */}
      {gpsNotice && (
        <div className="absolute bottom-16 right-3 left-3 sm:left-auto sm:max-w-sm z-20 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl px-3 py-2 text-xs font-bold shadow-md flex items-center justify-between gap-2">
          <span>{gpsNotice}</span>
          <button
            type="button"
            onClick={() => setGpsNotice('')}
            className="text-amber-700 hover:text-amber-950 font-black px-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
