/**
 * 餐厅选择组件
 */

'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';

interface Store {
  id: number;
  storeId: string;
  name: string;
  address: string;
  distance?: number;
  businessHours?: string;
}

interface StoreSelectorProps {
  onStoreSelect: (store: Store) => void;
  userLocation?: { lat: number; lng: number };
}

export default function StoreSelector({ onStoreSelect, userLocation = { lat: 31.2304, lng: 121.4737 } }: StoreSelectorProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [radius, setRadius] = useState(3000);

  useEffect(() => {
    fetchStores();
  }, [radius]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/stores/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`
      );
      const data = await response.json();
      if (data.success) {
        setStores(data.data);
      }
    } catch (error) {
      console.error('获取餐厅失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (store: Store) => {
    setSelectedStore(store);
    onStoreSelect(store);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 半径选择器 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3">📍 搜索范围</h3>
        <div className="flex gap-2">
          {[1000, 3000, 5000, 10000].map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                radius === r
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r >= 1000 ? `${r / 1000}km` : `${r}m`}
            </button>
          ))}
        </div>
      </div>

      {/* 餐厅列表 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">
          🍔 找到 {stores.length} 家附近餐厅
        </h3>

        {stores.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>附近没有找到餐厅</p>
            <p className="text-sm mt-2">尝试扩大搜索范围</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => handleSelect(store)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedStore?.id === store.id
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{store.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{store.address}</p>
                    {store.businessHours && (
                      <p className="text-xs text-gray-500 mt-1">
                        ⏰ {store.businessHours}
                      </p>
                    )}
                  </div>
                  {store.distance !== undefined && (
                    <div className="text-right">
                      <span className="text-lg font-bold text-yellow-600">
                        {store.distance < 1000
                          ? `${store.distance}m`
                          : `${(store.distance / 1000).toFixed(1)}km`}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
