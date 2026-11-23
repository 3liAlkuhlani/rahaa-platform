import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Crosshair,
  AlertTriangle,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import {
  getGoogleMapsApiKey,
  loadGoogleMapsApi,
  resetGoogleMapsLoader,
  SANA_CENTER,
} from '../../utils/googleMapsLoader';

function buildMarkerSvg(type) {
  let fill = '#10B981';
  const stroke = '#FFFFFF';

  if (type === 'destination') {
    fill = '#0D2D56';
  } else if (type === 'driver') {
    fill = '#0B58A8';
  } else if (type === 'nearby') {
    fill = '#EE9224';
  }

  return type === 'driver'
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="${fill}" fill-opacity="0.22"/>
        <circle cx="20" cy="20" r="12" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
        <path d="M20 11 L26 25 L20 22 L14 25 Z" fill="#FFFFFF"/>
      </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
        <path d="M18 2C9.7 2 3 8.7 3 17c0 10.5 15 25 15 25s15-14.5 15-25C33 8.7 26.3 2 18 2z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
        <circle cx="18" cy="17" r="6" fill="#FFFFFF"/>
      </svg>`;
}

function buildGoogleMarkerIcon(maps, type) {
  const svg = buildMarkerSvg(type);
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: type === 'driver' ? new maps.Size(40, 40) : new maps.Size(34, 42),
    anchor: type === 'driver' ? new maps.Point(20, 20) : new maps.Point(17, 42),
  };
}

function buildLeafletMarkerIcon(type) {
  const svg = buildMarkerSvg(type);
  const isDriver = type === 'driver';
  return L.divIcon({
    html: svg,
    className: 'rahaa-custom-map-marker',
    iconSize: isDriver ? [40, 40] : [34, 42],
    iconAnchor: isDriver ? [20, 20] : [17, 42],
  });
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
 * Unified Interactive Map Component for Rahah Platform
 * - Uses official Google Maps JS API when VITE_GOOGLE_MAPS_API_KEY is configured.
 * - Automatically renders a real interactive Arabic street map via Leaflet + Google/OSM tiles
 *   when no API key is configured yet, so maps are ALWAYS live, interactive, and usable.
 */
export const RahahGoogleMap = ({
  center = SANA_CENTER,
  zoom = 13,
  pickup = null, // { lat, lng, label? }
  dropoff = null, // { lat, lng, label? }
  driver = null, // { lat, lng, label? }
  nearbyDrivers = [], // [{ id, lat, lng, label? }]
  routeOrigin = null, // Optional override for route start (e.g. driver -> pickup during approach)
  routeDestination = null, // Optional override for route end
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
  const engineRef = useRef(null); // 'google' | 'leaflet'
  const googleMapRef = useRef(null);
  const googleMapsApiRef = useRef(null);
  const leafletMapRef = useRef(null);

  const markersRef = useRef({
    pickup: null,
    dropoff: null,
    driver: null,
    nearby: [],
  });
  const directionsRendererRef = useRef(null);
  const polylineRef = useRef(null);
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

  // Track online/offline & Google auth failure
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (loadState === 'error') {
        resetGoogleMapsLoader();
        setReloadTick((t) => t + 1);
      }
    };
    const handleOffline = () => setIsOffline(true);
    const handleAuthFailure = () => {
      // Automatically fall back to Leaflet interactive map if Google key fails auth
      resetGoogleMapsLoader();
      setReloadTick((t) => t + 1);
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

  // Arabic Reverse Geocoder (Google Geocoder when in Google mode, Nominatim in Leaflet mode)
  const reverseGeocode = useCallback(async (lat, lng) => {
    const gMaps = googleMapsApiRef.current;
    if (engineRef.current === 'google' && gMaps?.Geocoder) {
      return new Promise((resolve) => {
        try {
          const geocoder = new gMaps.Geocoder();
          geocoder.geocode({ location: { lat, lng }, language: 'ar' }, (results, status) => {
            if (status === 'OK' && results?.[0]?.formatted_address) {
              resolve(results[0].formatted_address);
            } else {
              resolve(`موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            }
          });
        } catch {
          resolve(`موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        }
      });
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.display_name) {
          return data.display_name.split(',').slice(0, 3).join('، ');
        }
      }
    } catch {
      // Fallback to coordinates string
    }
    return `موقع محدد (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }, []);

  // Initialize Map (Google Maps JS API if key configured, otherwise instant interactive Leaflet map)
  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    setErrorInfo({ code: '', message: '' });

    const initialCenter = isValidCoord(pickup)
      ? { lat: pickup.lat, lng: pickup.lng }
      : isValidCoord(center)
      ? center
      : SANA_CENTER;

    const initLeafletFallback = () => {
      if (cancelled || !containerRef.current) return;
      try {
        // Clear any residual DOM inside container
        containerRef.current.innerHTML = '';
        const lMap = L.map(containerRef.current, {
          center: [initialCenter.lat, initialCenter.lng],
          zoom,
          zoomControl: true,
          attributionControl: false,
        });

        // Google Arabic road tiles (fast, crisp Arabic labels for Sana'a) with OSM fallback
        const tileLayer = L.tileLayer(
          'https://mt{s}.google.com/vt/lyrs=m&hl=ar&x={x}&y={y}&z={z}',
          {
            subdomains: ['0', '1', '2', '3'],
            maxZoom: 20,
          }
        );

        let switchedToOsm = false;
        tileLayer.on('tileerror', () => {
          if (!switchedToOsm && leafletMapRef.current) {
            switchedToOsm = true;
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
            }).addTo(leafletMapRef.current);
          }
        });

        tileLayer.addTo(lMap);

        engineRef.current = 'leaflet';
        leafletMapRef.current = lMap;
        hasFittedBoundsRef.current = false;
        setLoadState('ready');

        // Ensure proper layout after CSS animations
        setTimeout(() => {
          lMap.invalidateSize();
        }, 180);
      } catch (err) {
        setLoadState('error');
        setErrorInfo({
          code: 'LEAFLET_INIT_ERROR',
          message: err?.message || 'تعذر تهيئة الخريطة حالياً',
        });
      }
    };

    const apiKey = getGoogleMapsApiKey();
    if (apiKey) {
      loadGoogleMapsApi()
        .then((maps) => {
          if (cancelled || !containerRef.current) return;
          googleMapsApiRef.current = maps;
          const map = new maps.Map(containerRef.current, {
            center: initialCenter,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            gestureHandling: 'greedy',
            styles: [{ featureType: 'poi.business', stylers: [{ visibility: 'simplified' }] }],
          });
          engineRef.current = 'google';
          googleMapRef.current = map;
          hasFittedBoundsRef.current = false;
          setLoadState('ready');
        })
        .catch(() => {
          if (!cancelled) {
            initLeafletFallback();
          }
        });
    } else {
      initLeafletFallback();
    }

    return () => {
      cancelled = true;
      if (clickListenerRef.current) {
        if (engineRef.current === 'google' && window.google?.maps?.event) {
          window.google.maps.event.removeListener(clickListenerRef.current);
        } else if (engineRef.current === 'leaflet' && leafletMapRef.current) {
          leafletMapRef.current.off('click', clickListenerRef.current);
        }
        clickListenerRef.current = null;
      }
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      if (polylineRef.current) {
        if (engineRef.current === 'google') polylineRef.current.setMap(null);
        else polylineRef.current.remove();
        polylineRef.current = null;
      }
      Object.values(markersRef.current).forEach((m) => {
        if (Array.isArray(m)) {
          m.forEach((item) => (engineRef.current === 'google' ? item?.setMap?.(null) : item?.remove?.()));
        } else if (m) {
          if (engineRef.current === 'google') m.setMap?.(null);
          else m.remove?.();
        }
      });
      markersRef.current = { pickup: null, dropoff: null, driver: null, nearby: [] };
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      googleMapRef.current = null;
      engineRef.current = null;
    };
  }, [reloadTick]);

  // Interactive click handler
  useEffect(() => {
    if (loadState !== 'ready') return;

    if (engineRef.current === 'google' && googleMapRef.current && googleMapsApiRef.current) {
      const maps = googleMapsApiRef.current;
      if (clickListenerRef.current) {
        maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
      if (interactive && onMapClick) {
        clickListenerRef.current = googleMapRef.current.addListener('click', async (event) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          const address = await reverseGeocode(lat, lng);
          onMapClick({ lat, lng, address });
        });
      }
    } else if (engineRef.current === 'leaflet' && leafletMapRef.current) {
      const lMap = leafletMapRef.current;
      if (clickListenerRef.current) {
        lMap.off('click', clickListenerRef.current);
        clickListenerRef.current = null;
      }
      if (interactive && onMapClick) {
        const handler = async (e) => {
          const { lat, lng } = e.latlng;
          const address = await reverseGeocode(lat, lng);
          onMapClick({ lat, lng, address });
        };
        clickListenerRef.current = handler;
        lMap.on('click', handler);
      }
    }
  }, [loadState, interactive, onMapClick, reverseGeocode]);

  // Sync Markers (Pickup, Destination, Live Driver, Nearby Captains)
  useEffect(() => {
    if (loadState !== 'ready') return;

    if (engineRef.current === 'google' && googleMapRef.current && googleMapsApiRef.current) {
      const map = googleMapRef.current;
      const maps = googleMapsApiRef.current;

      const upsertGoogleMarker = (key, coord, type, defaultTitle) => {
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
            icon: buildGoogleMarkerIcon(maps, type),
            zIndex: type === 'driver' ? 30 : type === 'pickup' ? 20 : 15,
          });
        }
      };

      upsertGoogleMarker('pickup', pickup, 'pickup', 'موقع الراكب / الانطلاق');
      upsertGoogleMarker('dropoff', dropoff, 'destination', 'موقع الوجهة');
      upsertGoogleMarker('driver', driver, 'driver', 'موقع السائق المباشر');

      markersRef.current.nearby.forEach((m) => m.setMap(null));
      markersRef.current.nearby = [];
      if (Array.isArray(nearbyDrivers)) {
        nearbyDrivers.forEach((cap) => {
          if (!isValidCoord(cap)) return;
          markersRef.current.nearby.push(
            new maps.Marker({
              position: { lat: cap.lat, lng: cap.lng },
              map,
              title: cap.label || cap.name || 'كابتن قريب',
              icon: buildGoogleMarkerIcon(maps, 'nearby'),
              zIndex: 10,
            })
          );
        });
      }

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
    } else if (engineRef.current === 'leaflet' && leafletMapRef.current) {
      const lMap = leafletMapRef.current;

      const upsertLeafletMarker = (key, coord, type, defaultTitle) => {
        if (!isValidCoord(coord)) {
          if (markersRef.current[key]) {
            markersRef.current[key].remove();
            markersRef.current[key] = null;
          }
          return;
        }
        const latLng = [coord.lat, coord.lng];
        if (markersRef.current[key]) {
          markersRef.current[key].setLatLng(latLng);
          if (coord.label) {
            markersRef.current[key].bindTooltip(coord.label, { direction: 'top', offset: [0, -18] });
          }
        } else {
          const marker = L.marker(latLng, {
            icon: buildLeafletMarkerIcon(type),
            zIndexOffset: type === 'driver' ? 500 : type === 'pickup' ? 300 : 200,
          }).addTo(lMap);
          marker.bindTooltip(coord.label || defaultTitle, { direction: 'top', offset: [0, -18] });
          markersRef.current[key] = marker;
        }
      };

      upsertLeafletMarker('pickup', pickup, 'pickup', 'موقع الراكب / الانطلاق');
      upsertLeafletMarker('dropoff', dropoff, 'destination', 'موقع الوجهة');
      upsertLeafletMarker('driver', driver, 'driver', 'موقع السائق المباشر');

      markersRef.current.nearby.forEach((m) => m.remove());
      markersRef.current.nearby = [];
      if (Array.isArray(nearbyDrivers)) {
        nearbyDrivers.forEach((cap) => {
          if (!isValidCoord(cap)) return;
          const m = L.marker([cap.lat, cap.lng], {
            icon: buildLeafletMarkerIcon('nearby'),
          }).addTo(lMap);
          markersRef.current.nearby.push(m);
        });
      }

      const points = [pickup, dropoff, driver].filter(isValidCoord);
      if (points.length >= 2 && !hasFittedBoundsRef.current) {
        const bounds = L.latLngBounds(points.map((pt) => [pt.lat, pt.lng]));
        lMap.fitBounds(bounds, { padding: [45, 45] });
        hasFittedBoundsRef.current = true;
      } else if (points.length === 1 && !hasFittedBoundsRef.current) {
        lMap.panTo([points[0].lat, points[0].lng]);
        hasFittedBoundsRef.current = true;
      }
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

  // Route Calculation & Rendering (Google Directions API in Google mode, OSRM Road Routing in Leaflet mode)
  useEffect(() => {
    if (loadState !== 'ready') return;

    const effectiveOrigin = isValidCoord(routeOrigin) ? routeOrigin : pickup;
    const effectiveDestination = isValidCoord(routeDestination) ? routeDestination : dropoff;

    const clearRoute = () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      if (polylineRef.current) {
        if (engineRef.current === 'google') polylineRef.current.setMap(null);
        else polylineRef.current.remove();
        polylineRef.current = null;
      }
    };

    if (!showRoute || !isValidCoord(effectiveOrigin) || !isValidCoord(effectiveDestination)) {
      clearRoute();
      return;
    }

    if (engineRef.current === 'google' && googleMapRef.current && googleMapsApiRef.current) {
      const map = googleMapRef.current;
      const maps = googleMapsApiRef.current;
      const origin = { lat: effectiveOrigin.lat, lng: effectiveOrigin.lng };
      const destination = { lat: effectiveDestination.lat, lng: effectiveDestination.lng };

      const drawGoogleFallback = () => {
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setMap(null);
          directionsRendererRef.current = null;
        }
        if (polylineRef.current) {
          polylineRef.current.setPath([origin, destination]);
        } else {
          polylineRef.current = new maps.Polyline({
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
          { origin, destination, travelMode: maps.TravelMode.DRIVING },
          (result, status) => {
            if (status === 'OK' && result) {
              if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
              }
              if (!directionsRendererRef.current) {
                directionsRendererRef.current = new maps.DirectionsRenderer({
                  map,
                  suppressMarkers: true,
                  preserveViewport: hasFittedBoundsRef.current,
                  polylineOptions: { strokeColor: '#0B58A8', strokeOpacity: 0.92, strokeWeight: 5 },
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
              drawGoogleFallback();
            }
          }
        );
      } catch {
        drawGoogleFallback();
      }
    } else if (engineRef.current === 'leaflet' && leafletMapRef.current) {
      const lMap = leafletMapRef.current;
      let aborted = false;

      const drawLeafletRoute = (coords) => {
        if (aborted || !leafletMapRef.current) return;
        if (polylineRef.current) {
          polylineRef.current.setLatLngs(coords);
        } else {
          polylineRef.current = L.polyline(coords, {
            color: '#0B58A8',
            weight: 5,
            opacity: 0.9,
          }).addTo(lMap);
        }
      };

      // Fetch real driving route geometry via OSRM, falling back cleanly to straight polyline
      fetch(
        `https://router.project-osrm.org/route/v1/driving/${effectiveOrigin.lng},${effectiveOrigin.lat};${effectiveDestination.lng},${effectiveDestination.lat}?overview=full&geometries=geojson`
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (aborted) return;
          const route = data?.routes?.[0];
          if (route?.geometry?.coordinates?.length) {
            const latLngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
            drawLeafletRoute(latLngs);
            if (onRouteCalculated) {
              const km = (route.distance / 1000).toFixed(1);
              const mins = Math.max(1, Math.round(route.duration / 60));
              onRouteCalculated({
                distanceText: `${km} كم`,
                durationText: `${mins} دقيقة`,
                distanceValue: route.distance,
                durationValue: route.duration,
              });
            }
          } else {
            drawLeafletRoute([
              [effectiveOrigin.lat, effectiveOrigin.lng],
              [effectiveDestination.lat, effectiveDestination.lng],
            ]);
          }
        })
        .catch(() => {
          drawLeafletRoute([
            [effectiveOrigin.lat, effectiveOrigin.lng],
            [effectiveDestination.lat, effectiveDestination.lng],
          ]);
        });

      return () => {
        aborted = true;
      };
    }
  }, [
    loadState,
    showRoute,
    pickup?.lat,
    pickup?.lng,
    dropoff?.lat,
    dropoff?.lng,
    routeOrigin?.lat,
    routeOrigin?.lng,
    routeDestination?.lat,
    routeDestination?.lng,
  ]);

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
        if (engineRef.current === 'google' && googleMapRef.current) {
          googleMapRef.current.panTo({ lat, lng });
          googleMapRef.current.setZoom(15);
        } else if (engineRef.current === 'leaflet' && leafletMapRef.current) {
          leafletMapRef.current.setView([lat, lng], 15, { animate: true });
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

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-rahaa-border bg-slate-100 ${className}`}
      dir="rtl"
    >
      {/* Live Interactive Map Canvas */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Loading Overlay */}
      {loadState === 'loading' && (
        <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 z-[400] p-4 text-center">
          <div className="w-9 h-9 border-3 border-rahaa-blue border-t-transparent rounded-full animate-spin" />
          <p className="font-cairo font-bold text-xs text-rahaa-navy">
            جاري تحميل الخريطة...
          </p>
        </div>
      )}

      {/* Offline / Fatal Error Overlay */}
      {loadState === 'error' && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/60 to-slate-100 flex flex-col items-center justify-center gap-3 z-[400] p-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
            {isOffline ? <WifiOff className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <p className="text-xs font-bold text-rahaa-navy">{errorInfo.message}</p>
          <button
            type="button"
            onClick={() => {
              resetGoogleMapsLoader();
              setReloadTick((t) => t + 1);
            }}
            className="h-9 px-4 rounded-xl bg-rahaa-blue text-white font-cairo font-bold text-xs inline-flex items-center gap-1.5"
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
          className="absolute bottom-4 left-4 z-[450] h-10 px-3 rounded-xl bg-white/95 hover:bg-white text-rahaa-navy border border-rahaa-border shadow-md flex items-center gap-1.5 text-xs font-cairo font-bold transition-all disabled:opacity-60"
        >
          <Crosshair className={`w-4 h-4 text-rahaa-blue ${gpsLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{gpsLoading ? 'جاري التحديد...' : 'موقعي الحالي'}</span>
        </button>
      )}

      {/* Map Legend Pill */}
      {loadState === 'ready' && (isValidCoord(pickup) || isValidCoord(dropoff) || isValidCoord(driver)) && (
        <div className="absolute top-3 right-3 z-[450] flex flex-wrap items-center gap-1.5 bg-white/92 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-rahaa-border shadow-xs text-[10px] font-cairo font-bold text-rahaa-navy">
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
        <div className="absolute bottom-16 right-3 left-3 sm:left-auto sm:max-w-sm z-[460] bg-amber-50 border border-amber-300 text-amber-900 rounded-xl px-3 py-2 text-xs font-bold shadow-md flex items-center justify-between gap-2">
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
