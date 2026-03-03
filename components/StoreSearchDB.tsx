/**
 * 餐厅搜索组件（数据库版本）
 */

'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/config';

interface Store {
  id?: number;
  storeId: string;
  name: string;
  address: string;
  district?: string;
  phone?: string;
  business_hours?: string;
  features?: string;
  latitude?: number;
  longitude?: number;
}

interface StoreSearchProps {
  city: string;
  onStoreSelect: (store: Store) => void;
  selectedStore?: Store | null;
}

export default function StoreSearch({ city, onStoreSelect, selectedStore }: StoreSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // 城市变化时清空搜索
  useEffect(() => {
    setStores([]);
    setKeyword('');
    setSearched(false);
  }, [city]);

  const handleSearch = async () => {
    if (!city) {
      alert('请先选择城市');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // 调用数据库API
      const url = new URL(`${API_BASE_URL}/api/stores/by-city`);
      url.searchParams.append('city', city);
      if (keyword.trim()) {
        url.searchParams.append('keyword', keyword);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.success) {
        setStores(data.data);
      } else {
        alert('搜索失败: ' + data.message);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      alert('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const parseFeatures = (featuresStr: string | undefined) => {
    if (!featuresStr) return [];
    try {
      const features = JSON.parse(featuresStr);
      const labels = [];
      if (features['24h']) labels.push('24小时');
      if (features['mcafe']) labels.push('McCafé');
      if (features['drive_thru']) labels.push('得来速');
      return labels;
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3">🔍 搜索餐厅</h3>

        <div className="space-y-3">
          {/* 城市显示 */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-600">📍</span>
            <span className="font-medium text-blue-900">{city}</span>
          </div>

          {/* 搜索输入 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入关键词，如：人民广场、南京路..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>

          {/* 提示信息 */}
          <p className="text-sm text-gray-500">
            💡 提示：可以输入商圈、地标、路名等关键词，如"人民广场"、"南京路"、"五角场"
          </p>
          <p className="text-xs text-gray-400">
            不输入关键词则显示该城市所有餐厅
          </p>
        </div>
      </div>

      {/* 搜索结果 */}
      {searched && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">
              🍔 找到 {stores.length} 家餐厅
            </h3>
            {stores.length > 0 && (
              <button
                onClick={handleSearch}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                刷新
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>未找到相关餐厅</p>
              <p className="text-sm mt-2">
                {keyword ? '请尝试其他关键词' : '该城市暂无餐厅数据'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stores.map((store) => (
                <button
                  key={store.storeId}
                  onClick={() => onStoreSelect(store)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedStore?.storeId === store.storeId
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-gray-900">{store.name}</h4>
                        {store.district && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {store.district}
                          </span>
                        )}
                        {parseFeatures(store.features).map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{store.address}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {store.phone && (
                          <span className="flex items-center gap-1">
                            📞 {store.phone}
                          </span>
                        )}
                        {store.business_hours && (
                          <span className="flex items-center gap-1">
                            ⏰ {store.business_hours}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
