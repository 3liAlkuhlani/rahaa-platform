/**
 * Official Google Maps JavaScript API Singleton Loader
 * Reads API key securely from Vite environment variable (VITE_GOOGLE_MAPS_API_KEY).
 * Never hardcode API keys in source code.
 */

let googleMapsPromise = null;
let authFailureTriggered = false;

export const SANA_CENTER = { lat: 15.3547, lng: 44.2066 };

export function getGoogleMapsApiKey() {
  const key = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  return key;
}

export function isGoogleMapsLoaded() {
  return Boolean(typeof window !== 'undefined' && window.google && window.google.maps && !authFailureTriggered);
}

export function resetGoogleMapsLoader() {
  googleMapsPromise = null;
  authFailureTriggered = false;
}

export function loadGoogleMapsApi() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('BROWSER_ONLY'));
  }

  if (isGoogleMapsLoaded()) {
    return Promise.resolve(window.google.maps);
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(
      Object.assign(
        new Error('لم يتم ضبط مفتاح Google Maps API (VITE_GOOGLE_MAPS_API_KEY) في ملف البيئة .env'),
        { code: 'MISSING_API_KEY' }
      )
    );
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return Promise.reject(
      Object.assign(
        new Error('لا يوجد اتصال بالإنترنت حالياً لتحميل خرائط Google Maps'),
        { code: 'OFFLINE' }
      )
    );
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-rahaa-google-maps="true"]');

    // Listen for Google Maps authentication failures (invalid/restricted key or billing)
    window.gm_authFailure = () => {
      authFailureTriggered = true;
      googleMapsPromise = null;
      window.dispatchEvent(new CustomEvent('rahaa-google-maps-auth-failure'));
    };

    const timeoutId = setTimeout(() => {
      googleMapsPromise = null;
      reject(
        Object.assign(
          new Error('انتهت مهلة تحميل خرائط Google Maps. يرجى التحقق من اتصال الإنترنت وإعادة المحاولة.'),
          { code: 'LOAD_TIMEOUT' }
        )
      );
    }, 15000);

    const onSuccess = () => {
      clearTimeout(timeoutId);
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        googleMapsPromise = null;
        reject(
          Object.assign(
            new Error('تعذر تهيئة مكتبة Google Maps بعد التحميل'),
            { code: 'INIT_FAILED' }
          )
        );
      }
    };

    const onError = () => {
      clearTimeout(timeoutId);
      googleMapsPromise = null;
      reject(
        Object.assign(
          new Error('فشل تحميل خرائط Google Maps. يرجى التحقق من الاتصال بالإنترنت وصلاحية المفتاح.'),
          { code: 'SCRIPT_LOAD_ERROR' }
        )
      );
    };

    if (existingScript) {
      if (window.google && window.google.maps) {
        onSuccess();
        return;
      }
      existingScript.addEventListener('load', onSuccess, { once: true });
      existingScript.addEventListener('error', onError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.dataset.rahaaGoogleMaps = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places,geometry&language=ar&region=YE&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = onSuccess;
    script.onerror = onError;
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

