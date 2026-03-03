/**
 * 增强版餐厅选择器 - 支持真实地理位置
 */

'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';
import { getUserLocation, recommendStores } from '@/lib/store-service';

interface Store {
  id: number;
  storeId: string;
  name: string;
  address: string;
  distance?: number;
  businessHours?: string;
  latitude?: number;
  longitude?: number;
}

interface StoreSelectorProps {
  onStoreSelect: (store: Store) => void;
  userLocation?: { lat: number; lng: number };
}

export default function StoreSelector({ onStoreSelect, userLocation }: StoreSelectorProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [radius, setRadius] = useState(3000);
  const [currentLocation, setCurrentLocation] = useState(
    userLocation || { lat: 31.2304, lng: 121.4737 }
  );

  useEffect(() => {
    if (!userLocation) {
      // 如果没有提供位置，自动获取
      getCurrentLocation();
    } else {
      fetchStores();
    }
  }, [radius, currentLocation]);

  const getCurrentLocation = async () => {
    try {
      setLocating(true);
      const location = await getUserLocation();
      setCurrentLocation(location);
      await fetchStores(location.lat, location.lng);
    } catch (error) {
      console.error("获取位置失败:", error);
      // 使用默认位置
      await fetchStores();
    } finally {
      setLocating(false);
    }
  };

  const fetchStores = async (lat?: number, lng?: number) => {
    try {
      setLoading(true);
      const latToUse = lat || currentLocation.lat;
      const lngToUse = lng || currentLocation.lng;

      // 优先使用高德地图API
      let response;

      // 检查是否配置了高德API
      if (process.env.NEXT_PUBLIC_USE_AMAP === 'true') {
        response = await fetch(
          `/api/stores/amap?lat=${latToUse}&lng=${lngToUse}&radius=${radius}`
        );
      } else {
        // 使用我们的API
        response = await fetch(
          `${API_BASE_URL}/api/stores/nearby?lat=${latToUse}&lng=${lngToUse}&radius=${radius}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setStores(data.data);

        // 智能推荐
        const recommendations = recommendStores(data.data, latToUse, lngToUse);

        console.log('推荐餐厅:', recommendations);
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {locating ? '正在定位...' : '加载餐厅中...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 定位和半径控制 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3">📍 位置和范围</h3>

        <div className="space-y-3">
          {/* 当前位置信息 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">当前位置</p>
              <p className="font-mono text-sm">
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </p>
            </div>
            <button
              onClick={getCurrentLocation}
              disabled={locating}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                locating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {locating ? '定位中...' : '重新定位'}
            </button>
          </div>

          {/* 半径选择 */}
          <div>
            <p className="text-sm text-gray-600 mb-2">搜索范围</p>
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
        </div>
      </div>

      {/* 餐厅列表 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            🍔 找到 {stores.length} 家附近餐厅
          </h3>
          {stores.length > 0 && (
            <span className="text-sm text-green-600">
              ✓ 已根据距离排序
            </span>
          )}
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>附近没有找到餐厅</p>
            <p className="text-sm mt-2">尝试扩大搜索范围或重新定位</p>
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
                      <p className="text-xs text-gray-500 mt-1">
                        {store.distance < 500 ? '很近' : store.distance < 2000 ? '适中' : '较远'}
                      </p>
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
