import React, { useState } from 'react';
import { MapPin, Plus, Layers, Navigation2, ZoomIn, ZoomOut } from 'lucide-react';

export default function ServiceZonesCard() {
  const [zones, setZones] = useState([
    { id: 1, name: 'منطقة أمانة العاصمة', color: 'bg-emerald-600', active: true, count: '142 سائق' },
    { id: 2, name: 'منطقة حدة والسبعين', color: 'bg-brand-600', active: true, count: '89 سائق' },
    { id: 3, name: 'منطقة الروضة والمطار', color: 'bg-purple-600', active: true, count: '45 سائق' },
  ]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-gray-900 font-cairo">مناطق الخدمة</h2>
          </div>
          <p className="text-xs text-gray-500 font-tajawal">
            تحديد النطاق الجغرافي لنشاط الخدمة في صنعاء وضبط قواعد التحرك
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-sm font-semibold transition-all">
          <Plus className="w-4 h-4" />
          <span className="font-cairo">إضافة منطقة جديدة</span>
        </button>
      </div>

      {/* Map Interactive View Simulation */}
      <div className="relative rounded-xl border border-gray-300 overflow-hidden bg-slate-900 h-80 shadow-inner">
        {/* Mock Map Background Grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        ></div>

        {/* Map SVG Overlay simulation of Sana'a Zones */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Zone 1 Polygon (Amanat Al Asimah) */}
          <polygon
            points="120,60 380,40 420,180 260,260 100,190"
            fill="rgba(0, 108, 74, 0.2)"
            stroke="#006C4A"
            strokeWidth="2.5"
            strokeDasharray="6,4"
          />
          {/* Zone 2 Polygon (Hadda & Al Sabeen) */}
          <polygon
            points="280,160 520,140 580,270 340,290"
            fill="rgba(0, 63, 177, 0.25)"
            stroke="#003FB1"
            strokeWidth="2.5"
          />
        </svg>

        {/* Floating Zone Legend Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl p-3 shadow-lg flex flex-col gap-2 z-10 max-w-xs">
          <span className="text-xs font-bold text-gray-700 font-cairo">المناطق المفعّلة</span>
          <div className="flex flex-col gap-1.5">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${zone.color}`}></span>
                  <span className="font-semibold text-gray-800 font-tajawal">{zone.name}</span>
                </div>
                <span className="text-gray-500 text-[10px] font-tajawal">{zone.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 z-10">
          <button className="w-8 h-8 bg-white text-gray-700 rounded-lg shadow flex items-center justify-center hover:bg-gray-100 transition">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 bg-white text-gray-700 rounded-lg shadow flex items-center justify-center hover:bg-gray-100 transition">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Center Indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
          <Navigation2 className="w-8 h-8 text-amber-400 drop-shadow-md animate-pulse" />
          <span className="mt-1 px-2 py-0.5 bg-black/70 text-amber-300 text-[10px] font-mono rounded">
            صنعاء (المركز الرئيسي)
          </span>
        </div>
      </div>
    </div>
  );
}
