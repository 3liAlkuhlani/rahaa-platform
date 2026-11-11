/**
 * Global Arabic Text, Terms & Eastern Arabic Numerals Localization Engine
 * Ensures 100% of letters, words, codes, and numbers across the UI are in Arabic
 * and aligned right-to-left (RTL).
 */

const WESTERN_TO_ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

const ARABIC_TO_WESTERN_MAP = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

/**
 * Convert Arabic-Indic digits (٠-٩) back to standard ASCII digits (0-9)
 * Used before sending data to backend APIs.
 */
export function toWesternDigits(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/[٠-٩]/g, (d) => ARABIC_TO_WESTERN_MAP[d] ?? d);
}

/**
 * Deeply normalize any object/string payload so backend API receives ASCII digits
 */
export function normalizePayloadDigits(payload) {
  if (payload == null) return payload;
  if (typeof payload === 'string') return toWesternDigits(payload);
  if (Array.isArray(payload)) return payload.map(normalizePayloadDigits);
  if (typeof payload === 'object' && !(payload instanceof FormData) && !(payload instanceof Blob)) {
    const out = {};
    for (const [k, v] of Object.entries(payload)) {
      out[k] = normalizePayloadDigits(v);
    }
    return out;
  }
  return payload;
}

const ENGLISH_TO_ARABIC_REPLACEMENTS = [
  [/\bChoose Your Service\b/gi, 'اختر وسيلة النقل'],
  [/\bSurge Pricing\b/gi, 'أوقات الذروة'],
  [/\bBackground Check\b/gi, 'فحص السجل الجنائي'],
  [/\bTR-([A-Z0-9]+)/gi, (_, code) => `رحلة-${code.replace(/[A-Z]/gi, (c) => (c.charCodeAt(0) % 10))}`],
  [/\bRX-([A-Z0-9]+)/gi, (_, code) => `رحلة-${code.replace(/[A-Z]/gi, (c) => (c.charCodeAt(0) % 10))}`],
  [/\bTRP-([A-Z0-9]+)/gi, (_, code) => `رحلة-${code.replace(/[A-Z]/gi, (c) => (c.charCodeAt(0) % 10))}`],
  [/\bCRG-([A-Z0-9]+)/gi, (_, code) => `شحنة-${code.replace(/[A-Z]/gi, (c) => (c.charCodeAt(0) % 10))}`],
  [/\bTRK-([A-Z0-9]+)/gi, (_, code) => `شاحنة-${code.replace(/[A-Z]/gi, (c) => (c.charCodeAt(0) % 10))}`],
  [/\bMOT-([A-Z0-9]+)/gi, (_, code) => `دراجة-${code.replace(/[A-Z]/gi, (c) => (c.charCodeAt(0) % 10))}`],
  [/\bRNT-([A-Z0-9]+)/gi, (_, code) => `تأجير-${code.replace(/[A-Z]/gi, (c) => (c.charCodeAt(0) % 10))}`],
  [/\bRN-([A-Z0-9]+)/gi, (_, code) => `تأجير-${code.replace(/[A-Z]/gi, (c) => (c.charCodeAt(0) % 10))}`],
  [/\bVIP\b/gi, 'فاخرة'],
  [/\bSUV\b/gi, 'دفع رباعي'],
  [/\bGPS\b/gi, 'تحديد المواقع'],
  [/\bSMS\b/gi, 'الرسائل النصية'],
  [/\bSOS\b/gi, 'طوارئ'],
  [/\bExcel\b/gi, 'إكسل'],
  [/\bAES-256\b/gi, 'التشفير المتقدم'],
  [/\bSSL\/TLS\b/gi, 'التشفير الآمن'],
  [/\bdriving_license\b/gi, 'رخصة قيادة'],
  [/\bnational_id\b/gi, 'بطاقة هوية وطنية'],
  [/\bvehicle_registration\b/gi, 'ملكية مركبة'],
  [/\bcommercial_permit\b/gi, 'تصريح نقل تجاري'],
  [/\bself_drive\b/gi, 'قيادة ذاتية'],
  [/\bwith_driver\b/gi, 'مع سائق خاص'],
  [/\bcomfort\b/gi, 'راحة بلس'],
  [/\beconomy\b/gi, 'راحة توفير'],
  [/\btaxi\b/gi, 'تاكسي'],
  [/\brental\b/gi, 'تأجير سيارات'],
  [/\btruck\b/gi, 'شاحنة نقل'],
  [/\bmotorcycle\b/gi, 'دراجة نارية'],
  [/\bAM\b/g, 'ص'],
  [/\bPM\b/g, 'م'],
];

