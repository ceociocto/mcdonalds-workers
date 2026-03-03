/**
 * 城市选择组件
 */

'use client';

import { useState } from 'react';
import { PROVINCES, HOT_CITIES } from '@/lib/store-service-v2';

interface CitySelectorProps {
  onCitySelect: (city: string) => void;
  selectedCity?: string;
}

export default function CitySelector({ onCitySelect, selectedCity }: CitySelectorProps) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const provinces = Object.keys(PROVINCES);

  return (
    <div className="space-y-4">
      {/* 热门城市 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">🔥 热门城市</h3>
        <div className="grid grid-cols-4 gap-2">
          {HOT_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => onCitySelect(city)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCity === city
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* 按省份选择 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📍 选择省份</h3>
        <div className="grid grid-cols-5 gap-2">
          {provinces.map((province) => (
            <button
              key={province}
              onClick={() => setSelectedProvince(province)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedProvince === province
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {province}
            </button>
          ))}
        </div>
      </div>

      {/* 城市列表 */}
      {selectedProvince && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            🏙️ {selectedProvince} - 选择城市
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {PROVINCES[selectedProvince as keyof typeof PROVINCES].map((city) => (
              <button
                key={city}
                onClick={() => onCitySelect(city)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCity === city
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