/**
 * Convert any English terms and Western digits (0-9) into pure Arabic words & Arabic numerals (٠-٩)
 */
export function toArabicDisplay(str) {
  if (!str || typeof str !== 'string') return str;

  let result = str;

  for (const [pattern, replacement] of ENGLISH_TO_ARABIC_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }

  // Replace thousands comma between digits with Arabic thousands separator
  result = result.replace(/(\d),(\d{3})/g, '$1٬$2');

  // Replace % with Arabic percent sign ٪
  result = result.replace(/%/g, '٪');

  // Replace Western digits 0-9 with Eastern Arabic digits ٠-٩
  result = result.replace(/[0-9]/g, (d) => WESTERN_TO_ARABIC_DIGITS[Number(d)]);

  return result;
}

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'PATH', 'CIRCLE', 'RECT', 'POLYGON', 'ELLIPSE', 'CODE']);

/**
 * Apply Arabic localization to all text nodes and attributes inside root
 */
export function localizeDOMSubtree(rootNode) {
  if (!rootNode) return;

  const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);

  let current = walker.currentNode;
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      const parentTag = current.parentElement?.tagName;
      if (parentTag && !SKIP_TAGS.has(parentTag)) {
        const original = current.nodeValue;
        const localized = toArabicDisplay(original);
        if (localized !== original) {
          current.nodeValue = localized;
        }
      }
    } else if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current;
      if (!SKIP_TAGS.has(el.tagName)) {
        if (el.getAttribute('dir') === 'ltr') {
          el.setAttribute('dir', 'rtl');
        }
        if (el.hasAttribute('placeholder')) {
          const ph = el.getAttribute('placeholder');
          const locPh = toArabicDisplay(ph);
          if (locPh !== ph) el.setAttribute('placeholder', locPh);
        }
        if (el.hasAttribute('title')) {
          const t = el.getAttribute('title');
          const locT = toArabicDisplay(t);
          if (locT !== t) el.setAttribute('title', locT);
        }
      }
    }
    current = walker.nextNode();
  }
}

/**
 * Initialize a global MutationObserver so every dynamic render is localized to Arabic & RTL
 */
export function initGlobalArabicLocalization() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  document.documentElement.setAttribute('lang', 'ar');
  document.documentElement.setAttribute('dir', 'rtl');

  let isMutating = false;

  const runLocalization = (target = document.body) => {
    if (isMutating) return;
    isMutating = true;
    try {
      localizeDOMSubtree(target);
    } finally {
      isMutating = false;
    }
  };

  runLocalization(document.body);

  const observer = new MutationObserver((mutations) => {
    if (isMutating) return;
    isMutating = true;
    try {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          const node = mutation.target;
          const parentTag = node.parentElement?.tagName;
          if (parentTag && !SKIP_TAGS.has(parentTag)) {
            const localized = toArabicDisplay(node.nodeValue);
            if (localized !== node.nodeValue) {
              node.nodeValue = localized;
            }
          }
        } else if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((added) => {
            if (added.nodeType === Node.TEXT_NODE) {
              const parentTag = added.parentElement?.tagName;
              if (parentTag && !SKIP_TAGS.has(parentTag)) {
                const localized = toArabicDisplay(added.nodeValue);
                if (localized !== added.nodeValue) {
                  added.nodeValue = localized;
                }
              }
            } else if (added.nodeType === Node.ELEMENT_NODE) {
              localizeDOMSubtree(added);
            }
          });
        }
      }
    } finally {
      isMutating = false;
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

